import {
  ChevronRight,
  Flame,
  Info,
  MessageSquare,
  Sparkles,
  Tag,
  Video,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import {
  mockTopicsExtendedList,
  type TopicExtendedItem,
} from '../data/extendedMockData'

export const TopicsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'semua' | 'sistem' | 'otomatis'>('semua')
  const [activeTopicDetail, setActiveTopicDetail] = useState<TopicExtendedItem | null>(null)

  const filteredTopics = mockTopicsExtendedList.filter((item) => {
    if (selectedFilter === 'semua') return true
    return item.category === selectedFilter
  })

  return (
    <div className="space-y-5 animate-section">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
          Kluster Topik & Isu Publik MBG
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Pengelompokan percakapan masyarakat ke dalam isu terstruktur (Sistem) dan isu baru yang muncul tanpa rekayasa kategori (Terdeteksi Otomatis).
        </p>
      </div>

      {/* Filter Tabs & Concept Explanation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium mr-1">Kategori Topik:</span>
          <button
            type="button"
            onClick={() => setSelectedFilter('semua')}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              selectedFilter === 'semua'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({mockTopicsExtendedList.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('sistem')}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              selectedFilter === 'sistem'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Tag className="w-3 h-3" />
            Topik Sistem (Terstruktur)
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('otomatis')}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              selectedFilter === 'otomatis'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            Terdeteksi Otomatis (Emerging Issues)
          </button>
        </div>

        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          Klik salah satu kartu topik untuk melihat komentar & video pemicu lonjakan.
        </span>
      </div>

      {/* Grid of Topic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => {
          const isSelected = activeTopicDetail?.id === topic.id
          return (
            <div
              key={topic.id}
              onClick={() => setActiveTopicDetail(isSelected ? null : topic)}
              className={`bg-white rounded-lg p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Badge category + Period Growth Trend */}
                <div className="flex items-center justify-between gap-2">
                  {topic.category === 'otomatis' ? (
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10.5px] font-bold px-2 py-0.5 rounded border border-purple-200">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      Terdeteksi Otomatis
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10.5px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                      <Tag className="w-3 h-3 text-slate-500" />
                      Topik Sistem
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    <Flame className="w-3 h-3 fill-rose-500" />
                    <span>{topic.growthPercentage} minggu ini</span>
                  </div>
                </div>

                {/* Topic Name */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {topic.name}
                </h3>

                {/* Mention volume */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-900 text-sm">
                    {topic.mentionCount}
                  </span>
                  <span>tercatat di 4 platform</span>
                </div>

                {/* Mini Sentiment Ratio Bar */}
                <div className="space-y-1 pt-1">
                  <div className="h-2 rounded-sm bg-slate-100 overflow-hidden flex shadow-inner">
                    <div
                      style={{ width: `${topic.positiveRatio}%` }}
                      className="bg-emerald-500"
                      title={`Positif: ${topic.positiveRatio}%`}
                    ></div>
                    <div
                      style={{ width: `${topic.neutralRatio}%` }}
                      className="bg-slate-400"
                      title={`Netral: ${topic.neutralRatio}%`}
                    ></div>
                    <div
                      style={{ width: `${topic.negativeRatio}%` }}
                      className="bg-rose-500"
                      title={`Negatif: ${topic.negativeRatio}%`}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-600 font-medium">
                      {topic.positiveRatio}% Positif
                    </span>
                    <span className="text-rose-600 font-medium">
                      {topic.negativeRatio}% Negatif
                    </span>
                  </div>
                </div>

                {/* Keywords pill list */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {topic.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                <span>{isSelected ? 'Tutup Detail' : 'Buka Bukti Komentar & Konten'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* DETAIL DRAWER / SECTION WHEN TOPIC IS CLICKED */}
      {activeTopicDetail && (
        <div className="bg-white rounded-lg p-5 border-2 border-blue-500/80 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Detail & Bukti Percakapan Isu
                </span>
                <span className="text-[11px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded">
                  Lonjakan {activeTopicDetail.growthPercentage} periode ini
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {activeTopicDetail.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setActiveTopicDetail(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Sample comments in this topic */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                Sampel Komentar Netizen Terkait
              </h4>
              <div className="space-y-2">
                {activeTopicDetail.sampleComments.map((cm, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">
                        {cm.author} ({cm.platform})
                      </span>
                      <span
                        className={`font-bold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                          cm.sentiment === 'positif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cm.sentiment === 'negatif'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {cm.sentiment}
                      </span>
                    </div>
                    <p className="text-slate-800 italic">"{cm.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Associated contents causing the spike */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-600" />
                Konten Media Sosial Pemicu Isu
              </h4>
              <div className="space-y-2">
                {activeTopicDetail.associatedContents.map((cnt) => (
                  <div
                    key={cnt.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        {cnt.platform}
                      </span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {cnt.title}
                      </p>
                    </div>
                    <span className="text-[11px] text-blue-600 font-semibold shrink-0">
                      Terindeks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
