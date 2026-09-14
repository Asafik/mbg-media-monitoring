import pg from 'pg';
const { Client } = pg;

const API_KEY = 'AIzaSyA0XLpI6IGMC00cJ68SXpfNkczzuXrTDko';
const rawQuery = 'Makan Bergizi Gratis keracunan OR basi OR "tidak tepat sasaran" OR masalah OR kritik -lagu -lirik -musik -mainan -kartun';

const client = new Client({
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.iyruoqteedkyljqbneap',
  password: 'b4SgaAFICBQszTbm',
  ssl: { rejectUnauthorized: false }
});

function formatViews(numStr) {
  const num = parseInt(numStr || '0', 10) || 0;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M views';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K views';
  return num + ' views';
}

function formatComments(numStr) {
  const num = parseInt(numStr || '0', 10) || 0;
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K komentar';
  return num + ' komentar';
}

async function main() {
  console.log('1. Fetching 5 issue videos from YouTube API...');
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(rawQuery)}&type=video&regionCode=ID&relevanceLanguage=id&order=relevance&maxResults=5&key=${API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const videoIds = searchData.items.map(i => i.id.videoId).filter(Boolean);
  
  console.log('Found video IDs:', videoIds);

  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  console.log('2. Connecting to Supabase PostgreSQL...');
  await client.connect();

  // Clear previous meme contents
  await client.query("DELETE FROM contents WHERE platform = 'YouTube'");

  console.log('3. Inserting 5 targeted issue videos...');
  for (let i = 0; i < detailsData.items.length; i++) {
    const v = detailsData.items[i];
    const thumb = v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url;
    const published = new Date(v.snippet.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const viewCount = parseInt(v.statistics?.viewCount || '0', 10);
    const commentCount = parseInt(v.statistics?.commentCount || '0', 10);

    await client.query(`
      INSERT INTO contents (
        id, platform, rank, title, author, views, numeric_views,
        comments, numeric_comments, shares, time_ago, sentiment,
        comment_sentiment_label, thumbnail_url, url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      `yt-${v.id}`,
      'YouTube',
      i + 1,
      v.snippet.title,
      v.snippet.channelTitle,
      formatViews(v.statistics?.viewCount),
      viewCount,
      formatComments(v.statistics?.commentCount),
      commentCount,
      'Terpantau',
      published,
      'negatif',
      'Sentimen Komentar: Kritis / Negatif',
      thumb,
      `https://www.youtube.com/watch?v=${v.id}`
    ]);

    console.log(`Saved #${i+1}: ${v.snippet.title} (${v.snippet.channelTitle})`);
  }

  const check = await client.query('SELECT rank, title, author, views FROM contents ORDER BY rank ASC');
  console.log('\nFinal contents in PostgreSQL Supabase:');
  console.table(check.rows);

  await client.end();
}

main().catch(console.error);
