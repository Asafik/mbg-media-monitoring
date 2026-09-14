import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.iyruoqteedkyljqbneap',
  password: 'b4SgaAFICBQszTbm',
  ssl: { rejectUnauthorized: false }
});

const instagramPosts = [
  {
    id: 'ig-kompas-1',
    platform: 'Instagram',
    rank: 1,
    title: 'Dinkes Selidiki Dugaan Keracunan Massal MBG di Tiga Sekolah Dasar',
    author: '@kompascom',
    views: '84.5K likes',
    numeric_views: 84500,
    comments: '2.4K komentar',
    numeric_comments: 2400,
    shares: '3.1K share',
    time_ago: '13 Sep',
    sentiment: 'negatif',
    comment_sentiment_label: 'Sentimen Komentar: Negatif 82%',
    thumbnail_url: 'https://i.ytimg.com/vi/_OnKkVwvBgg/hqdefault.jpg',
    url: 'https://www.instagram.com/kompascom/',
  },
  {
    id: 'ig-tribun-2',
    platform: 'Instagram',
    rank: 2,
    title: 'BGN Buka Suara Terkait Siswa Mual & Muntah Usai Konsumsi Makanan MBG',
    author: '@tribunnews',
    views: '62.1K likes',
    numeric_views: 62100,
    comments: '1.9K komentar',
    numeric_comments: 1900,
    shares: '2.5K share',
    time_ago: '12 Sep',
    sentiment: 'negatif',
    comment_sentiment_label: 'Sentimen Komentar: Kritis 76%',
    thumbnail_url: 'https://i.ytimg.com/vi/yujUVcBp7S0/hqdefault.jpg',
    url: 'https://www.instagram.com/tribunnews/',
  },
  {
    id: 'ig-narasi-3',
    platform: 'Instagram',
    rank: 3,
    title: 'Catatan Kritis: Transparansi Anggaran 71T & Standar Dapur Pelayanan MBG',
    author: '@narasinewsroom',
    views: '95.4K likes',
    numeric_views: 95400,
    comments: '3.8K komentar',
    numeric_comments: 3800,
    shares: '5.2K share',
    time_ago: '11 Sep',
    sentiment: 'negatif',
    comment_sentiment_label: 'Sentimen Komentar: Investigasi Negatif 88%',
    thumbnail_url: 'https://i.ytimg.com/vi/pFVOQMnTZdc/hqdefault.jpg',
    url: 'https://www.instagram.com/narasinewsroom/',
  },
  {
    id: 'ig-kumparan-4',
    platform: 'Instagram',
    rank: 4,
    title: 'Wali Murid Keluhkan Porsi MBG Terlalu Sedikit & Nasi Keras di Sejumlah Daerah',
    author: '@kumparancom',
    views: '48.2K likes',
    numeric_views: 48200,
    comments: '1.2K komentar',
    numeric_comments: 1200,
    shares: '1.8K share',
    time_ago: '10 Sep',
    sentiment: 'negatif',
    comment_sentiment_label: 'Sentimen Komentar: Keluhan 74%',
    thumbnail_url: 'https://i.ytimg.com/vi/21g5WNyy1eY/hqdefault.jpg',
    url: 'https://www.instagram.com/kumparancom/',
  },
  {
    id: 'ig-fokus-5',
    platform: 'Instagram',
    rank: 5,
    title: 'Sidak Dapur Umum Sentra Pelayanan MBG: Pantau Higienitas & Menu Bergizi',
    author: '@fokus_edukasi',
    views: '35.6K likes',
    numeric_views: 35600,
    comments: '750 komentar',
    numeric_comments: 750,
    shares: '920 share',
    time_ago: '9 Sep',
    sentiment: 'positif',
    comment_sentiment_label: 'Sentimen Komentar: Positif 68%',
    thumbnail_url: 'https://i.ytimg.com/vi/6lTjTgXMbaw/hqdefault.jpg',
    url: 'https://www.instagram.com/explore/tags/makanbergizigratis/',
  },
];

