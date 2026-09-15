import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faFacebook, faTiktok } from '@fortawesome/free-brands-svg-icons'
import {
  CheckCircle2,
  ExternalLink,
  Info,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  getTargetAccounts,
  createTargetAccount,
  updateTargetAccount,
  toggleTargetAccountActive,
  deleteTargetAccount,
  resetTargetAccountsDefault,
} from '../services/targetAccountsService'
import React, { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { defaultMonitoredSources } from '../data/monitoredSourcesData'
import type { MonitoredSourceItem } from '../types/dashboard'

export interface SourcesPageProps {
  embedded?: boolean
}

export const SourcesPage: React.FC<SourcesPageProps> = ({ embedded = false }) => {
  const [sourcesList, setSourcesList] = useState<MonitoredSourceItem[]>(() => {
    try {
      const saved = localStorage.getItem('mbg_monitored_sources')
      if (saved) {
        const parsed: MonitoredSourceItem[] = JSON.parse(saved)
        // Pastikan akun IG dan FB ada, jika belum ada FB tambahkan default FB
        const hasFb = parsed.some((s) => s.platform === 'Facebook')
        if (!hasFb) {
          const fbDefaults = defaultMonitoredSources.filter((s) => s.platform === 'Facebook')
          const merged = [...parsed, ...fbDefaults]
          localStorage.setItem('mbg_monitored_sources', JSON.stringify(merged))
          return merged
        }
        return parsed
      }
    } catch {
      // Fallback
    }
    localStorage.setItem('mbg_monitored_sources', JSON.stringify(defaultMonitoredSources))
    return defaultMonitoredSources
  })

  // Filter States
  const [selectedPlatform, setSelectedPlatform] = useState<'semua' | 'Instagram' | 'Facebook' | 'TikTok'>('semua')
  const [selectedStatus, setSelectedStatus] = useState<'semua' | 'aktif' | 'nonaktif'>('semua')
  const [searchTerm, setSearchTerm] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Modal States for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MonitoredSourceItem | null>(null)

  // Modal Form Inputs
  const [formPlatform, setFormPlatform] = useState<'Instagram' | 'Facebook' | 'TikTok'>('Instagram')
  const [formHandle, setFormHandle] = useState('')
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formProfileUrl, setFormProfileUrl] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  // Database & Sync States
  const [isDbConnected, setIsDbConnected] = useState(true)
  const [isSyncingDb, setIsSyncingDb] = useState(false)

  // Ambil data terbaru dari Supabase saat halaman dibuka
  React.useEffect(() => {
    let isMounted = true
    const loadFromDb = async () => {
      setIsSyncingDb(true)
      const res = await getTargetAccounts()
      if (isMounted) {
        if (res.data.length > 0) {
          setSourcesList(res.data)
        }
        setIsDbConnected(res.fromDb)
        setIsSyncingDb(false)
      }
    }
    loadFromDb()
    return () => {
      isMounted = false
    }
  }, [])

  // Dengarkan sinyal pembersihan cache global
  React.useEffect(() => {
    const handleCacheCleared = () => {
      setSourcesList(defaultMonitoredSources)
    }
    window.addEventListener('mbg-cache-cleared', handleCacheCleared)
    return () => window.removeEventListener('mbg-cache-cleared', handleCacheCleared)
  }, [])

  const saveSources = (updated: MonitoredSourceItem[]) => {
    setSourcesList(updated)
    try {
      localStorage.setItem('mbg_monitored_sources', JSON.stringify(updated))
    } catch {
      // Fallback
    }
  }

  // KPI Calculations
  const stats = useMemo(() => {
    const total = sourcesList.length
    const activeCount = sourcesList.filter((s) => s.isActive).length
    const inactiveCount = sourcesList.filter((s) => !s.isActive).length
    const igCount = sourcesList.filter((s) => s.platform === 'Instagram').length
    const fbCount = sourcesList.filter((s) => s.platform === 'Facebook').length
    const ttCount = sourcesList.filter((s) => s.platform === 'TikTok').length
    return { total, activeCount, inactiveCount, igCount, fbCount, ttCount }
  }, [sourcesList])

  // Filter Logic
  const filteredSources = useMemo(() => {
    return sourcesList.filter((item) => {
      const matchPlatform =
        selectedPlatform === 'semua' || item.platform === selectedPlatform

      const matchStatus =
        selectedStatus === 'semua' ||
        (selectedStatus === 'aktif' && item.isActive) ||
        (selectedStatus === 'nonaktif' && !item.isActive)

      const term = searchTerm.toLowerCase()
      const matchSearch =
        item.handle.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.platform.toLowerCase().includes(term)

      return matchPlatform && matchStatus && matchSearch
    })
  }, [sourcesList, selectedPlatform, selectedStatus, searchTerm])

  // Modal Handlers
  const openAddModal = (defaultPlat: 'Instagram' | 'Facebook' | 'TikTok' = 'Instagram') => {
    setEditingItem(null)
    setFormPlatform(defaultPlat)
    setFormHandle('')
    setFormName('')
    setFormCategory('')
    setFormProfileUrl('')
    setFormIsActive(true)
    setIsModalOpen(true)
  }

  const openEditModal = (item: MonitoredSourceItem) => {
    setEditingItem(item)
    setFormPlatform((item.platform as 'Instagram' | 'Facebook' | 'TikTok') || 'Instagram')
    setFormHandle(item.handle)
    setFormName(item.name)
    setFormCategory(item.category)
    setFormProfileUrl(item.profileUrl)
    setFormIsActive(item.isActive)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let cleanHandle = formHandle.trim()
    if (!cleanHandle) return

    if (formPlatform === 'Instagram' || formPlatform === 'TikTok') {
      if (!cleanHandle.startsWith('@')) {
        cleanHandle = `@${cleanHandle}`
      }
    } else {
      // Facebook: bersihkan @ jika ada
      cleanHandle = cleanHandle.replace(/^@/, '')
    }

    const rawId = cleanHandle.replace(/^@/, '')
    const defaultUrl =
      formPlatform === 'Instagram'
        ? `https://www.instagram.com/${rawId}/`
        : formPlatform === 'TikTok'
        ? `https://www.tiktok.com/@${rawId}`
        : `https://www.facebook.com/${encodeURIComponent(cleanHandle)}`

    const finalUrl = formProfileUrl.trim() || defaultUrl

    if (editingItem) {
      // Mode Edit
      const updatedItem: MonitoredSourceItem = {
        ...editingItem,
        handle: cleanHandle,
        name: formName.trim() || cleanHandle,
        platform: formPlatform,
        category: formCategory.trim() || (formPlatform === 'Instagram' ? 'Media Berita Nasional' : 'Portal Berita Digital'),
        profileUrl: finalUrl,
        isActive: formIsActive,
      }
      const updated = sourcesList.map((item) => (item.id === editingItem.id ? updatedItem : item))
      saveSources(updated)
      updateTargetAccount(updatedItem)
      setSuccessMessage(`Target ${formPlatform} "${cleanHandle}" berhasil diperbarui di database.`)
    } else {
      // Mode Tambah Baru
      const newItem: MonitoredSourceItem = {
        id: `src-${formPlatform.toLowerCase()}-${Date.now()}`,
        handle: cleanHandle,
        name: formName.trim() || cleanHandle,
        platform: formPlatform,
        category: formCategory.trim() || (formPlatform === 'Instagram' ? 'Media Berita Publik' : 'Portal Berita Digital'),
        isActive: formIsActive,
        isDefault: false,
        postsCount: 0,
        lastChecked: 'Baru ditambahkan',
        profileUrl: finalUrl,
      }
      const updated = [newItem, ...sourcesList]
      saveSources(updated)
      createTargetAccount(newItem)
      setSuccessMessage(`Target ${formPlatform} "${cleanHandle}" berhasil disimpan ke database Supabase.`)
    }

    closeModal()
    setTimeout(() => setSuccessMessage(null), 3500)
  }

  const handleToggleActive = (id: string) => {
    const target = sourcesList.find((s) => s.id === id)
    if (target) {
      const nextActive = !target.isActive
      const updated = sourcesList.map((item) =>
        item.id === id ? { ...item, isActive: nextActive } : item
      )
      saveSources(updated)
      toggleTargetAccountActive(id, nextActive)
      setSuccessMessage(
        `Status ${target.platform} ${target.handle} diubah menjadi ${
          nextActive ? 'Aktif' : 'Tidak Aktif'
        } di database.`
      )
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleDeleteSource = (id: string, handle: string, platform: string) => {
    if (window.confirm(`Hapus akun ${platform} "${handle}" dari database target pantauan?`)) {
      const updated = sourcesList.filter((item) => item.id !== id)
      saveSources(updated)
      deleteTargetAccount(id)
      setSuccessMessage(`Target ${platform} "${handle}" berhasil dihapus dari database Supabase.`)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleResetToDefault = async () => {
    if (
      window.confirm(
        'Kembalikan seluruh daftar akun ke 17 akun default di database (8 Instagram + 4 Facebook + 5 TikTok)?'
      )
    ) {
      setIsSyncingDb(true)
      const res = await resetTargetAccountsDefault()
      setSourcesList(res.data)
      setIsSyncingDb(false)
      setSuccessMessage('Daftar target berhasil di-reset ke 12 media default di database Supabase.')
      setTimeout(() => setSuccessMessage(null), 3500)
    }
  }

  return (
    <div className="space-y-5 animate-section">
      {/* Header Section */}
      {!embedded ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Radio className="text-sm" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                Target Akun Pantauan Media (Instagram, Facebook & TikTok)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kelola daftar akun publik Instagram, Facebook Fanspage, dan kreator TikTok yang dipantau crawler MBG secara terpadu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Kembalikan ke Akun Default"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Default (17 Akun)</span>
            </button>

            <button
              type="button"
              onClick={() => openAddModal()}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Target Akun</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Target Akun Terpadu (Instagram, Facebook & TikTok)
              </h3>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <span className={`w-1.5 h-1.5 rounded-full ${isSyncingDb ? 'bg-amber-500 animate-spin' : isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {isSyncingDb ? 'Sinkron DB...' : isDbConnected ? 'DB Supabase Terhubung' : 'Cache Lokal'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola akun Instagram, Fanspage Facebook, dan kreator TikTok yang dipantau crawler MBG.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isSyncingDb}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Kembalikan ke Akun Default"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isSyncingDb ? 'animate-spin' : ''}`} />
              <span>Reset (17 Akun)</span>
            </button>
            <button
              type="button"
              onClick={() => openAddModal()}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Target Akun</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Manajemen Akun Terpadu:</span> Daftar ini memadukan akun publik <strong>Instagram</strong>, fanspage <strong>Facebook</strong>, dan kreator <strong>TikTok</strong>. Crawler menyerap postingan publik seputar program MBG secara otomatis tanpa memerlukan kredensial login.
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-lg text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            title="Tutup pesan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Radio className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Total Target Akun</span>
            <span className="text-lg font-bold text-slate-900">{stats.total} Sasaran</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Status Pantauan</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-emerald-700">{stats.activeCount} Aktif</span>
              <span className="text-xs text-slate-300 font-bold">/</span>
              <span className="text-xs font-semibold text-slate-500">{stats.inactiveCount} Nonaktif</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faInstagram} className="text-base" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Platform Instagram</span>
            <span className="text-lg font-bold text-fuchsia-700">{stats.igCount} Akun</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faFacebook} className="text-base" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Platform Facebook</span>
            <span className="text-lg font-bold text-blue-700">{stats.fbCount} Fanspage</span>
          </div>
        </div>
      </div>

      {/* KPI TikTok Mini Card */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faTiktok} className="text-white text-base" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-medium text-slate-400 block">Platform TikTok (Public Scraper — Tanpa Login)</span>
            <span className="text-base font-bold text-white">{stats.ttCount} Kreator Terpantau</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">Bebas Kuota</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Platform Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedPlatform('semua')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
                selectedPlatform === 'semua'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlatform('Instagram')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedPlatform === 'Instagram'
                  ? 'bg-fuchsia-600 text-white shadow-xs'
                  : 'text-fuchsia-700 hover:text-fuchsia-900 hover:bg-fuchsia-50'
              }`}
            >
              <FontAwesomeIcon icon={faInstagram} className="text-xs" />
              <span>Instagram ({stats.igCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlatform('Facebook')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedPlatform === 'Facebook'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:text-blue-900 hover:bg-blue-50'
              }`}
            >
              <FontAwesomeIcon icon={faFacebook} className="text-xs" />
              <span>Facebook ({stats.fbCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlatform('TikTok')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedPlatform === 'TikTok'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FontAwesomeIcon icon={faTiktok} className="text-xs" />
              <span>TikTok ({stats.ttCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari akun, fanspage, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Sub-Filter: Status Pantauan (Semua, Aktif, Nonaktif) */}
        <div className="flex items-center gap-2 pt-1 text-xs border-t border-slate-100">
          <span className="text-slate-400 text-[11px] font-medium">Status Pantauan:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedStatus('semua')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                selectedStatus === 'semua'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('aktif')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                selectedStatus === 'aktif'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Aktif ({stats.activeCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('nonaktif')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                selectedStatus === 'nonaktif'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Nonaktif ({stats.inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Unified Table of Target Accounts */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Target Akun / Fanspage</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Kategori Media</th>
                <th className="py-3 px-3">Status Pantauan</th>
                <th className="py-3 px-3 text-center">Konten Terdeteksi</th>
                <th className="py-3 px-3">Pemeriksaan Terakhir</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSources.map((item) => {
                const isIg = item.platform === 'Instagram'
                const isTt = item.platform === 'TikTok'
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.isActive
                        ? 'hover:bg-slate-50/70'
                        : 'bg-slate-50/40 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    {/* Akun / Fanspage Handle & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${
                            isIg
                              ? item.isActive
                                ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700'
                                : 'bg-slate-100/60 border-slate-200 text-slate-400'
                              : isTt
                              ? item.isActive
                                ? 'bg-slate-900 border-slate-700 text-white'
                                : 'bg-slate-100/60 border-slate-200 text-slate-400'
                              : item.isActive
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-slate-100/60 border-slate-200 text-slate-400'
                          }`}
                        >
                          <FontAwesomeIcon icon={isIg ? faInstagram : isTt ? faTiktok : faFacebook} className="text-sm" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{item.handle}</span>
                            {item.isDefault && (
                              <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Platform Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          item.platform === 'Instagram'
                            ? 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200'
                            : item.platform === 'TikTok'
                            ? 'bg-slate-900 text-white border-slate-700'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {item.platform === 'Instagram' && <FontAwesomeIcon icon={faInstagram} className="text-[10px]" />}
                        {item.platform === 'Facebook' && <FontAwesomeIcon icon={faFacebook} className="text-[10px]" />}
                        {item.platform === 'TikTok' && <FontAwesomeIcon icon={faTiktok} className="text-[10px]" />}
                        {item.platform}
                      </span>
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200 block truncate max-w-xs">
                        {item.category}
                      </span>
                    </td>

                    {/* Status Pantauan: Interactive Switch + Badge */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.isActive}
                        onClick={() => handleToggleActive(item.id)}
                        className="group inline-flex items-center gap-2 cursor-pointer select-none text-left p-1 rounded-md hover:bg-slate-100/70 transition-colors focus:outline-none"
                        title={
                          item.isActive
                            ? 'Status: Aktif. Klik untuk jeda pantauan'
                            : 'Status: Tidak Aktif. Klik untuk aktifkan pantauan'
                        }
                      >
                        <div
                          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            item.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              item.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-100/70'
                              : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200/70'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {item.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </button>
                    </td>

                    {/* Konten Terdeteksi */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs">
                        {item.postsCount} konten
                      </span>
                    </td>

                    {/* Terakhir Diperiksa */}
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-slate-400" />
                        <span>{item.lastChecked}</span>
                      </div>
                    </td>

                    {/* Aksi: Edit, Open Link, Delete */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Edit Target Akun"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {item.profileUrl && item.profileUrl !== '#' && (
                        <a
                            href={item.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1.5 text-slate-400 rounded transition-colors ${
                              item.platform === 'Instagram'
                                ? 'hover:text-fuchsia-600 hover:bg-fuchsia-50'
                                : item.platform === 'TikTok'
                                ? 'hover:text-slate-900 hover:bg-slate-100'
                                : 'hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title={`Buka Halaman ${item.platform}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteSource(item.id, item.handle, item.platform)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredSources.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    Tidak ditemukan target akun yang cocok dengan filter atau kata kunci pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH & EDIT TARGET AKUN (IG / FB) */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-900/25 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal()
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingItem ? 'Edit Target Pantauan' : 'Tambah Target Akun Media'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingItem
                      ? `Perbarui rincian target pantauan untuk ${editingItem.handle}`
                      : 'Pilih platform dan lengkapi rincian akun sasaran crawler.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleModalSubmit} className="p-5 space-y-4">
                {/* 1. Pilih Platform via Select Dropdown */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Platform Media Sosial *
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as 'Instagram' | 'Facebook' | 'TikTok')}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Instagram">Instagram (Crawler Open Graph Publik)</option>
                    <option value="Facebook">Facebook (Crawler Fanspage Publik)</option>
                    <option value="TikTok">TikTok (Public Video Scraper — Tanpa Login)</option>
                  </select>
                </div>

                {/* 2. Form Fields Sesuai Platform yang Dipilih */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {/* Handle / Username Input */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      {formPlatform === 'Instagram' || formPlatform === 'TikTok'
                        ? (formPlatform === 'TikTok' ? 'Username / Handle TikTok *' : 'Username / Handle Instagram *')
                        : 'Nama Fanspage / ID Halaman Facebook *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        formPlatform === 'Instagram'
                          ? 'Contoh: @kompascom atau narasinewsroom'
                          : formPlatform === 'TikTok'
                          ? 'Contoh: @mbg.kreator atau gurupenggerakdesa'
                          : 'Contoh: Kompas.com atau CNNIndonesia'
                      }
                      value={formHandle}
                      onChange={(e) => setFormHandle(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formPlatform === 'Instagram' || formPlatform === 'TikTok'
                        ? 'Otomatis diformat dengan awalan @.'
                        : 'Masukkan nama resmi fanspage publik Facebook.'}
                    </p>
                  </div>

                  {/* Nama Tampilan Media */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Nama Tampilan / Nama Media *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        formPlatform === 'Instagram'
                          ? 'Contoh: Kompas.com'
                          : 'Contoh: Kompas.com Fanspage'
                      }
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Kategori Media */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Kategori / Label Sasaran
                    </label>
                    <input
                      type="text"
                      placeholder={
                        formPlatform === 'Instagram'
                          ? 'Contoh: Media Berita Nasional / Jurnalisme Investigasi'
                          : 'Contoh: Portal Berita Digital / Fanspage Resmi Pemerintah'
                      }
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* URL Profil / Halaman */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      {formPlatform === 'Instagram'
                        ? 'URL Profil Instagram (Opsional)'
                        : 'URL Halaman Facebook (Opsional)'}
                    </label>
                    <input
                      type="url"
                      placeholder={
                        formPlatform === 'Instagram'
                          ? 'https://www.instagram.com/kompascom/'
                          : 'https://www.facebook.com/kompascom'
                      }
                      value={formProfileUrl}
                      onChange={(e) => setFormProfileUrl(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Dibiarkan kosong akan di-generate otomatis dari handle.
                      {formPlatform === 'TikTok' && (
                        <span className="block text-slate-400">Contoh: https://www.tiktok.com/@username</span>
                      )}
                    </p>
                  </div>

                  {/* Status Pantauan */}
                  <div className="pt-2">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                      Status Pemantauan Crawler
                    </label>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formIsActive}
                        onClick={() => setFormIsActive(!formIsActive)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                          formIsActive ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            formIsActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span
                        onClick={() => setFormIsActive(!formIsActive)}
                        className={`text-xs font-semibold cursor-pointer select-none ${
                          formIsActive ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {formIsActive ? 'Aktif (Dipantau oleh crawler)' : 'Tidak Aktif (Dijeda sementara)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Target Akun'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
