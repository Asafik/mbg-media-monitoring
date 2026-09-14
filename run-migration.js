import fs from 'fs'
import pg from 'pg'

async function migrate() {
  const sql = fs.readFileSync('./supabase/schema.sql', 'utf-8')
  console.log('Connecting to Supabase PostgreSQL...')

  const client = new pg.Client({
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.iyruoqteedkyljqbneap',
    password: 'b4SgaAFICBQszTbm',
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  console.log('Connected! Executing schema.sql migration...')

  await client.query(sql)
  console.log('Migration executed successfully!')

  const contentCount = await client.query('SELECT count(*) FROM public.contents;')
  const commentCount = await client.query('SELECT count(*) FROM public.comments;')

  console.log('Contents in Supabase DB:', contentCount.rows[0].count)
  console.log('Comments in Supabase DB:', commentCount.rows[0].count)

  await client.end()
}

migrate().catch(console.error)
