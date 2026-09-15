import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface MonitoredKeywordItem {
  id: string
  keyword: string
  type: 'primary' | 'issue'
  isActive: boolean
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

export const DEFAULT_PRIMARY_KEYWORDS = [
  'MBG',
  'Makan Bergizi Gratis',
  'Dapur SPPG',
  'Satuan Pelayanan Pangan Gizi',
]

export const DEFAULT_ISSUE_KEYWORDS = [
  'keracunan',
  'basi',
  'tidak tepat sasaran',
  'terlambat',
  'porsi sedikit',
  'ompreng',
  'susu sapi',
]

interface DbKeywordRow {
  id: string
  keyword: string
  type: 'primary' | 'issue'
  is_active: boolean
  is_default: boolean
  created_at?: string
  updated_at?: string
}

function mapDbToModel(row: DbKeywordRow): MonitoredKeywordItem {
  return {
    id: row.id,
    keyword: row.keyword,
    type: row.type,
    isActive: row.is_active,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Mengambil seluruh kata kunci (Utama & Isu) dari Supabase DB
 */
export async function getMonitoredKeywords(): Promise<{
  primary: string[]
  issue: string[]
  items: MonitoredKeywordItem[]
  fromDb: boolean
}> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('monitored_keywords')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data && data.length > 0) {
        const items = data.map((d) => mapDbToModel(d as DbKeywordRow))
        const primary = items.filter((k) => k.type === 'primary' && k.isActive).map((k) => k.keyword)
        const issue = items.filter((k) => k.type === 'issue' && k.isActive).map((k) => k.keyword)

        try {
          localStorage.setItem('mbg_primary_keywords', JSON.stringify(primary))
          localStorage.setItem('mbg_issue_keywords', JSON.stringify(issue))
        } catch {}

        return { primary, issue, items, fromDb: true }
      }
    } catch (err) {
      console.warn('Gagal membaca monitored_keywords dari Supabase:', err)
    }
  }

  // Fallback ke localStorage jika DB tidak tersedia
  try {
    const savedPrimary = localStorage.getItem('mbg_primary_keywords')
    const savedIssue = localStorage.getItem('mbg_issue_keywords')
    const primary = savedPrimary ? JSON.parse(savedPrimary) : DEFAULT_PRIMARY_KEYWORDS
    const issue = savedIssue ? JSON.parse(savedIssue) : DEFAULT_ISSUE_KEYWORDS
    return { primary, issue, items: [], fromDb: false }
  } catch {
    return {
      primary: DEFAULT_PRIMARY_KEYWORDS,
      issue: DEFAULT_ISSUE_KEYWORDS,
      items: [],
      fromDb: false,
    }
  }
}

/**
 * Menambahkan kata kunci baru ke Supabase DB dan localStorage
 */
export async function addMonitoredKeyword(
  keyword: string,
  type: 'primary' | 'issue'
): Promise<{ success: boolean; item?: MonitoredKeywordItem; error?: string }> {
  const cleanKeyword = keyword.trim()
  if (!cleanKeyword) return { success: false, error: 'Kata kunci tidak boleh kosong' }

  const newId = `kw-${type[0]}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const newModel: MonitoredKeywordItem = {
    id: newId,
    keyword: cleanKeyword,
    type,
    isActive: true,
    isDefault: false,
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('monitored_keywords').insert({
        id: newId,
        keyword: cleanKeyword,
        type,
        is_active: true,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        // Jika sudah ada (unique constraint)
        if (error.code === '23505') {
          return { success: false, error: 'Kata kunci sudah terdaftar di database' }
        }
        console.error('Error insert keyword Supabase:', error)
        return { success: false, error: error.message }
      }
    } catch (err) {
      console.warn('Gagal insert keyword ke Supabase:', err)
    }
  }

  // Update localStorage
  try {
    const key = type === 'primary' ? 'mbg_primary_keywords' : 'mbg_issue_keywords'
    const current = JSON.parse(localStorage.getItem(key) || '[]')
    if (!current.includes(cleanKeyword)) {
      current.push(cleanKeyword)
      localStorage.setItem(key, JSON.stringify(current))
    }
  } catch {}

  return { success: true, item: newModel }
}

/**
 * Menghapus kata kunci dari Supabase DB dan localStorage
 */
export async function removeMonitoredKeyword(
  keyword: string,
  type: 'primary' | 'issue'
): Promise<{ success: boolean; error?: string }> {
  const cleanKeyword = keyword.trim()

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('monitored_keywords')
        .delete()
        .eq('keyword', cleanKeyword)
        .eq('type', type)

      if (error) {
        console.error('Error delete keyword Supabase:', error)
        return { success: false, error: error.message }
      }
    } catch (err) {
      console.warn('Gagal delete keyword Supabase:', err)
    }
  }

  // Update localStorage
  try {
    const key = type === 'primary' ? 'mbg_primary_keywords' : 'mbg_issue_keywords'
    const current: string[] = JSON.parse(localStorage.getItem(key) || '[]')
    const updated = current.filter((k) => k !== cleanKeyword)
    localStorage.setItem(key, JSON.stringify(updated))
  } catch {}

  return { success: true }
}

/**
 * Mengembalikan seluruh kata kunci ke daftar default di database Supabase
 */
export async function resetMonitoredKeywords(): Promise<{
  success: boolean
  primary: string[]
  issue: string[]
  error?: string
}> {
  if (isSupabaseConfigured) {
    try {
      // Hapus seluruh data lama
      await supabase.from('monitored_keywords').delete().neq('id', 'dummy_placeholder')

      // Masukkan default kata kunci
      const rowsToInsert: DbKeywordRow[] = []
      DEFAULT_PRIMARY_KEYWORDS.forEach((kw, i) => {
        rowsToInsert.push({
          id: `kw-p-${i + 1}`,
          keyword: kw,
          type: 'primary',
          is_active: true,
          is_default: true,
        })
      })
      DEFAULT_ISSUE_KEYWORDS.forEach((kw, i) => {
        rowsToInsert.push({
          id: `kw-i-${i + 1}`,
          keyword: kw,
          type: 'issue',
          is_active: true,
          is_default: true,
        })
      })

      const { error } = await supabase.from('monitored_keywords').insert(rowsToInsert)
      if (error) {
        console.error('Gagal reset keywords di Supabase:', error)
      }
    } catch (err) {
      console.warn('Gagal reset keywords di Supabase:', err)
    }
  }

  try {
    localStorage.setItem('mbg_primary_keywords', JSON.stringify(DEFAULT_PRIMARY_KEYWORDS))
    localStorage.setItem('mbg_issue_keywords', JSON.stringify(DEFAULT_ISSUE_KEYWORDS))
  } catch {}

  return {
    success: true,
    primary: DEFAULT_PRIMARY_KEYWORDS,
    issue: DEFAULT_ISSUE_KEYWORDS,
  }
}
