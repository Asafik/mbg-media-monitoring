import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { KeywordCloud } from './components/KeywordCloud'
import { KpiCards } from './components/KpiCards'
import { Sidebar } from './components/Sidebar'
import { TopContentSection } from './components/TopContentSection'
import { TopicBreakdown } from './components/TopicBreakdown'
import { PlatformBarChart } from './components/charts/PlatformBarChart'
import { SentimentDonutChart } from './components/charts/SentimentDonutChart'
import { SentimentTrendChart } from './components/charts/SentimentTrendChart'
import { useDashboardData } from './hooks/useDashboardData'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CommentsPage } from './pages/CommentsPage'
import { ContentPage } from './pages/ContentPage'
import { KeywordsPage } from './pages/KeywordsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TopicsPage } from './pages/TopicsPage'

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Two-way sync between URL hash and active menu
  useEffect(() => {
    const syncWithHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').toLowerCase()
      if (['dashboard', 'konten', 'komentar', 'analisis', 'topik', 'keyword', 'laporan', 'pengaturan'].includes(hash)) {
        setActiveMenu(hash)
      } else if (!hash) {
        setActiveMenu('dashboard')
      }
    }

    syncWithHash()
    window.addEventListener('hashchange', syncWithHash)
    return () => window.removeEventListener('hashchange', syncWithHash)
  }, [])

  const handleSelectMenu = (menu: string) => {
    setActiveMenu(menu)
    window.location.hash = `/${menu}`
  }

  // Isolated data management via custom hook
  const {
    data,
    selectedPeriod,
    isRefreshing,
    handlePeriodChange,
    refreshData,
  } = useDashboardData()

  const renderActivePage = () => {
    switch (activeMenu) {
      case 'konten':
        return <ContentPage />
      case 'komentar':
        return <CommentsPage />
      case 'analisis':
        return <AnalyticsPage />
      case 'topik':
        return <TopicsPage />
      case 'keyword':
        return <KeywordsPage />
      case 'laporan':
        return <ReportsPage />
      case 'pengaturan':
        return <SettingsPage />
      case 'dashboard':
      default:
        return (
          <div className="space-y-5">
            {/* Dashboard Title & Subtitle */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                Dashboard
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ringkasan percakapan publik tentang Makan Bergizi Gratis (MBG) dari berbagai platform sosial media.
              </p>
            </div>

            {/* Row 1: KPI Summary Cards */}
            <KpiCards items={data.kpiList} />

            {/* Row 2: Charts Row (Tren Sentimen, Distribusi Sentimen, Jumlah Konten) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 h-[230px]">
                <SentimentTrendChart data={data.sentimentTrends} />
              </div>
              <div className="lg:col-span-4 h-[230px]">
                <SentimentDonutChart
                  data={data.sentimentDistributions}
                  totalCount={data.totalCommentsCount}
                />
              </div>
              <div className="lg:col-span-3 h-[230px]">
                <PlatformBarChart data={data.platformCounts} />
              </div>
            </div>

            {/* Row 3: Top 5 Konten per Platform */}
            <TopContentSection
              youtube={data.contentsByPlatform.youtube}
              tiktok={data.contentsByPlatform.tiktok}
              instagram={data.contentsByPlatform.instagram}
              facebook={data.contentsByPlatform.facebook}
            />

            {/* Row 4: Topik yang Sering Dibahas & Keyword Populer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
              <div className="min-h-[260px]">
                <TopicBreakdown topics={data.topics} />
              </div>
              <div className="min-h-[260px]">
                <KeywordCloud keywords={data.keywords} />
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex antialiased text-slate-900 font-sans">
      {/* Sticky & Responsive Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        onSelectMenu={handleSelectMenu}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Period Filter & Mobile Menu Trigger */}
        <Header
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          onRefresh={refreshData}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          isRefreshing={isRefreshing}
        />

        {/* Dynamic Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  )
}

export default App
