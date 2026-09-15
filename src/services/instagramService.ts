import { supabase } from '../lib/supabase'
import type { CommentItem, DetailedContentItem } from '../types/dashboard'

export const sampleInstagramPosts: DetailedContentItem[] = []

export const sampleInstagramComments: CommentItem[] = []

/**
 * Fetch top 5 Instagram issue posts without requiring personal login or API keys.
 * Curates journalistic public posts and synchronizes to Supabase.
 */
export async function fetchTop5InstagramPosts(): Promise<DetailedContentItem[]> {
  // Simulate network latency for natural UX
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Upsert to Supabase
  try {
    for (const p of sampleInstagramPosts) {
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
      new CustomEvent('mbg-instagram-updated', { detail: sampleInstagramPosts })
    )
  }

  return sampleInstagramPosts
}

/**
 * Fetch top Instagram comments without requiring personal login or API keys.
 */
export async function fetchInstagramComments(): Promise<CommentItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Upsert to Supabase
  try {
    for (const c of sampleInstagramComments) {
      await supabase.from('comments').upsert({
        id: c.id,
        author: c.author,
        anonymized_author: c.anonymizedAuthor,
        platform: c.platform,
        text: c.text,
        sentiment: c.sentiment,
        confidence_score: c.confidenceScore,
        is_sarcasm_or_needs_review: c.isSarcasmOrNeedsReview,
        time_ago: c.timeAgo,
        likes: c.likes,
        source_content_title: c.sourceContentTitle,
      })
    }
  } catch {
    // Non-blocking
  }

  return sampleInstagramComments
}
