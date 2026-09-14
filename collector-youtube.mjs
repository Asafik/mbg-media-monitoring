import pg from 'pg'

const YOUTUBE_API_KEY = 'AIzaSyA0XLpI6IGMC00cJ68SXpfNkczzuXrTDko'

const DB_CONFIG = {
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.iyruoqteedkyljqbneap',
  password: 'b4SgaAFICBQszTbm',
  ssl: { rejectUnauthorized: false },
}

function formatViews(numStr) {
  const num = parseInt(numStr, 10) || 0
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M views'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K views'
  return num + ' views'
}

function formatComments(numStr) {
  const num = parseInt(numStr, 10) || 0
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K komentar'
  return num + ' komentar'
}

function analyzeSentiment(text) {
  const lower = text.toLowerCase()
  const positiveWords = ['bagus', 'mantap', 'alhamdulillah', 'senang', 'berkah', 'sehat', 'terima kasih', 'semoga sukses', 'dukung', 'gizi', 'semangat', 'hebat', 'keren', 'bermanfaat', 'membantu', 'lahap', 'lezat', 'enak', 'bergizi', 'sukses', 'solusi']
  const negativeWords = ['korupsi', 'kroni', 'basi', 'keracunan', 'buruk', 'kritik', 'kecewa', 'penipuan', 'bahaya', 'protes', 'rugi', 'rusak', 'jelek', 'kurang', 'gagal', 'skandal', 'muntah', 'masuk rumah sakit', 'mual', 'kecewa', 'kejanggalan']

  let pos = 0
  let neg = 0

  positiveWords.forEach(w => { if (lower.includes(w)) pos++ })
  negativeWords.forEach(w => { if (lower.includes(w)) neg++ })

  // Check sarcasm
  const isSarcasm = (lower.includes('mantap') || lower.includes('hebat')) && (lower.includes('rumah sakit') || lower.includes('keracunan') || lower.includes('basi'))

  if (isSarcasm) {
    return {
      sentiment: 'negatif',
      label: 'Sentimen Komentar: Negatif 76%',
      confidence: 0.62,
      isSarcasm: true,
    }
  }

  if (neg > pos) {
    const percent = Math.min(88, 56 + neg * 10)
    return {
      sentiment: 'negatif',
      label: `Sentimen Komentar: Negatif ${percent}%`,
      confidence: 0.88,
      isSarcasm: false,
    }
  }

  if (pos > neg) {
    const percent = Math.min(94, 60 + pos * 9)
    return {
      sentiment: 'positif',
      label: `Sentimen Komentar: Positif ${percent}%`,
      confidence: 0.92,
      isSarcasm: false,
    }
  }

  return {
    sentiment: 'netral',
    label: 'Sentimen Komentar: Netral 58%',
    confidence: 0.78,
    isSarcasm: false,
  }
}

