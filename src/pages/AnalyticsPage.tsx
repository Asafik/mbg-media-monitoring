import {
  AlertTriangle,
  Clock,
  HelpCircle,
  TrendingUp,
  Video,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

export const AnalyticsPage: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Semua Platform')
  const [showRiskFormula, setShowRiskFormula] = useState(false)

  const platforms = ['Semua Platform', 'YouTube', 'TikTok', 'Instagram', 'Facebook']

  const platformDataList = [
    {
      platform: 'TikTok',
      views: '4.9M tayangan',
      sampleComments: '4.820 komentar dianalisis',
      sentimentScore: '+21 (Cenderung Positif)',
      positive: 52,
      negative: 31,
      neutral: 17,
      color: '#111827',
      dominantIssue: 'Porsi & keseruan anak sekolah',
    },
    {
      platform: 'YouTube',
      views: '3.4M tayangan',
      sampleComments: '5.110 komentar dianalisis',
      sentimentScore: '-18 (Kritis / Negatif)',
      positive: 24,
      negative: 58,
      neutral: 18,
      color: '#ef4444',
      dominantIssue: 'Keracunan & kelayakan vendor MBG',
    },
    {
      platform: 'Instagram',
      views: '2.1M tayangan',
      sampleComments: '2.340 komentar dianalisis',
      sentimentScore: '-5 (Netral Kritis)',
      positive: 34,
      negative: 44,
      neutral: 22,
      color: '#c026d3',
      dominantIssue: 'Transparansi anggaran & biaya packaging',
    },
    {
      platform: 'Facebook',
      views: '890K tayangan',
      sampleComments: '1.200 komentar dianalisis',
      sentimentScore: '+8 (Netral Positif)',
      positive: 41,
      negative: 35,
      neutral: 24,
      color: '#2563eb',
      dominantIssue: 'Dukungan orang tua & pemda setempat',
    },
  ]

  const filteredPlatformList =
    selectedPlatform === 'Semua Platform'
      ? platformDataList
      : platformDataList.filter((p) => p.platform === selectedPlatform)

  const negativeDrivers = [
    {
      issue: 'Kualitas & Higienitas Makanan (Kasus Basi / Gejala Keracunan)',
      share: 44,
      count: '1.494 komentar sampel',
      severity: 'Tinggi',
      impact: 'Sensitivitas tinggi di YouTube & TikTok',
    },
    {
      issue: 'Keterlambatan Jam Pengiriman ke Sekolah',
      share: 26,
      count: '883 komentar sampel',
      severity: 'Sedang',
      impact: 'Mempengaruhi jam belajar mengajar',
    },
    {
      issue: 'Porsi Menu Dinilai Kurang Mengenyangkan untuk Anak SMP',
      share: 18,
      count: '611 komentar sampel',
      severity: 'Sedang',
      impact: 'Banyak diangkat di Facebook & Instagram',
    },
    {
      issue: 'Kekhawatiran Transparansi Anggaran & Akuntabilitas Vendor',
      share: 12,
      count: '407 komentar sampel',
      severity: 'Rendah',
      impact: 'Diskusi akademisi & pemerhati kebijakan',
    },
  ]

  return (
    <div className="space-y-5 animate-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            Analisis Sentimen & Tren Percakapan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data statistik analitik mendalam berdasarkan agregasi percakapan publik di 4 platform media sosial.
          </p>
        </div>
      </div>

      {/* Row 1: KPI Analytics Overview (Renamed & Scientifically Accurate) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Indeks Sentimen Publik (Skala -100 s/d +100) */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Indeks Sentimen Publik (PSI)
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">+31.2</div>
            <span className="text-[11px] text-emerald-600 font-medium">
              Skala -100 s/d +100 (Cenderung Positif)
            </span>
          </div>
        </div>

        {/* Metric 2: Indeks Risiko Reputasi 39% with Formula Tooltip */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">
                Indeks Risiko Isu Reputasi
              </span>
              <button
                type="button"
                onClick={() => setShowRiskFormula(!showRiskFormula)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Lihat dasar perhitungan rumus risiko"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-0.5">39% Waspada</div>
            <span className="text-[11px] text-rose-600 font-medium">
              Dipicu isu higienitas makanan di Jabar
            </span>
          </div>

          {/* Formula Tooltip Modal/Card */}
          {showRiskFormula && (
            <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-slate-900 text-white text-xs p-3.5 rounded-lg shadow-xl border border-slate-700 animate-in fade-in">
              <div className="font-bold border-b border-slate-700 pb-1.5 mb-1.5 flex items-center justify-between">
                <span>ⓘ Dasar Perhitungan Indeks Risiko (39%):</span>
                <button
                  type="button"
                  onClick={() => setShowRiskFormula(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 mb-2">
                Dihitung dari bobot parameter percakapan publik:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-200">
                <li><strong className="text-white">Rasio Komentar Negatif</strong> (bobot 40%) : 27.2%</li>
                <li><strong className="text-white">Kenaikan Isu Mingguan</strong> (bobot 25%) : +28% isu keracunan</li>
                <li><strong className="text-white">Tingkat Viralitas Konten Kritis</strong> (bobot 20%) : 1.4M views</li>
                <li><strong className="text-white">Kluster Isu Sensitif</strong> (bobot 15%) : Dampak kesehatan anak</li>
              </ul>
            </div>
          )}
        </div>

        {/* Metric 3: Total Tayangan Konten Terpantau (Bukan unique audience) */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Total Tayangan Konten Terpantau
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">11.6M</div>
            <span className="text-[11px] text-slate-400">
              Akumulasi views Top 5 konten di 4 platform
            </span>
          </div>
        </div>
      </div>

      {/* In-Page Platform Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
        <span className="text-xs text-slate-500 font-medium px-2">Filter Analisis:</span>
        {platforms.map((plat) => (
          <button
            key={plat}
            onClick={() => setSelectedPlatform(plat)}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              selectedPlatform === plat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {plat}
          </button>
        ))}
      </div>

      {/* Row 2: Perbandingan Sentimen Antar Platform (Lengkap Dengan Sampel Konteks) */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Perbandingan Sentimen Lintas Platform
            </h3>
            <p className="text-xs text-slate-400">
              Proporsi reaksi sentimen beserta volume tayangan dan jumlah sampel komentar yang dianalisis.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Positif
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Netral
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Negatif
            </span>
          </div>
        </div>

        {/* Platform bars with Sample Size Context */}
        <div className="space-y-4 pt-1">
          {filteredPlatformList.map((item) => (
            <div key={item.platform} className="space-y-1.5 p-3 rounded-lg bg-slate-50/60 border border-slate-100">
              <div className="flex flex-wrap items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="font-bold text-slate-800 text-sm">{item.platform}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">{item.views}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {item.sampleComments}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 sm:mt-0">
                  Skor: <span className="font-bold text-slate-700">{item.sentimentScore}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 rounded-sm bg-slate-200 overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${item.positive}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Positif: ${item.positive}%`}
                ></div>
                <div
                  style={{ width: `${item.neutral}%` }}
                  className="bg-slate-400 transition-all duration-500"
                  title={`Netral: ${item.neutral}%`}
                ></div>
                <div
                  style={{ width: `${item.negative}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Negatif: ${item.negative}%`}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-0.5">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    <strong>{item.positive}%</strong> Positif
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span>
                    <strong>{item.neutral}%</strong> Netral
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                    <strong>{item.negative}%</strong> Negatif
                  </span>
                </div>
                <span className="text-slate-400 hidden sm:inline">
                  Fokus isu: {item.dominantIssue}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: 2 Kolom: Pemicu Negatif & Waktu Aktivitas Tertinggi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Faktor Pendorong Sentimen Negatif */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Faktor Pendorong Sentimen Negatif
              </h3>
              <p className="text-xs text-slate-400">
                Akar permasalahan yang mendominasi kritik publik.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded">
              4 Kluster Utama
            </span>
          </div>

          <div className="space-y-3">
            {negativeDrivers.map((driver) => (
              <div key={driver.issue} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 leading-snug">
                    {driver.issue}
                  </span>
                  <span className="font-bold text-rose-600 ml-2 shrink-0">
                    {driver.share}%
                  </span>
                </div>
                <div className="h-2 rounded-sm bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-sm"
                    style={{ width: `${driver.share}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                  <span>{driver.count}</span>
                  <span className="text-slate-500 italic">{driver.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waktu Aktivitas Tertinggi Pada Data Terpantau */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Waktu Aktivitas Tertinggi Pada Data Terpantau
              </h3>
              <p className="text-xs text-slate-400">
                Pola jam interaksi netizen mengunggah reaksi dan komentar MBG.
              </p>
            </div>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>Jam Makan Siang Sekolah (11:30 - 13:30 WIB)</span>
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">Puncak Tertinggi</span>
              </div>
              <p className="text-[11px] text-blue-800">
                Lonjakan video unboxing menu MBG oleh murid dan guru, serta keluhan awal jika terjadi keterlambatan atau porsi basi.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Jam Pulang & Santai Malam (19:00 - 21:00 WIB)</span>
                <span className="text-slate-500 text-[10px]">Puncak Sekunder</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Orang tua murid berdiskusi di grup Facebook & kolom komentar TikTok mengenai menu makanan yang dikonsumsi anaknya seharian.
              </p>
            </div>

            <div className="p-2 text-[10.5px] text-slate-400 bg-slate-50/50 rounded border border-dashed border-slate-200 text-center">
              ⓘ Berdasarkan distribusi cap waktu 12.482 komentar sampel pada konten terindeks.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
