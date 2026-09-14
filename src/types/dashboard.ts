export type SentimentType = 'positif' | 'negatif' | 'netral'

export interface KpiItem {
  id: string
  title: string
  value: string
  change: string
  isPositiveChange: boolean
  subtitle: string
  type: 'content' | 'comment' | 'sentiment-positive' | 'sentiment-negative' | 'sentiment-neutral'
}

export interface SentimentTrendPoint {
  date: string
  positif: number
  negatif: number
  netral: number
}

export interface SentimentDistribution {
  name: string
  percentage: number
  count: number
  color: string
}

export interface PlatformCount {
  platform: 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook'
  count: number
  color: string
}

export interface PlatformContentItem {
  id: string
  rank: number
  title: string
  views: string
  comments: string
  timeAgo: string
  thumbnailUrl: string
  url?: string
  badgeText?: string
}

export interface DetailedContentItem {
  id: string
  platform: 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook'
  title: string
  author: string
  views: string
  comments: string
  shares: string
  timeAgo: string
  sentiment: SentimentType
  commentSentimentLabel?: string
  rank?: number
  numericViews?: number
  numericComments?: number
  thumbnailUrl: string
  url: string
}

export interface CommentItem {
  id: string
  author: string
  anonymizedAuthor?: string
  avatarUrl?: string
  platform: 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook'
  text: string
  sentiment: SentimentType
  confidenceScore: number
  isSarcasmOrNeedsReview?: boolean
  timeAgo: string
  likes: number
  sourceContentTitle: string
}

export interface TopicExtendedItem {
  id: string
  name: string
  category: 'sistem' | 'otomatis'
  mentionCount: string
  growthPercentage: string
  isTrendingUp: boolean
  positiveRatio: number
  negativeRatio: number
  neutralRatio: number
  keySampleQuotes: string[]
  relatedContents: Array<{
    id: string
    title: string
    platform: string
    views: string
  }>
}

export interface MonitoredSourceItem {
  id: string
  handle: string
  name: string
  platform: 'Instagram' | 'TikTok' | 'Facebook' | 'YouTube'
  category: string
  isActive: boolean
  isDefault: boolean
  postsCount: number
  lastChecked: string
  profileUrl: string
}

export interface TopicItem {
  rank: number
  name: string
  count: number
  formattedCount: string
  color: string
  sentimentCategory?: SentimentType
  trendPercentage?: string
  isTrendingUp?: boolean
}

export interface KeywordItem {
  text: string
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color: string
  weight: 'font-normal' | 'font-medium' | 'font-semibold' | 'font-bold'
  category?: SentimentType
  mentionsCount?: number
}

export interface ReportItem {
  id: string
  title: string
  period: string
  dateGenerated: string
  summary: string
  keyFindings: string[]
  fileSize: string
  type: 'Harian' | 'Mingguan' | 'Khusus'
}

export interface DashboardData {
  lastUpdated: string
  period: string
  kpiList: KpiItem[]
  sentimentTrends: SentimentTrendPoint[]
  sentimentDistributions: SentimentDistribution[]
  totalCommentsCount: string
  platformCounts: PlatformCount[]
  contentsByPlatform: {
    youtube: PlatformContentItem[]
    tiktok: PlatformContentItem[]
    instagram: PlatformContentItem[]
    facebook: PlatformContentItem[]
  }
  topics: TopicItem[]
  keywords: KeywordItem[]
}
