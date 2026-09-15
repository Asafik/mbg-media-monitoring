import pg from 'pg'

async function setupApiSettings() {
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

  // 1. Create table app_settings
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.app_settings (
      key_name TEXT PRIMARY KEY,
      key_value TEXT NOT NULL,
      platform TEXT NOT NULL,
      label TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow public read app_settings" ON public.app_settings;
    CREATE POLICY "Allow public read app_settings" ON public.app_settings FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow public insert app_settings" ON public.app_settings;
    CREATE POLICY "Allow public insert app_settings" ON public.app_settings FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public update app_settings" ON public.app_settings;
    CREATE POLICY "Allow public update app_settings" ON public.app_settings FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Allow public delete app_settings" ON public.app_settings;
    CREATE POLICY "Allow public delete app_settings" ON public.app_settings FOR DELETE USING (true);
  `)
  console.log('Table public.app_settings verified with RLS policies!')

  // 2. Seed default YouTube API Key
  const defaultYouTubeKey = 'AIzaSyA0XLpI6IGMC00cJ68SXpfNkczzuXrTDko'
  await client.query(`
    INSERT INTO public.app_settings (key_name, key_value, platform, label, is_active, updated_at)
    VALUES ('youtube_api_key', $1, 'YouTube', 'Official YouTube Data API v3 Key', true, NOW())
    ON CONFLICT (key_name) DO UPDATE SET
      key_value = EXCLUDED.key_value,
      updated_at = NOW();
  `, [defaultYouTubeKey])

  const res = await client.query('SELECT * FROM public.app_settings;')
  console.log('Current app_settings:', res.rows)

  await client.end()
}

setupApiSettings().catch((err) => {
  console.error('Setup failed:', err)
  process.exit(1)
})
