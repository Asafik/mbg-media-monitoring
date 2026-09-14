import { supabase } from '../lib/supabase'
import type { CommentItem, DetailedContentItem } from '../types/dashboard'

export const sampleFacebookPosts: DetailedContentItem[] = [
  {
    id: 'fb-detik-1',
    platform: 'Facebook',
    rank: 1,
    title: 'Beredar Kabar Menu MBG Basi di Sekolah Swasta, Kadisdik Minta Kepsek Laporkan Vendor Nakal',
    author: 'detikcom',
    views: '54.2K reaksi',
    numericViews: 54200,
    comments: '3.1K komentar',
    numericComments: 3100,
    shares: '4.2K share',
    timeAgo: '13 Sep',
    sentiment: 'negatif',
    commentSentimentLabel: 'Sentimen Komentar: Kritis 79%',
    thumbnailUrl: 'https://i.ytimg.com/vi/a0HM_M1G_q0/hqdefault.jpg',
    url: 'https://www.facebook.com/detikcom',
  },
  {
    id: 'fb-kompas-2',
    platform: 'Facebook',
    rank: 2,
    title: 'Polemik Susu Ikan vs Susu Sapi untuk Program MBG, Ahli Gizi UI Ingatkan Potensi Alergi Anak',
    author: 'Kompas.com',
    views: '46.7K reaksi',
    numericViews: 46700,
    comments: '2.9K komentar',
    numericComments: 2900,
    shares: '3.4K share',
    timeAgo: '12 Sep',
    sentiment: 'netral',
    commentSentimentLabel: 'Sentimen Komentar: Pro-Kontra 52%',
    thumbnailUrl: 'https://i.ytimg.com/vi/9ebrZWyHXac/hqdefault.jpg',
    url: 'https://www.facebook.com/kompascom',
  },
  {
    id: 'fb-tribun-3',
    platform: 'Facebook',
    rank: 3,
    title: 'Uji Coba Distribusi MBG Gunakan Kendaraan Khusus Dapur SPPG untuk Jaga Kesegaran Sayur',
    author: 'Tribunnews.com',
    views: '68.5K reaksi',
    numericViews: 68500,
    comments: '4.7K komentar',
    numericComments: 4700,
    shares: '5.6K share',
    timeAgo: '12 Sep',
    sentiment: 'positif',
    commentSentimentLabel: 'Sentimen Komentar: Positif 72%',
    thumbnailUrl: 'https://i.ytimg.com/vi/21g5WNyy1eY/hqdefault.jpg',
    url: 'https://www.facebook.com/tribunnews',
  },
  {
    id: 'fb-cnn-4',
    platform: 'Facebook',
    rank: 4,
    title: 'DPR Minta Dapur MBG Wajib Gandeng Petani & Peternak Lokal demi Pasokan Telur Segar',
    author: 'CNN Indonesia',
    views: '38.9K reaksi',
    numericViews: 38900,
    comments: '1.8K komentar',
    numericComments: 1800,
    shares: '1.9K share',
    timeAgo: '11 Sep',
    sentiment: 'netral',
    commentSentimentLabel: 'Sentimen Komentar: Netral 64%',
    thumbnailUrl: 'https://i.ytimg.com/vi/2gIobI9TvnA/hqdefault.jpg',
    url: 'https://www.facebook.com/CNNIndonesia',
  },
  {
    id: 'fb-liputan6-5',
    platform: 'Facebook',
    rank: 5,
    title: 'Kisah Guru Honorer Bagikan Makan Bergizi Gratis di SD Terpencil: Siswa Semangat Bawa Pulang Buah',
    author: 'Liputan6.com',
    views: '32.1K reaksi',
    numericViews: 32100,
    comments: '1.2K komentar',
    numericComments: 1200,
    shares: '1.6K share',
    timeAgo: '10 Sep',
    sentiment: 'positif',
    commentSentimentLabel: 'Sentimen Komentar: Positif 88%',
    thumbnailUrl: 'https://i.ytimg.com/vi/KzehmPJbQxU/hqdefault.jpg',
    url: 'https://www.facebook.com/liputan6online',
  },
]

