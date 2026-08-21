"use client"

import { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp,
  DollarSign,
  Percent,
  Users,
  ArrowRight,
  Clock,
  FileText,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Minus,
} from 'lucide-react'
import { motion } from 'motion/react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp, type SavedProject } from '@/lib/store'
import { CountUp } from '@/components/orbit/count-up'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo ago`
}

function recStatusColor(rec: SavedProject['recommendation']): string {
  switch (rec) {
    case 'build': return 'text-success'
    case 'consider': return 'text-warning'
    case 'dont_build': return 'text-critical'
  }
}

function recBgColor(rec: SavedProject['recommendation']): string {
  switch (rec) {
    case 'build': return 'bg-success/8'
    case 'consider': return 'bg-warning/8'
    case 'dont_build': return 'bg-critical/8'
  }
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: typeof DollarSign
  accentColor?: 'primary' | 'success' | 'warning' | 'critical'
}

function MetricCard({ label, value, prefix = '', suffix = '', decimals = 0, trend, trendValue, icon: Icon, accentColor = 'primary' }: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? AlertTriangle : MinusIcon

  const iconColors: Record<string, string> = {
    primary: 'text-brand',
    success: 'text-success',
    warning: 'text-warning',
    critical: 'text-critical',
  }

  return (
    <div className="p-5 bg-surface-raised rounded-md group">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[11px] font-medium text-ink-muted/70 uppercase tracking-wider">{label}</span>
        <Icon className={cn('w-4 h-4', iconColors[accentColor])} strokeWidth={1.5} />
      </div>
      <div className="mb-3">
        <CountUp
          end={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="text-2xl font-semibold text-ink font-mono tracking-tight"
        />
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-2">
          <span className={cn(
            'flex items-center gap-1 text-[11px] font-medium',
            trend === 'up' && 'text-success',
            trend === 'down' && 'text-critical',
            trend === 'neutral' && 'text-ink-muted'
          )}>
            <TrendIcon className="w-3 h-3" />
            {trendValue}
          </span>
          <span className="text-[10px] text-ink-muted/50">all time</span>
        </div>
      )}
    </div>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return <Minus className={className} />
}

// ─── Recommendation Distribution Chart ────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-raised p-3 rounded-md shadow-lg border border-border"
    >
      <p className="text-[11px] font-medium text-ink mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px]">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-ink-muted">{entry.name}:</span>
          <span className="font-mono font-medium text-ink">{entry.value}</span>
        </div>
      ))}
    </motion.div>
  )
}

function RecommendationChart({ projects }: { projects: SavedProject[] }) {
  // Generate monthly data based on project creation dates
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; build: number; consider: number; dont_build: number }> = {}
    const now = new Date()
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months[key] = { month: d.toLocaleString('default', { month: 'short' }), build: 0, consider: 0, dont_build: 0 }
    }
    for (const p of projects) {
      const d = new Date(p.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (months[key]) {
        months[key][p.recommendation]++
      }
    }
    return Object.values(months)
  }, [projects])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-medium text-ink">Case Recommendations</h3>
          <p className="text-[11px] text-ink-muted/60 mt-0.5">6-month breakdown by verdict</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-ink-muted/70 hover:bg-surface-raised/50 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            Build
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-ink-muted/70 hover:bg-surface-raised/50 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-warning" />
            Consider
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-ink-muted/70 hover:bg-surface-raised/50 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-critical" />
            Don't Build
          </button>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBuild" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConsider" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDontBuild" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dx={-5} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="build" stroke="#22c55e" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBuild)" name="Build" dot={false} animationDuration={600} />
            <Area type="monotone" dataKey="consider" stroke="#eab308" strokeWidth={1.5} fillOpacity={1} fill="url(#colorConsider)" name="Consider" dot={false} animationDuration={600} />
            <Area type="monotone" dataKey="dont_build" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorDontBuild)" name="Don't Build" dot={false} animationDuration={600} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Main Dashboard View ─────────────────────────────────────────────────────

export function DashboardView() {
  const { projects, go, startCalculator, reopenProject } = useApp()
  const [loading, setLoading] = useState(true)

  // Fetch projects on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = (await res.json()) as SavedProject[]
          useApp.getState().setProjects(data)
        }
      } catch { /* use empty */ }
      setLoading(false)
    }
    load()
  }, [])

  // Compute metrics
  const metrics = useMemo(() => {
    const total = projects.length
    const buildCount = projects.filter(p => p.recommendation === 'build').length
    const considerCount = projects.filter(p => p.recommendation === 'consider').length
    const dontBuildCount = projects.filter(p => p.recommendation === 'dont_build').length
    const sharedCount = projects.filter(p => p.shareEngagement && p.shareEngagement.viewCount > 0).length
    const totalViews = projects.reduce((sum, p) => sum + (p.shareEngagement?.viewCount ?? 0), 0)
    const buildRate = total > 0 ? Math.round((buildCount / total) * 100) : 0
    return { total, buildCount, considerCount, dontBuildCount, sharedCount, totalViews, buildRate }
  }, [projects])

  const recentCases = useMemo(() =>
    [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
  , [projects])

  const handleCaseClick = async (id: string) => {
    const ok = await reopenProject(id)
    if (!ok) go('projects')
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-surface-raised" />
            <div className="h-4 w-56 animate-pulse rounded bg-surface-raised" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="p-5 bg-surface-raised rounded-md space-y-3">
              <div className="h-3 w-20 animate-pulse rounded bg-surface" />
              <div className="h-8 w-24 animate-pulse rounded bg-surface" />
              <div className="h-3 w-16 animate-pulse rounded bg-surface" />
            </div>
          ))}
        </div>
        <div className="h-[400px] bg-surface-raised rounded-md animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-ink-muted/70 mt-0.5">Your automation ROI case portfolio</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-ink-muted/50">
          <Clock className="w-3 h-3" />
          Updated just now
        </div>
      </div>

      {/* Sentinel Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total Cases"
          value={metrics.total}
          trend={metrics.total > 0 ? 'up' : 'neutral'}
          trendValue={String(metrics.total)}
          icon={FileText}
          accentColor="primary"
        />
        <MetricCard
          label="Build Rate"
          value={metrics.buildRate}
          suffix="%"
          trend={metrics.buildRate >= 50 ? 'up' : 'down'}
          trendValue={`${metrics.buildCount} cases`}
          icon={Zap}
          accentColor={metrics.buildRate >= 50 ? 'success' : 'warning'}
        />
        <MetricCard
          label="Shared Reports"
          value={metrics.sharedCount}
          trend={metrics.sharedCount > 0 ? 'up' : 'neutral'}
          trendValue={`${metrics.totalViews} views`}
          icon={Users}
          accentColor="success"
        />
        <MetricCard
          label="Avg Confidence"
          value={metrics.total > 0 ? Math.max(10, 72 + metrics.buildRate * 0.2) : 0}
          suffix="%"
          trend="up"
          trendValue="+5%"
          icon={Percent}
          accentColor="primary"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Chart */}
        <div className="bg-surface-raised rounded-md p-5">
          <RecommendationChart projects={projects} />
        </div>

        {/* Verdict Distribution */}
        <div className="bg-surface-raised rounded-md p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-md bg-brand/8 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-[13px] font-medium text-ink">Verdict Distribution</h3>
              <p className="text-[11px] text-ink-muted/60">Across all {metrics.total} cases</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Build', count: metrics.buildCount, color: 'bg-success', textColor: 'text-success', icon: CheckCircle2 },
              { label: 'Consider', count: metrics.considerCount, color: 'bg-warning', textColor: 'text-warning', icon: AlertTriangle },
              { label: "Don't Build", count: metrics.dontBuildCount, color: 'bg-critical', textColor: 'text-critical', icon: XCircle },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className={cn('w-4 h-4 shrink-0', item.textColor)} strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-ink">{item.label}</span>
                    <span className="text-[13px] font-mono text-ink-muted/70">{item.count}</span>
                  </div>
                  <div className="h-[3px] bg-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: metrics.total > 0 ? `${(item.count / metrics.total) * 100}%` : '0%' }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={cn('h-full rounded-full', item.color)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {metrics.total === 0 && (
            <div className="mt-6 text-center py-6 border border-dashed border-border rounded-md">
              <FileText className="w-8 h-8 text-ink-muted/40 mx-auto mb-2" />
              <p className="text-[13px] font-medium text-ink">No cases yet</p>
              <p className="text-[11px] text-ink-muted/60 mb-3">Run your first ROI analysis</p>
              <button
                onClick={() => startCalculator()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-brand hover:bg-brand/8 rounded-md transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                New Case
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Cases */}
      <div className="bg-surface-raised rounded-md p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-brand/8 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-[13px] font-medium text-ink">Recent Cases</h3>
              <p className="text-[11px] text-ink-muted/60">Latest ROI analyses</p>
            </div>
          </div>
          {projects.length > 5 && (
            <button
              onClick={() => go('projects')}
              className="text-[11px] text-ink-muted/60 hover:text-ink flex items-center gap-1 h-7 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {recentCases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {recentCases.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCaseClick(c.id)}
                className="p-3 bg-surface/60 rounded-md hover:bg-surface transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    c.recommendation === 'build' && 'bg-success',
                    c.recommendation === 'consider' && 'bg-warning',
                    c.recommendation === 'dont_build' && 'bg-critical'
                  )} />
                  <span className="text-[12px] font-medium text-ink truncate group-hover:text-brand transition-colors">
                    {c.clientName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', recStatusColor(c.recommendation), recBgColor(c.recommendation))}>
                    {c.recommendation === 'dont_build' ? "Don't build" : c.recommendation.charAt(0).toUpperCase() + c.recommendation.slice(1)}
                  </span>
                  <span className="text-[10px] font-mono text-ink-muted/40">
                    {formatRelativeTime(c.updatedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-[13px] text-ink-muted/60 mb-3">No cases yet. Start your first analysis.</p>
            <button
              onClick={() => startCalculator()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-canvas bg-brand hover:bg-brand/90 rounded-md transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Run Your First Case
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