const instagramComments = [
  {
    id: 'ig-cmt-1',
    author: '@bunda_faiha',
    anonymized_author: '@bun***',
    platform: 'Instagram',
    text: 'Tolong diperketat seleksi kateringnya! Anak saya kemarin muntah-muntah sepulang sekolah gara-gara tumis buncisnya bau asam.',
    sentiment: 'negatif',
    confidence_score: 0.94,
    is_sarcasm_or_needs_review: false,
    time_ago: '13 Sep',
    likes: 852,
    source_content_title: 'Dinkes Selidiki Dugaan Keracunan Massal MBG di Tiga Sekolah Dasar',
  },
  {
    id: 'ig-cmt-2',
    author: '@dimas.wicaksono',
    anonymized_author: '@dim***',
    platform: 'Instagram',
    text: 'Bagus kalau dinkes dan BPOM turun tangan langsung. Jangan nunggu korban makin banyak baru evaluasi.',
    sentiment: 'negatif',
    confidence_score: 0.88,
    is_sarcasm_or_needs_review: false,
    time_ago: '12 Sep',
    likes: 412,
    source_content_title: 'BGN Buka Suara Terkait Siswa Mual & Muntah Usai Konsumsi Makanan MBG',
  },
  {
    id: 'ig-cmt-3',
    author: '@rina_kartika_s',
    anonymized_author: '@rin***',
    platform: 'Instagram',
    text: 'Hebat ya anggarannya puluhan triliun tapi lauknya telur puyuh sebiji sama semangka layu.',
    sentiment: 'negatif',
    confidence_score: 0.62, // Sarkasme
    is_sarcasm_or_needs_review: true,
    time_ago: '11 Sep',
    likes: 674,
    source_content_title: 'Catatan Kritis: Transparansi Anggaran 71T & Standar Dapur Pelayanan MBG',
  },
  {
    id: 'ig-cmt-4',
    author: '@guru_sd_nusantara',
    anonymized_author: '@gur***',
    platform: 'Instagram',
    text: 'Di sekolah kami alhamdulillah kualitas makanannya terjaga karena katering lokal desa sendiri yang kelola.',
    sentiment: 'positif',
    confidence_score: 0.91,
    is_sarcasm_or_needs_review: false,
    time_ago: '10 Sep',
    likes: 295,
    source_content_title: 'Sidak Dapur Umum Sentra Pelayanan MBG: Pantau Higienitas & Menu Bergizi',
  },
  {
    id: 'ig-cmt-5',
    author: '@taufik_hidayat88',
    anonymized_author: '@tau***',
    platform: 'Instagram',
    text: 'Programnya bagus niatnya mulia, cuma oknum-oknum vendor nakal ini yang bikin rusak nama program.',
    sentiment: 'netral',
    confidence_score: 0.82,
    is_sarcasm_or_needs_review: false,
    time_ago: '9 Sep',
    likes: 184,
    source_content_title: 'Wali Murid Keluhkan Porsi MBG Terlalu Sedikit & Nasi Keras di Sejumlah Daerah',
  },
];

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL.');

  // Clear previous instagram contents if any
  await client.query("DELETE FROM contents WHERE platform = 'Instagram'");
  await client.query("DELETE FROM comments WHERE platform = 'Instagram'");

  // Insert Instagram Posts
  for (const p of instagramPosts) {
    await client.query(`
      INSERT INTO contents (
        id, platform, rank, title, author, views, numeric_views,
        comments, numeric_comments, shares, time_ago, sentiment,
        comment_sentiment_label, thumbnail_url, url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      p.id, p.platform, p.rank, p.title, p.author, p.views, p.numeric_views,
      p.comments, p.numeric_comments, p.shares, p.time_ago, p.sentiment,
      p.comment_sentiment_label, p.thumbnail_url, p.url
    ]);
    console.log(`Saved Instagram post #${p.rank}: ${p.title}`);
  }

  // Insert Instagram Comments
  for (const c of instagramComments) {
    await client.query(`
      INSERT INTO comments (
        id, author, anonymized_author, platform, text, sentiment,
        confidence_score, is_sarcasm_or_needs_review, time_ago, likes, source_content_title
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      c.id, c.author, c.anonymized_author, c.platform, c.text, c.sentiment,
      c.confidence_score, c.is_sarcasm_or_needs_review, c.time_ago, c.likes, c.source_content_title
    ]);
    console.log(`Saved Instagram comment: ${c.author}`);
  }

  console.log('Instagram sync completed successfully!');
  await client.end();
}

main().catch(console.error);
