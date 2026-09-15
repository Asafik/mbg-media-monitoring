import { supabase } from '../lib/supabase'
import type { DetailedContentItem, CommentItem } from '../types/dashboard'

import { DEFAULT_YOUTUBE_API_KEY } from './apiKeyService'

export function getActiveYouTubeApiKey(): string {
  try {
    const fromStorage = localStorage.getItem('mbg_youtube_api_key')
    if (fromStorage && fromStorage.trim()) return fromStorage.trim()
  } catch {}
  return DEFAULT_YOUTUBE_API_KEY
}

export type YouTubeIssueTopic =
  | 'kritis'
  | 'keracunan'
  | 'distribusi'
  | 'anggaran'

function getSearchQueryForTopic(topic: YouTubeIssueTopic): string {
  const negativeFilters = '-lagu -lirik -musik -song -mainan -kartun'
  switch (topic) {
    case 'keracunan':
      return `Makan Bergizi Gratis keracunan OR basi OR muntah OR diare OR higienis ${negativeFilters}`
    case 'distribusi':
      return `Makan Bergizi Gratis keluhan OR "tidak tepat sasaran" OR porsi OR belatung OR komplain ${negativeFilters}`
    case 'anggaran':
      return `Makan Bergizi Gratis anggaran OR APBN OR kroni OR korupsi OR kritik DPR ${negativeFilters}`
    case 'kritis':
    default:
      return `Makan Bergizi Gratis keracunan OR basi OR "tidak tepat sasaran" OR masalah OR kritik ${negativeFilters}`
  }
}

function formatViews(numStr?: string) {
  const num = parseInt(numStr || '0', 10) || 0
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M views'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K views'
  return num + ' views'
}

function formatComments(numStr?: string) {
  const num = parseInt(numStr || '0', 10) || 0
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K komentar'
  return num + ' komentar'
}

function analyzeSentiment(title: string) {
  const lower = title.toLowerCase()
  const positiveWords = [
    'bagus',
    'mantap',
    'alhamdulillah',
    'senang',
    'berkah',
    'sehat',
    'terima kasih',
    'dukung',
    'gizi',
    'semangat',
    'hebat',
    'keren',
    'bermanfaat',
    'membantu',
    'lahap',
    'lezat',
    'enak',
    'bergizi',
    'sukses',
    'semoga',
  ]
  const negativeWords = [
    'korupsi',
    'korup',
    'maling',
    'beracun',
    'kroni',
    'basi',
    'keracunan',
    'buruk',
    'kritik',
    'kecewa',
    'penipuan',
    'bahaya',
    'protes',
    'rugi',
    'rusak',
    'jelek',
    'kurang',
    'gagal',
    'skandal',
    'muntah',
    'diare',
    'tragis',
    'gila',
    'dipertanyakan',
    'dipangkas',
    'tanggungjawab',
    'masalah',
    'bebal',
    'cuci tangan',
    'keras kepala',
    'nyawa',
    'delusi',
    'mubazir',
    'hentikan',
    'parah',
    'bohong',
  ]

  let pos = 0
  let neg = 0
  positiveWords.forEach((w) => {
    if (lower.includes(w)) pos++
  })
  negativeWords.forEach((w) => {
    if (lower.includes(w)) neg++
  })

  if (neg > pos) {
    const percent = Math.min(92, 60 + neg * 8)
    return {
      sentiment: 'negatif' as const,
      label: `Sentimen Komentar: Negatif ${percent}%`,
    }
  }
  if (pos > neg) {
    const percent = Math.min(94, 60 + pos * 8)
    return {
      sentiment: 'positif' as const,
      label: `Sentimen Komentar: Positif ${percent}%`,
    }
  }
  return {
    sentiment: 'netral' as const,
    label: 'Sentimen Komentar: Netral 56%',
  }
}

/**
 * Fetch 5 real targeted issue videos from YouTube Data API v3.
 * Targets issues: keracunan, basi, tidak tepat sasaran, anggaran, kritik.
 * Strictly NO comments fetched as requested.
 * Automatically saves to Supabase contents table.
 */
