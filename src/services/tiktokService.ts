import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { CommentItem, DetailedContentItem } from '../types/dashboard'

export const sampleTikTokPosts: DetailedContentItem[] = []
export const sampleTikTokComments: CommentItem[] = []

/**
 * Fetch top 5 TikTok videos seputar MBG langsung dari database Supabase
 */
export async function fetchTop5TikTokPosts(): Promise<DetailedContentItem[]> {
  // Simulasi latency UX natural
  await new Promise((resolve) => setTimeout(resolve, 650))

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('platform', 'TikTok')
        .order('rank', { ascending: true })

      if (!error && data && data.length > 0) {
        const mapped: DetailedContentItem[] = data.map((c) => ({
          id: c.id,
          platform: c.platform,
          rank: c.rank,
          title: c.title,
          author: c.author,
          views: c.views,
          numericViews: Number(c.numeric_views || 0),
          comments: c.comments,
          numericComments: Number(c.numeric_comments || 0),
          shares: c.shares,
          timeAgo: c.time_ago,
          sentiment: c.sentiment,
          commentSentimentLabel: c.comment_sentiment_label,
          thumbnailUrl: c.thumbnail_url,
          url: c.url,
        }))

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('mbg-tiktok-updated', { detail: mapped })
          )
        }

        return mapped
      }
    } catch (e) {
      console.warn('Gagal memuat konten TikTok dari Supabase:', e)
    }
  }

  return sampleTikTokPosts
}

/**
 * Fetch top TikTok comments seputar MBG (tidak menyentuh database)
 */
export async function fetchTikTokComments(): Promise<CommentItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return sampleTikTokComments
}
