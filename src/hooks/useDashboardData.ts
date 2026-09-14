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
    if (!isSupabaseConfigured) return

    let ignore = false

    async function loadData() {
      try {
        const { data: contentsData, error } = await supabase
          .from('contents')
          .select('*')
          .order('rank', { ascending: true })

        if (!ignore && !error && contentsData && contentsData.length > 0) {
          applyContentsToState(contentsData as DetailedContentItem[])
        }
      } catch {
        // Silently fallback
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
    window.addEventListener('mbg-youtube-updated', handler)
    window.addEventListener('mbg-instagram-updated', handler)
    return () => {
      window.removeEventListener('mbg-youtube-updated', handler)
      window.removeEventListener('mbg-instagram-updated', handler)
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
    isRefreshing,
    isLiveFromSupabase,
    handlePeriodChange,
    refreshData,
  }
}
