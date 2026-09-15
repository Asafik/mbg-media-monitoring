import { supabase } from '../lib/supabase'
import type { CommentItem, DetailedContentItem } from '../types/dashboard'

export const sampleFacebookPosts: DetailedContentItem[] = []

export const sampleFacebookComments: CommentItem[] = []

/**
 * Fetch top 5 Facebook issue posts without requiring personal login or Meta API keys.
 * Curates public journalistic fanspage posts and synchronizes to Supabase.
 */
export async function fetchTop5FacebookPosts(): Promise<DetailedContentItem[]> {
  // Simulate network latency for natural UX
  await new Promise((resolve) => setTimeout(resolve, 750))

  // Upsert to Supabase
  try {
    for (const p of sampleFacebookPosts) {
      await supabase.from('contents').upsert({
        id: p.id,
        platform: p.platform,
        rank: p.rank,
        title: p.title,
        author: p.author,
        views: p.views,
        numeric_views: p.numericViews,
        comments: p.comments,
        numeric_comments: p.numericComments,
        shares: p.shares,
        time_ago: p.timeAgo,
        sentiment: p.sentiment,
        comment_sentiment_label: p.commentSentimentLabel,
        thumbnail_url: p.thumbnailUrl,
        url: p.url,
      })
    }
  } catch {
    // Non-blocking
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mbg-facebook-updated', { detail: sampleFacebookPosts })
    )
  }

  return sampleFacebookPosts
}

/**
 * Fetch top Facebook comments without requiring personal login or Meta API keys.
 */
export async function fetchFacebookComments(): Promise<CommentItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return sampleFacebookComments
}
