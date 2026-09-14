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

    let ignore = false

    async function loadData() {
      try {
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

  // Real-time synchronization when YouTube or Instagram data is fetched
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<DetailedContentItem[]>
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        applyContentsToState(customEvent.detail)
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
    window.addEventListener('mbg-youtube-updated', handler)
    window.addEventListener('mbg-instagram-updated', handler)
    window.addEventListener('mbg-facebook-updated', handler)
    window.addEventListener('mbg-cache-cleared', cacheClearedHandler)
    return () => {
      window.removeEventListener('mbg-youtube-updated', handler)
      window.removeEventListener('mbg-instagram-updated', handler)
      window.removeEventListener('mbg-facebook-updated', handler)
      window.removeEventListener('mbg-cache-cleared', cacheClearedHandler)
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
