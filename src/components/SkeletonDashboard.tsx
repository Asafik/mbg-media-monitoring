import React from 'react'

const Bone: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <div className={`skeleton ${className}`} style={style} />
)

const KpiCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between min-h-[110px]">
    <div className="flex items-center gap-3">
      <Bone className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone className="h-3.5 w-24" />
        <Bone className="h-7 w-20" />
      </div>
    </div>
    <div className="mt-3 pt-2 border-t border-slate-100">
      <Bone className="h-3 w-32" />
    </div>
  </div>
)

const ChartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg p-5 border border-slate-200 shadow-xs flex flex-col gap-4 ${className}`}>
    <div className="flex items-center justify-between">
      <Bone className="h-4 w-40" />
      <Bone className="h-4 w-16" />
    </div>
    <div className="flex-1 flex items-end gap-2" style={{ minHeight: '140px' }}>
      {[55, 80, 45, 70, 60, 90, 50].map((h, i) => (
        <Bone key={i} className="flex-1 rounded-sm" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
)

const ContentCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs space-y-3">
    <Bone className="h-4 w-32" />
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-3 items-start">
        <Bone className="w-12 h-12 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Bone className="h-3.5" style={{ width: '100%' }} />
          <Bone className="h-3" style={{ width: '75%' }} />
          <Bone className="h-3" style={{ width: '50%' }} />
        </div>
      </div>
    ))}
  </div>
)

export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-5">
    <div className="space-y-2">
      <Bone className="h-7 w-36" />
      <Bone className="h-4 w-80" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => <KpiCardSkeleton key={i} />)}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <ChartSkeleton className="lg:col-span-5 min-h-[255px]" />
      <ChartSkeleton className="lg:col-span-4 min-h-[255px]" />
      <ChartSkeleton className="lg:col-span-3 min-h-[255px]" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => <ContentCardSkeleton key={i} />)}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
      <ChartSkeleton className="min-h-[260px]" />
      <ChartSkeleton className="min-h-[260px]" />
    </div>
  </div>
)
