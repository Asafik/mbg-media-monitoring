import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iyruoqteedkyljqbneap.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here')

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'dummy-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

export async function testSupabaseConnection(): Promise<{
  success: boolean
  message: string
  latencyMs?: number
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'VITE_SUPABASE_ANON_KEY belum diisi di file .env',
    }
  }

  const start = performance.now()
  try {
    const { error } = await supabase.from('contents').select('count', { count: 'exact', head: true })
    const latency = Math.round(performance.now() - start)

    if (error && error.code !== 'PGRST116') {
      return {
        success: false,
        message: `Koneksi Supabase gagal: ${error.message}`,
        latencyMs: latency,
      }
    }

    return {
      success: true,
      message: `Terhubung ke Supabase (${latency} ms)`,
      latencyMs: latency,
    }
  } catch (err: unknown) {
    const latency = Math.round(performance.now() - start)
    const errMessage = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      message: `Koneksi error: ${errMessage}`,
      latencyMs: latency,
    }
  }
}
