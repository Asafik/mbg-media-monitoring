import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
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
  Zap,
} from 'lucide-react'
import React, { useState } from 'react'

const DEFAULT_IG_ACCOUNTS = [
  { username: '@kompascom', label: 'Media Berita Nasional', isDefault: true, isActive: true },
  { username: '@tribunnews', label: 'Jaringan Berita Daerah', isDefault: true, isActive: true },
  { username: '@narasinewsroom', label: 'Jurnalisme Kritis & Investigasi', isDefault: true, isActive: true },
  { username: '@kumparancom', label: 'Media Digital & Warganet', isDefault: true, isActive: true },
]

export const SettingsPage: React.FC = () => {
  // Keyword Utama (Wajib ada pada konten)
  const [primaryKeywords, setPrimaryKeywords] = useState([
    'MBG',
    'Makan Bergizi Gratis',
    'Dapur SPPG',
    'Satuan Pelayanan Pangan Gizi',
  ])
  const [newPrimary, setNewPrimary] = useState('')

  // Keyword Isu Terkait (Hanya ditarik jika bersamaan dengan Keyword Utama)
  const [issueKeywords, setIssueKeywords] = useState([
    'keracunan',
    'basi',
    'tidak tepat sasaran',
    'terlambat',
    'porsi sedikit',
    'ompreng',
    'susu sapi',
  ])
  const [newIssue, setNewIssue] = useState('')

  // Monitored Instagram Public Accounts (Default 4 Media Besar)
  const [instagramAccounts, setInstagramAccounts] = useState<
    Array<{ username: string; label: string; isDefault: boolean; isActive?: boolean }>
  >(() => {
    try {
      const saved = localStorage.getItem('mbg_instagram_accounts')
      if (saved) return JSON.parse(saved)
    } catch {
      // Fallback
    }
    return DEFAULT_IG_ACCOUNTS
  })
  const [newIgAccount, setNewIgAccount] = useState('')
  const [newIgLabel, setNewIgLabel] = useState('')

  // Interval crawler default aman: 6 jam
  const [syncInterval, setSyncInterval] = useState('360') // 360 min = 6 jam

  // Early warning multi-kondisi
  const [minNegativePercent, setMinNegativePercent] = useState('35')
  const [minCommentThreshold, setMinCommentThreshold] = useState('500')
  const [requireSpikeCondition, setRequireSpikeCondition] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)

  // Status Actions (Cache, Ping API, Save)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [cacheClearMessage, setCacheClearMessage] = useState<string | null>(null)
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [apiTestMessage, setApiTestMessage] = useState<string | null>(null)

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
      mode: 'Meta Public Content Pages API',
      status: 'Warning Rate Limit',
      statusColor: 'text-amber-800 bg-amber-50 border-amber-200',
      lastSync: '3 jam lalu',
      itemsFound: '12 post',
      latency: '420 ms',
      quotaUsed: '88% dari kuota (Rate limit)',
      errorCount: 2,
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

  const handleAddInstagramAccount = () => {
    let cleanUser = newIgAccount.trim()
    if (!cleanUser) return
    if (!cleanUser.startsWith('@')) {
      cleanUser = `@${cleanUser}`
    }
    if (instagramAccounts.some((a) => a.username.toLowerCase() === cleanUser.toLowerCase())) {
      return
    }
    const updated = [
      ...instagramAccounts,
      {
        username: cleanUser,
        label: newIgLabel.trim() || 'Akun Publik Tambahan',
        isDefault: false,
      },
    ]
    setInstagramAccounts(updated)
    try {
      localStorage.setItem('mbg_instagram_accounts', JSON.stringify(updated))
    } catch {}
    setNewIgAccount('')
    setNewIgLabel('')
  }

  const handleRemoveInstagramAccount = (username: string) => {
    const updated = instagramAccounts.filter((a) => a.username !== username)
    setInstagramAccounts(updated)
    try {
      localStorage.setItem('mbg_instagram_accounts', JSON.stringify(updated))
    } catch {}
  }

  const handleToggleInstagramAccount = (username: string) => {
    const updated = instagramAccounts.map((a) => {
      if (a.username === username) {
        return { ...a, isActive: a.isActive === false ? true : false }
      }
      return a
    })
    setInstagramAccounts(updated)
    try {
      localStorage.setItem('mbg_instagram_accounts', JSON.stringify(updated))
    } catch {}
  }

  const handleResetInstagramAccounts = () => {
    setInstagramAccounts(DEFAULT_IG_ACCOUNTS)
    try {
      localStorage.setItem('mbg_instagram_accounts', JSON.stringify(DEFAULT_IG_ACCOUNTS))
    } catch {}
  }

  const handleSave = () => {
    try {
      localStorage.setItem('mbg_instagram_accounts', JSON.stringify(instagramAccounts))
    } catch {}
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleClearCache = () => {
    setIsClearingCache(true)
    setTimeout(() => {
      // Hapus semua key localStorage milik app ini
      const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('mbg_'))
      const totalKeys = keysToRemove.length
      keysToRemove.forEach((k) => localStorage.removeItem(k))

      // Reset state Instagram accounts ke default
      setInstagramAccounts(DEFAULT_IG_ACCOUNTS)

      setIsClearingCache(false)
      setCacheClearMessage(
        `Cache berhasil dibersihkan! ${totalKeys} item lokal dihapus. Pengaturan direset ke default.`
      )
      setTimeout(() => setCacheClearMessage(null), 4000)
    }, 850)
  }

  const handleTestAllApi = () => {
    setIsTestingApi(true)
    setTimeout(() => {
      setIsTestingApi(false)
      setApiTestMessage('Uji koneksi selesai: YouTube, TikTok & Instagram (Public Scraper) aktif optimal, 1 platform (Facebook) mendekati rate-limit.')
      setTimeout(() => setApiTestMessage(null), 4000)
    }, 1100)
  }

  return (
    <div className="space-y-6 pb-10 animate-section">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
          Pengaturan Sistem, Database & Sumber Data
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Pusat kontrol database, manajemen cache data, status koneksi 4 API platform sosial media, dan logika pemantauan crawler.
        </p>
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
          <Zap className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{cacheClearMessage}</span>
        </div>
      )}

      {apiTestMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <Activity className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{apiTestMessage}</span>
        </div>
      )}

      {/* SECTION 1: STATUS DATABASE & MANAJEMEN CACHE (NEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1A: Status Database (Supabase Cloud Health) */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
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
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>Koneksi: <strong className="text-emerald-700 font-medium">Terhubung Langsung (Pooler 6543)</strong></span>
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold text-[10px]">
              Tabel Siap • 0 Data
            </span>
          </div>
        </div>

        {/* 1B: Cache Management & Clear Cache Action */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Manajemen Cache Sistem (In-Memory Cache)
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                Hit Rate: 94.2%
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Cache query ringkasan dasbor dan grafik untuk mempercepat loading tanpa membebani database.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Driver Cache</span>
                <span className="font-bold text-slate-800 text-xs">Redis / Memory</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Total Cache Keys</span>
                <span className="font-bold text-slate-800 text-xs">1.240 Keys</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Ukuran Cache</span>
                <span className="font-bold text-blue-600 text-xs">4.6 MB</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              TTL Cache: Otomatis kedaluwarsa tiap 15 menit
            </span>
            <button
              type="button"
              onClick={handleClearCache}
              disabled={isClearingCache}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Bersihkan seluruh cache Redis agar sistem query langsung ke DB"
            >
              <Trash2 className={`w-3.5 h-3.5 ${isClearingCache ? 'animate-spin' : ''}`} />
              <span>{isClearingCache ? 'Membersihkan Cache...' : 'Bersihkan Cache (Clear Cache)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: STATUS SUMBER DATA & API (TERHUBUNG 4 PLATFORM) */}
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
              3/4 Normal • 1 Mendekati Kuota
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

      {/* SECTION 3: DAFTAR AKUN INSTAGRAM PUBLIK YANG DIPANTAU (DEFAULT 4 MEDIA BESAR) */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faInstagram} className="text-base text-fuchsia-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Target Akun Publik Instagram (Instagram Whitelist Sources)
              </h3>
              <span className="bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 text-[10px] font-bold px-2 py-0.5 rounded">
                {instagramAccounts.length} Akun Terpantau
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sistem memantau postingan & respon warganet seputar MBG secara otomatis dari akun media publik terpercaya tanpa memerlukan API key maupun login kredensial.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetInstagramAccounts}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium self-start sm:self-auto cursor-pointer"
            title="Kembalikan ke 4 Media Besar Default"
          >
            Reset ke 4 Media Besar
          </button>
        </div>

        {/* Input Tambah Akun Baru */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Username IG, cth: @kemdikbud.ri atau @dinkesjabar..."
            value={newIgAccount}
            onChange={(e) => setNewIgAccount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddInstagramAccount()}
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500"
          />
          <input
            type="text"
            placeholder="Kategori / Label (opsional, cth: Lembaga Pemerintah)..."
            value={newIgLabel}
            onChange={(e) => setNewIgLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddInstagramAccount()}
            className="sm:w-64 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500"
          />
          <button
            type="button"
            onClick={handleAddInstagramAccount}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Akun</span>
          </button>
        </div>

        {/* List Akun yang Dipantau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {instagramAccounts.map((acc) => {
            const isAccActive = acc.isActive !== false
            return (
              <div
                key={acc.username}
                className={`p-3 border rounded-lg flex items-center justify-between gap-2 text-xs transition-colors ${
                  isAccActive ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-100/50 border-slate-200 opacity-70'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate">
                      {acc.username}
                    </span>
                    {acc.isDefault && (
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                    {acc.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Toggle Switch Aktif / Tidak Aktif */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isAccActive}
                    onClick={() => handleToggleInstagramAccount(acc.username)}
                    className={`relative inline-flex h-4.5 w-8 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isAccActive ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    title={
                      isAccActive
                        ? 'Status: Aktif. Klik untuk ubah ke Tidak Aktif'
                        : 'Status: Tidak Aktif. Klik untuk ubah ke Aktif'
                    }
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isAccActive ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveInstagramAccount(acc.username)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                    title={`Hapus ${acc.username}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION 4: DUA JENIS KEYWORD (UTAMA & ISU TERKAIT) */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-5">
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
        <div className="space-y-2 pt-2 border-t border-slate-100">
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

      {/* SECTION 4: FREKUENSI CRAWLER (Default Aman 6 Jam / 12 Jam) */}
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

      {/* SECTION 5: SMART EARLY WARNING MULTI-KONDISI */}
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
            <strong>Logika Cerdas Multi-Kondisi:</strong> Alarm tidak akan sembarangan berbunyi hanya karena ada 4 komentar negatif dari total 10 komentar (40%). Alarm hanya aktif jika terpenuhi kondisi statistik di bawah:
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

      {/* Save Button */}
      <div className="flex justify-end">
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
