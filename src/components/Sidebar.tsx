import {
  ChevronDown,
  ChevronRight,
  FileBarChart,
  FileText,
  Info,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  PieChart,
  Settings,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

interface SidebarProps {
  activeMenu: string
  onSelectMenu: (menu: string) => void
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onSelectMenu,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'konten', label: 'Konten', icon: FileText },
    { id: 'komentar', label: 'Komentar', icon: MessageSquare },
    { id: 'analisis', label: 'Analisis', icon: TrendingUp },
    { id: 'topik', label: 'Topik', icon: PieChart },
    { id: 'keyword', label: 'Keyword', icon: KeyRound },
    { id: 'sumber', label: 'Target Akun IG', icon: Users },
    { id: 'laporan', label: 'Laporan', icon: FileBarChart },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ]

  const settingsSubItems = [
    { id: 'pengaturan-koneksi', label: 'Koneksi & API' },
    { id: 'pengaturan-akun', label: 'Target Akun' },
    { id: 'pengaturan-keyword', label: 'Kata Kunci' },
    { id: 'pengaturan-lainnya', label: 'Lainnya (Sistem & Cache)' },
  ]

  const handleItemClick = (id: string) => {
    onSelectMenu(id)
    onCloseMobile?.()
  }

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full overflow-y-auto select-none">
      {/* Brand / Logo */}
      <div>
        <div className="p-5 pb-6 border-b border-[#243248] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-emerald-400"
              >
                <path d="M7 20h10" />
                <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z" />
                <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4.3 1-4.9 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-base tracking-tight flex items-center gap-1.5">
                MBG Monitor
              </h1>
              <p className="text-[10.5px] text-slate-400 font-medium">Pantau Opini, Dukung Informasi</p>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isPengaturan = item.id === 'pengaturan'
            const isPengaturanActive = activeMenu.startsWith('pengaturan')
            const isActive = isPengaturan ? isPengaturanActive : activeMenu === item.id

            if (isPengaturan) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen((prev) => !prev)
                      if (!activeMenu.startsWith('pengaturan')) {
                        handleItemClick('pengaturan-koneksi')
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                      isActive && !isSettingsOpen
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : isActive
                        ? 'bg-[#202d42] text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#202d42]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isSettingsOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {/* Sub-menu items under Pengaturan */}
                  {isSettingsOpen && (
                    <div className="pl-3 pr-1 py-1 space-y-1 border-l border-slate-700/60 ml-5 animate-in fade-in duration-150">
                      {settingsSubItems.map((sub) => {
                        const isSubActive =
                          activeMenu === sub.id ||
                          (activeMenu === 'pengaturan' && sub.id === 'pengaturan-koneksi')
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleItemClick(sub.id)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all text-left cursor-pointer ${
                              isSubActive
                                ? 'bg-[#2563eb] text-white font-semibold shadow-xs'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-[#202d42]'
                            }`}
                          >
                            <ChevronRight
                              className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                                isSubActive ? 'text-white translate-x-0.5' : 'text-slate-500'
                              }`}
                            />
                            <span className="truncate">{sub.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#202d42]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Beta Card Footer */}
      <div className="p-4 mt-auto">
        <div className="p-3 rounded-lg bg-[#131c2a] border border-[#243248] text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold mb-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Versi Beta</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Data diambil dari konten publik. Bukan representasi resmi.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#182334] text-slate-300 flex-col shrink-0 sticky top-0 h-screen border-r border-[#243248] z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-[#182334] text-slate-300 z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl border-r border-[#243248] ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  )
}
