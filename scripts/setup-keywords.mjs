import pg from 'pg'

async function setupKeywords() {
  const client = new pg.Client({
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.iyruoqteedkyljqbneap',
    password: 'b4SgaAFICBQszTbm',
    ssl: { rejectUnauthorized: false },
  })

  console.log('Connecting to Supabase PostgreSQL Pooler...')
  await client.connect()
  console.log('Connected!')

  // 1. Create table public.monitored_keywords
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.monitored_keywords (
      id TEXT PRIMARY KEY,
      keyword TEXT NOT NULL,
      type TEXT NOT NULL, -- 'primary' or 'issue'
      is_active BOOLEAN DEFAULT TRUE,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT unique_keyword_type UNIQUE (keyword, type)
    );

    ALTER TABLE public.monitored_keywords ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow public read monitored_keywords" ON public.monitored_keywords;
    CREATE POLICY "Allow public read monitored_keywords" ON public.monitored_keywords FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow public insert monitored_keywords" ON public.monitored_keywords;
    CREATE POLICY "Allow public insert monitored_keywords" ON public.monitored_keywords FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public update monitored_keywords" ON public.monitored_keywords;
    CREATE POLICY "Allow public update monitored_keywords" ON public.monitored_keywords FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Allow public delete monitored_keywords" ON public.monitored_keywords;
    CREATE POLICY "Allow public delete monitored_keywords" ON public.monitored_keywords FOR DELETE USING (true);
  `)
  console.log('Table public.monitored_keywords and CRUD RLS policies verified!')

  // 2. Default keywords
  const defaultPrimaries = [
    'MBG',
    'Makan Bergizi Gratis',
    'Dapur SPPG',
    'Satuan Pelayanan Pangan Gizi',
  ]

  const defaultIssues = [
    'keracunan',
    'basi',
    'tidak tepat sasaran',
    'terlambat',
    'porsi sedikit',
    'ompreng',
    'susu sapi',
  ]

  // Check existing count
  const checkRes = await client.query('SELECT COUNT(*) FROM public.monitored_keywords;')
  const currentCount = parseInt(checkRes.rows[0].count, 10)
  console.log(`Current keywords count in DB: ${currentCount}`)

  if (currentCount === 0) {
    console.log('Seeding default keywords into DB...')
    for (let i = 0; i < defaultPrimaries.length; i++) {
      const kw = defaultPrimaries[i]
      await client.query(`
        INSERT INTO public.monitored_keywords (id, keyword, type, is_active, is_default, created_at, updated_at)
        VALUES ($1, $2, 'primary', true, true, NOW(), NOW())
        ON CONFLICT (keyword, type) DO NOTHING;
      `, [`kw-p-${i + 1}`, kw])
    }

    for (let i = 0; i < defaultIssues.length; i++) {
      const kw = defaultIssues[i]
      await client.query(`
        INSERT INTO public.monitored_keywords (id, keyword, type, is_active, is_default, created_at, updated_at)
        VALUES ($1, $2, 'issue', true, true, NOW(), NOW())
        ON CONFLICT (keyword, type) DO NOTHING;
      `, [`kw-i-${i + 1}`, kw])
    }
    console.log('Default keywords successfully seeded!')
  }

  const finalRes = await client.query('SELECT * FROM public.monitored_keywords ORDER BY type, created_at ASC;')
  console.log('All keywords in DB:', finalRes.rows)

  await client.end()
}

setupKeywords().catch((err) => {
  console.error('Error during setupKeywords:', err)
  process.exit(1)
})
