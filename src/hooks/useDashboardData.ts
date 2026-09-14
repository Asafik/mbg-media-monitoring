import { useCallback, useEffect, useState } from 'react'
import { initialDashboardData } from '../data/mockData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type {
  DashboardData,
  DetailedContentItem,
  PlatformContentItem,
} from '../types/dashboard'

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(initialDashboardData)
  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialDashboardData.period)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLiveFromSupabase, setIsLiveFromSupabase] = useState(false)

  const applyContentsToState = useCallback((contentsData: DetailedContentItem[]) => {
    const mapToPlatformContent = (items: DetailedContentItem[]): PlatformContentItem[] =>
      items.map((item, idx) => ({
        id: item.id,
        rank: item.rank || idx + 1,
        title: item.title,
        views: item.views,
        comments: item.comments,
        timeAgo: item.timeAgo,
        thumbnailUrl: item.thumbnailUrl,
        url: item.url,
      }))

    const yt = mapToPlatformContent(contentsData.filter((c) => c.platform === 'YouTube').slice(0, 5))
    const tt = mapToPlatformContent(contentsData.filter((c) => c.platform === 'TikTok').slice(0, 5))
    const ig = mapToPlatformContent(contentsData.filter((c) => c.platform === 'Instagram').slice(0, 5))
    const fb = mapToPlatformContent(contentsData.filter((c) => c.platform === 'Facebook').slice(0, 5))

    setData((prev) => ({
      ...prev,
      contentsByPlatform: {
        youtube: yt.length ? yt : prev.contentsByPlatform.youtube,
        tiktok: tt.length ? tt : prev.contentsByPlatform.tiktok,
        instagram: ig.length ? ig : prev.contentsByPlatform.instagram,
        facebook: fb.length ? fb : prev.contentsByPlatform.facebook,
      },
      lastUpdated: `Live Supabase • ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
    }))
    setIsLiveFromSupabase(true)
  }, [])

  useEffect(() => {
    // Simulate initial load delay for mock data (so skeleton is always visible)
    const mockDelay = !isSupabaseConfigured
      ? new Promise<void>((resolve) => setTimeout(resolve, 900))
      : Promise.resolve()

    const syncFromLocalStorage = () => {
      if (typeof window === 'undefined') return
      try {
        const savedLive = localStorage.getItem('mbg_live_contents')
        if (savedLive) {
          const parsed = JSON.parse(savedLive) as DetailedContentItem[]
          if (Array.isArray(parsed) && parsed.length > 0) {
            applyContentsToState(parsed)
            return true
          }
        }
        if (localStorage.getItem('mbg_cleared_empty') === 'true') {
          setData((prev) => ({
            ...prev,
            contentsByPlatform: {
              youtube: [],
              tiktok: [],
              instagram: [],
              facebook: [],
            },
            lastUpdated: `Cache Bersih • 0 Konten Terpantau`,
          }))
          return true
        }
      } catch {}
      return false
    }

    let ignore = false

    async function loadData() {
      try {
        // Cek localStorage segera tanpa delay
        const synced = syncFromLocalStorage()
        if (synced && !ignore) {
          setIsLoading(false)
          return
        }

        await mockDelay
        if (!ignore) setIsLoading(false)

        if (!isSupabaseConfigured) return

        const { data: contentsData, error } = await supabase
          .from('contents')
          .select('*')
          .order('rank', { ascending: true })

        if (!ignore && !error && contentsData && contentsData.length > 0) {
          applyContentsToState(contentsData as DetailedContentItem[])
        }
      } catch {
        if (!ignore) setIsLoading(false)
      }
    }

    void loadData()

    return () => {
      ignore = true
    }
  }, [applyContentsToState])

  // Real-time synchronization when YouTube, Instagram, or Facebook data is fetched or page changes
  useEffect(() => {
    const handleContentsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DetailedContentItem[]>
      if (customEvent.detail && Array.isArray(customEvent.detail) && customEvent.detail.length > 0) {
        applyContentsToState(customEvent.detail)
      } else {
        // Fallback baca dari localStorage
        try {
          const saved = localStorage.getItem('mbg_live_contents')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              applyContentsToState(parsed)
            }
          }
        } catch {}
      }
    }

    const cacheClearedHandler = () => {
      setData((prev) => ({
        ...prev,
        contentsByPlatform: {
          youtube: [],
          tiktok: [],
          instagram: [],
          facebook: [],
        },
        lastUpdated: `Cache Bersih • 0 Konten Terpantau`,
      }))
      setIsLiveFromSupabase(false)
    }

    // Re-sync kapan pun rute/menu berpindah (hashchange) atau window fokus
    const handleNavigationSync = () => {
      try {
        const savedLive = localStorage.getItem('mbg_live_contents')
        if (savedLive) {
          const parsed = JSON.parse(savedLive) as DetailedContentItem[]
          if (Array.isArray(parsed) && parsed.length > 0) {
            applyContentsToState(parsed)
            return
          }
        }
        if (localStorage.getItem('mbg_cleared_empty') === 'true') {
          setData((prev) => ({
            ...prev,
            contentsByPlatform: {
              youtube: [],
              tiktok: [],
              instagram: [],
              facebook: [],
            },
            lastUpdated: `Cache Bersih • 0 Konten Terpantau`,
          }))
        }
      } catch {}
    }

    window.addEventListener('mbg-live-contents-updated', handleContentsUpdate)
    window.addEventListener('mbg-youtube-updated', handleContentsUpdate)
    window.addEventListener('mbg-instagram-updated', handleContentsUpdate)
    window.addEventListener('mbg-facebook-updated', handleContentsUpdate)
    window.addEventListener('mbg-cache-cleared', cacheClearedHandler)
    window.addEventListener('hashchange', handleNavigationSync)
    window.addEventListener('storage', handleNavigationSync)

    return () => {
      window.removeEventListener('mbg-live-contents-updated', handleContentsUpdate)
      window.removeEventListener('mbg-youtube-updated', handleContentsUpdate)
      window.removeEventListener('mbg-instagram-updated', handleContentsUpdate)
      window.removeEventListener('mbg-facebook-updated', handleContentsUpdate)
      window.removeEventListener('mbg-cache-cleared', cacheClearedHandler)
      window.removeEventListener('hashchange', handleNavigationSync)
      window.removeEventListener('storage', handleNavigationSync)
    }
  }, [applyContentsToState])

  const handlePeriodChange = useCallback((newPeriod: string) => {
    setSelectedPeriod(newPeriod)
    setData((prev) => ({
      ...prev,
      period: newPeriod,
    }))
  }, [])

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    if (isSupabaseConfigured) {
      try {
        const { data: contentsData, error } = await supabase
          .from('contents')
          .select('*')
          .order('rank', { ascending: true })

        if (!error && contentsData && contentsData.length > 0) {
          applyContentsToState(contentsData as DetailedContentItem[])
        }
      } catch {
        // Fallback silently
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setData((prev) => ({
        ...prev,
        lastUpdated: '14 Sep 2024, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }))
    }
    setIsRefreshing(false)
  }, [applyContentsToState])

  return {
    data,
    selectedPeriod,
    isLoading,
    isRefreshing,
    isLiveFromSupabase,
    handlePeriodChange,
    refreshData,
  }
}