export async function fetchTop5YouTubeVideos(
  topic: YouTubeIssueTopic = 'kritis'
): Promise<DetailedContentItem[]> {
  const rawQuery = getSearchQueryForTopic(topic)
  const encodedQuery = encodeURIComponent(rawQuery)
  const apiKey = getActiveYouTubeApiKey()
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&type=video&regionCode=ID&relevanceLanguage=id&order=relevance&maxResults=5&key=${apiKey}`

  const searchRes = await fetch(searchUrl)
  const searchData = await searchRes.json()

  if (searchData.error) {
    throw new Error(`YouTube API Error: ${searchData.error.message}`)
  }

  const items = searchData.items || []
  const videoIds = items
    .map((i: { id?: { videoId?: string } }) => i.id?.videoId)
    .filter(Boolean)

  if (videoIds.length === 0) return []

  // Fetch full video statistics (viewCount, commentCount)
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`
  const detailsRes = await fetch(detailsUrl)
  const detailsData = await detailsRes.json()

  const videoList = detailsData.items || []

  const formattedContents: DetailedContentItem[] = videoList.map(
    (
      v: {
        id: string
        snippet: {
          title: string
          channelTitle: string
          publishedAt: string
          thumbnails?: {
            high?: { url: string }
            medium?: { url: string }
            default?: { url: string }
          }
        }
        statistics?: {
          viewCount?: string
          commentCount?: string
          likeCount?: string
        }
      },
      index: number
    ) => {
      const sentimentInfo = analyzeSentiment(v.snippet.title)
      const thumb =
        v.snippet.thumbnails?.high?.url ||
        v.snippet.thumbnails?.medium?.url ||
        v.snippet.thumbnails?.default?.url ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=240'

      const published = new Date(v.snippet.publishedAt).toLocaleDateString(
        'id-ID',
        { day: 'numeric', month: 'short' }
      )

      return {
        id: `yt-${v.id}`,
        platform: 'YouTube' as const,
        rank: index + 1,
        title: v.snippet.title,
        author: v.snippet.channelTitle,
        views: formatViews(v.statistics?.viewCount),
        numericViews: parseInt(v.statistics?.viewCount || '0', 10),
        comments: formatComments(v.statistics?.commentCount),
        numericComments: parseInt(v.statistics?.commentCount || '0', 10),
        shares: 'Terpantau',
        timeAgo: published,
        sentiment: sentimentInfo.sentiment,
        commentSentimentLabel: sentimentInfo.label,
        thumbnailUrl: thumb,
        url: `https://www.youtube.com/watch?v=${v.id}`,
      }
    }
  )

  // Upsert to Supabase
  try {
    for (const c of formattedContents) {
      await supabase.from('contents').upsert({
        id: c.id,
        platform: c.platform,
        rank: c.rank,
        title: c.title,
        author: c.author,
        views: c.views,
        numeric_views: c.numericViews,
        comments: c.comments,
        numeric_comments: c.numericComments,
        shares: c.shares,
        time_ago: c.timeAgo,
        sentiment: c.sentiment,
        comment_sentiment_label: c.commentSentimentLabel,
        thumbnail_url: c.thumbnailUrl,
        url: c.url,
      })
    }
  } catch {
    // Non-blocking
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mbg-youtube-updated', { detail: formattedContents })
    )
  }

  return formattedContents
}

/**
 * Fetch live comments from YouTube Data API v3 for tracked videos.
 * Analyzes sentiment and upserts to Supabase comments table.
 */
export async function fetchYouTubeComments(
  targetVideos?: { id: string; title: string }[]
): Promise<CommentItem[]> {
  let videos = targetVideos
  if (!videos || videos.length === 0) {
    videos = [
      {
        id: 'KzehmPJbQxU',
        title: 'FULL! MBG Watch Desak Program Makan Bergizi Gratis Dihentikan Sementara Buntut Kasus Keracunan',
      },
      {
        id: '9ebrZWyHXac',
        title: 'Prabowo Pede Program Makan Bergizi Gratis Sukses Meski Ada Siswa Keracunan: Keberhasilan 99,99%',
      },
      {
        id: '2gIobI9TvnA',
        title: 'MAKAN BERGIZI GRATIS | Dari Keracunan, Sampai Bagi-Bagi Proyek',
      },
      {
        id: 'a0HM_M1G_q0',
        title: 'Ibu Hamil di Cipongkor Diduga Keracunan Makan Bergizi Gratis #beritasatu',
      },
      {
        id: '6lTjTgXMbaw',
        title: 'Penelusuran Dapur Makan Bergizi Gratis | Prime Story',
      },
    ]
  }

  const allComments: CommentItem[] = []

  const apiKey = getActiveYouTubeApiKey()
  for (const video of videos) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${video.id}&maxResults=4&order=relevance&key=${apiKey}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          const snippet = item.snippet?.topLevelComment?.snippet
          if (!snippet) continue

          const rawText = (snippet.textDisplay || '')
            .replace(/<[^>]*>?/gm, '')
            .trim()
          if (!rawText) continue

          const author = snippet.authorDisplayName || '@warga_net'
          const anonymized =
            author.length > 5 ? `${author.substring(0, 4)}***` : `${author}***`

          const sentimentInfo = analyzeSentiment(rawText)
          const isNegative = sentimentInfo.sentiment === 'negatif'
          const hasSarcasm =
            /cuci tangan|hebat|mantap|untung/i.test(rawText) && isNegative

          const commentObj: CommentItem = {
            id: `yt-cmt-${item.id}`,
            author: author,
            anonymizedAuthor: anonymized,
            avatarUrl: snippet.authorProfileImageUrl,
            platform: 'YouTube',
            text: rawText,
            sentiment: sentimentInfo.sentiment,
            confidenceScore: hasSarcasm ? 0.65 : isNegative ? 0.88 : 0.82,
            isSarcasmOrNeedsReview: hasSarcasm,
            timeAgo: new Date(snippet.publishedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            }),
            likes: snippet.likeCount || 0,
            sourceContentTitle: video.title,
          }

          allComments.push(commentObj)
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch comments for video ${video.id}:`, e)
    }
  }

  return allComments
}