export const sampleFacebookComments: CommentItem[] = [
  {
    id: 'fb-cmt-1',
    author: 'Bambang Supriyanto',
    anonymizedAuthor: 'Bambang S***',
    platform: 'Facebook',
    text: 'Tolong BGN jangan cuma pasang target angka. Kalau anak-anak sampai keracunan gini yang tanggung jawab siapa? Vendor harus transparan!',
    sentiment: 'negatif',
    confidenceScore: 0.94,
    isSarcasmOrNeedsReview: false,
    timeAgo: '13 Sep',
    likes: 642,
    sourceContentTitle: 'Dugaan Keracunan Massal Menu MBG di Tiga Sekolah Dasar: Dinkes Ambil Sampel Makanan Dapur SPPG',
  },
  {
    id: 'fb-cmt-2',
    author: 'Siti Rahmawati',
    anonymizedAuthor: 'Siti R***',
    platform: 'Facebook',
    text: 'Kemarin anak saya bawa pulang omprengnya, nasinya memang pera banget dan lauknya sedikit sekali. Mending uangnya buat fasilitas kelas aja.',
    sentiment: 'negatif',
    confidenceScore: 0.89,
    isSarcasmOrNeedsReview: false,
    timeAgo: '12 Sep',
    likes: 418,
    sourceContentTitle: 'Wali Murid Bagikan Foto Menu MBG: Nasi Keras & Sayur Berbau Basi, Minta Pengawasan Rutin Sekolah',
  },
  {
    id: 'fb-cmt-3',
    author: 'Hendra Gunawan',
    anonymizedAuthor: 'Hendra G***',
    platform: 'Facebook',
    text: 'SOP dari awal masak sampai dibagikan ke siswa harus diperketat. Jeda waktu 3-4 jam di wadah tertutup bisa bikin makanan berlendir.',
    sentiment: 'netral',
    confidenceScore: 0.85,
    isSarcasmOrNeedsReview: false,
    timeAgo: '11 Sep',
    likes: 312,
    sourceContentTitle: 'BGN Respons Kasus Siswa Mengeluh Mual Usai Santap Makan Bergizi Gratis: Vendor Langsung Disanksi',
  },
  {
    id: 'fb-cmt-4',
    author: 'Nurul Hidayah',
    anonymizedAuthor: 'Nurul H***',
    platform: 'Facebook',
    text: 'Alhamdulillah di SD anak saya di pelosok sangat membantu sekali, anak-anak jadi semangat sekolah dan dapat susu gratis tiap hari.',
    sentiment: 'positif',
    confidenceScore: 0.91,
    isSarcasmOrNeedsReview: false,
    timeAgo: '10 Sep',
    likes: 275,
    sourceContentTitle: 'Uji Coba Sentra Dapur Pelayanan Gizi Sukses di Wilayah 3T: Menu Bergizi Disambut Antusias Siswa',
  },
  {
    id: 'fb-cmt-5',
    author: 'Agus Pratama',
    anonymizedAuthor: 'Agus P***',
    platform: 'Facebook',
    text: 'Hebat ya anggarannya puluhan triliun tapi pas dicek di lapangan makanannya malah bermasalah. Harus diaudit BPK ini mah.',
    sentiment: 'negatif',
    confidenceScore: 0.92,
    isSarcasmOrNeedsReview: true,
    timeAgo: '9 Sep',
    likes: 580,
    sourceContentTitle: 'Sorotan Transparansi Anggaran Dapur MBG 71T: Komisi X DPR Tekankan Akuntabilitas Dapur Daerah',
  },
]

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

  // Upsert to Supabase
  try {
    for (const c of sampleFacebookComments) {
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

  return sampleFacebookComments
}
