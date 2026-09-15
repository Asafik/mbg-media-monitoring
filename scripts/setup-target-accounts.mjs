import pg from 'pg'

async function setupTargetAccounts() {
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

  // 1. Create table with appropriate columns
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.target_accounts (
      id TEXT PRIMARY KEY,
      handle TEXT NOT NULL,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      category TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      is_default BOOLEAN DEFAULT FALSE,
      posts_count INT DEFAULT 0,
      last_checked TEXT DEFAULT 'Baru saja',
      profile_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE public.target_accounts ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow public read target_accounts" ON public.target_accounts;
    CREATE POLICY "Allow public read target_accounts" ON public.target_accounts FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow public insert target_accounts" ON public.target_accounts;
    CREATE POLICY "Allow public insert target_accounts" ON public.target_accounts FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public update target_accounts" ON public.target_accounts;
    CREATE POLICY "Allow public update target_accounts" ON public.target_accounts FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Allow public delete target_accounts" ON public.target_accounts;
    CREATE POLICY "Allow public delete target_accounts" ON public.target_accounts FOR DELETE USING (true);
  `)
  console.log('Table public.target_accounts and CRUD RLS policies verified!')

  // 2. Clear old/dummy data if any
  await client.query('TRUNCATE TABLE public.target_accounts;')
  console.log('Cleared dummy / old rows from target_accounts.')

  // 3. Seed default 12 media accounts (8 IG + 4 FB)
  const defaultItems = [
    {
      id: 'src-ig-1',
      handle: '@kompascom',
      name: 'Kompas.com',
      platform: 'Instagram',
      category: 'Media Berita Nasional',
      isActive: true,
      isDefault: true,
      postsCount: 28,
      lastChecked: 'Baru saja',
      profileUrl: 'https://www.instagram.com/kompascom/',
    },
    {
      id: 'src-ig-2',
      handle: '@tribunnews',
      name: 'Tribunnews',
      platform: 'Instagram',
      category: 'Jaringan Berita Daerah',
      isActive: true,
      isDefault: true,
      postsCount: 34,
      lastChecked: '10 menit lalu',
      profileUrl: 'https://www.instagram.com/tribunnews/',
    },
    {
      id: 'src-ig-3',
      handle: '@narasinewsroom',
      name: 'Narasi Newsroom',
      platform: 'Instagram',
      category: 'Jurnalisme Kritis & Investigasi',
      isActive: true,
      isDefault: true,
      postsCount: 19,
      lastChecked: '25 menit lalu',
      profileUrl: 'https://www.instagram.com/narasinewsroom/',
    },
    {
      id: 'src-ig-4',
      handle: '@kumparancom',
      name: 'Kumparan',
      platform: 'Instagram',
      category: 'Media Digital & Warganet',
      isActive: true,
      isDefault: true,
      postsCount: 22,
      lastChecked: '30 menit lalu',
      profileUrl: 'https://www.instagram.com/kumparancom/',
    },
    {
      id: 'src-ig-5',
      handle: '@detikcom',
      name: 'detikcom',
      platform: 'Instagram',
      category: 'Media Berita Cepat',
      isActive: true,
      isDefault: true,
      postsCount: 31,
      lastChecked: '15 menit lalu',
      profileUrl: 'https://www.instagram.com/detikcom/',
    },
    {
      id: 'src-ig-6',
      handle: '@tempodotco',
      name: 'Tempo.co',
      platform: 'Instagram',
      category: 'Jurnalisme Investigasi',
      isActive: true,
      isDefault: true,
      postsCount: 16,
      lastChecked: '40 menit lalu',
      profileUrl: 'https://www.instagram.com/tempodotco/',
    },
    {
      id: 'src-ig-7',
      handle: '@cnnindonesia',
      name: 'CNN Indonesia',
      platform: 'Instagram',
      category: 'Media Berita Nasional & TV',
      isActive: true,
      isDefault: true,
      postsCount: 25,
      lastChecked: '50 menit lalu',
      profileUrl: 'https://www.instagram.com/cnnindonesia/',
    },
    {
      id: 'src-ig-8',
      handle: '@antaranewscom',
      name: 'Antara News',
      platform: 'Instagram',
      category: 'Kantor Berita Resmi Nasional',
      isActive: true,
      isDefault: true,
      postsCount: 18,
      lastChecked: '1 jam lalu',
      profileUrl: 'https://www.instagram.com/antaranewscom/',
    },
    {
      id: 'src-fb-1',
      handle: 'Kompas.com',
      name: 'Kompas.com',
      platform: 'Facebook',
      category: 'Media Nasional Terverifikasi',
      isActive: true,
      isDefault: true,
      postsCount: 24,
      lastChecked: 'Baru saja',
      profileUrl: 'https://www.facebook.com/kompascom',
    },
    {
      id: 'src-fb-2',
      handle: 'detikcom',
      name: 'detikcom',
      platform: 'Facebook',
      category: 'Portal Berita Digital',
      isActive: true,
      isDefault: true,
      postsCount: 29,
      lastChecked: '15 menit lalu',
      profileUrl: 'https://www.facebook.com/detikcom',
    },
    {
      id: 'src-fb-3',
      handle: 'CNN Indonesia',
      name: 'CNN Indonesia',
      platform: 'Facebook',
      category: 'Berita & Investigasi Kebijakan',
      isActive: true,
      isDefault: true,
      postsCount: 18,
      lastChecked: '35 menit lalu',
      profileUrl: 'https://www.facebook.com/CNNIndonesia',
    },
    {
      id: 'src-fb-4',
      handle: 'Badan Gizi Nasional (BGN)',
      name: 'Badan Gizi Nasional (BGN)',
      platform: 'Facebook',
      category: 'Fanspage Resmi Program MBG',
      isActive: true,
      isDefault: true,
      postsCount: 15,
      lastChecked: 'Baru saja',
      profileUrl: 'https://www.facebook.com/BadanGiziNasional',
    },
    // TikTok Media Berita Nasional
    {
      id: 'src-tt-1',
      handle: '@kompascom',
      name: 'Kompas.com',
      platform: 'TikTok',
      category: 'Media Berita Nasional',
      isActive: true,
      isDefault: true,
      postsCount: 38,
      lastChecked: 'Baru saja',
      profileUrl: 'https://www.tiktok.com/@kompascom',
    },
    {
      id: 'src-tt-2',
      handle: '@detikcom',
      name: 'detikcom',
      platform: 'TikTok',
      category: 'Portal Berita Cepat',
      isActive: true,
      isDefault: true,
      postsCount: 42,
      lastChecked: '12 menit lalu',
      profileUrl: 'https://www.tiktok.com/@detikcom',
    },
    {
      id: 'src-tt-3',
      handle: '@tribunnews',
      name: 'Tribunnews',
      platform: 'TikTok',
      category: 'Jaringan Berita Daerah',
      isActive: true,
      isDefault: true,
      postsCount: 35,
      lastChecked: '20 menit lalu',
      profileUrl: 'https://www.tiktok.com/@tribunnews',
    },
    {
      id: 'src-tt-4',
      handle: '@cnnindonesia',
      name: 'CNN Indonesia',
      platform: 'TikTok',
      category: 'Media Berita Nasional & TV',
      isActive: true,
      isDefault: true,
      postsCount: 29,
      lastChecked: '30 menit lalu',
      profileUrl: 'https://www.tiktok.com/@cnnindonesia',
    },
    {
      id: 'src-tt-5',
      handle: '@narasi_tv',
      name: 'Narasi',
      platform: 'TikTok',
      category: 'Jurnalisme Kritis & Isu Publik',
      isActive: true,
      isDefault: true,
      postsCount: 26,
      lastChecked: '45 menit lalu',
      profileUrl: 'https://www.tiktok.com/@narasi_tv',
    },
    {
      id: 'src-tt-6',
      handle: '@kumparan',
      name: 'kumparan',
      platform: 'TikTok',
      category: 'Media Digital & Warganet',
      isActive: true,
      isDefault: true,
      postsCount: 31,
      lastChecked: '50 menit lalu',
      profileUrl: 'https://www.tiktok.com/@kumparan',
    },
    {
      id: 'src-tt-7',
      handle: '@tempodotco',
      name: 'Tempo.co',
      platform: 'TikTok',
      category: 'Jurnalisme Investigasi',
      isActive: true,
      isDefault: true,
      postsCount: 21,
      lastChecked: '1 jam lalu',
      profileUrl: 'https://www.tiktok.com/@tempodotco',
    },
  ]

  for (const item of defaultItems) {
    await client.query(
      `
      INSERT INTO public.target_accounts (
        id, handle, name, platform, category, is_active, is_default, posts_count, last_checked, profile_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        handle = EXCLUDED.handle,
        name = EXCLUDED.name,
        platform = EXCLUDED.platform,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        is_default = EXCLUDED.is_default,
        posts_count = EXCLUDED.posts_count,
        last_checked = EXCLUDED.last_checked,
        profile_url = EXCLUDED.profile_url,
        updated_at = NOW();
    `,
      [
        item.id,
        item.handle,
        item.name,
        item.platform,
        item.category,
        item.isActive,
        item.isDefault,
        item.postsCount,
        item.lastChecked,
        item.profileUrl,
      ]
    )
  }

  const res = await client.query('SELECT count(*) FROM public.target_accounts;')
  console.log(`Successfully seeded ${res.rows[0].count} default target accounts into Supabase DB!`)

  await client.end()
}

setupTargetAccounts().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
