import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowsRotate,
  faThumbsUp,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { faYoutube, faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons'
import { CheckCircle2, Info, MessageSquare, Search, X } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { mockCommentsList } from '../data/extendedMockData'
import { fetchYouTubeComments } from '../services/youtubeService'
import {
  fetchInstagramComments,
  sampleInstagramComments,
} from '../services/instagramService'
import {
  fetchFacebookComments,
  sampleFacebookComments,
} from '../services/facebookService'
import type { CommentItem } from '../types/dashboard'

const initialCombinedComments: CommentItem[] = [
  ...mockCommentsList,
  ...sampleInstagramComments,
  ...sampleFacebookComments,
]

export const CommentsPage: React.FC = () => {
  const [commentsList, setCommentsList] = useState<CommentItem[]>(() => {
    try {
      if (localStorage.getItem('mbg_cleared_empty') === 'true') {
        return []
      }
      const saved = localStorage.getItem('mbg_live_comments')
      if (saved) return JSON.parse(saved)
    } catch {}
    return initialCombinedComments
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSentiment, setSelectedSentiment] = useState<string>('Semua')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Semua')
  const [onlyReviewNeeded, setOnlyReviewNeeded] = useState<boolean>(false)
  const [isFetchingYouTube, setIsFetchingYouTube] = useState<boolean>(false)
  const [isFetchingInstagram, setIsFetchingInstagram] = useState<boolean>(false)
  const [isFetchingFacebook, setIsFetchingFacebook] = useState<boolean>(false)
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null)

  const sentimentFilters = ['Semua', 'positif', 'negatif', 'netral']

  // Dengarkan sinyal pembersihan cache global
  React.useEffect(() => {
    const handleCacheCleared = () => {
      setCommentsList([])
    }
    window.addEventListener('mbg-cache-cleared', handleCacheCleared)
    return () => window.removeEventListener('mbg-cache-cleared', handleCacheCleared)
  }, [])

  const handleFetchCommentsLive = async () => {
    setIsFetchingYouTube(true)
    try {
      const realComments = await fetchYouTubeComments()
      if (realComments.length > 0) {
        setCommentsList((prev) => {
          const existingIds = new Set(realComments.map((c) => c.id))
          const filteredPrev = prev.filter((p) => !existingIds.has(p.id))
          const updated = [...realComments, ...filteredPrev]
          try {
            localStorage.setItem('mbg_live_comments', JSON.stringify(updated))
          } catch {}
          return updated
        })
        setSyncSuccessMessage(
          `Berhasil menarik ${realComments.length} komentar riil YouTube via Live Data API v3!`
        )
        setTimeout(() => setSyncSuccessMessage(null), 6000)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setSyncSuccessMessage(`Gagal menarik komentar YouTube: ${msg}`)
      setTimeout(() => setSyncSuccessMessage(null), 5000)
    } finally {
      setIsFetchingYouTube(false)
    }
  }

  const handleFetchInstagramCommentsLive = async () => {
    setIsFetchingInstagram(true)
    try {
      const realComments = await fetchInstagramComments()
      if (realComments.length > 0) {
        setCommentsList((prev) => {
          const existingIds = new Set(realComments.map((c) => c.id))
          const filteredPrev = prev.filter((p) => !existingIds.has(p.id))
          const updated = [...realComments, ...filteredPrev]
          try {
            localStorage.setItem('mbg_live_comments', JSON.stringify(updated))
          } catch {}
          return updated
        })
        setSyncSuccessMessage(
          `Berhasil menarik ${realComments.length} komentar publik Instagram (Tanpa API & Login) via Public Scraper!`
        )
        setTimeout(() => setSyncSuccessMessage(null), 6000)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setSyncSuccessMessage(`Gagal menarik komentar Instagram: ${msg}`)
      setTimeout(() => setSyncSuccessMessage(null), 5000)
    } finally {
      setIsFetchingInstagram(false)
    }
  }

  const handleFetchFacebookCommentsLive = async () => {
    setIsFetchingFacebook(true)
    try {
      const realComments = await fetchFacebookComments()
      if (realComments.length > 0) {
        setCommentsList((prev) => {
          const existingIds = new Set(realComments.map((c) => c.id))
          const filteredPrev = prev.filter((p) => !existingIds.has(p.id))
          const updated = [...realComments, ...filteredPrev]
          try {
            localStorage.setItem('mbg_live_comments', JSON.stringify(updated))
          } catch {}
          return updated
        })
        setSyncSuccessMessage(
          `Berhasil menarik ${realComments.length} komentar publik Facebook (Tanpa API & Login) via Public Fanspage Crawler!`
        )
        setTimeout(() => setSyncSuccessMessage(null), 6000)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setSyncSuccessMessage(`Gagal menarik komentar Facebook: ${msg}`)
      setTimeout(() => setSyncSuccessMessage(null), 5000)
    } finally {
      setIsFetchingFacebook(false)
    }
  }

  const filteredComments = useMemo(() => {
    return commentsList.filter((item) => {
      const matchSearch =
        item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sourceContentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.anonymizedAuthor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase())

      const matchSentiment =
        selectedSentiment === 'Semua' || item.sentiment === selectedSentiment

      const matchPlatform =
        selectedPlatform === 'Semua' || item.platform === selectedPlatform

      const matchReview = !onlyReviewNeeded || item.isSarcasmOrNeedsReview

      return matchSearch && matchSentiment && matchPlatform && matchReview
    })
  }, [commentsList, searchTerm, selectedSentiment, selectedPlatform, onlyReviewNeeded])

  // Calculated KPI Stats
  const kpiStats = useMemo(() => {
    const list =
      selectedPlatform === 'Semua'
        ? commentsList
        : commentsList.filter((c) => c.platform === selectedPlatform)
    const total = list.length
    if (total === 0) {
      return { total: 0, posPercent: '0%', negPercent: '0%', reviewCount: 0 }
    }
    const pos = list.filter((c) => c.sentiment === 'positif').length
    const neg = list.filter((c) => c.sentiment === 'negatif').length
    const review = list.filter((c) => c.isSarcasmOrNeedsReview).length
    return {
      total,
      posPercent: ((pos / total) * 100).toFixed(1) + '%',
      negPercent: ((neg / total) * 100).toFixed(1) + '%',
      reviewCount: review,
    }
  }, [commentsList, selectedPlatform])

  const getSentimentBadge = (item: CommentItem) => {
    const scorePercent = Math.round(item.confidenceScore * 100)

    if (item.isSarcasmOrNeedsReview || item.confidenceScore < 0.7) {
      return (
        <span
          className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-bold shadow-2xs"
          title="Tingkat keyakinan model rendah (<70%) atau terdeteksi nuansa sarkasme / ironi yang memerlukan verifikasi manual."
        >
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-600 text-xs" />
          Perlu Review ({scorePercent}%)
        </span>
      )
    }

    switch (item.sentiment) {
      case 'positif':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Positif ({scorePercent}%)
          </span>
        )
      case 'negatif':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200/80 px-2 py-0.5 rounded text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Negatif ({scorePercent}%)
          </span>
        )
      case 'netral':
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Netral ({scorePercent}%)
          </span>
        )
    }
  }

  const getPlatformTag = (platform: string) => {
    if (platform === 'YouTube') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
          <FontAwesomeIcon icon={faYoutube} className="text-xs" />
          YouTube
        </span>
      )
    }
    switch (platform) {
      case 'TikTok':
        return (
          <span className="text-[11px] font-bold text-white bg-slate-900 px-2 py-0.5 rounded">
            TikTok
          </span>
        )
      case 'Instagram':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 px-2 py-0.5 rounded">
            <FontAwesomeIcon icon={faInstagram} className="text-xs" />
            Instagram
          </span>
        )
      case 'Facebook':
        return (
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            Facebook
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-5 relative animate-section">
      {/* Loading Overlay saat menarik data komentar dari YouTube API */}
      {isFetchingYouTube && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg p-6 md:p-8 max-w-sm w-full mx-4 border border-slate-200/80 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Animated Logo Container */}
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-red-400 opacity-30"></span>
              <div className="w-14 h-14 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 text-white relative z-10">
                <FontAwesomeIcon icon={faYoutube} className="text-2xl text-white" />
              </div>
            </div>

            {/* Texts */}
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Menghubungkan ke YouTube API...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sedang mengambil thread komentar publik terbaru dari video isu MBG terpantau serta menganalisis sentimennya...
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-sm h-1.5 overflow-hidden">
              <div className="bg-red-600 h-full w-full rounded-sm animate-pulse"></div>
            </div>

            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faArrowsRotate} className="text-xs animate-spin text-red-600" />
              Memproses YouTube commentThreads API
            </span>
          </div>
        </div>
      )}

      {/* Loading Overlay saat menarik komentar Instagram (Tanpa API & Login) */}
      {isFetchingInstagram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg p-6 md:p-8 max-w-sm w-full mx-4 border border-slate-200/80 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Animated Logo Container */}
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-fuchsia-400 opacity-30"></span>
              <div className="w-14 h-14 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 text-white relative z-10">
                <FontAwesomeIcon icon={faInstagram} className="text-2xl text-white" />
              </div>
            </div>

            {/* Texts */}
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Menghubungkan Scraper Komentar Instagram...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mengambil respon warganet di akun media berita publik (@kompascom, @tribunnews, @narasinewsroom){' '}
                <span className="font-bold text-fuchsia-600">tanpa kredensial login atau API key</span>.
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-sm h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 h-full w-full rounded-sm animate-pulse"></div>
            </div>

            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faArrowsRotate} className="text-xs animate-spin text-fuchsia-600" />
              Instagram Public Pipeline Active
            </span>
          </div>
        </div>
      )}

      {/* Title & Description & Pull Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            Analisis Komentar Publik MBG (YouTube & Instagram)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">{filteredComments.length} komentar terpantau</span> •{' '}
            <span className="text-red-600 font-semibold">YouTube Data API v3</span> +{' '}
            <span className="text-fuchsia-600 font-semibold">Instagram Scraper (Tanpa API)</span>.
          </p>
        </div>

        {/* Action Buttons: Tarik YouTube & Tarik Instagram */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleFetchCommentsLive}
            disabled={isFetchingYouTube || isFetchingInstagram}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Tarik thread komentar YouTube terbaru secara live"
          >
            {isFetchingYouTube ? (
              <FontAwesomeIcon icon={faArrowsRotate} className="animate-spin text-xs" />
            ) : (
              <FontAwesomeIcon icon={faYoutube} className="text-sm" />
            )}
            <span>
              {isFetchingYouTube ? 'Menarik...' : 'Tarik YouTube (API)'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleFetchInstagramCommentsLive}
            disabled={isFetchingYouTube || isFetchingInstagram || isFetchingFacebook}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-opacity cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Tarik komentar publik Instagram tanpa login atau API key"
          >
            {isFetchingInstagram ? (
              <FontAwesomeIcon icon={faArrowsRotate} className="animate-spin text-xs" />
            ) : (
              <FontAwesomeIcon icon={faInstagram} className="text-sm" />
            )}
            <span>
              {isFetchingInstagram ? 'Menarik...' : 'Tarik Instagram (Tanpa API)'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleFetchFacebookCommentsLive}
            disabled={isFetchingYouTube || isFetchingInstagram || isFetchingFacebook}
            className="flex items-center gap-2 bg-[#1877f2] hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Tarik komentar publik Facebook fanspage tanpa login atau API key"
          >
            {isFetchingFacebook ? (
              <FontAwesomeIcon icon={faArrowsRotate} className="animate-spin text-xs" />
            ) : (
              <FontAwesomeIcon icon={faFacebook} className="text-sm" />
            )}
            <span>
              {isFetchingFacebook ? 'Menarik...' : 'Tarik Facebook (Tanpa API)'}
            </span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {syncSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-2 text-xs text-emerald-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            title="Tutup pesan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Focus Note Banner */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 text-xs text-slate-800">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Integrasi Komentar:</strong> Menampilkan feedback publik riil dari <strong className="text-red-600">YouTube API v3</strong> dan <strong className="text-fuchsia-600">Instagram Scraper (Tanpa API/Login)</strong>.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10.5px] bg-red-50 text-red-600 border border-red-200 font-bold px-2 py-0.5 rounded">
            YouTube Live
          </span>
          <span className="text-[10.5px] bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 font-bold px-2 py-0.5 rounded">
            IG Live Scraper
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Komentar Dianalisis</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{kpiStats.total}</div>
          <span className="text-[11px] text-slate-400">Dari Konten Terpantau</span>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Sentimen Positif</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{kpiStats.posPercent}</div>
          <span className="text-[11px] text-slate-400">Komentar mendukung</span>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Sentimen Negatif / Kritis</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{kpiStats.negPercent}</div>
          <span className="text-[11px] text-slate-400">Keluhan & kritik publik</span>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Perlu Review / Sarkasme</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{kpiStats.reviewCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">Deteksi ironi / sarkasme</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kata kunci dalam komentar atau judul postingan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Quick Toggle: Perlu Review Saja */}
          <button
            type="button"
            onClick={() => setOnlyReviewNeeded(!onlyReviewNeeded)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
              onlyReviewNeeded
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
            <span>Tampilkan "Perlu Review" Saja (Sarkasme / Ambigu)</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Platform Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-500 font-medium mr-1">Platform:</span>
            <button
              onClick={() => setSelectedPlatform('Semua')}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                selectedPlatform === 'Semua'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedPlatform('YouTube')}
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                selectedPlatform === 'YouTube'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FontAwesomeIcon icon={faYoutube} className="text-xs" />
              YouTube (API)
            </button>
            <button
              onClick={() => setSelectedPlatform('Instagram')}
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                selectedPlatform === 'Instagram'
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FontAwesomeIcon icon={faInstagram} className="text-xs" />
              Instagram (Tanpa API)
            </button>
            {['TikTok', 'Facebook'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`text-xs px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedPlatform === p
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                }`}
              >
                {p} (Demo)
              </button>
            ))}
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">Sentimen:</span>
            {sentimentFilters.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSentiment(s)}
                className={`text-xs px-2.5 py-1 rounded-md capitalize font-semibold transition-colors cursor-pointer ${
                  selectedSentiment === s
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sarkasme info banner */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
        <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-600 text-sm shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Deteksi Sarkasme Bahasa Medsos:</span> Komentar bernada ironi (contoh: <em>"Seperti biasa para pejabat tingginya cuci tangan"</em> atau <em>"MBG sukses korupnya"</em>) otomatis ditandai <strong>Perlu Review</strong> untuk verifikasi manual analis.
        </div>
      </div>

      {/* Comment Feed Cards */}
      <div className="space-y-3">
        {filteredComments.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg p-4 border transition-all shadow-xs ${
              item.isSarcasmOrNeedsReview
                ? 'border-amber-300 bg-amber-50/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Top row: Anonymized user + Platform + Sentiment Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
                  {item.platform === 'YouTube' ? (
                    <FontAwesomeIcon icon={faYoutube} className="text-red-600 text-xs" />
                  ) : item.platform === 'Instagram' ? (
                    <FontAwesomeIcon icon={faInstagram} className="text-fuchsia-600 text-xs" />
                  ) : item.platform === 'Facebook' ? (
                    <FontAwesomeIcon icon={faFacebook} className="text-blue-600 text-xs" />
                  ) : (
                    'TT'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      {item.author}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.anonymizedAuthor}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.timeAgo}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getPlatformTag(item.platform)}
                {getSentimentBadge(item)}
              </div>
            </div>

            {/* Comment Text */}
            <p className="text-xs md:text-[13px] text-slate-800 leading-relaxed py-3 font-normal">
              "{item.text}"
            </p>

            {/* Bottom Row: Source Content Reference + Likes */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 max-w-xl truncate">
                <span className="text-slate-400">
                  {item.platform === 'Instagram' ? 'Dari postingan:' : 'Dari video:'}
                </span>
                <span className="text-slate-700 font-medium truncate underline-offset-2">
                  {item.sourceContentTitle}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-400">
                  <FontAwesomeIcon icon={faThumbsUp} className="text-[11px] text-slate-400" />
                  {item.likes.toLocaleString()}
                </span>
                {item.isSarcasmOrNeedsReview && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                    Evaluasi Manual
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredComments.length === 0 && (
        <div className="bg-white rounded-lg p-12 border border-slate-200 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <MessageSquare className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {commentsList.length === 0
              ? 'Belum Ada Komentar (Cache Bersih / Kosong)'
              : 'Tidak ada komentar yang cocok dengan filter'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            {commentsList.length === 0
              ? 'Seluruh data komentar telah dikosongkan. Klik tombol "Tarik YouTube Live" atau "Tarik Komentar IG" di atas untuk menarik komentar warganet terbaru.'
              : 'Coba sesuaikan kata kunci pencarian atau filter sentimen.'}
          </p>
          {commentsList.length === 0 && (
            <button
              type="button"
              onClick={() => {
                setCommentsList(initialCombinedComments)
                localStorage.removeItem('mbg_cleared_empty')
              }}
              className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Muat Ulang Komentar Sampel
            </button>
          )}
        </div>
      )}
    </div>
  )
}
