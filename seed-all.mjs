import pg from 'pg'
import { allDetailedContents, mockCommentsList, mockTopicsExtendedList } from './src/data/extendedMockData.ts'

async function seedAll() {
  const client = new pg.Client({
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.iyruoqteedkyljqbneap',
    password: 'b4SgaAFICBQszTbm',
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  console.log('Connected to Supabase. Seeding full dataset...')

  // 1. Contents
  for (const c of allDetailedContents) {
    await client.query(`
      INSERT INTO public.contents (id, platform, rank, title, author, views, numeric_views, comments, numeric_comments, shares, time_ago, sentiment, comment_sentiment_label, thumbnail_url, url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        views = EXCLUDED.views,
        numeric_views = EXCLUDED.numeric_views,
        comments = EXCLUDED.comments,
        numeric_comments = EXCLUDED.numeric_comments,
        sentiment = EXCLUDED.sentiment,
        comment_sentiment_label = EXCLUDED.comment_sentiment_label;
    `, [
      c.id,
      c.platform,
      c.rank || 1,
      c.title,
      c.author,
      c.views,
      c.numericViews || 0,
      c.comments,
      c.numericComments || 0,
      c.shares,
      c.timeAgo,
      c.sentiment,
      c.commentSentimentLabel || null,
      c.thumbnailUrl,
      c.url,
    ])
  }
  console.log(`Seeded ${allDetailedContents.length} contents`)

  // 2. Comments
  for (const cm of mockCommentsList) {
    await client.query(`
      INSERT INTO public.comments (id, author, anonymized_author, platform, text, sentiment, confidence_score, is_sarcasm_or_needs_review, time_ago, likes, source_content_title)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        text = EXCLUDED.text,
        sentiment = EXCLUDED.sentiment,
        confidence_score = EXCLUDED.confidence_score,
        is_sarcasm_or_needs_review = EXCLUDED.is_sarcasm_or_needs_review;
    `, [
      cm.id,
      cm.author,
      cm.anonymizedAuthor || null,
      cm.platform,
      cm.text,
      cm.sentiment,
      cm.confidenceScore,
      cm.isSarcasmOrNeedsReview || false,
      cm.timeAgo,
      cm.likes,
      cm.sourceContentTitle,
    ])
  }
  console.log(`Seeded ${mockCommentsList.length} comments`)

  // 3. Topics
  for (const tp of mockTopicsExtendedList) {
    await client.query(`
      INSERT INTO public.topics (id, name, category, mention_count, growth_percentage, is_trending_up, positive_ratio, negative_ratio, neutral_ratio, keywords)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        mention_count = EXCLUDED.mention_count,
        growth_percentage = EXCLUDED.growth_percentage;
    `, [
      tp.id,
      tp.name,
      tp.category,
      tp.mentionCount,
      tp.growthPercentage,
      tp.isTrendingUp,
      tp.positiveRatio,
      tp.negativeRatio,
      tp.neutralRatio,
      tp.keywords,
    ])
  }
  console.log(`Seeded ${mockTopicsExtendedList.length} topics`)

  const countRes = await client.query(`
    SELECT
      (SELECT count(*) FROM public.contents) as contents_count,
      (SELECT count(*) FROM public.comments) as comments_count,
      (SELECT count(*) FROM public.topics) as topics_count;
  `)
  console.log('Database Summary:', countRes.rows[0])

  await client.end()
}

seedAll().catch(console.error)
