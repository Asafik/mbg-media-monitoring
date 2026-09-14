import React, { useState } from 'react'
import type { KeywordItem, SentimentType } from '../types/dashboard'

interface KeywordCloudProps {
  keywords: KeywordItem[]
}

export const KeywordCloud: React.FC<KeywordCloudProps> = ({ keywords }) => {
  const [activeFilter, setActiveFilter] = useState<'semua' | SentimentType>('semua')

  const filterTabs: Array<{ id: 'semua' | SentimentType; label: string }> = [
    { id: 'semua', label: 'Semua' },
    { id: 'positif', label: 'Positif' },
    { id: 'negatif', label: 'Negatif' },
    { id: 'netral', label: 'Netral' },
  ]

  const filteredKeywords = keywords.filter((k) => {
    if (activeFilter === 'semua') return true
    return k.category === activeFilter
  })

  // Size mapping
  const getSizeClass = (size: KeywordItem['size']) => {
    switch (size) {
      case '2xl':
        return 'text-3xl font-extrabold'
      case 'xl':
        return 'text-2xl font-bold'
      case 'lg':
        return 'text-xl font-bold'
      case 'md':
        return 'text-lg font-semibold'
      case 'sm':
        return 'text-sm font-semibold'
      case 'xs':
        return 'text-xs font-semibold'
      default:
        return 'text-sm font-semibold'
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      {/* Header with Filter Tabs */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-1">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Keyword Populer</h3>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Word Cloud Visual Canvas */}
      <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-x-4 gap-y-3 p-4 min-h-[160px] bg-slate-50/40 rounded-lg border border-slate-100/60">
        {filteredKeywords.map((item, idx) => (
          <span
            key={`${item.text}-${idx}`}
            className={`transition-all duration-200 hover:scale-110 cursor-pointer select-none ${getSizeClass(
              item.size,
            )}`}
            style={{ color: item.color }}
          >
            {item.text}
          </span>
        ))}

        {filteredKeywords.length === 0 && (
          <div className="text-xs text-slate-400">
            Tidak ada kata kunci untuk kategori ini.
          </div>
        )}
      </div>
    </div>
  )
}
