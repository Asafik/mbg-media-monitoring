import pg from 'pg'

async function seedTikTokContents() {
  const client = new pg.Client({
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.iyruoqteedkyljqbneap',
    password: 'b4SgaAFICBQszTbm',
    ssl: { rejectUnauthorized: false },
  })

  console.log('Connecting to Supabase PostgreSQL...')
  await client.connect()

  const posts = [
    {
      id: 'tt-kompas-1',
      platform: 'TikTok',
      rank: 1,
      title: 'BGN Buka Suara Soal Pengawasan Menu dan Dapur Pelayanan MBG Seluruh Indonesia',
      author: '@kompascom',
      views: '1.4M views',
      numeric_views: 1400000,
      comments: '8.2K komentar',
      numeric_comments: 8200,
      shares: '5.6K share',
      time_ago: '14 Sep',
      sentiment: 'positif',
      comment_sentiment_label: 'Sentimen Komentar: Positif 78%',
      thumbnail_url: 'https://i.ytimg.com/vi/a0HM_M1G_q0/hqdefault.jpg',
      url: 'https://www.tiktok.com/@kompascom',
    },
    {
      id: 'tt-detik-2',
      platform: 'TikTok',
      rank: 2,
      title: 'Siswa & Guru di Sekolah Sambut Program Makan Bergizi Gratis: Menunya Bergizi & Disukai Anak',
      author: '@detikcom',
      views: '2.1M views',
      numeric_views: 2100000,
      comments: '14.5K komentar',
      numeric_comments: 14500,
      shares: '11.3K share',
      time_ago: '13 Sep',
      sentiment: 'positif',
      comment_sentiment_label: 'Sentimen Komentar: Positif 85%',
      thumbnail_url: 'https://i.ytimg.com/vi/9ebrZWyHXac/hqdefault.jpg',
      url: 'https://www.tiktok.com/@detikcom',
    },
    {
      id: 'tt-tribun-3',
      platform: 'TikTok',
      rank: 3,
      title: 'Klarifikasi Pihak SPPG Terkait Standar Ompreng Stainless & Pengawasan Higienitas Makanan MBG',
      author: '@tribunnews',
      views: '980K views',
      numeric_views: 980000,
      comments: '6.1K komentar',
      numeric_comments: 6100,
      shares: '4.5K share',
      time_ago: '12 Sep',
      sentiment: 'netral',
      comment_sentiment_label: 'Sentimen Komentar: Netral 62%',
      thumbnail_url: 'https://i.ytimg.com/vi/21g5WNyy1eY/hqdefault.jpg',
      url: 'https://www.tiktok.com/@tribunnews',
    },
    {
      id: 'tt-cnn-4',
      platform: 'TikTok',
      rank: 4,
      title: 'Sorotan Publik: Anggaran 71T Program Makan Bergizi Gratis & Evaluasi Distribusi Lapangan',
      author: '@cnnindonesia',
      views: '1.8M views',
      numeric_views: 1800000,
      comments: '19.2K komentar',
      numeric_comments: 19200,
      shares: '12.8K share',
      time_ago: '11 Sep',
      sentiment: 'negatif',
      comment_sentiment_label: 'Sentimen Komentar: Kritis 82%',
      thumbnail_url: 'https://i.ytimg.com/vi/2gIobI9TvnA/hqdefault.jpg',
      url: 'https://www.tiktok.com/@cnnindonesia',
    },
    {
      id: 'tt-narasi-5',
      platform: 'TikTok',
      rank: 5,
      title: 'Catatan Kritis Program MBG: Menjamin Gizi Anak Tanpa Korupsi Pengadaan Dapur',
      author: '@narasi_tv',
      views: '1.1M views',
      numeric_views: 1100000,
      comments: '9.4K komentar',
      numeric_comments: 9400,
      shares: '8.1K share',
      time_ago: '10 Sep',
      sentiment: 'negatif',
      comment_sentiment_label: 'Sentimen Komentar: Investigasi 86%',
      thumbnail_url: 'https://i.ytimg.com/vi/6lTjTgXMbaw/hqdefault.jpg',
      url: 'https://www.tiktok.com/@narasi_tv',
    },
  ]

  for (const p of posts) {
    await client.query(
      `
      INSERT INTO public.contents (
        id, platform, rank, title, author, views, numeric_views, comments, numeric_comments, shares, time_ago, sentiment, comment_sentiment_label, thumbnail_url, url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        author = EXCLUDED.author,
        views = EXCLUDED.views,
        numeric_views = EXCLUDED.numeric_views,
        comments = EXCLUDED.comments,
        numeric_comments = EXCLUDED.numeric_comments,
        shares = EXCLUDED.shares,
        time_ago = EXCLUDED.time_ago,
        sentiment = EXCLUDED.sentiment,
        comment_sentiment_label = EXCLUDED.comment_sentiment_label,
        thumbnail_url = EXCLUDED.thumbnail_url,
        url = EXCLUDED.url;
    `,
      [
        p.id,
        p.platform,
        p.rank,
        p.title,
        p.author,
        p.views,
        p.numeric_views,
        p.comments,
        p.numeric_comments,
        p.shares,
        p.time_ago,
        p.sentiment,
        p.comment_sentiment_label,
        p.thumbnail_url,
        p.url,
      ]
    )
  }

  const countRes = await client.query('SELECT platform, count(*) FROM public.contents GROUP BY platform;')
  console.log('Contents by platform in Supabase DB:')
  console.table(countRes.rows)

  await client.end()
}

seedTikTokContents().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
