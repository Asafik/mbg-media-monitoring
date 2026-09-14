import React, { useState } from 'react'
import type { SentimentTrendPoint } from '../../types/dashboard'

interface SentimentTrendChartProps {
  data: SentimentTrendPoint[]
}

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ data }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  // Chart dimensions - tuned to match reference image 1 exactly
  const width = 600
  const height = 180
  const paddingLeft = 32
  const paddingRight = 10
  const paddingTop = 12
  const paddingBottom = 26

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Y-Scale: 0% to 100% with ticks 0, 25, 50, 75, 100
  const maxY = 100
  const yTicks = [100, 75, 50, 25, 0]

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxY) * chartHeight
  }

  const getX = (idx: number) => {
    return paddingLeft + (idx / (data.length - 1)) * chartWidth
  }

  // Generate SVG path for a metric line
  const createPath = (key: 'positif' | 'negatif' | 'netral') => {
    return data.reduce((acc, curr, idx) => {
      const x = getX(idx)
      const y = getY(curr[key])
      return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`
    }, '')
  }

  // Generate SVG area path under the negatif curve
  const createNegatifAreaPath = () => {
    if (data.length === 0) return ''
    const linePath = data.reduce((acc, curr, idx) => {
      const x = getX(idx)
      const y = getY(curr.negatif)
      return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`
    }, '')
    const firstX = getX(0)
    const lastX = getX(data.length - 1)
    const baselineY = getY(0)
    return `${linePath} L ${lastX},${baselineY} L ${firstX},${baselineY} Z`
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Legend */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-900 tracking-tight">Tren Sentimen</h3>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Positif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Negatif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span>Netral</span>
          </div>
        </div>
      </div>

      {/* SVG Chart with preserveAspectRatio=none to fill card */}
      <div className="relative w-full h-[180px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible select-none"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="negatifAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#ef4444" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y Grid Lines & Labels */}
          {yTicks.map((tick) => {
            const y = getY(tick)
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="#94a3b8"
                  fontWeight="500"
                >
                  {tick}%
                </text>
              </g>
            )
          })}

          {/* Left Y Axis border line */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={getY(0)}
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Bottom X Axis baseline */}
          <line
            x1={paddingLeft}
            y1={getY(0)}
            x2={width - paddingRight}
            y2={getY(0)}
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Soft Red Gradient Area Under Negatif Line */}
          <path
            d={createNegatifAreaPath()}
            fill="url(#negatifAreaGradient)"
          />

          {/* Line 1: Netral (Slate Gray) */}
          <path
            d={createPath('netral')}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Line 2: Positif (Emerald Green) */}
          <path
            d={createPath('positif')}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Line 3: Negatif (Rose Red) */}
          <path
            d={createPath('negatif')}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots on data points */}
          {data.map((d, idx) => {
            const x = getX(idx)
            const isHovered = hoverIndex === idx
            return (
              <g key={idx}>
                {/* Netral dot */}
                <circle
                  cx={x}
                  cy={getY(d.netral)}
                  r={isHovered ? 4.5 : 3}
                  fill="#64748b"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                {/* Positif dot */}
                <circle
                  cx={x}
                  cy={getY(d.positif)}
                  r={isHovered ? 4.5 : 3}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                {/* Negatif dot */}
                <circle
                  cx={x}
                  cy={getY(d.negatif)}
                  r={isHovered ? 5 : 3.5}
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="1"
                />

                {/* X Axis Label */}
                <text
                  x={x}
                  y={height - 6}
                  textAnchor={idx === 0 ? 'start' : idx === data.length - 1 ? 'end' : 'middle'}
                  fontSize="9.5"
                  fill="#64748b"
                  fontWeight="500"
                >
                  {d.date}
                </text>

                {/* Invisible hover area */}
                <rect
                  x={x - chartWidth / (data.length * 2)}
                  y={paddingTop}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              </g>
            )
          })}
        </svg>

        {/* Floating Tooltip on Hover */}
        {hoverIndex !== null && (
          <div
            className="absolute -top-3 pointer-events-none bg-slate-900/90 backdrop-blur text-white text-[10px] rounded-md px-2.5 py-1.5 shadow-lg border border-slate-700/50 -translate-x-1/2 z-10 transition-all"
            style={{
              left: `${(getX(hoverIndex) / width) * 100}%`,
            }}
          >
            <div className="font-semibold text-[11px] mb-1 text-slate-200">
              {data[hoverIndex].date}
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>Positif:</span> <span className="font-bold">{data[hoverIndex].positif}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span>Negatif:</span> <span className="font-bold">{data[hoverIndex].negatif}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span>Netral:</span> <span className="font-bold">{data[hoverIndex].netral}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
