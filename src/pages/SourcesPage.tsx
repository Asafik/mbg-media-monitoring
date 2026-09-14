import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Info,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { defaultMonitoredSources } from '../data/monitoredSourcesData'
import type { MonitoredSourceItem } from '../types/dashboard'

export const SourcesPage: React.FC = () => {
  const [sourcesList, setSourcesList] = useState<MonitoredSourceItem[]>(() => {
    try {
      const saved = localStorage.getItem('mbg_monitored_sources')
      if (saved) {
        const parsed: MonitoredSourceItem[] = JSON.parse(saved)
        // Pastikan hanya akun Instagram yang dimuat sesuai fokus crawler saat ini
        const igOnly = parsed.filter((item) => item.platform === 'Instagram')
        if (igOnly.length > 0) {
          localStorage.setItem('mbg_monitored_sources', JSON.stringify(igOnly))
          return igOnly
        }
      }
    } catch {
      // Fallback
    }
    localStorage.setItem('mbg_monitored_sources', JSON.stringify(defaultMonitoredSources))
    return defaultMonitoredSources
  })

  const [selectedStatus, setSelectedStatus] = useState<'semua' | 'aktif' | 'nonaktif'>('semua')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Dengarkan sinyal pembersihan cache global
  React.useEffect(() => {
    const handleCacheCleared = () => {
      setSourcesList(defaultMonitoredSources)
    }
    window.addEventListener('mbg-cache-cleared', handleCacheCleared)
    return () => window.removeEventListener('mbg-cache-cleared', handleCacheCleared)
  }, [])

  // Form Inputs
  const [newHandle, setNewHandle] = useState('')
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newProfileUrl, setNewProfileUrl] = useState('')
  const [newIsActive, setNewIsActive] = useState<boolean>(true)

  const saveSources = (updated: MonitoredSourceItem[]) => {
    setSourcesList(updated)
    try {
      localStorage.setItem('mbg_monitored_sources', JSON.stringify(updated))
    } catch {
      // Fallback
    }
  }

  // Filter Logic
  const filteredSources = useMemo(() => {
    return sourcesList.filter((item) => {
      const matchStatus =
        selectedStatus === 'semua' ||
        (selectedStatus === 'aktif' && item.isActive) ||
        (selectedStatus === 'nonaktif' && !item.isActive)
      const matchSearch =
        item.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [sourcesList, selectedStatus, searchTerm])

  // KPI Calculations (Instagram Specific)
  const stats = useMemo(() => {
    const total = sourcesList.length
    const activeCount = sourcesList.filter((s) => s.isActive).length
    const inactiveCount = sourcesList.filter((s) => !s.isActive).length
    const totalPosts = sourcesList.reduce((sum, s) => sum + (s.postsCount || 0), 0)
    const nationalMedia = sourcesList.filter((s) =>
      s.category.toLowerCase().includes('nasional') || s.category.toLowerCase().includes('resmi')
    ).length
    return { total, activeCount, inactiveCount, totalPosts, nationalMedia }
  }, [sourcesList])

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault()
    let cleanHandle = newHandle.trim()
    if (!cleanHandle) return

    if (!cleanHandle.startsWith('@')) {
      cleanHandle = `@${cleanHandle}`
    }

    const rawUsername = cleanHandle.replace('@', '')
    const generatedUrl =
      newProfileUrl.trim() || `https://www.instagram.com/${rawUsername}/`

    const newItem: MonitoredSourceItem = {
      id: `src-ig-${Date.now()}`,
      handle: cleanHandle,
      name: newName.trim() || cleanHandle,
      platform: 'Instagram',
      category: newCategory.trim() || 'Media Berita Publik',
      isActive: newIsActive,
      isDefault: false,
      postsCount: 0,
      lastChecked: 'Baru ditambahkan',
      profileUrl: generatedUrl,
    }

    const updated = [newItem, ...sourcesList]
    saveSources(updated)

    setNewHandle('')
    setNewName('')
    setNewCategory('')
    setNewProfileUrl('')
    setNewIsActive(true)
    setShowAddForm(false)

    setSuccessMessage(
      `Akun Instagram ${cleanHandle} berhasil ditambahkan dengan status ${
        newIsActive ? 'Aktif' : 'Tidak Aktif'
      }.`
    )
    setTimeout(() => setSuccessMessage(null), 3500)
  }

  const handleToggleActive = (id: string) => {
    const updated = sourcesList.map((item) => {
      if (item.id === id) {
        return { ...item, isActive: !item.isActive }
      }
      return item
    })
    saveSources(updated)
    const target = updated.find((s) => s.id === id)
    if (target) {
      setSuccessMessage(
        `Status pantauan ${target.handle} diubah menjadi ${
          target.isActive ? 'Aktif' : 'Tidak Aktif'
        }.`
      )
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleDeleteSource = (id: string, handle: string) => {
    if (window.confirm(`Hapus akun Instagram ${handle} dari daftar pantauan?`)) {
      const updated = sourcesList.filter((item) => item.id !== id)
      saveSources(updated)
      setSuccessMessage(`Akun ${handle} berhasil dihapus dari daftar pantauan.`)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Kembalikan seluruh daftar akun ke 8 media berita Instagram default?'
      )
    ) {
      saveSources(defaultMonitoredSources)
      setSuccessMessage('Daftar akun berhasil di-reset ke 8 media Instagram default.')
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-5 animate-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faInstagram} className="text-sm" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              Target Akun Pantauan Instagram
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar target akun publik Instagram yang dipantau crawler MBG. YouTube memantau secara global via pencarian kata kunci, sedangkan TikTok & Facebook belum diaktifkan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Kembalikan ke Akun Instagram Default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset ke 8 Media Default</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Form' : 'Tambah Akun Instagram'}</span>
          </button>
        </div>
      </div>

      {/* Info Notice: Alasan Khusus Instagram */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Fokus Tabel Khusus Target Instagram:</span> Tabel pemantauan akun ini dikhususkan untuk platform <strong>Instagram</strong>. Platform <strong>YouTube</strong> tidak memerlukan daftar akun karena sistem mencari konten secara <strong>global</strong> menggunakan pencarian kata kunci MBG (YouTube Data API v3). Sedangkan platform <strong>TikTok & Facebook</strong> ditiadakan sementara dan belum diaktifkan.
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
          <div className="w-9 h-9 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faInstagram} className="text-base" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Total Akun IG</span>
            <span className="text-lg font-bold text-slate-900">{stats.total} Akun</span>
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
              <span className="text-xs font-semibold text-slate-500">{stats.inactiveCount} Tidak Aktif</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Radio className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Media Berita Utama</span>
            <span className="text-lg font-bold text-blue-700">{stats.nationalMedia} Media</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Konten Terdeteksi</span>
            <span className="text-lg font-bold text-violet-700">{stats.totalPosts} Konten</span>
          </div>
        </div>
      </div>

      {/* Quick Add Form Panel */}
      {showAddForm && (
        <div className="bg-white rounded-lg p-5 border-2 border-blue-500/80 shadow-md space-y-4 animate-in fade-in">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faInstagram} className="text-fuchsia-600 text-sm" />
              <h3 className="text-sm font-bold text-slate-900">
                Tambah Target Akun Instagram Baru
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Media berita nasional, portal daerah, atau instansi resmi pemerintah di Instagram.
            </span>
          </div>

          <form onSubmit={handleAddSource} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Username Instagram
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: @kemdikbud.ri"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Nama Tampilan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kemdikbud RI Resmi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Instansi Pemerintah"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                  Status Pantauan Awal
                </label>
                <div className="flex items-center gap-2.5 pt-0.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={newIsActive}
                    onClick={() => setNewIsActive(!newIsActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                      newIsActive ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        newIsActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    onClick={() => setNewIsActive(!newIsActive)}
                    className={`text-xs font-semibold cursor-pointer select-none ${
                      newIsActive ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {newIsActive ? 'Aktif (Dipantau)' : 'Tidak Aktif (Dijeda)'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                URL Profil Instagram (Opsional, terisi otomatis)
              </label>
              <input
                type="url"
                placeholder="https://www.instagram.com/kemdikbud.ri/"
                value={newProfileUrl}
                onChange={(e) => setNewProfileUrl(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Simpan Target Instagram
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Status & Search Bar */}
      <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSelectedStatus('semua')}
            className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedStatus === 'semua'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Akun ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('aktif')}
            className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedStatus === 'aktif'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/60'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                selectedStatus === 'aktif' ? 'bg-white' : 'bg-emerald-500'
              }`}
            />
            Aktif ({stats.activeCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('nonaktif')}
            className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedStatus === 'nonaktif'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                selectedStatus === 'nonaktif' ? 'bg-white' : 'bg-slate-400'
              }`}
            />
            Tidak Aktif ({stats.inactiveCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari username @ atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Table of Monitored Sources */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Target Akun Instagram</th>
                <th className="py-3 px-3">Kategori Media</th>
                <th className="py-3 px-3">Status Pantauan</th>
                <th className="py-3 px-3 text-center">Konten Terdeteksi</th>
                <th className="py-3 px-3">Pemeriksaan Terakhir</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSources.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    item.isActive
                      ? 'hover:bg-slate-50/70'
                      : 'bg-slate-50/40 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {/* Akun / Handle */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${
                          item.isActive
                            ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700'
                            : 'bg-slate-100/60 border-slate-200 text-slate-400'
                        }`}
                      >
                        <FontAwesomeIcon icon={faInstagram} className="text-sm" />
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
                        <span className="text-[11px] text-slate-500 block">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Kategori */}
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                      {item.category}
                    </span>
                  </td>

                  {/* Status Pantauan: Interactive Toggle switch + Badge */}
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.isActive}
                      onClick={() => handleToggleActive(item.id)}
                      className="group inline-flex items-center gap-2 cursor-pointer select-none text-left p-1 rounded-md hover:bg-slate-100/70 transition-colors focus:outline-none"
                      title={
                        item.isActive
                          ? 'Status: Aktif. Klik saklar untuk mengubah ke Tidak Aktif'
                          : 'Status: Tidak Aktif. Klik saklar untuk mengubah ke Aktif'
                      }
                    >
                      {/* Toggle Track */}
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

                      {/* Status Badge */}
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

                  {/* Aksi */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.profileUrl && item.profileUrl !== '#' && (
                        <a
                          href={item.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded transition-colors"
                          title="Buka Profil Instagram"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteSource(item.id, item.handle)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSources.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    Tidak ditemukan target akun Instagram yang cocok dengan filter atau kata kunci pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
