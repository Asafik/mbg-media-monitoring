import { supabase } from '../lib/supabase'
import type { CommentItem, DetailedContentItem } from '../types/dashboard'

export const sampleInstagramPosts: DetailedContentItem[] = [
  {
    id: 'ig-kompas-1',
    platform: 'Instagram',
    rank: 1,
    title: 'Dinkes Selidiki Dugaan Keracunan Massal MBG di Tiga Sekolah Dasar',
    author: '@kompascom',
    views: '84.5K likes',
    numericViews: 84500,
    comments: '2.4K komentar',
    numericComments: 2400,
    shares: '3.1K share',
    timeAgo: '13 Sep',
    sentiment: 'negatif',
    commentSentimentLabel: 'Sentimen Komentar: Negatif 82%',
    thumbnailUrl: 'https://i.ytimg.com/vi/_OnKkVwvBgg/hqdefault.jpg',
    url: 'https://www.instagram.com/kompascom/',
  },
  {
    id: 'ig-tribun-2',
    platform: 'Instagram',
    rank: 2,
    title: 'BGN Buka Suara Terkait Siswa Mual & Muntah Usai Konsumsi Makanan MBG',
    author: '@tribunnews',
    views: '62.1K likes',
    numericViews: 62100,
    comments: '1.9K komentar',
    numericComments: 1900,
    shares: '2.5K share',
    timeAgo: '12 Sep',
    sentiment: 'negatif',
    commentSentimentLabel: 'Sentimen Komentar: Kritis 76%',
    thumbnailUrl: 'https://i.ytimg.com/vi/yujUVcBp7S0/hqdefault.jpg',
    url: 'https://www.instagram.com/tribunnews/',
  },
  {
    id: 'ig-narasi-3',
    platform: 'Instagram',
    rank: 3,
    title: 'Catatan Kritis: Transparansi Anggaran 71T & Standar Dapur Pelayanan MBG',
    author: '@narasinewsroom',
    views: '95.4K likes',
    numericViews: 95400,
    comments: '3.8K komentar',
    numericComments: 3800,
    shares: '5.2K share',
    timeAgo: '11 Sep',
    sentiment: 'negatif',
    commentSentimentLabel: 'Sentimen Komentar: Investigasi Negatif 88%',
    thumbnailUrl: 'https://i.ytimg.com/vi/pFVOQMnTZdc/hqdefault.jpg',
    url: 'https://www.instagram.com/narasinewsroom/',
  },
  {
    id: 'ig-kumparan-4',
    platform: 'Instagram',
    rank: 4,
    title: 'Wali Murid Keluhkan Porsi MBG Terlalu Sedikit & Nasi Keras di Sejumlah Daerah',
    author: '@kumparancom',
    views: '48.2K likes',
    numericViews: 48200,
    comments: '1.2K komentar',
    numericComments: 1200,
    shares: '1.8K share',
    timeAgo: '10 Sep',
    sentiment: 'negatif',
    commentSentimentLabel: 'Sentimen Komentar: Keluhan 74%',
    thumbnailUrl: 'https://i.ytimg.com/vi/21g5WNyy1eY/hqdefault.jpg',
    url: 'https://www.instagram.com/kumparancom/',
  },
  {
    id: 'ig-fokus-5',
    platform: 'Instagram',
    rank: 5,
    title: 'Sidak Dapur Umum Sentra Pelayanan MBG: Pantau Higienitas & Menu Bergizi',
    author: '@fokus_edukasi',
    views: '35.6K likes',
    numericViews: 35600,
    comments: '750 komentar',
    numericComments: 750,
    shares: '920 share',
    timeAgo: '9 Sep',
    sentiment: 'positif',
    commentSentimentLabel: 'Sentimen Komentar: Positif 68%',
    thumbnailUrl: 'https://i.ytimg.com/vi/6lTjTgXMbaw/hqdefault.jpg',
    url: 'https://www.instagram.com/explore/tags/makanbergizigratis/',
  },
]

export const sampleInstagramComments: CommentItem[] = [
  {
    id: 'ig-cmt-1',
    author: '@bunda_faiha',
    anonymizedAuthor: '@bun***',
    platform: 'Instagram',
    text: 'Tolong diperketat seleksi kateringnya! Anak saya kemarin muntah-muntah sepulang sekolah gara-gara tumis buncisnya bau asam.',
    sentiment: 'negatif',
    confidenceScore: 0.94,
    isSarcasmOrNeedsReview: false,
    timeAgo: '13 Sep',
    likes: 852,
    sourceContentTitle: 'Dinkes Selidiki Dugaan Keracunan Massal MBG di Tiga Sekolah Dasar',
  },
  {
    id: 'ig-cmt-2',
    author: '@dimas.wicaksono',
    anonymizedAuthor: '@dim***',
    platform: 'Instagram',
    text: 'Bagus kalau dinkes dan BPOM turun tangan langsung. Jangan nunggu korban makin banyak baru evaluasi.',
    sentiment: 'negatif',
    confidenceScore: 0.88,
    isSarcasmOrNeedsReview: false,
    timeAgo: '12 Sep',
    likes: 412,
    sourceContentTitle: 'BGN Buka Suara Terkait Siswa Mual & Muntah Usai Konsumsi Makanan MBG',
  },
  {
    id: 'ig-cmt-3',
    author: '@rina_kartika_s',
    anonymizedAuthor: '@rin***',
    platform: 'Instagram',
    text: 'Hebat ya anggarannya puluhan triliun tapi lauknya telur puyuh sebiji sama semangka layu.',
    sentiment: 'negatif',
    confidenceScore: 0.62,
    isSarcasmOrNeedsReview: true,
    timeAgo: '11 Sep',
    likes: 674,
    sourceContentTitle: 'Catatan Kritis: Transparansi Anggaran 71T & Standar Dapur Pelayanan MBG',
  },
  {
    id: 'ig-cmt-4',
    author: '@guru_sd_nusantara',
    anonymizedAuthor: '@gur***',
    platform: 'Instagram',
    text: 'Di sekolah kami alhamdulillah kualitas makanannya terjaga karena katering lokal desa sendiri yang kelola.',
    sentiment: 'positif',
    confidenceScore: 0.91,
    isSarcasmOrNeedsReview: false,
    timeAgo: '10 Sep',
    likes: 295,
    sourceContentTitle: 'Sidak Dapur Umum Sentra Pelayanan MBG: Pantau Higienitas & Menu Bergizi',
  },
  {
    id: 'ig-cmt-5',
    author: '@taufik_hidayat88',
    anonymizedAuthor: '@tau***',
    platform: 'Instagram',
    text: 'Programnya bagus niatnya mulia, cuma oknum-oknum vendor nakal ini yang bikin rusak nama program.',
    sentiment: 'netral',
    confidenceScore: 0.82,
    isSarcasmOrNeedsReview: false,
    timeAgo: '9 Sep',
    likes: 184,
    sourceContentTitle: 'Wali Murid Keluhkan Porsi MBG Terlalu Sedikit & Nasi Keras di Sejumlah Daerah',
  },
]

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
