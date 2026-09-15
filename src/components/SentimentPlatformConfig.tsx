import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faYoutube, faTiktok, faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons'
import { CheckCircle2, Save, RotateCcw, BarChart3 } from 'lucide-react'

const STORAGE_KEY = 'mbg_sentiment_config'

interface PlatformSentiment {
  positif: number
  negatif: number
  netral: number
}

interface SentimentConfig {
  YouTube: PlatformSentiment
  TikTok: PlatformSentiment
  Instagram: PlatformSentiment
  Facebook: PlatformSentiment
}

const DEFAULT_CONFIG: SentimentConfig = {
  YouTube: { positif: 21, negatif: 68, netral: 11 },
  TikTok: { positif: 48, negatif: 30, netral: 22 },
  Instagram: { positif: 35, negatif: 42, netral: 23 },
  Facebook: { positif: 28, negatif: 55, netral: 17 },
}

type PlatformKey = keyof SentimentConfig

const PLATFORMS: { key: PlatformKey; label: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
  {
    key: 'YouTube',
    label: 'YouTube',
    icon: <FontAwesomeIcon icon={faYoutube} className="text-sm text-red-600" />,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  {
    key: 'TikTok',
    label: 'TikTok',
    icon: <FontAwesomeIcon icon={faTiktok} className="text-sm text-white" />,
    color: 'text-white',
    bg: 'bg-slate-900',
    border: 'border-slate-700',
  },
  {
    key: 'Instagram',
    label: 'Instagram',
    icon: <FontAwesomeIcon icon={faInstagram} className="text-sm text-fuchsia-600" />,
    color: 'text-fuchsia-700',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
  },
  {
    key: 'Facebook',
    label: 'Facebook',
    icon: <FontAwesomeIcon icon={faFacebook} className="text-sm text-blue-600" />,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
]

function loadConfig(): SentimentConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) }
  } catch {}
  return DEFAULT_CONFIG
}

export function SentimentPlatformConfig() {
  const [config, setConfig] = useState<SentimentConfig>(loadConfig)
  const [saved, setSaved] = useState(false)

  // Emit global event so other components (Dashboard donut) can listen
  const broadcast = (cfg: SentimentConfig) => {
    try {
      window.dispatchEvent(new CustomEvent('mbg-sentiment-config-updated', { detail: cfg }))
    } catch {}
  }

  useEffect(() => {
    broadcast(config)
  }, [config])

  const handleChange = (platform: PlatformKey, field: keyof PlatformSentiment, rawValue: number) => {
    const current = config[platform]
    const others = (['positif', 'negatif', 'netral'] as const).filter((k) => k !== field)
    // Clamp to [0, 100]
    const val = Math.max(0, Math.min(100, rawValue))
    const remaining = 100 - val
    const totalOther = current[others[0]] + current[others[1]]
    let a = totalOther === 0 ? Math.round(remaining / 2) : Math.round((current[others[0]] / totalOther) * remaining)
    let b = remaining - a
    if (a < 0) a = 0
    if (b < 0) b = 0
    setConfig((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: val, [others[0]]: a, [others[1]]: b },
    }))
  }

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {}
    broadcast(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
  }

  return (
    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Konfigurasi Distribusi Sentimen per Platform
          </h3>
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
            4 Platform
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Tersimpan!' : 'Simpan Semua'}</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 -mt-2">
        Atur persentase distribusi sentimen (<strong>Positif</strong>, <strong>Negatif</strong>, <strong>Netral</strong>) untuk setiap platform. Nilai otomatis diseimbangkan ke total 100%.
      </p>

      {/* Platform Sentiment Editors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map((plat) => {
          const data = config[plat.key]
          return (
            <div
              key={plat.key}
              className={`rounded-lg border p-4 space-y-3 ${plat.border} ${
                plat.key === 'TikTok' ? 'bg-slate-950' : 'bg-white'
              }`}
            >
              {/* Platform Header */}
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    plat.key === 'YouTube'
                      ? 'bg-red-50 border border-red-200'
                      : plat.key === 'TikTok'
                      ? 'bg-white/10'
                      : plat.key === 'Instagram'
                      ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {plat.icon}
                </div>
                <span
                  className={`text-sm font-bold ${
                    plat.key === 'TikTok' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {plat.label}
                </span>

                {/* Progress bar preview */}
                <div className="flex-1 flex h-2 rounded-full overflow-hidden ml-2">
                  <div style={{ width: `${data.positif}%` }} className="bg-emerald-500 transition-all duration-300" />
                  <div style={{ width: `${data.negatif}%` }} className="bg-rose-500 transition-all duration-300" />
                  <div style={{ width: `${data.netral}%` }} className="bg-slate-400 transition-all duration-300" />
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-2.5">
                {/* Positif */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className={`text-[11px] font-semibold flex items-center gap-1 ${plat.key === 'TikTok' ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Positif
                    </label>
                    <span className={`text-[11px] font-bold ${plat.key === 'TikTok' ? 'text-emerald-300' : 'text-emerald-700'}`}>{data.positif}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={data.positif}
                    onChange={(e) => handleChange(plat.key, 'positif', parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 rounded"
                  />
                </div>

                {/* Negatif */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className={`text-[11px] font-semibold flex items-center gap-1 ${plat.key === 'TikTok' ? 'text-rose-300' : 'text-rose-700'}`}>
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      Negatif
                    </label>
                    <span className={`text-[11px] font-bold ${plat.key === 'TikTok' ? 'text-rose-300' : 'text-rose-700'}`}>{data.negatif}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={data.negatif}
                    onChange={(e) => handleChange(plat.key, 'negatif', parseInt(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer h-1.5 rounded"
                  />
                </div>

                {/* Netral */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className={`text-[11px] font-semibold flex items-center gap-1 ${plat.key === 'TikTok' ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                      Netral
                    </label>
                    <span className={`text-[11px] font-bold ${plat.key === 'TikTok' ? 'text-slate-300' : 'text-slate-600'}`}>{data.netral}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={data.netral}
                    onChange={(e) => handleChange(plat.key, 'netral', parseInt(e.target.value))}
                    className="w-full accent-slate-600 cursor-pointer h-1.5 rounded"
                  />
                </div>
              </div>

              {/* Total Badge */}
              <div className={`flex items-center justify-between pt-1 border-t ${plat.key === 'TikTok' ? 'border-slate-700' : 'border-slate-100'}`}>
                <span className={`text-[10px] ${plat.key === 'TikTok' ? 'text-slate-400' : 'text-slate-400'}`}>Total:</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    data.positif + data.negatif + data.netral === 100
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border border-amber-200'
                  }`}
                >
                  {data.positif + data.negatif + data.netral}%
                  {data.positif + data.negatif + data.netral === 100 ? ' ✓' : ' (Diseimbangkan otomatis)'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Note */}
      <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
        Konfigurasi ini mempengaruhi tampilan distribusi sentimen di Dashboard Donut Chart dan KPI card. Nilai disimpan di browser lokal dan tidak mempengaruhi database Supabase.
      </p>
    </div>
  )
}
