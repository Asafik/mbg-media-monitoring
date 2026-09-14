import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTriangleExclamation,
  faSkullCrossbones,
  faBoxOpen,
  faScaleBalanced,
  faArrowsRotate,
} from '@fortawesome/free-solid-svg-icons'
import { faYoutube, faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons'
import {
  CheckCircle2,
  Database,
  ExternalLink,
  Eye,
  Info,
  LayoutGrid,
  List,
  MessageSquare,
  Search,
  Share2,
  X,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { allDetailedContents } from '../data/extendedMockData'
import {
  fetchTop5YouTubeVideos,
  type YouTubeIssueTopic,
} from '../services/youtubeService'
import {
  fetchTop5InstagramPosts,
  sampleInstagramPosts,
} from '../services/instagramService'
import {
  fetchTop5FacebookPosts,
  sampleFacebookPosts,
} from '../services/facebookService'
import type { DetailedContentItem } from '../types/dashboard'

/**
 * Helper deteksi isu kembar/duplikat antar-platform (YouTube, IG, FB):
 * 1. Thumbnail URL sama persis.
 * 2. Kesamaan kata kunci judul > 55% pada kata-kata esensial.
 */
const areContentsDuplicate = (a: DetailedContentItem, b: DetailedContentItem): boolean => {
  if (a.id === b.id) return false
  if (a.thumbnailUrl && b.thumbnailUrl && a.thumbnailUrl === b.thumbnailUrl) return true

  const stopWords = new Set([
    'dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'pada', 'dengan', 'adalah', 'ini', 'itu',
    'soal', 'terkait', 'usai', 'buka', 'respons', 'mbg', 'program', 'makan', 'bergizi', 'gratis'
  ])

  const tokenize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))

  const wordsA = new Set(tokenize(a.title))
  const wordsB = new Set(tokenize(b.title))

  if (wordsA.size === 0 || wordsB.size === 0) return false

  let intersection = 0
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersection++
  })

  const minLen = Math.min(wordsA.size, wordsB.size)
  return intersection / minLen >= 0.55
}

// Initial content gabungan YouTube + Instagram + Facebook (Tanpa API/Login)
const sanitizeThumbnails = (items: DetailedContentItem[]): DetailedContentItem[] => {
  return items.map((item) => {
    if (item.id === 'fb-kompas-1') return sampleFacebookPosts[0]
    if (item.id === 'fb-detik-2') return sampleFacebookPosts[1]
    if (item.thumbnailUrl.includes('aL3N4447j9A')) {
      return { ...item, thumbnailUrl: 'https://i.ytimg.com/vi/21g5WNyy1eY/hqdefault.jpg' }
    }
    if (item.thumbnailUrl.includes('u5h3Yq3n5aI')) {
      return { ...item, thumbnailUrl: 'https://i.ytimg.com/vi/2gIobI9TvnA/hqdefault.jpg' }
    }
    if (item.thumbnailUrl.includes('m0G8s7d8H_s')) {
      return { ...item, thumbnailUrl: 'https://i.ytimg.com/vi/6lTjTgXMbaw/hqdefault.jpg' }
    }
    return item
  })
}

const initialCombinedContents: DetailedContentItem[] = sanitizeThumbnails([
  ...allDetailedContents.filter((item) => item.platform === 'YouTube'),
  ...sampleInstagramPosts,
  ...sampleFacebookPosts,
])

