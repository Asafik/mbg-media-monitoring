import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFacebook,
  faInstagram,
  faTiktok,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import {
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { defaultMonitoredSources } from '../data/monitoredSourcesData'
import type { MonitoredSourceItem } from '../types/dashboard'

export const SourcesPage: React.FC = () => {
  const [sourcesList, setSourcesList] = useState<MonitoredSourceItem[]>(() => {
    try {
      const saved = localStorage.getItem('mbg_monitored_sources')
      if (saved) return JSON.parse(saved)
    } catch {
      // Fallback
    }
    return defaultMonitoredSources
  })

  const [selectedPlatform, setSelectedPlatform] = useState<string>('Semua')
  const [selectedStatus, setSelectedStatus] = useState<'semua' | 'aktif' | 'nonaktif'>('semua')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form Inputs
  const [newHandle, setNewHandle] = useState('')
  const [newName, setNewName] = useState('')
  const [newPlatform, setNewPlatform] = useState<MonitoredSourceItem['platform']>('Instagram')
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
      const matchPlatform =
        selectedPlatform === 'Semua' || item.platform === selectedPlatform
      const matchStatus =
        selectedStatus === 'semua' ||
        (selectedStatus === 'aktif' && item.isActive) ||
        (selectedStatus === 'nonaktif' && !item.isActive)
      const matchSearch =
        item.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      return matchPlatform && matchStatus && matchSearch
    })
  }, [sourcesList, selectedPlatform, selectedStatus, searchTerm])

  // KPI Calculations
  const stats = useMemo(() => {
    const total = sourcesList.length
    const instagram = sourcesList.filter((s) => s.platform === 'Instagram').length
    const tiktok = sourcesList.filter((s) => s.platform === 'TikTok').length
    const facebook = sourcesList.filter((s) => s.platform === 'Facebook').length
    const youtube = sourcesList.filter((s) => s.platform === 'YouTube').length
    const activeCount = sourcesList.filter((s) => s.isActive).length
    const inactiveCount = sourcesList.filter((s) => !s.isActive).length
    return { total, instagram, tiktok, facebook, youtube, activeCount, inactiveCount }
  }, [sourcesList])

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault()
    let cleanHandle = newHandle.trim()
    if (!cleanHandle) return

    if (newPlatform === 'Instagram' || newPlatform === 'TikTok') {
      if (!cleanHandle.startsWith('@')) {
        cleanHandle = `@${cleanHandle}`
      }
    }

    const newItem: MonitoredSourceItem = {
      id: `src-${Date.now()}`,
      handle: cleanHandle,
      name: newName.trim() || cleanHandle,
      platform: newPlatform,
      category: newCategory.trim() || 'Media Berita Publik',
      isActive: newIsActive,
      isDefault: false,
      postsCount: 0,
      lastChecked: 'Baru ditambahkan',
      profileUrl: newProfileUrl.trim() || '#',
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
      `Akun ${cleanHandle} (${newPlatform}) berhasil ditambahkan dengan status ${newIsActive ? 'Aktif' : 'Nonaktif'}.`
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
        `Status ${target.handle} (${target.platform}) diubah menjadi ${target.isActive ? 'Aktif' : 'Nonaktif'}.`
      )
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleDeleteSource = (id: string, handle: string) => {
    if (window.confirm(`Hapus akun ${handle} dari daftar pantauan?`)) {
      const updated = sourcesList.filter((item) => item.id !== id)
      saveSources(updated)
      setSuccessMessage(`Akun ${handle} berhasil dihapus dari daftar pantauan.`)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan seluruh daftar akun ke 16 media berita default?')) {
      saveSources(defaultMonitoredSources)
      setSuccessMessage('Daftar akun berhasil di-reset ke 16 media berita default.')
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const getPlatformBadge = (platform: MonitoredSourceItem['platform']) => {
    switch (platform) {
      case 'YouTube':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[11px] font-bold">
            <FontAwesomeIcon icon={faYoutube} className="text-xs" />
            YouTube
          </span>
        )
      case 'TikTok':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded text-[11px] font-bold">
            <FontAwesomeIcon icon={faTiktok} className="text-xs" />
            TikTok
          </span>
        )
      case 'Instagram':
        return (
          <span className="inline-flex items-center gap-1 bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 px-2 py-0.5 rounded text-[11px] font-bold">
            <FontAwesomeIcon icon={faInstagram} className="text-xs" />
            Instagram
          </span>
        )
      case 'Facebook':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold">
            <FontAwesomeIcon icon={faFacebook} className="text-xs" />
            Facebook
          </span>
        )
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            Sumber Akun Media & Kanal Pantauan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar akun publik media berita, lembaga resmi, dan kreator di 4 platform sosial media yang dipantau secara otomatis untuk isu MBG.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Kembalikan ke 16 Media Default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset ke Default</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Form' : 'Tambah Akun Pantau'}</span>
          </button>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Total Akun</span>
            <span className="text-lg font-bold text-slate-900">{stats.total} Akun</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Status Pantau</span>
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
            <span className="text-[11px] font-medium text-slate-500 block">Instagram</span>
            <span className="text-lg font-bold text-fuchsia-700">{stats.instagram} Akun</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faTiktok} className="text-base" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">TikTok</span>
            <span className="text-lg font-bold text-slate-900">{stats.tiktok} Akun</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faFacebook} className="text-base" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Facebook</span>
            <span className="text-lg font-bold text-blue-700">{stats.facebook} Halaman</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faYoutube} className="text-base" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">YouTube</span>
            <span className="text-lg font-bold text-red-700">{stats.youtube} Kanal</span>
          </div>
        </div>
      </div>

      {/* Quick Add Form Panel */}
      {showAddForm && (
        <div className="bg-white rounded-lg p-5 border-2 border-blue-500/80 shadow-md space-y-4 animate-in fade-in">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Tambah Target Akun / Kanal Baru
            </h3>
            <span className="text-xs text-slate-400">
              Dapat mencakup akun media, portal berita lokal, atau lembaga resmi.
            </span>
          </div>

          <form onSubmit={handleAddSource} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Platform
                </label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as MonitoredSourceItem['platform'])}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Username / Handle
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: @kemdikbud.ri"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
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
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Status Pantauan
                </label>
                <select
                  value={newIsActive ? 'aktif' : 'nonaktif'}
                  onChange={(e) => setNewIsActive(e.target.value === 'aktif')}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="aktif">Aktif (Langsung dipantau)</option>
                  <option value="nonaktif">Nonaktif (Dijeda)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                URL Profil / Halaman Akun (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://www.instagram.com/..."
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
                Simpan Target Pantauan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Platform Tabs & Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg overflow-x-auto">
            {['Semua', 'Instagram', 'TikTok', 'Facebook', 'YouTube'].map((p) => {
              const isActive = selectedPlatform === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlatform(p)}
                  className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>

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
              Semua Status ({stats.total})
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
              Nonaktif ({stats.inactiveCount})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari akun atau kategori..."
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
                <th className="py-3 px-4">Akun / Handle</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Status Pantauan</th>
                <th className="py-3 px-3 text-center">Konten Terdeteksi</th>
                <th className="py-3 px-3">Terakhir Diperiksa</th>
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
                            ? 'bg-slate-100 border-slate-200 text-slate-700'
                            : 'bg-slate-100/50 border-slate-200 text-slate-400'
                        }`}
                      >
                        {item.handle.replace('@', '').slice(0, 2).toUpperCase()}
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

                  {/* Platform */}
                  <td className="py-3 px-3">
                    {getPlatformBadge(item.platform)}
                  </td>

                  {/* Kategori */}
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                      {item.category}
                    </span>
                  </td>

                  {/* Status Pantauan: Toggle switch + Status badge */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.isActive}
                        onClick={() => handleToggleActive(item.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                          item.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                        title={
                          item.isActive
                            ? 'Status: Aktif. Klik untuk menonaktifkan pantauan'
                            : 'Status: Nonaktif. Klik untuk mengaktifkan pantauan'
                        }
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            item.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        {item.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
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
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Buka Profil Asli"
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
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    Tidak ditemukan akun pantauan yang cocok dengan filter atau kata kunci pencarian.
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
