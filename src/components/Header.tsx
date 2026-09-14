import { ChevronDown, Menu, RotateCw } from 'lucide-react'
import React, { useState } from 'react'

interface HeaderProps {
  selectedPeriod: string
  onPeriodChange: (period: string) => void
  onRefresh?: () => void
  onToggleMobileMenu?: () => void
  isRefreshing?: boolean
}

export const Header: React.FC<HeaderProps> = ({
  selectedPeriod,
  onPeriodChange,
  onRefresh,
  onToggleMobileMenu,
  isRefreshing = false,
}) => {
  const [internalSpin, setInternalSpin] = useState(false)
  const periods = ['7 Hari Terakhir', '14 Hari Terakhir', '30 Hari Terakhir', 'Hari Ini']

  const handleRefreshClick = () => {
    setInternalSpin(true)
    onRefresh?.()
    setTimeout(() => setInternalSpin(false), 800)
  }

  const spinning = isRefreshing || internalSpin

  return (
    <header className="bg-[#f1f5f9] border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu Trigger + Periode Filter */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Periode Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="period-select" className="text-sm font-semibold text-slate-700 hidden sm:inline">
            Periode
          </label>
          <div className="relative">
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-sm font-semibold text-slate-800 rounded-lg pl-3 pr-8 py-1.5 shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Right: Last Updated Status, Collector Health & Refresh */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden lg:inline">Diperbarui 10:45 WIB</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="hidden sm:inline text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200/60">
            4/4 Collector Sehat
          </span>
          <span className="hidden xl:inline text-slate-300">•</span>
          <span className="hidden xl:inline text-slate-500 text-xs">
            Top 5 × 4 Platform (20 Konten)
          </span>
          <span className="sm:hidden font-medium">10:45 WIB (Sehat)</span>
        </div>

        <button
          type="button"
          onClick={handleRefreshClick}
          title="Segarkan Data"
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs active:scale-95 cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 transition-transform duration-700 ${spinning ? 'rotate-180 animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  )
}
