import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { ArrowRight, Copy, ExternalLink, MoreVertical, Star } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import type { PlatformContentItem } from '../types/dashboard'

interface TopContentSectionProps {
  youtube: PlatformContentItem[]
  tiktok: PlatformContentItem[]
  instagram: PlatformContentItem[]
  facebook: PlatformContentItem[]
}

// Social Media SVG Logos (Sized w-8 h-8 matching reference)
const YouTubeIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-[#ef4444] flex items-center justify-center text-white shrink-0 shadow-xs">
    <FontAwesomeIcon icon={faYoutube} className="text-base text-white" />
  </div>
)

const TikTokIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0 shadow-xs">
    <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.27 6.27 0 0 0 1.86-4.46V8.78a8.16 8.16 0 0 0 4.92 1.63V6.96a4.85 4.85 0 0 1-1-.27z" />
    </svg>
  </div>
)

const InstagramIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
    <FontAwesomeIcon icon={faInstagram} className="text-base text-white" />
  </div>
)

const FacebookIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-[#1877f2] flex items-center justify-center text-white shrink-0 shadow-xs">
    <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  </div>
)

export const TopContentSection: React.FC<TopContentSectionProps> = ({
  youtube,
  tiktok,
  instagram,
  facebook,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  const renderPlatformColumn = (
    platformName: string,
    icon: React.ReactNode,
    items: PlatformContentItem[],
  ) => {
    return (
      <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs flex flex-col justify-between">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {icon}
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-base font-bold text-slate-900 leading-tight">
                  {platformName}
                </h4>
                {platformName === 'YouTube' ? (
                  <span className="text-[10.5px] font-bold text-red-600 bg-red-50 border border-red-200/80 px-1.5 py-0.5 rounded">
                    Live API
                  </span>
                ) : platformName === 'Instagram' ? (
                  <span className="text-[10.5px] font-bold text-fuchsia-600 bg-fuchsia-50 border border-fuchsia-200 px-1.5 py-0.5 rounded">
                    Live Scraper
                  </span>
                ) : (
                  <span className="text-[10.5px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    Demo
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {platformName === 'YouTube'
                  ? 'Video Isu Kritis Terpantau'
                  : platformName === 'Instagram'
                  ? 'Postingan Isu Media Terpantau'
                  : 'Top 5 dari 7 hari terakhir'}
              </span>
            </div>
          </div>
        </div>

        {/* List of 5 items */}
        <div className="space-y-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 group hover:bg-slate-50/80 p-1 rounded-lg transition-colors"
            >
              {/* Rank */}
              <span className="text-sm font-bold text-slate-700 w-3.5 pt-0.5 shrink-0 text-center">
                {item.rank}
              </span>

              {/* Thumbnail */}
              <div className="relative w-16 h-10 rounded overflow-hidden bg-slate-200 shrink-0 border border-slate-200/80 shadow-xs">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src =
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="45" viewBox="0 0 60 45" fill="%23e2e8f0"><rect width="60" height="45" fill="%23cbd5e1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="9" fill="%2364748b">MBG</text></svg>'
                  }}
                />
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-1">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 hover:underline transition-colors block"
                    title={`Buka di ${platformName}`}
                  >
                    {item.title}
                  </a>
                ) : (
                  <h5 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h5>
                )}
                <div className="text-[11px] text-slate-500 mt-1 leading-tight flex flex-wrap items-center gap-1 font-medium">
                  <span>{item.views}</span>
                  <span>•</span>
                  <span>{item.comments}</span>
                </div>
                <div className="text-[10.5px] text-slate-400 mt-0.5">
                  {item.timeAgo}
                </div>
              </div>

              {/* 3 Dots button + Dropdown */}
              <div className="relative shrink-0" ref={openMenuId === item.id ? menuRef : undefined}>
                <button
                  type="button"
                  onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                  className="text-slate-300 hover:text-slate-600 p-0.5 rounded transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {openMenuId === item.id && (
                  <div className="absolute right-0 top-6 z-50 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setOpenMenuId(null)}
                        className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">Buka Konten</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (item.url) navigator.clipboard.writeText(item.url)
                        setOpenMenuId(null)
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">Salin Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(null)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">Tandai Penting</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Title & View All */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Top 5 Konten per Platform
        </h3>
        <button
          type="button"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>Lihat Semua Konten</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {renderPlatformColumn('YouTube', <YouTubeIcon />, youtube)}
        {renderPlatformColumn('TikTok', <TikTokIcon />, tiktok)}
        {renderPlatformColumn('Instagram', <InstagramIcon />, instagram)}
        {renderPlatformColumn('Facebook', <FacebookIcon />, facebook)}
      </div>
    </div>
  )
}