async function collectYouTube() {
  console.log('=== START YOUTUBE COLLECTOR MBG ===')

  // 1. Search top 5 videos on YouTube
  const query = encodeURIComponent('Makan Bergizi Gratis MBG')
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&regionCode=ID&relevanceLanguage=id&order=relevance&maxResults=5&key=${YOUTUBE_API_KEY}`

  const searchRes = await fetch(searchUrl)
  const searchData = await searchRes.json()

  if (searchData.error) {
    throw new Error(`YouTube API Error: ${searchData.error.message}`)
  }

  const videoIds = searchData.items.map(i => i.id.videoId).filter(Boolean)
  console.log(`Found ${videoIds.length} video IDs:`, videoIds)

  // 2. Fetch full statistics for each video
  const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
  const detailsRes = await fetch(videoDetailsUrl)
  const detailsData = await detailsRes.json()

  const dbClient = new pg.Client(DB_CONFIG)
  await dbClient.connect()
  console.log('Connected to Supabase PostgreSQL.')

  let rank = 1
  for (const video of detailsData.items) {
    const snippet = video.snippet
    const stats = video.statistics
    const videoId = video.id
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const thumbUrl = snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url

    // Determine initial sentiment from video title
    const videoSentiment = analyzeSentiment(snippet.title)

    console.log(`\n[Rank #${rank}] ${snippet.title}`)
    console.log(`Channel: ${snippet.channelTitle} | Views: ${stats.viewCount || 0} | Comments: ${stats.commentCount || 0}`)

    // Insert or update into public.contents
    await dbClient.query(`
      INSERT INTO public.contents (
        id, platform, rank, title, author, views, numeric_views, comments, numeric_comments, shares, time_ago, sentiment, comment_sentiment_label, thumbnail_url, url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        views = EXCLUDED.views,
        numeric_views = EXCLUDED.numeric_views,
        comments = EXCLUDED.comments,
        numeric_comments = EXCLUDED.numeric_comments,
        sentiment = EXCLUDED.sentiment,
        comment_sentiment_label = EXCLUDED.comment_sentiment_label,
        thumbnail_url = EXCLUDED.thumbnail_url;
    `, [
      `yt-${videoId}`,
      'YouTube',
      rank,
      snippet.title,
      snippet.channelTitle,
      formatViews(stats.viewCount),
      parseInt(stats.viewCount, 10) || 0,
      formatComments(stats.commentCount),
      parseInt(stats.commentCount, 10) || 0,
      'Share Terpantau',
      new Date(snippet.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      videoSentiment.sentiment,
      videoSentiment.label,
      thumbUrl,
      videoUrl,
    ])

    // 3. Fetch real comments for this video
    try {
      const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=5&order=relevance&key=${YOUTUBE_API_KEY}`
      const commentRes = await fetch(commentsUrl)
      const commentData = await commentRes.json()

      if (commentData.items && commentData.items.length > 0) {
        console.log(`  -> Fetched ${commentData.items.length} real comments for this video`)
        for (const item of commentData.items) {
          const topComment = item.snippet.topLevelComment.snippet
          const rawText = topComment.textOriginal || topComment.textDisplay
          const authorName = topComment.authorDisplayName || 'Netizen YouTube'
          const authorAnonymized = '@' + authorName.slice(0, 2).toLowerCase() + '***' + Math.floor(10 + Math.random() * 89)
          const commentSentiment = analyzeSentiment(rawText)

          await dbClient.query(`
            INSERT INTO public.comments (
              id, author, anonymized_author, platform, text, sentiment, confidence_score, is_sarcasm_or_needs_review, time_ago, likes, source_content_title
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
              text = EXCLUDED.text,
              sentiment = EXCLUDED.sentiment,
              confidence_score = EXCLUDED.confidence_score,
              likes = EXCLUDED.likes;
          `, [
            `yt-cm-${item.id}`,
            'Pengguna YouTube',
            authorAnonymized,
            'YouTube',
            rawText.trim(),
            commentSentiment.sentiment,
            commentSentiment.confidence,
            commentSentiment.isSarcasm || false,
            new Date(topComment.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            topComment.likeCount || 0,
            snippet.title.slice(0, 60) + '...',
          ])
        }
      }
    } catch (e) {
      console.log(`  -> Comments disabled or error on video ${videoId}:`, e.message)
    }

    rank++
  }

  const finalCounts = await dbClient.query(`
    SELECT
      (SELECT count(*) FROM public.contents WHERE platform = 'YouTube') as yt_contents,
      (SELECT count(*) FROM public.comments WHERE platform = 'YouTube') as yt_comments;
  `)

  console.log('\n=== SEED SUKSES KE SUPABASE! ===')
  console.log('Real YouTube Contents in Supabase:', finalCounts.rows[0].yt_contents)
  console.log('Real YouTube Comments in Supabase:', finalCounts.rows[0].yt_comments)

  await dbClient.end()
}

collectYouTube().catch(console.error)
