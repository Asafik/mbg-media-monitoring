import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { defaultMonitoredSources } from '../data/monitoredSourcesData'
import type { MonitoredSourceItem } from '../types/dashboard'

interface DbTargetAccount {
  id: string
  handle: string
  name: string
  platform: 'Instagram' | 'Facebook' | 'TikTok'
  category: string
  is_active: boolean
  is_default: boolean
  posts_count: number
  last_checked: string
  profile_url: string
  created_at?: string
  updated_at?: string
}

function mapDbToModel(row: DbTargetAccount): MonitoredSourceItem {
  return {
    id: row.id,
    handle: row.handle,
    name: row.name,
    platform: row.platform,
    category: row.category,
    isActive: row.is_active,
    isDefault: row.is_default,
    postsCount: row.posts_count || 0,
    lastChecked: row.last_checked || 'Baru saja',
    profileUrl: row.profile_url || '#',
  }
}

function mapModelToDb(item: MonitoredSourceItem): DbTargetAccount {
  return {
    id: item.id,
    handle: item.handle,
    name: item.name,
    platform: item.platform as 'Instagram' | 'Facebook' | 'TikTok',
    category: item.category,
    is_active: item.isActive,
    is_default: item.isDefault,
    posts_count: item.postsCount || 0,
    last_checked: item.lastChecked || 'Baru saja',
    profile_url: item.profileUrl || '',
  }
}

/**
 * Mengambil daftar seluruh target akun (Instagram & Facebook) dari Supabase DB
 */
export async function getTargetAccounts(): Promise<{
  data: MonitoredSourceItem[]
  fromDb: boolean
}> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('target_accounts')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

      if (!error && data && data.length > 0) {
        let mapped = data.map((d: DbTargetAccount) => mapDbToModel(d))
        const hasTt = mapped.some((d) => d.platform === 'TikTok')
        if (!hasTt) {
          const ttDefaults = defaultMonitoredSources.filter((s) => s.platform === 'TikTok')
          mapped = [...mapped, ...ttDefaults]
        }
        localStorage.setItem('mbg_monitored_sources', JSON.stringify(mapped))
        return { data: mapped, fromDb: true }
      }
    } catch (err) {
      console.warn('Gagal memuat target_accounts dari Supabase, beralih ke cache lokal:', err)
    }
  }

  // Fallback ke localStorage
  try {
    const saved = localStorage.getItem('mbg_monitored_sources')
    if (saved) {
      const parsed: MonitoredSourceItem[] = JSON.parse(saved)
      if (parsed.length > 0) {
        return { data: parsed, fromDb: false }
      }
    }
  } catch {}

  return { data: defaultMonitoredSources, fromDb: false }
}

/**
 * Menambahkan akun baru ke database Supabase
 */
export async function createTargetAccount(
  item: MonitoredSourceItem
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const dbRow = mapModelToDb(item)
      const { error } = await supabase.from('target_accounts').insert(dbRow)
      if (error) {
        console.error('Supabase create error:', error)
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
 * Memperbarui akun di database Supabase (Edit)
 */
export async function updateTargetAccount(
  item: MonitoredSourceItem
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const dbRow = mapModelToDb(item)
      const { error } = await supabase
        .from('target_accounts')
        .update({
          handle: dbRow.handle,
          name: dbRow.name,
          platform: dbRow.platform,
          category: dbRow.category,
          is_active: dbRow.is_active,
          profile_url: dbRow.profile_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) {
        console.error('Supabase update error:', error)
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
 * Mengubah status aktif / nonaktif akun di database Supabase
 */
export async function toggleTargetAccountActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('target_accounts')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        console.error('Supabase toggle error:', error)
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
 * Menghapus akun dari database Supabase
 */
export async function deleteTargetAccount(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('target_accounts').delete().eq('id', id)
      if (error) {
        console.error('Supabase delete error:', error)
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
 * Reset seluruh akun di Supabase ke default 12 media berita
 */
export async function resetTargetAccountsDefault(): Promise<{
  success: boolean
  data: MonitoredSourceItem[]
  error?: string
}> {
  if (isSupabaseConfigured) {
    try {
      // Hapus seluruh data lama/kustom
      await supabase.from('target_accounts').delete().neq('id', 'dummy_prevent_empty')

      // Masukkan 12 default
      const dbRows = defaultMonitoredSources.map((item) => mapModelToDb(item))
      const { error } = await supabase.from('target_accounts').insert(dbRows)

      if (error) {
        console.error('Supabase reset insert error:', error)
      } else {
        localStorage.setItem('mbg_monitored_sources', JSON.stringify(defaultMonitoredSources))
        return { success: true, data: defaultMonitoredSources }
      }
    } catch (err: unknown) {
      console.error('Supabase reset exception:', err)
    }
  }

  localStorage.setItem('mbg_monitored_sources', JSON.stringify(defaultMonitoredSources))
  return { success: true, data: defaultMonitoredSources }
}
