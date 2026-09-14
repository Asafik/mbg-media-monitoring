import {
  ArrowRight,
  Layers,
  MessageSquare,
  Tag,
} from 'lucide-react'
import React, { useState } from 'react'
import { allDetailedContents, mockCommentsList } from '../data/extendedMockData'
import type { SentimentType } from '../types/dashboard'

interface KeywordMeta {
  text: string
  parentTopic: string
  count: number
  sentiment: SentimentType
  growth: string
  category: 'Kualitas & Higienitas' | 'Nutrisi & Menu' | 'Logistik & Wadah' | 'Kebijakan'
}

export const KeywordsPage: React.FC = () => {
  const [selectedKeyword, setSelectedKeyword] = useState<string>('keracunan')

  const keywordDataset: KeywordMeta[] = [
    { text: 'keracunan', parentTopic: 'Keamanan & Higienitas Makanan', count: 1840, sentiment: 'negatif', growth: '+32%', category: 'Kualitas & Higienitas' },
    { text: 'gizi', parentTopic: 'Menu 4 Sehat 5 Sempurna & Gizi Anak', count: 2450, sentiment: 'positif', growth: '+14%', category: 'Nutrisi & Menu' },
    { text: 'susu', parentTopic: 'Isu Susu Sapi Segar vs Susu Kotak', count: 1620, sentiment: 'netral', growth: '+24%', category: 'Nutrisi & Menu' },
    { text: 'basi', parentTopic: 'Keamanan & Higienitas Makanan', count: 980, sentiment: 'negatif', growth: '+28%', category: 'Kualitas & Higienitas' },
    { text: 'ompreng', parentTopic: 'Polemik Wadah Ompreng & Limbah', count: 1290, sentiment: 'netral', growth: '+42%', category: 'Logistik & Wadah' },
    { text: 'stunting', parentTopic: 'Menu 4 Sehat 5 Sempurna & Gizi Anak', count: 1120, sentiment: 'positif', growth: '+9%', category: 'Nutrisi & Menu' },
    { text: 'dapur sppg', parentTopic: 'Kemitraan Dapur SPPG & Petani Lokal', count: 860, sentiment: 'positif', growth: '+6%', category: 'Kebijakan' },
    { text: 'porsi sedikit', parentTopic: 'Evaluasi Kecukupan Porsi', count: 740, sentiment: 'negatif', growth: '+18%', category: 'Kualitas & Higienitas' },
    { text: 'telur', parentTopic: 'Menu 4 Sehat 5 Sempurna & Gizi Anak', count: 1340, sentiment: 'positif', growth: '+11%', category: 'Nutrisi & Menu' },
    { text: 'terlambat', parentTopic: 'Ketepatan Jam Pengiriman MBG', count: 680, sentiment: 'negatif', growth: '+15%', category: 'Logistik & Wadah' },
    { text: 'buah', parentTopic: 'Menu 4 Sehat 5 Sempurna & Gizi Anak', count: 920, sentiment: 'positif', growth: '+8%', category: 'Nutrisi & Menu' },
    { text: 'anggaran', parentTopic: 'Akuntabilitas & Biaya Per Porsi', count: 810, sentiment: 'netral', growth: '+4%', category: 'Kebijakan' },
  ]

  // Filtered comments containing selected keyword
  const kwLower = selectedKeyword.toLowerCase()
  const matchedComments = selectedKeyword
    ? mockCommentsList.filter(
        (c) =>
          c.text.toLowerCase().includes(kwLower) ||
          c.sourceContentTitle.toLowerCase().includes(kwLower)
      )
    : []

  // Filtered contents containing selected keyword
  const matchedContents = selectedKeyword
    ? allDetailedContents.filter((cnt) =>
        cnt.title.toLowerCase().includes(kwLower)
      )
    : []

  const selectedMeta = keywordDataset.find((k) => k.text === selectedKeyword)

  return (
    <div className="space-y-5">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
          Analisis Kata Kunci (Keywords) MBG
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Eksplorasi entitas kata yang paling sering diucapkan netizen, frekuensi kemunculan, dan hubungan semantiknya dengan kluster topik.
        </p>
      </div>

      {/* Concept Architecture Banner: Keyword vs Topik */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg shrink-0 mt-0.5 border border-blue-400/30">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold tracking-wide uppercase text-blue-300">
                Arsitektur Semantik Sistem
              </h3>
              <p className="text-xs text-slate-200">
                Perbedaan mendasar antara <strong>Kata Kunci (Keyword)</strong> dan <strong>Topik (Topic)</strong>:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block font-mono">Entitas Kata</span>
              <span className="font-bold text-rose-400">basi, muntah, keracunan</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block font-mono">Kelompok Makna</span>
              <span className="font-bold text-emerald-400">Keamanan & Higienitas Makanan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Word Cloud Card */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Word Cloud Interaktif (Klik Kata untuk Memfilter Bukti)
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Ukuran teks mencerminkan frekuensi sebutan
          </span>
        </div>

        {/* Word Cloud Tag Cloud */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 p-6 bg-slate-50/70 rounded-lg min-h-[140px] border border-slate-100">
          {keywordDataset.map((kw) => {
            const isSelected = selectedKeyword === kw.text

            // Dynamic font sizes based on mention volume
            let sizeClass = 'text-xs'
            if (kw.count > 2000) sizeClass = 'text-lg font-extrabold'
            else if (kw.count > 1200) sizeClass = 'text-sm font-bold'
            else if (kw.count > 800) sizeClass = 'text-xs font-semibold'

            // Color by sentiment
            let colorClass = 'bg-slate-100 text-slate-700 border-slate-200'
            if (kw.sentiment === 'positif') {
              colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
            } else if (kw.sentiment === 'negatif') {
              colorClass = 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
            } else {
              colorClass = 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }

            return (
              <button
                key={kw.text}
                type="button"
                onClick={() => setSelectedKeyword(kw.text)}
                className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${sizeClass} ${colorClass} ${
                  isSelected ? 'ring-2 ring-blue-600 shadow-sm scale-105' : ''
                }`}
              >
                #{kw.text}
                <span className="text-[10px] opacity-75 ml-1">({kw.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* FILTER DRILLDOWN PANEL: PROVEN EVIDENCE FOR SELECTED KEYWORD */}
      {selectedMeta && (
        <div className="bg-white rounded-lg p-5 border-2 border-blue-500 shadow-md space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                #{selectedMeta.text.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Kata Kunci: #{selectedMeta.text}
                  </h3>
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded capitalize ${
                      selectedMeta.sentiment === 'positif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedMeta.sentiment === 'negatif'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Sentimen: {selectedMeta.sentiment}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tergabung dalam kluster topik:{' '}
                  <strong className="text-slate-800">{selectedMeta.parentTopic}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Total Sebutan</span>
                <span className="font-bold text-slate-900 text-sm">{selectedMeta.count.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Kenaikan Tren</span>
                <span className="font-bold text-emerald-600 text-sm">{selectedMeta.growth}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Left: Matched Comments */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                Sampel Komentar Mengandung "#{selectedMeta.text}" ({matchedComments.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {matchedComments.length > 0 ? (
                  matchedComments.map((cm) => (
                    <div
                      key={cm.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">{cm.author}</span>
                        <span className="font-medium text-slate-400">{cm.platform}</span>
                      </div>
                      <p className="text-slate-800 font-normal">"{cm.text}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg">
                    Tidak ada komentar sampel yang persis mengandung kata ini di batch ringkas.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Matched Content */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Konten Video/Postingan Terkait "#{selectedMeta.text}" ({matchedContents.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {matchedContents.length > 0 ? (
                  matchedContents.map((cnt) => (
                    <div
                      key={cnt.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                    >
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        {cnt.platform} • {cnt.views}
                      </span>
                      <p className="font-semibold text-slate-900 leading-snug">
                        {cnt.title}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg">
                    Kata kunci ini tersebar terutama di ribuan komentar percakapan publik.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table: Full Keyword Frequency & Topic Mapping */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Tabel Pemetaan Kata Kunci ke Kluster Topik
          </h3>
          <span className="text-xs text-slate-400">{keywordDataset.length} Entitas Kata</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Kata Kunci</th>
                <th className="py-2.5 px-4">Kluster Topik Induk</th>
                <th className="py-2.5 px-4">Kategori Isu</th>
                <th className="py-2.5 px-4 text-right">Frekuensi Sebutan</th>
                <th className="py-2.5 px-4">Sentimen Dominan</th>
                <th className="py-2.5 px-4 text-right">Kenaikan Tren</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {keywordDataset.map((item) => (
                <tr
                  key={item.text}
                  onClick={() => setSelectedKeyword(item.text)}
                  className={`cursor-pointer transition-colors ${
                    selectedKeyword === item.text ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-slate-900">
                    #{item.text}
                  </td>
                  <td className="py-3 px-4 text-blue-700">
                    {item.parentTopic}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {item.category}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {item.count.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded capitalize ${
                        item.sentiment === 'positif'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.sentiment === 'negatif'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.sentiment}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                    {item.growth}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