export const ContentPage: React.FC = () => {
  const [contentList, setContentList] = useState<DetailedContentItem[]>(() => {
    try {
      const saved = localStorage.getItem('mbg_live_contents')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeThumbnails(parsed)
        }
      }
      if (localStorage.getItem('mbg_cleared_empty') === 'true') {
        return []
      }
      // Simpan dataset bawaan ke storage jika belum pernah di-clear
      localStorage.setItem('mbg_live_contents', JSON.stringify(initialCombinedContents))
    } catch {}
    return initialCombinedContents
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSentiment, setSelectedSentiment] = useState<string>('Semua')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Semua')
  const [selectedIssueTopic, setSelectedIssueTopic] = useState<YouTubeIssueTopic>('kritis')
  const [sortBy, setSortBy] = useState<'views' | 'comments' | 'rank'>('rank')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [isFetchingYouTube, setIsFetchingYouTube] = useState(false)
  const [isFetchingInstagram, setIsFetchingInstagram] = useState(false)
  const [isFetchingFacebook, setIsFetchingFacebook] = useState(false)
  const [deduplicateCrossPlatform, setDeduplicateCrossPlatform] = useState<boolean>(true)
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null)

  const sentiments = ['Semua', 'positif', 'negatif', 'netral']

  // Dengarkan sinyal pembersihan cache global
  React.useEffect(() => {
    const handleCacheCleared = () => {
      setContentList([])
    }
    window.addEventListener('mbg-cache-cleared', handleCacheCleared)
    return () => window.removeEventListener('mbg-cache-cleared', handleCacheCleared)
  }, [])

  const handleFetchYouTubeLive = async () => {
    setIsFetchingYouTube(true)
    try {
      const realYouTubeVideos = await fetchTop5YouTubeVideos(selectedIssueTopic)
      if (realYouTubeVideos.length > 0) {
        setContentList((prev) => {
          const nonYt = prev.filter((p) => p.platform !== 'YouTube')
          const updated = [...realYouTubeVideos, ...nonYt]
          try {
            localStorage.removeItem('mbg_cleared_empty')
            localStorage.setItem('mbg_live_contents', JSON.stringify(updated))
            window.dispatchEvent(new CustomEvent('mbg-live-contents-updated', { detail: updated }))
          } catch {}
          return updated
        })
        setSyncSuccessMessage(
          `Berhasil menarik ${realYouTubeVideos.length} video asli YouTube tentang isu: "${selectedIssueTopic.toUpperCase()}" via Live API!`
        )
        setTimeout(() => setSyncSuccessMessage(null), 6000)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setSyncSuccessMessage(`Error saat menarik YouTube API: ${msg}`)
      setTimeout(() => setSyncSuccessMessage(null), 5000)
    } finally {
      setIsFetchingYouTube(false)
    }
  }

  const handleFetchInstagramLive = async () => {
    setIsFetchingInstagram(true)
    try {
      const realInstagramPosts = await fetchTop5InstagramPosts()
      if (realInstagramPosts.length > 0) {
        setContentList((prev) => {
          const nonIg = prev.filter((p) => p.platform !== 'Instagram')
          const updated = [...nonIg, ...realInstagramPosts]
          try {
            localStorage.removeItem('mbg_cleared_empty')
            localStorage.setItem('mbg_live_contents', JSON.stringify(updated))
            window.dispatchEvent(new CustomEvent('mbg-live-contents-updated', { detail: updated }))
          } catch {}
          return updated
        })
        setSyncSuccessMessage(
          `Berhasil menarik ${realInstagramPosts.length} postingan Instagram (Tanpa API & Tanpa Login) via Public Scraper!`
        )
        setTimeout(() => setSyncSuccessMessage(null), 6000)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setSyncSuccessMessage(`Error saat menarik Instagram: ${msg}`)
      setTimeout(() => setSyncSuccessMessage(null), 5000)
    } finally {
      setIsFetchingInstagram(false)
    }
  }

  const handleFetchFacebookLive = async () => {
    setIsFetchingFacebook(true)
    try {
      const realFacebookPosts = await fetchTop5FacebookPosts()
      if (realFacebookPosts.length > 0) {
        setContentList((prev) => {
          const nonFb = prev.filter((p) => p.platform !== 'Facebook')
          const updated = [...nonFb, ...realFacebookPosts]
          try {
            localStorage.removeItem('mbg_cleared_empty')
            localStorage.setItem('mbg_live_contents', JSON.stringify(updated))
            window.dispatchEvent(new CustomEvent('mbg-live-contents-updated', { detail: updated }))
          } catch {}
          return updated
        })
        setSyncSuccessMessage(
          `Berhasil menarik ${realFacebookPosts.length} postingan Facebook (Tanpa API & Tanpa Login) via Public Fanspage Crawler!`
        )
        setTimeout(() => setSyncSuccessMessage(null), 6000)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setSyncSuccessMessage(`Error saat menarik Facebook: ${msg}`)
      setTimeout(() => setSyncSuccessMessage(null), 5000)
    } finally {
      setIsFetchingFacebook(false)
    }
  }

  const filteredContents = useMemo(() => {
    let result = contentList.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchSentiment =
        selectedSentiment === 'Semua' || item.sentiment === selectedSentiment
      const matchPlatform =
        selectedPlatform === 'Semua' || item.platform === selectedPlatform
      return matchSearch && matchSentiment && matchPlatform
    })

    // Saring konten duplikat/kembar antar platform jika filter anti-duplikasi aktif
    if (deduplicateCrossPlatform) {
      const seen: DetailedContentItem[] = []
      result = result.filter((item) => {
        const isDuplicate = seen.some((existing) => areContentsDuplicate(existing, item))
        if (isDuplicate) return false
        seen.push(item)
        return true
      })
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'views') {
        return (b.numericViews || 0) - (a.numericViews || 0)
      }
      if (sortBy === 'comments') {
        return (b.numericComments || 0) - (a.numericComments || 0)
      }
      return (a.rank || 99) - (b.rank || 99)
    })

    return result
  }, [contentList, searchTerm, selectedSentiment, selectedPlatform, sortBy, deduplicateCrossPlatform])

  // Hitung jumlah isu kembar yang disaring
  const duplicateCount = useMemo(() => {
    let count = 0
    const seen: DetailedContentItem[] = []
    contentList.forEach((item) => {
      if (seen.some((existing) => areContentsDuplicate(existing, item))) {
        count++
      } else {
        seen.push(item)
      }
    })
    return count
  }, [contentList])

  // Hitung total akumulasi views & komentar dari video yang ada di list
  const totalViewsNum = useMemo(() => {
    const sum = contentList.reduce((acc, curr) => acc + (curr.numericViews || 0), 0)
    if (sum >= 1000000) return (sum / 1000000).toFixed(1) + 'M'
    if (sum >= 1000) return (sum / 1000).toFixed(1) + 'K'
    return sum.toLocaleString()
  }, [contentList])

  const totalCommentsNum = useMemo(() => {
    const sum = contentList.reduce((acc, curr) => acc + (curr.numericComments || 0), 0)
    if (sum >= 1000) return (sum / 1000).toFixed(1) + 'K'
    return sum.toLocaleString()
  }, [contentList])

  const getPlatformBadge = (platform: string) => {
    if (platform === 'YouTube') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200/80 px-2 py-0.5 rounded text-[11px] font-bold">
          <FontAwesomeIcon icon={faYoutube} className="text-red-600 text-xs" />
          YouTube
        </span>
      )
    }
    if (platform === 'Instagram') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/80 px-2 py-0.5 rounded text-[11px] font-bold">
          <FontAwesomeIcon icon={faInstagram} className="text-fuchsia-600 text-xs" />
          Instagram
        </span>
      )
    }
    if (platform === 'Facebook') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded text-[11px] font-bold">
          <FontAwesomeIcon icon={faFacebook} className="text-blue-600 text-xs" />
          Facebook
        </span>
      )
    }
    return null
  }

  const getSentimentPill = (item: DetailedContentItem) => {
    const label = item.commentSentimentLabel || `Sentimen: ${item.sentiment}`
    switch (item.sentiment) {
      case 'positif':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded text-[10.5px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {label}
          </span>
        )
      case 'negatif':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/80 px-2 py-0.5 rounded text-[10.5px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {label}
          </span>
        )
      case 'netral':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10.5px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {label}
          </span>
        )
    }
  }

  return (
    <div className="space-y-5 relative animate-section">
      {/* Loading Overlay saat menarik data dari YouTube API */}
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
                Sedang memfilter 5 video YouTube teratas seputar isu:{' '}
                <span className="font-bold text-red-600 uppercase">"{selectedIssueTopic}"</span>{' '}
                (kasus keracunan, pembagian tidak tepat sasaran, atau anggaran MBG).
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-sm h-1.5 overflow-hidden">
              <div className="bg-red-600 h-full w-full rounded-sm animate-pulse"></div>
            </div>

            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faArrowsRotate} className="text-xs animate-spin text-red-600" />
              Memproses YouTube Data API v3
            </span>
          </div>
        </div>
      )}

      {/* Loading Overlay saat menarik data dari Instagram (Tanpa API & Login) */}
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
                Menghubungkan Instagram Public Scraper...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mengambil postingan media monitoring publik Instagram (@kompascom, @tribunnews, @narasinewsroom, dll){' '}
                <span className="font-bold text-fuchsia-600">tanpa memerlukan API key maupun login kredensial pribadi</span>.
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-sm h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 h-full w-full rounded-sm animate-pulse"></div>
            </div>

            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faArrowsRotate} className="text-xs animate-spin text-fuchsia-600" />
              Instagram Public Open Graph Pipeline
            </span>
          </div>
        </div>
      )}

      {/* Title & Description with clear methodology */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            Monitoring Konten MBG (YouTube & Instagram)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">{contentList.length} konten terindeks</span> •{' '}
            <span className="text-red-600 font-bold">YouTube API Live</span> +{' '}
            <span className="text-fuchsia-600 font-bold">Instagram Scraper (Tanpa API)</span>.
          </p>
        </div>

        {/* Actions: Selector Isu + Tarik YouTube + Tarik Instagram + View Toggle */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Selector Topik Isu Target (YouTube) */}
          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            {selectedIssueTopic === 'kritis' && (
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-500 text-xs" />
            )}
            {selectedIssueTopic === 'keracunan' && (
              <FontAwesomeIcon icon={faSkullCrossbones} className="text-rose-500 text-xs" />
            )}
            {selectedIssueTopic === 'distribusi' && (
              <FontAwesomeIcon icon={faBoxOpen} className="text-blue-500 text-xs" />
            )}
            {selectedIssueTopic === 'anggaran' && (
              <FontAwesomeIcon icon={faScaleBalanced} className="text-purple-500 text-xs" />
            )}
            <span className="text-xs text-slate-500 font-medium hidden md:inline">Fokus Isu YT:</span>
            <select
              value={selectedIssueTopic}
              onChange={(e) => setSelectedIssueTopic(e.target.value as YouTubeIssueTopic)}
              className="text-xs font-semibold bg-transparent text-slate-800 focus:outline-none cursor-pointer py-0.5"
            >
              <option value="kritis">Semua Isu Kritis (Keracunan & Sasaran)</option>
              <option value="keracunan">Kasus Keracunan & Makanan Basi</option>
              <option value="distribusi">Tidak Tepat Sasaran & Porsi</option>
              <option value="anggaran">Kritik Anggaran & Kebijakan</option>
            </select>
          </div>

          {/* Button Tarik 5 Video YouTube (Live API) */}
          <button
            type="button"
            onClick={handleFetchYouTubeLive}
            disabled={isFetchingYouTube || isFetchingInstagram}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Tarik 5 video asli YouTube seputar isu yang dipilih secara live"
          >
            {isFetchingYouTube ? (
              <FontAwesomeIcon icon={faArrowsRotate} className="text-xs animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faYoutube} className="text-sm" />
            )}
            <span>
              {isFetchingYouTube ? 'Menarik...' : 'Tarik YouTube (API)'}
            </span>
          </button>

          {/* Button Tarik 5 Post Instagram (Live Scraper - Tanpa API) */}
          <button
            type="button"
            onClick={handleFetchInstagramLive}
            disabled={isFetchingYouTube || isFetchingInstagram || isFetchingFacebook}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Tarik 5 postingan Instagram dari media kredibel tanpa API key atau login"
          >
            {isFetchingInstagram ? (
              <FontAwesomeIcon icon={faArrowsRotate} className="text-xs animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faInstagram} className="text-sm" />
            )}
            <span>
              {isFetchingInstagram ? 'Menarik...' : 'Tarik Instagram (Tanpa API)'}
            </span>
          </button>

          {/* Button Tarik 5 Post Facebook (Public Fanspage Crawler - Tanpa API) */}
          <button
            type="button"
            onClick={handleFetchFacebookLive}
            disabled={isFetchingYouTube || isFetchingInstagram || isFetchingFacebook}
            className="flex items-center gap-1.5 bg-[#1877f2] hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Tarik 5 postingan Facebook fanspage berita media tanpa API key atau login"
          >
            {isFetchingFacebook ? (
              <FontAwesomeIcon icon={faArrowsRotate} className="text-xs animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faFacebook} className="text-sm" />
            )}
            <span>
              {isFetchingFacebook ? 'Menarik...' : 'Tarik Facebook (Tanpa API)'}
            </span>
          </button>

          {/* View Toggle: Card vs List */}
          <div className="inline-flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Tampilan Tabel List"
            >
              <List className="w-3.5 h-3.5" />
              <span>List Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Focus Note Banner */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 text-xs text-slate-800">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Status Integrasi:</strong> <strong className="text-red-600">YouTube Data API v3 (Live)</strong>, <strong className="text-fuchsia-600">Instagram Scraper (Tanpa Login)</strong>, dan <strong className="text-blue-600">Facebook Scraper (Tanpa Login)</strong> aktif. Platform TikTok tetap dalam mode demo.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10.5px] bg-red-50 text-red-600 border border-red-200 font-bold px-2 py-0.5 rounded">
            YouTube API
          </span>
          <span className="text-[10.5px] bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 font-bold px-2 py-0.5 rounded">
            IG Scraper
          </span>
          <span className="text-[10.5px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded">
            FB Scraper
          </span>
        </div>
      </div>

      {/* Sync Notification Toast */}
      {syncSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-lg text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{syncSuccessMessage}</span>
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

      {/* Summary KPI Mini Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Konten Terpantau</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{contentList.length}</div>
          <span className="text-[11px] text-blue-600 font-medium">Top Isu YouTube & IG</span>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Tayangan / Likes</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalViewsNum}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Akumulasi views & likes</span>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Komentar Publik</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCommentsNum}</div>
          <span className="text-[11px] text-slate-400">Di kolom respon warganet</span>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Status Platform Aktif</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">2 Aktif</div>
          <span className="text-[11px] text-slate-400">YouTube + Instagram Live</span>
        </div>
      </div>

      {/* Filter & Sorting Toolbar */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul konten atau nama akun/channel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium mr-1">Platform:</span>
          {(['Semua', 'YouTube', 'Instagram', 'Facebook'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPlatform(p)}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                selectedPlatform === p
                  ? p === 'YouTube'
                    ? 'bg-red-600 text-white shadow-xs'
                    : p === 'Instagram'
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs'
                    : p === 'Facebook'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p === 'YouTube' && <FontAwesomeIcon icon={faYoutube} className="mr-1 text-xs" />}
              {p === 'Instagram' && <FontAwesomeIcon icon={faInstagram} className="mr-1 text-xs" />}
              {p === 'Facebook' && <FontAwesomeIcon icon={faFacebook} className="mr-1 text-xs" />}
              {p}
            </button>
          ))}
        </div>

        {/* Anti-Duplikasi Cross-Platform Toggle */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={deduplicateCrossPlatform}
              onChange={(e) => setDeduplicateCrossPlatform(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1.5">
              <span>Saring Isu Duplikat</span>
              {duplicateCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  deduplicateCrossPlatform ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {deduplicateCrossPlatform ? `${duplicateCount} disaring` : `${duplicateCount} duplikat`}
                </span>
              )}
            </span>
          </label>
        </div>

        {/* Sentiment Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium mr-1">Sentimen:</span>
          {sentiments.map((s) => (
            <button
              key={s}
              type="button"
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

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
          <span className="text-xs text-slate-500 font-medium">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'views' | 'comments' | 'rank')}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="rank">Ranking Teratas</option>
            <option value="views">Terbanyak Dilihat</option>
            <option value="comments">Terbanyak Dikomentari</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: CARD GRID VIEW */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredContents.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-200 overflow-hidden">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'
                    }}
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    {getPlatformBadge(item.platform)}
                    {item.rank && item.rank <= 5 && (
                      <span className="bg-amber-400 text-slate-900 font-bold text-[10px] px-1.5 py-0.5 rounded shadow-xs">
                        #{item.rank} {item.platform}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Info */}
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    {getSentimentPill(item)}
                    <span className="text-[10px] text-slate-400">{item.timeAgo}</span>
                  </div>

                  <h3 className={`text-xs font-bold text-slate-900 leading-snug line-clamp-2 transition-colors ${
                    item.platform === 'Instagram'
                      ? 'group-hover:text-fuchsia-600'
                      : item.platform === 'Facebook'
                      ? 'group-hover:text-blue-600'
                      : 'group-hover:text-red-600'
                  }`}>
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {item.platform === 'Instagram'
                      ? 'Akun:'
                      : item.platform === 'Facebook'
                      ? 'Fanspage:'
                      : 'Channel:'}{' '}
                    <span className="text-slate-800 font-semibold">{item.author}</span>
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 pt-2 text-[10.5px] text-slate-500 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {item.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      {item.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      {item.shares}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-[10.5px] text-slate-400">{item.platform} Terpantau</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`font-semibold flex items-center gap-1 ${
                    item.platform === 'Instagram'
                      ? 'text-fuchsia-600 hover:text-fuchsia-700'
                      : item.platform === 'Facebook'
                      ? 'text-blue-600 hover:text-blue-700'
                      : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  {item.platform === 'Instagram'
                    ? 'Buka di Instagram'
                    : item.platform === 'Facebook'
                    ? 'Buka di Facebook'
                    : 'Buka di YouTube'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: COMPACT LIST / TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Peringkat</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4 min-w-[280px]">Judul Konten & Akun</th>
                  <th className="py-3 px-4">Sentimen Komentar</th>
                  <th className="py-3 px-4 text-right">Tayangan / Likes</th>
                  <th className="py-3 px-4 text-right">Komentar</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredContents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-block bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                        #{item.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getPlatformBadge(item.platform)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.thumbnailUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-12 h-8 rounded object-cover shrink-0 border border-slate-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'
                          }}
                        />
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-1 max-w-md">
                            {item.title}
                          </p>
                          <p className="text-[10.5px] text-slate-400 mt-0.5">
                            {item.platform === 'Instagram' ? 'Akun:' : 'Channel:'}{' '}
                            <span className="text-slate-700 font-medium">{item.author}</span> • {item.timeAgo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getSentimentPill(item)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {item.views}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {item.comments}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1 font-semibold ${
                          item.platform === 'Instagram'
                            ? 'text-fuchsia-600 hover:text-fuchsia-800'
                            : item.platform === 'Facebook'
                            ? 'text-blue-600 hover:text-blue-800'
                            : 'text-red-600 hover:text-red-800'
                        }`}
                      >
                        {item.platform === 'Instagram'
                          ? 'Buka Post IG'
                          : item.platform === 'Facebook'
                          ? 'Buka Post FB'
                          : 'Buka Video'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredContents.length === 0 && (
        <div className="bg-white rounded-lg p-12 border border-slate-200 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Database className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {contentList.length === 0
              ? 'Belum Ada Konten (Cache Bersih / Kosong)'
              : 'Tidak ada konten yang cocok dengan filter'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            {contentList.length === 0
              ? 'Seluruh data cache telah dibersihkan. Klik tombol "Tarik YouTube Live" atau "Tarik Instagram" di atas untuk memantau data baru, atau pulihkan data sampel bawaan.'
              : 'Coba ubah kata kunci pencarian atau filter platform/sentimen.'}
          </p>
          {contentList.length === 0 && (
            <button
              type="button"
              onClick={() => {
                setContentList(initialCombinedContents)
                localStorage.removeItem('mbg_cleared_empty')
              }}
              className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Muat Ulang Data Sampel
            </button>
          )}
        </div>
      )}
    </div>
  )
}
