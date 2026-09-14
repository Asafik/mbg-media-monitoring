import { useEffect, useRef, useState } from 'react'

/**
 * Animates a numeric string from 0 to the target value.
 * Supports formats like "31.2", "+31.2", "11.6M", "39%", "12,482"
 */
export function useCountUp(target: string, durationMs = 1200): string {
  const [display, setDisplay] = useState('0')
  const frameRef = useRef<number>(0)

  useEffect(() => {
    // Handle prefix like "+" or "-"
    const prefix = target.startsWith('+') ? '+' : target.startsWith('-') ? '-' : ''
    const stripped = target.replace(/^[+-]/, '')

    const match = stripped.match(/^([\d.,]+)([^\d.]*)$/)
    if (!match) {
      setDisplay(target)
      return
    }

    const numStr = match[1].replace(/,/g, '')
    const suffix = match[2] || ''
    const end = parseFloat(numStr)
    const isNeg = prefix === '-'
    const hasDecimal = numStr.includes('.')
    const decimalPlaces = hasDecimal ? (numStr.split('.')[1]?.length ?? 1) : 0
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = end * eased * (isNeg ? -1 : 1)
      const absVal = Math.abs(current)
      const formatted = hasDecimal
        ? absVal.toFixed(decimalPlaces)
        : Math.round(absVal).toLocaleString('id-ID')
      setDisplay(`${prefix}${formatted}${suffix}`)
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, durationMs])

  return display
}
