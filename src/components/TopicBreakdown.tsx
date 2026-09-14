import React, { useState } from 'react'
import type { SentimentType, TopicItem } from '../types/dashboard'

interface TopicBreakdownProps {
  topics: TopicItem[]
}

export const TopicBreakdown: React.FC<TopicBreakdownProps> = ({ topics }) => {
  const [activeFilter, setActiveFilter] = useState<'semua' | SentimentType>('semua')

  const filterTabs: Array<{ id: 'semua' | SentimentType; label: string }> = [
    { id: 'semua', label: 'Semua' },
    { id: 'positif', label: 'Positif' },
    { id: 'negatif', label: 'Negatif' },
    { id: 'netral', label: 'Netral' },
  ]

  const filteredTopics = topics.filter((t) => {
    if (activeFilter === 'semua') return true
    return t.sentimentCategory === activeFilter
  })

  // Maximum value for proportional width calculation (using max of original list ~ 3000)
  const maxVal = 3200

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      {/* Header with Filter Tabs */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-1">
        <h3 className="text-xs font-bold text-slate-900 tracking-tight">
          Topik yang Sering Dibahas
        </h3>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3 my-auto">
        {filteredTopics.map((topic) => {
          const widthPercent = Math.max(12, (topic.count / maxVal) * 100)
          return (
            <div key={topic.name} className="flex items-center gap-3 text-xs">
              {/* Rank & Name */}
              <div className="w-36 sm:w-48 md:w-52 shrink-0 flex items-center gap-2">
                <span className="font-bold text-slate-700 w-3">{topic.rank}</span>
                <span className="font-medium text-slate-800 truncate" title={topic.name}>
                  {topic.name}
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="flex-1 bg-slate-50 h-2.5 rounded-sm overflow-hidden flex items-center">
                <div
                  className="h-full rounded-sm transition-all duration-700"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: topic.color,
                  }}
                ></div>
              </div>

              {/* Count Value */}
              <span className="w-12 text-right font-bold text-slate-700 shrink-0 text-[11px]">
                {topic.formattedCount}
              </span>
            </div>
          )
        })}

        {filteredTopics.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-400">
            Tidak ada topik untuk kategori ini.
          </div>
        )}
      </div>
    </div>
  )
}
