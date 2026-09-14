import {
  ArrowDown,
  ArrowUp,
  MinusCircle,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import React from 'react'
import type { KpiItem } from '../types/dashboard'

interface KpiCardsProps {
  items: KpiItem[]
}

export const KpiCards: React.FC<KpiCardsProps> = ({ items }) => {
  const getIcon = (type: KpiItem['type']) => {
    switch (type) {
      case 'content':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <svg className="w-5 h-5 fill-blue-600" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5zM16 18H8v-2h8v2zm0-4H8v-2h8v2z" />
            </svg>
          </div>
        )
      case 'comment':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <svg className="w-5 h-5 fill-blue-600" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
        )
      case 'sentiment-positive':
        return (
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ThumbsUp className="w-5 h-5 fill-emerald-600 stroke-emerald-600" />
          </div>
        )
      case 'sentiment-negative':
        return (
          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <ThumbsDown className="w-5 h-5 fill-rose-600 stroke-rose-600" />
          </div>
        )
      case 'sentiment-neutral':
        return (
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <MinusCircle className="w-5 h-5 fill-slate-400 stroke-white stroke-[1.5]" />
          </div>
        )
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {items.map((item) => {
        const isUp = item.isPositiveChange
        return (
          <div
            key={item.id}
            className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                {getIcon(item.type)}
                <div>
                  <span className="text-[12px] font-medium text-slate-500 block leading-tight">
                    {item.title}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                      {item.value}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                        isUp
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isUp ? (
                        <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                      )}
                      <span>{item.change}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-normal">
                {item.subtitle}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
