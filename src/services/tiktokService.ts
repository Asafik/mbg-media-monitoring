import type { CommentItem, DetailedContentItem } from '../types/dashboard'

export const sampleTikTokPosts: DetailedContentItem[] = []

export const sampleTikTokComments: CommentItem[] = []

/**
 * Fetch top 5 TikTok videos seputar MBG tanpa login akun dan TANPA menyentuh database
 */
export async function fetchTop5TikTokPosts(): Promise<DetailedContentItem[]> {
  // Simulasi latency UX natural
  await new Promise((resolve) => setTimeout(resolve, 650))

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mbg-tiktok-updated', { detail: sampleTikTokPosts })
    )
  }

  return sampleTikTokPosts
}

/**
 * Fetch top TikTok comments seputar MBG TANPA menyentuh database
 */
export async function fetchTikTokComments(): Promise<CommentItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return sampleTikTokComments
}
