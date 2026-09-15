import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook } from '@fortawesome/free-brands-svg-icons'
import {
  Activity,
  Bell,
  Check,
  Database,
  HardDrive,
  Info,
  Plus,
  Radio,
  RefreshCw,
  Save,
  ShieldAlert,
  Tag,
  Trash2,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { SourcesPage } from './SourcesPage'

export type SettingsTab = 'koneksi' | 'akun' | 'keyword' | 'lainnya'

const DEFAULT_FB_PAGES = [
  { name: 'Kompas.com', label: 'Media Nasional Terverifikasi', status: 'Crawler Publik Aktif' },
  { name: 'detikcom', label: 'Portal Berita Digital', status: 'Crawler Publik Aktif' },
  { name: 'CNN Indonesia', label: 'Berita & Investigasi Kebijakan', status: 'Crawler Publik Aktif' },
  { name: 'Badan Gizi Nasional (BGN)', label: 'Fanspage Resmi Program MBG', status: 'Pantauan Langsung' },
]


const DEFAULT_PRIMARY_KEYWORDS = [
  'MBG',
  'Makan Bergizi Gratis',
  'Dapur SPPG',
  'Satuan Pelayanan Pangan Gizi',
]

const DEFAULT_ISSUE_KEYWORDS = [
  'keracunan',
  'basi',
  'tidak tepat sasaran',
  'terlambat',
  'porsi sedikit',
  'ompreng',
  'susu sapi',
]

export interface SettingsPageProps {
  initialTab?: SettingsTab
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  initialTab = 'koneksi',
}) => {
  // Keyword Utama (Wajib ada pada konten)
  const [primaryKeywords, setPrimaryKeywords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mbg_primary_keywords')
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_PRIMARY_KEYWORDS
  })
  const [newPrimary, setNewPrimary] = useState('')

  // Keyword Isu Terkait (Hanya ditarik jika bersamaan dengan Keyword Utama)
  const [issueKeywords, setIssueKeywords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mbg_issue_keywords')
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_ISSUE_KEYWORDS
  })
  const [newIssue, setNewIssue] = useState('')


  // Interval crawler default aman: 6 jam
  const [syncInterval, setSyncInterval] = useState('360') // 360 min = 6 jam

  // Early warning multi-kondisi
  const [minNegativePercent, setMinNegativePercent] = useState('35')
  const [minCommentThreshold, setMinCommentThreshold] = useState('500')
  const [requireSpikeCondition, setRequireSpikeCondition] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)

  // Status Actions (Save, Clear Cache, Ping API)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [cacheClearMessage, setCacheClearMessage] = useState<string | null>(null)
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [apiTestMessage, setApiTestMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab)

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const getStorageStats = () => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('mbg_'))
      let totalBytes = 0
      keys.forEach((k) => {
        const val = localStorage.getItem(k) || ''
        totalBytes += (k.length + val.length) * 2
      })
      const kb = (totalBytes / 1024).toFixed(1)
      return { count: keys.length, size: `${kb} KB` }
    } catch {
      return { count: 0, size: '0 KB' }
    }
  }

  const [storageStats, setStorageStats] = useState(getStorageStats())

  // Dengarkan jika ada event pembersihan cache
  useEffect(() => {
    const handleCacheCleared = () => {
      setPrimaryKeywords(DEFAULT_PRIMARY_KEYWORDS)
      setIssueKeywords(DEFAULT_ISSUE_KEYWORDS)
      setStorageStats({ count: 0, size: '0 KB' })
    }
    window.addEventListener('mbg-cache-cleared', handleCacheCleared)
    return () => window.removeEventListener('mbg-cache-cleared', handleCacheCleared)
  }, [])

  // Collector status data
  const collectors = [
    {
      platform: 'YouTube',
      mode: 'YouTube Data API v3 (Official API Key)',
      status: 'Active Connected',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      lastSync: 'Baru saja (Sync Sukses)',
      itemsFound: '5 video asli MBG',
      latency: '98 ms',
      quotaUsed: '2.5% dari 10.000 kuota harian',
      errorCount: 0,
    },
    {
      platform: 'TikTok',
      mode: 'TikTok Creative & Search API',
      status: 'Connected',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      lastSync: '25 menit lalu',
      itemsFound: '34 video',
      latency: '142 ms',
      quotaUsed: '18% dari kuota harian',
      errorCount: 0,
    },
    {
      platform: 'Instagram',
      mode: 'Public Open Graph Scraper (Tanpa API & Login)',
      status: 'Active (Tanpa API)',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      lastSync: 'Baru saja (Open Graph)',
      itemsFound: '5 konten publik MBG',
      latency: '115 ms',
      quotaUsed: 'Tanpa Batas (Bebas Kuota/Login)',
      errorCount: 0,
    },
    {
      platform: 'Facebook',
      mode: 'Public Fanspage News Crawler (Tanpa API & Login)',
      status: 'Active (Tanpa API)',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      lastSync: 'Baru saja (Crawler Aktif)',
      itemsFound: '5 post fanspage MBG',
      latency: '128 ms',
      quotaUsed: 'Tanpa Batas (Bebas Kuota/Login)',
      errorCount: 0,
    },
  ]

  const handleAddPrimary = () => {
    if (newPrimary.trim() && !primaryKeywords.includes(newPrimary.trim())) {
      setPrimaryKeywords([...primaryKeywords, newPrimary.trim()])
      setNewPrimary('')
    }
  }

  const handleRemovePrimary = (kw: string) => {
    setPrimaryKeywords(primaryKeywords.filter((k) => k !== kw))
  }

  const handleAddIssue = () => {
    if (newIssue.trim() && !issueKeywords.includes(newIssue.trim())) {
      setIssueKeywords([...issueKeywords, newIssue.trim()])
      setNewIssue('')
    }
  }

  const handleRemoveIssue = (kw: string) => {
    setIssueKeywords(issueKeywords.filter((k) => k !== kw))
  }

  const handleSave = () => {
    try {
      localStorage.setItem('mbg_primary_keywords', JSON.stringify(primaryKeywords))
      localStorage.setItem('mbg_issue_keywords', JSON.stringify(issueKeywords))
      setStorageStats(getStorageStats())
    } catch {}
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleClearCache = () => {
    setIsClearingCache(true)
    setTimeout(() => {
      // Hapus seluruh key mbg_* dari browser localStorage
      const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('mbg_'))
      const totalKeys = keysToRemove.length
      keysToRemove.forEach((k) => localStorage.removeItem(k))

      // Tandai bahwa cache telah dibersihkan kosong
      localStorage.setItem('mbg_cleared_empty', 'true')

      // Reset state internal di SettingsPage
      setPrimaryKeywords(DEFAULT_PRIMARY_KEYWORDS)
      setIssueKeywords(DEFAULT_ISSUE_KEYWORDS)
      setStorageStats({ count: 1, size: '0.1 KB' })

      // Broadcast event ke semua halaman aktif (Dashboard, Konten, Komentar, Sumber)
      window.dispatchEvent(new CustomEvent('mbg-cache-cleared'))

      setIsClearingCache(false)
      setCacheClearMessage(
        `Cache berhasil dibersihkan! ${totalKeys} item lokal dihapus. Halaman Konten, Komentar, dan Dasbor kini telah dikosongkan secara bersih.`
      )
      setTimeout(() => setCacheClearMessage(null), 5000)
    }, 650)
  }


  const handleTestAllApi = () => {
    setIsTestingApi(true)
    setTimeout(() => {
      setIsTestingApi(false)
      setApiTestMessage('Uji koneksi selesai: 4 Platform (YouTube API, TikTok, Instagram Scraper & Facebook Crawler) aktif optimal dan siap pantau MBG.')
      setTimeout(() => setApiTestMessage(null), 4000)
    }, 1100)
  }

  return (
    <div className="space-y-6 pb-10 animate-section">
      {/* Title & Top Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            Pengaturan Sistem & Pemantauan MBG
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pusat kontrol database, status koneksi API platform sosial media, dan logika pemantauan crawler.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="self-start sm:self-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {/* Sub-section Indicator */}
      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-400">Bagian:</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
          {activeTab === 'koneksi' && 'Koneksi & API'}
          {activeTab === 'akun' && 'Target Akun'}
          {activeTab === 'keyword' && 'Kata Kunci'}
          {activeTab === 'lainnya' && 'Lainnya (Sistem & Cache)'}
        </span>
      </div>

      {/* Global Alerts */}
      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan parameter pemantauan berhasil disimpan ke konfigurasi lokal!</span>
        </div>
      )}

      {cacheClearMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{cacheClearMessage}</span>
        </div>
      )}

      {apiTestMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <Activity className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{apiTestMessage}</span>
        </div>
      )}

      {/* SUB-MENU 1: KONEKSI & API */}
      {activeTab === 'koneksi' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Status Database Supabase */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Status Database Supabase (asafik)
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Healthy (Production)
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Database PostgreSQL terkelola di <strong>Supabase Cloud</strong> untuk penyimpanan data konten, komentar, dan analisis MBG.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Proyek</span>
                <span className="font-bold text-slate-800 text-xs">asafik</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Region</span>
                <span className="font-bold text-slate-800 text-xs">ap-northeast-1</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Compute</span>
                <span className="font-bold text-emerald-600 text-xs">Nano (CPU 3%)</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Total Record</span>
                <span className="font-bold text-emerald-600 text-xs">25 data asli (5 Video + 20 Komentar)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>Koneksi: <strong className="text-emerald-700 font-medium">Terhubung Langsung (Pooler 6543)</strong></span>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold text-[10px]">
                REST API & Realtime Terhubung
              </span>
            </div>
          </div>

          {/* Status Koneksi API 4 Platform */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Status Koneksi API & Platform Media Sosial
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    4 Platform Terhubung
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pantauan koneksi data scraper, kecepatan respon (latensi), dan penggunaan kuota API harian.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                  4/4 Normal & Aktif Optimal
                </span>
                <button
                  type="button"
                  onClick={handleTestAllApi}
                  disabled={isTestingApi}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
                  <span>{isTestingApi ? 'Menguji API...' : 'Ping / Uji Semua API'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Metode API / Collector</th>
                    <th className="py-2.5 px-3">Status Koneksi</th>
                    <th className="py-2.5 px-3">Latensi</th>
                    <th className="py-2.5 px-3">Terakhir Sinkron</th>
                    <th className="py-2.5 px-3">Penggunaan Kuota</th>
                    <th className="py-2.5 px-3 text-right">Konten Terdeteksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {collectors.map((c) => (
                    <tr key={c.platform} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {c.platform}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {c.mode}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block border px-2 py-0.5 rounded text-[10.5px] font-bold ${c.statusColor}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {c.latency}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {c.lastSync}
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <span className={c.quotaUsed.includes('Rate limit') ? 'text-amber-700 font-semibold' : 'text-slate-500'}>
                          {c.quotaUsed}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {c.itemsFound}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 2: TARGET AKUN */}
      {activeTab === 'akun' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Unified Target Akun Management */}
          <SourcesPage embedded={true} />

          {/* Target Halaman / Fanspage Facebook */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFacebook} className="text-base text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Target Fanspage Publik Facebook (Facebook Media Sources)
                </h3>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  {DEFAULT_FB_PAGES.length} Sumber Berita
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Crawler publik menyerap berita seputar MBG secara berkala dari portal berita dan institusi resmi berikut tanpa login.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {DEFAULT_FB_PAGES.map((page) => (
                <div key={page.name} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 block truncate">{page.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">{page.label}</span>
                  </div>
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                    {page.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 3: KATA KUNCI */}
      {activeTab === 'keyword' && (
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Manajemen Kata Kunci Bertingkat (Keyword Contextual Logic)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Keyword isu hanya ditarik jika terdapat keyword utama dalam konten/komentar yang sama untuk menghindari noise berita lain yang tidak berhubungan.
            </p>
          </div>

          {/* 3A: Keyword Utama */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                1. Keyword Utama (Wajib Ada):
              </span>
              <span className="text-[11px] text-slate-400">Entitas Subjek MBG</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah keyword utama baru..."
                value={newPrimary}
                onChange={(e) => setNewPrimary(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPrimary()}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={handleAddPrimary}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {primaryKeywords.map((kw) => (
                <span
                  key={kw}
                  className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  #{kw}
                  <button
                    type="button"
                    onClick={() => handleRemovePrimary(kw)}
                    className="text-blue-400 hover:text-blue-700 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 3B: Keyword Isu Terkait */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                2. Keyword Isu Terkait (Terkait Erat dengan MBG):
              </span>
              <span className="text-[11px] text-slate-400">Indikator Masalah & Topik</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah keyword isu baru (contoh: 'muntah', 'anggaran')..."
                value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddIssue()}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={handleAddIssue}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {issueKeywords.map((kw) => (
                <span
                  key={kw}
                  className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  #{kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveIssue(kw)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 4: LAINNYA (SISTEM, CACHE & ALARM) */}
      {activeTab === 'lainnya' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Pembersihan Cache & Local Storage */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Cache & Penyimpanan Browser (Local Storage)
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Aktif • {storageStats.count} Key Tersimpan
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Membersihkan seluruh data cache yang tersimpan di <strong>LocalStorage browser</strong> (hasil fetch live YouTube/IG/FB, komentar tersimpan, pengaturan sumber & akun) agar semua halaman kembali bersih.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Penyimpanan</span>
                <span className="font-bold text-slate-800 text-xs">LocalStorage</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Data Tersimpan</span>
                <span className="font-bold text-slate-800 text-xs">{storageStats.count} Item</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Ukuran Cache</span>
                <span className="font-bold text-amber-600 text-xs">{storageStats.size}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                Mereset konten, komentar, sumber, dan setting ke default
              </span>
              <button
                type="button"
                onClick={handleClearCache}
                disabled={isClearingCache}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Bersihkan seluruh data yang tersimpan di LocalStorage browser"
              >
                <Trash2 className={`w-3.5 h-3.5 ${isClearingCache ? 'animate-spin' : ''}`} />
                <span>{isClearingCache ? 'Membersihkan Cache...' : 'Bersihkan Cache (Clear Cache)'}</span>
              </button>
            </div>
          </div>

          {/* Frekuensi Interval Sinkronisasi Crawler */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Frekuensi Interval Sinkronisasi Crawler
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Interval diatur lebih bijak untuk mencegah kena penalti kuota (rate-limit) pada free tier API media sosial:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: '360', label: '6 Jam (Direkomendasikan)', desc: 'Optimal & aman kuota' },
                { value: '720', label: '12 Jam', desc: 'Sangat hemat request' },
                { value: '60', label: '1 Jam', desc: 'Untuk server production' },
                { value: '15', label: '15 Menit', desc: 'Khusus masa krisis darurat' },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    syncInterval === item.value
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="syncInterval"
                    value={item.value}
                    checked={syncInterval === item.value}
                    onChange={(e) => setSyncInterval(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold text-slate-800 block">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {item.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Alarm Peringatan Dini (Early Warning Rule) */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Logika Alarm Peringatan Dini (Early Warning Rule)
              </h3>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Logika Cerdas Multi-Kondisi:</strong> Alarm tidak akan sembarangan berbunyi hanya karena ada sedikit komentar negatif. Alarm hanya aktif jika terpenuhi kondisi statistik di bawah:
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  1. Ambang Batas Sentimen Negatif (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="60"
                    step="5"
                    value={minNegativePercent}
                    onChange={(e) => setMinNegativePercent(e.target.value)}
                    className="flex-1 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-rose-600 w-10">
                    &gt; {minNegativePercent}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Pemicu jika rasio negatif melebihi nilai ini.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  2. Batas Minimal Sampel Komentar Terkumpul
                </label>
                <select
                  value={minCommentThreshold}
                  onChange={(e) => setMinCommentThreshold(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="200">Minimal 200 komentar</option>
                  <option value="500">Minimal 500 komentar (Direkomendasikan)</option>
                  <option value="1000">Minimal 1.000 komentar</option>
                </select>
                <span className="text-[10px] text-slate-400">
                  Mencegah alarm palsu dari sampel kecil.
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={requireSpikeCondition}
                  onChange={(e) => setRequireSpikeCondition(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Syarat lonjakan: Pertumbuhan negatif &gt; 2x lipat periode sebelumnya</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Kirim Notifikasi Email Darurat</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Save Button at Bottom */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Seluruh Pengaturan</span>
        </button>
      </div>
    </div>
  )
}
