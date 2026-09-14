import React from 'react'
import type { SentimentDistribution } from '../../types/dashboard'

interface SentimentDonutChartProps {
  data: SentimentDistribution[]
  totalCount: string
}

export const SentimentDonutChart: React.FC<SentimentDonutChartProps> = ({
  data,
  totalCount,
}) => {
  // SVG Donut calculation
  const size = 180
  const center = size / 2
  const strokeWidth = 32
  const radius = center - strokeWidth / 2
  const circumference = 2 * Math.PI * radius

  // Calculate strokes cleanly
  const segments = data.reduce<
    Array<
      SentimentDistribution & {
        strokeDasharray: string
        strokeDashoffset: number
      }
    >
  >((acc, item) => {
    const priorPercent = acc.reduce((sum, curr) => sum + curr.percentage, 0)
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
    const strokeDashoffset = -((priorPercent / 100) * circumference)
    acc.push({
      ...item,
      strokeDasharray,
      strokeDashoffset,
    })
    return acc
  }, [])

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      {/* Title */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-slate-900 tracking-tight">Distribusi Sentimen</h3>
      </div>

      {/* Donut and Legend */}
      <div className="flex items-center justify-center gap-6 my-auto">
        {/* SVG Donut */}
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {segments.map((segment) => (
              <circle
                key={segment.name}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-300"
              />
            ))}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-none">
              {totalCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1">
              Komentar
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs min-w-[110px]">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="font-medium text-slate-700">{item.name}</span>
              </div>
              <span className="font-bold text-slate-900">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
