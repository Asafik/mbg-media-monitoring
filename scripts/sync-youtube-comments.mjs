import pg from 'pg';
const { Client } = pg;

const API_KEY = 'AIzaSyA0XLpI6IGMC00cJ68SXpfNkczzuXrTDko';
const videos = [
  { id: 'KzehmPJbQxU', title: 'FULL! MBG Watch Desak Program Makan Bergizi Gratis Dihentikan Sementara Buntut Kasus Keracunan' },
  { id: '9ebrZWyHXac', title: 'Prabowo Pede Program Makan Bergizi Gratis Sukses Meski Ada Siswa Keracunan: Keberhasilan 99,99%' },
  { id: '2gIobI9TvnA', title: 'MAKAN BERGIZI GRATIS | Dari Keracunan, Sampai Bagi-Bagi Proyek' },
  { id: 'a0HM_M1G_q0', title: 'Ibu Hamil di Cipongkor Diduga Keracunan Makan Bergizi Gratis #beritasatu' },
  { id: '6lTjTgXMbaw', title: 'Penelusuran Dapur Makan Bergizi Gratis | Prime Story' },
];

const client = new Client({
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.iyruoqteedkyljqbneap',
  password: 'b4SgaAFICBQszTbm',
  ssl: { rejectUnauthorized: false }
});

function analyzeComment(text) {
  const lower = text.toLowerCase();
  const neg = ['keracunan', 'bebal', 'korupsi', 'cuci tangan', 'bahaya', 'keras kepala', 'bagi', 'bohong', 'kecewa', 'mati', 'nyawa', 'rusak', 'basi', 'parah', 'buruk'];
  const pos = ['bagus', 'dukung', 'sukses', 'semoga', 'sehat', 'mantap', 'terima kasih', 'alhamdulillah'];
  let nCount = 0;
  let pCount = 0;
  neg.forEach(w => { if(lower.includes(w)) nCount++; });
  pos.forEach(w => { if(lower.includes(w)) pCount++; });
  if (nCount > pCount) return { sentiment: 'negatif', score: 0.88 };
  if (pCount > nCount) return { sentiment: 'positif', score: 0.84 };
  return { sentiment: 'netral', score: 0.75 };
}

async function run() {
  await client.connect();
  console.log('Postgres connected.');

  // Clear previous comments
  await client.query("DELETE FROM comments WHERE platform = 'YouTube'");

  let totalSaved = 0;
  for (const v of videos) {
    console.log(`\nFetching comments for: "${v.title}"`);
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${v.id}&maxResults=4&order=relevance&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items) {
      console.log('No comments or error:', data.error?.message);
      continue;
    }

    for (const it of data.items) {
      const snip = it.snippet.topLevelComment.snippet;
      const cleanText = (snip.textDisplay || '').replace(/<[^>]*>?/gm, '').trim();
      const author = snip.authorDisplayName || '@warga';
      const anon = author.length > 5 ? `${author.substring(0, 4)}***` : `${author}***`;
      const analysis = analyzeComment(cleanText);
      const isSarcasm = /cuci tangan|hebat|mantap/i.test(cleanText) && analysis.sentiment === 'negatif';

      await client.query(`
        INSERT INTO comments (
          id, author, anonymized_author, platform, text, sentiment,
          confidence_score, is_sarcasm_or_needs_review, time_ago, likes, source_content_title
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [
        `yt-cmt-${it.id}`,
        author,
        anon,
        'YouTube',
        cleanText,
        analysis.sentiment,
        analysis.score,
        isSarcasm,
        new Date(snip.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        snip.likeCount || 0,
        v.title
      ]);
      totalSaved++;
      console.log(`+ Saved [${analysis.sentiment}] ${author}: "${cleanText.substring(0, 60)}..."`);
    }
  }

  const check = await client.query("SELECT count(*) FROM comments WHERE platform = 'YouTube'");
  console.log(`\nTotal YouTube comments in Supabase DB: ${check.rows[0].count}`);
  await client.end();
}

run().catch(console.error);
