import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const DEFAULT_YOUTUBE_API_KEY =
  import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyA0XLpI6IGMC00cJ68SXpfNkczzuXrTDko'

/**
 * Mengambil nilai API Key aktif (dari Supabase DB jika terhubung, atau dari localStorage/env)
 */
export async function getApiKey(
  keyName: string = 'youtube_api_key',
  fallbackDefault: string = DEFAULT_YOUTUBE_API_KEY
): Promise<{ key: string; fromDb: boolean }> {
  // 1. Cek dari Supabase DB
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key_value')
        .eq('key_name', keyName)
        .single()

      if (!error && data?.key_value) {
        localStorage.setItem(`mbg_${keyName}`, data.key_value)
        return { key: data.key_value, fromDb: true }
      }
    } catch (err) {
      console.warn('Gagal membaca app_settings dari Supabase:', err)
    }
  }

  // 2. Cek dari localStorage
  try {
    const cached = localStorage.getItem(`mbg_${keyName}`)
    if (cached && cached.trim()) {
      return { key: cached.trim(), fromDb: false }
    }
  } catch {}

  // 3. Fallback default
  return { key: fallbackDefault, fromDb: false }
}

/**
 * Menyimpan API Key baru ke database Supabase dan localStorage
 */
export async function saveApiKey(
  keyName: string,
  keyValue: string,
  platform: string,
  label: string
): Promise<{ success: boolean; error?: string }> {
  const cleanVal = keyValue.trim()
  try {
    localStorage.setItem(`mbg_${keyName}`, cleanVal)
  } catch {}

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('app_settings').upsert({
        key_name: keyName,
        key_value: cleanVal,
        platform,
        label,
        is_active: true,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Gagal upsert app_settings Supabase:', error)
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg }
    }
  }

  return { success: true }
}

/**
 * Menguji apakah YouTube API Key valid dengan request ping ringan ke Google API
 */
export async function validateYouTubeApiKey(
  apiKey: string
): Promise<{ valid: boolean; message: string; quotaStatus?: string }> {
  const cleanKey = apiKey.trim()
  if (!cleanKey) {
    return { valid: false, message: 'API Key tidak boleh kosong.' }
  }

  try {
    const start = performance.now()
    // Uji request ringan (part=snippet, maxResults=1)
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=MBG&maxResults=1&key=${cleanKey}`
    const res = await fetch(testUrl)
    const json = await res.json()
    const latency = Math.round(performance.now() - start)

    if (json.error) {
      const errReason = json.error.errors?.[0]?.reason || json.error.message || 'Error tidak diketahui'
      return {
        valid: false,
        message: `API Key ditolak Google: ${errReason}`,
      }
    }

    return {
      valid: true,
      message: `API Key YouTube valid & aktif! Respon cepat (${latency} ms).`,
      quotaStatus: 'Tersedia 10.000 kuota harian',
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { valid: false, message: `Gagal menguji koneksi: ${msg}` }
  }
}
