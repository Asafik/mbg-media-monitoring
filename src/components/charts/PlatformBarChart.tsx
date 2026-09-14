import React from 'react'
import type { PlatformCount } from '../../types/dashboard'

interface PlatformBarChartProps {
  data: PlatformCount[]
}

export const PlatformBarChart: React.FC<PlatformBarChartProps> = ({ data }) => {
  // SVG Dimensions tuned to match reference image 2 exactly
  const width = 320
  const height = 175
  const paddingLeft = 26
  const paddingRight = 12
  const paddingTop = 24
  const baselineY = 124

  const chartHeight = baselineY - paddingTop
  const maxY = 6
  const yTicks = [6, 4, 2, 0]

  const getY = (val: number) => {
    return baselineY - (val / maxY) * chartHeight
  }

  const chartWidth = width - paddingLeft - paddingRight
  const slotWidth = chartWidth / data.length
  const barWidth = 42
  const cornerRadius = 5

  // Platform specific colors and dark count numbers matching screenshot
  const platformConfig: Record<
    string,
    {
      barColor: string
      textColor: string
    }
  > = {
    YouTube: { barColor: '#ef4444', textColor: '#58121a' },
    TikTok: { barColor: '#1e293b', textColor: '#0f172a' },
    Instagram: { barColor: '#c026d3', textColor: '#6b21a8' },
    Facebook: { barColor: '#2563eb', textColor: '#1d4ed8' },
  }

  const iconY = baselineY + 16
  const labelY = baselineY + 33

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      {/* Title */}
      <div className="mb-1">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Jumlah Konten per Platform
        </h3>
      </div>

      {/* SVG Bar Chart */}
      <div className="relative w-full h-[185px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
        >
          <defs>
            {/* Instagram Gradient */}
            <linearGradient id="igIconGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="40%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Left Y Axis line */}
          <line
            x1={paddingLeft}
            y1={paddingTop - 4}
            x2={paddingLeft}
            y2={baselineY}
            stroke="#e2e8f0"
            strokeWidth="1.2"
          />

          {/* Bottom X Axis baseline */}
          <line
            x1={paddingLeft}
            y1={baselineY}
            x2={width - paddingRight + 4}
            y2={baselineY}
            stroke="#e2e8f0"
            strokeWidth="1.2"
          />

          {/* Y Axis Numbers */}
          {yTicks.map((tick) => {
            const y = getY(tick)
            return (
              <text
                key={tick}
                x={paddingLeft - 7}
                y={y + 3.5}
                textAnchor="end"
                fontSize="11"
                fill="#64748b"
                fontWeight="600"
              >
                {tick}
              </text>
            )
          })}

          {/* Bars & Labels */}
          {data.map((item, idx) => {
            const cx = paddingLeft + (idx + 0.5) * slotWidth
            const x = cx - barWidth / 2
            const y = getY(item.count)
            const config = platformConfig[item.platform] || {
              barColor: item.color,
              textColor: '#0f172a',
            }

            // Path for bar with rounded top corners and flat bottom sitting on baseline
            const barPath = `
              M ${x},${baselineY}
              L ${x},${y + cornerRadius}
              Q ${x},${y} ${x + cornerRadius},${y}
              L ${x + barWidth - cornerRadius},${y}
              Q ${x + barWidth},${y} ${x + barWidth},${y + cornerRadius}
              L ${x + barWidth},${baselineY}
              Z
            `

            return (
              <g key={item.platform} className="group cursor-pointer">
                {/* Value on top of bar */}
                <text
                  x={cx}
                  y={y - 7}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="800"
                  fill={config.textColor}
                >
                  {item.count}
                </text>

                {/* Bar */}
                <path
                  d={barPath}
                  fill={config.barColor}
                  className="transition-opacity duration-200 group-hover:opacity-90"
                />

                {/* Platform Icon */}
                {item.platform === 'YouTube' && (
                  <g transform={`translate(${cx - 9}, ${iconY - 6.5})`}>
                    <rect width="18" height="13" rx="3.5" fill="#ef4444" />
                    <polygon points="7,3.5 12.5,6.5 7,9.5" fill="#ffffff" />
                  </g>
                )}

                {item.platform === 'TikTok' && (
                  <g transform={`translate(${cx - 7}, ${iconY - 7.5})`}>
                    <svg width="14" height="15" viewBox="0 0 24 24" fill="#0f172a">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.27 6.27 0 0 0 1.86-4.46V8.78a8.16 8.16 0 0 0 4.92 1.63V6.96a4.85 4.85 0 0 1-1-.27z" />
                    </svg>
                  </g>
                )}

                {item.platform === 'Instagram' && (
                  <g transform={`translate(${cx - 7.5}, ${iconY - 7.5})`}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="url(#igIconGrad)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
                    </svg>
                  </g>
                )}

                {item.platform === 'Facebook' && (
                  <g transform={`translate(${cx - 7.5}, ${iconY - 7.5})`}>
                    <circle cx="7.5" cy="7.5" r="7.5" fill="#2563eb" />
                    <path
                      d="M10 8 H8.4 V13 H6.3 V8 H5.2 V6.2 H6.3 V4.9 C6.3 3.8 7 3 8.4 3 H9.9 V4.7 H8.9 C8.4 4.7 8.4 4.9 8.4 5.3 V6.2 H10.1 L10 8 Z"
                      fill="#ffffff"
                    />
                  </g>
                )}

                {/* Platform Label */}
                <text
                  x={cx}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#1e293b"
                  fontWeight="600"
                >
                  {item.platform}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
