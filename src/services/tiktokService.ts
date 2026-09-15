import type { CommentItem, DetailedContentItem } from '../types/dashboard'

export const sampleTikTokPosts: DetailedContentItem[] = [
  {
    id: 'tt-mbg-1',
    platform: 'TikTok',
    rank: 1,
    title: 'Review Jujur Menu MBG Hari Ini: Ada Ayam Suwir, Tumis Buncis & Buah Semangka Segar',
    author: '@kuliner.sekolah_id',
    views: '1.8M tayangan',
    numericViews: 1800000,
    comments: '12.4K komentar',
    numericComments: 12400,
    shares: '8.7K share',
    timeAgo: '14 Sep',
    sentiment: 'positif',
    commentSentimentLabel: 'Sentimen Komentar: Positif 84%',
    thumbnailUrl: 'https://i.ytimg.com/vi/oNZA9jTMQvI/hqdefault.jpg',
    url: 'https://www.tiktok.com/@kuliner.sekolah_id',
  },
  {
    id: 'tt-mbg-2',
    platform: 'TikTok',
    rank: 2,
    title: 'Viral Siswa Mengeluh Nasi Keras dan Sayur Basi di Salah Satu Sekolah, Pihak Katering Langsung Klarifikasi',
    author: '@suara.pelajar_official',
    views: '2.4M tayangan',
    numericViews: 2400000,
    comments: '18.9K komentar',
    numericComments: 18900,
    shares: '14.2K share',
    timeAgo: '13 Sep',
    sentiment: 'negatif',
    commentSentimentLabel: 'Sentimen Komentar: Kritis 81%',
    thumbnailUrl: 'https://i.ytimg.com/vi/rh2aQ4UlPWc/hqdefault.jpg',
    url: 'https://www.tiktok.com/@suara.pelajar_official',
  },
  {
    id: 'tt-mbg-3',
    platform: 'TikTok',
    rank: 3,
    title: 'Unboxing Tempat Makan Stainless (Ompreng) Dapur SPPG Standar MBG, Higienis & Tertutup Rapat',
    author: '@dapur.gizi.nusantara',
    views: '940K tayangan',
    numericViews: 940000,
    comments: '6.8K komentar',
    numericComments: 6800,
    shares: '5.1K share',
    timeAgo: '13 Sep',
    sentiment: 'positif',
    commentSentimentLabel: 'Sentimen Komentar: Positif 89%',
    thumbnailUrl: 'https://i.ytimg.com/vi/hnVgW1nMJWY/hqdefault.jpg',
    url: 'https://www.tiktok.com/@dapur.gizi.nusantara',
  },
  {
    id: 'tt-mbg-4',
    platform: 'TikTok',
    rank: 4,
    title: 'Perdebatan Netizen: Evaluasi Higienitas & Pengawasan Menu MBG Agar Kualitas Terjaga',
    author: '@opini.publik_id',
    views: '760K tayangan',
    numericViews: 760000,
    comments: '9.3K komentar',
    numericComments: 9300,
    shares: '3.8K share',
    timeAgo: '12 Sep',
    sentiment: 'netral',
    commentSentimentLabel: 'Sentimen Komentar: Pro-Kontra 55%',
    thumbnailUrl: 'https://i.ytimg.com/vi/jCno2fVj_CA/hqdefault.jpg',
    url: 'https://www.tiktok.com/@opini.publik_id',
  },
  {
    id: 'tt-mbg-5',
    platform: 'TikTok',
    rank: 5,
    title: 'Bocil SD Semangat Habiskan Makan Siang MBG Sampai Bersih: Enak Banget Bu Gurunya Ramah',
    author: '@guru.penggerak_desa',
    views: '3.1M tayangan',
    numericViews: 3100000,
    comments: '24.5K komentar',
    numericComments: 24500,
    shares: '22.1K share',
    timeAgo: '11 Sep',
    sentiment: 'positif',
    commentSentimentLabel: 'Sentimen Komentar: Positif 93%',
    thumbnailUrl: 'https://i.ytimg.com/vi/cMae0UkPiAw/hqdefault.jpg',
    url: 'https://www.tiktok.com/@guru.penggerak_desa',
  },
]

export const sampleTikTokComments: CommentItem[] = [
  {
    id: 'tt-c-1',
    author: '@ibu_rumahtangga_33',
    anonymizedAuthor: 'Ibu Siswa SD',
    platform: 'TikTok',
    text: 'Alhamdulillah anakku di sekolah dapat menu lengkap, ada buah sama susunya juga. Sangat membantu pengeluaran kami.',
    sentiment: 'positif',
    confidenceScore: 0.94,
    isSarcasmOrNeedsReview: false,
    timeAgo: '14 Sep',
    likes: 3420,
    sourceContentTitle: 'Review Jujur Menu MBG Hari Ini: Ada Ayam Suwir, Tumis Buncis & Buah Semangka Segar',
  },
  {
    id: 'tt-c-2',
    author: '@warga_kritis_62',
    anonymizedAuthor: 'Netizen TikTok',
    platform: 'TikTok',
    text: 'Tolong pengawasannya diperketat jangan sampai ada vendor nakal yang ngurangin porsi atau kirim sayur basi.',
    sentiment: 'negatif',
    confidenceScore: 0.88,
    isSarcasmOrNeedsReview: false,
    timeAgo: '13 Sep',
    likes: 1890,
    sourceContentTitle: 'Viral Siswa Mengeluh Nasi Keras dan Sayur Basi di Salah Satu Sekolah, Pihak Katering Langsung Klarifikasi',
  },
  {
    id: 'tt-c-3',
    author: '@pejuang_gizi_muda',
    anonymizedAuthor: 'Relawan Gizi',
    platform: 'TikTok',
    text: 'Ompreng stainless lebih aman daripada kemasan plastik sekali pakai. Ramah lingkungan dan tidak bau.',
    sentiment: 'positif',
    confidenceScore: 0.91,
    isSarcasmOrNeedsReview: false,
    timeAgo: '13 Sep',
    likes: 920,
    sourceContentTitle: 'Unboxing Tempat Makan Stainless (Ompreng) Dapur SPPG Standar MBG, Higienis & Tertutup Rapat',
  },
]

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
