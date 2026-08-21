"use client"

import { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, FileText, Zap, Users, Percent, ArrowRight,
  Clock, CheckCircle2, AlertTriangle, XCircle, Minus, Share2, Eye,
  Sparkles, Lightbulb, Wallet, ChevronRight,
} from 'lucide-react'
import { motion } from 'motion/react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp, type SavedProject } from '@/lib/store'
import { useTier } from '@/lib/store'
import { CASES_PER_MONTH } from '@/lib/entitlement'
import { CountUp } from '@/components/orbit/count-up'
import { StatusPill } from '@/components/status-pill'
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

const VERDICT_META = {
  build: {
    label: 'BUILD',
    icon: CheckCircle2,
    text: 'text-success',
    bg: 'bg-success/10',
    bar: 'bg-success',
    dot: 'bg-success',
    pill: 'build' as const,
  },
  consider: {
    label: 'CONSIDER',
    icon: AlertTriangle,
    text: 'text-warning',
    bg: 'bg-warning/10',
    bar: 'bg-warning',
    dot: 'bg-warning',
    pill: 'consider' as const,
  },
  dont_build: {
    label: "DON'T BUILD",
    icon: XCircle,
    text: 'text-critical',
    bg: 'bg-critical/10',
    bar: 'bg-critical',
    dot: 'bg-critical',
    pill: 'dont_build' as const,
  },
}

// ─── Metric Card (Pulse-style: icon pill, trend badge, big value) ────────────

interface MetricCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  trendGood?: boolean
  icon: typeof FileText
  accentColor?: 'brand' | 'success' | 'warning' | 'critical'
}

function MetricCard({
  label, value, prefix = '', suffix = '', decimals = 0,
  trend, trendValue, trendGood, icon: Icon, accentColor = 'brand',
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const iconColors: Record<string, string> = {
    brand: 'text-brand',
    success: 'text-success',
    warning: 'text-warning',
    critical: 'text-critical',
  }
  const pillBg: Record<string, string> = {
    brand: 'bg-brand/8',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    critical: 'bg-critical/10',
  }
  const trendColor =
    trendGood === undefined ? 'text-ink-muted' : trendGood ? 'text-success' : 'text-critical'

  return (
    <div className="bg-surface-raised rounded-xl border border-border/50 p-5 transition-shadow hover:shadow-quiet">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-lg', pillBg[accentColor])}>
          <Icon className={cn('w-4 h-4', iconColors[accentColor])} strokeWidth={1.5} />
        </div>
        {trend && trendValue ? (
          <span className={cn('flex items-center gap-1 text-[11px] font-medium', trendColor)}>
            <TrendIcon className="w-3 h-3" />
            {trendValue}
          </span>
        ) : null}
      </div>
      <div className="mb-1.5">
        <CountUp
          end={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="text-[26px] font-semibold text-ink font-mono tracking-tight leading-none"
        />
      </div>
      <p className="text-[11px] font-medium text-ink-muted/70 uppercase tracking-wider">{label}</p>
    </div>
  )
}

// ─── Chart Tooltip ───────────────────────────────────────────────────────────

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
      className="bg-surface-raised p-3 rounded-lg shadow-floating border border-border"
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

// ─── Cases Over Time Chart ───────────────────────────────────────────────────

function CasesOverTimeChart({ projects }: { projects: SavedProject[] }) {
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; build: number; consider: number; dont_build: number }> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months[key] = { month: d.toLocaleString('default', { month: 'short' }), build: 0, consider: 0, dont_build: 0 }
    }
    for (const p of projects) {
      const d = new Date(p.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (months[key]) months[key][p.recommendation]++
    }
    return Object.values(months)
  }, [projects])

  const totalInWindow = monthlyData.reduce((s, m) => s + m.build + m.consider + m.dont_build, 0)

  return (
    <div className="bg-surface-raised rounded-xl border border-border/50 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-medium text-ink">Case verdicts over time</h3>
          <p className="text-[11px] text-ink-muted/60 mt-0.5">6-month breakdown by decision</p>
        </div>
        <div className="flex items-center gap-3">
          {(['build', 'consider', 'dont_build'] as const).map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className={cn('w-1.5 h-1.5 rounded-full', VERDICT_META[k].dot)} />
              <span className="text-[11px] text-ink-muted/70">{VERDICT_META[k].label.charAt(0) + VERDICT_META[k].label.slice(1).toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBuild" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConsider" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDontBuild" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dx={-4} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="build" stroke="#34d399" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBuild)" name="Build" dot={false} animationDuration={600} />
            <Area type="monotone" dataKey="consider" stroke="#fbbf24" strokeWidth={1.5} fillOpacity={1} fill="url(#colorConsider)" name="Consider" dot={false} animationDuration={600} />
            <Area type="monotone" dataKey="dont_build" stroke="#f87171" strokeWidth={1.5} fillOpacity={1} fill="url(#colorDontBuild)" name="Don't Build" dot={false} animationDuration={600} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {totalInWindow === 0 && (
        <p className="text-[11px] text-ink-muted/50 mt-3 text-center">
          No cases in the last 6 months yet. Run your first analysis to populate the trend.
        </p>
      )}
    </div>
  )
}

// ─── Verdict Distribution Panel ──────────────────────────────────────────────

function VerdictDistribution({ metrics }: { metrics: ReturnType<typeof computeMetrics> }) {
  const items = [
    { key: 'build' as const, count: metrics.buildCount },
    { key: 'consider' as const, count: metrics.considerCount },
    { key: 'dont_build' as const, count: metrics.dontBuildCount },
  ]
  return (
    <div className="bg-surface-raised rounded-xl border border-border/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-brand/8 flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 text-brand" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-[13px] font-medium text-ink">Verdict distribution</h3>
          <p className="text-[11px] text-ink-muted/60">Across all {metrics.total} cases</p>
        </div>
      </div>
      <div className="space-y-4">
        {items.map(({ key, count }) => {
          const meta = VERDICT_META[key]
          const Icon = meta.icon
          const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-3.5 h-3.5', meta.text)} strokeWidth={1.5} />
                  <span className="text-[12.5px] font-medium text-ink">{meta.label.charAt(0) + meta.label.slice(1).toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-mono text-ink-muted/70">{count}</span>
                  <span className="text-[11px] font-mono text-ink-faint">{pct}%</span>
                </div>
              </div>
              <div className="h-[4px] bg-surface rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', meta.bar)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Usage Meter (entitlement + cases used this period) ──────────────────────

function UsageMeter({ casesThisMonth, tier }: { casesThisMonth: number; tier: string }) {
  const limit = (CASES_PER_MONTH as Record<string, number>)[tier] ?? 1
  const isUnlimited = !Number.isFinite(limit)
  const used = Math.min(casesThisMonth, isUnlimited ? casesThisMonth : limit)
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const isFree = tier === 'free'
  const now = new Date()
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const resetLabel = resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="bg-surface-raised rounded-xl border border-border/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-brand/8 flex items-center justify-center">
          <Wallet className="w-3.5 h-3.5 text-brand" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-medium text-ink">Usage this period</h3>
          <p className="text-[11px] text-ink-muted/60">
            {tier.charAt(0).toUpperCase() + tier.slice(1)} plan · {isUnlimited ? 'unlimited' : `${used} of ${limit}`} cases
          </p>
        </div>
        <StatusPill variant={isFree ? 'draft' : 'paid'}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </StatusPill>
      </div>

      {!isUnlimited ? (
        <>
          <div className="h-[6px] bg-surface rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={cn('h-full rounded-full', pct >= 100 ? 'bg-critical' : pct >= 75 ? 'bg-warning' : 'bg-brand')}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-ink-muted/60">
            <span>{used} used</span>
            <span>Resets {resetLabel}</span>
          </div>
        </>
      ) : (
        <p className="text-[12px] text-ink-muted/60">{used} cases this month. No cap on your plan.</p>
      )}

      {isFree && (
        <button
          onClick={() => useApp.getState().go('pricing')}
          className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium text-canvas bg-brand hover:bg-brand/90 rounded-lg transition-colors"
        >
          Upgrade to Pro
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── Contextual Tip (right-rail explainer) ───────────────────────────────────

function DecisionTip() {
  return (
    <div className="bg-surface-analytical rounded-xl border border-surface-analytical-border p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg bg-brand/8 flex items-center justify-center">
          <Lightbulb className="w-3.5 h-3.5 text-brand" strokeWidth={1.5} />
        </div>
        <h3 className="text-[13px] font-medium text-ink">How Viableo decides</h3>
      </div>
      <p className="text-[12.5px] text-ink-muted leading-relaxed mb-3">
        The conservative scenario is the floor. If even the floor pays back inside
        12 months and confidence is at least 60, the model says BUILD.
      </p>
      <div className="flex flex-col gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-ink-muted"><span className="text-success font-medium">BUILD</span> — floor pays back ≤ 12mo, confidence ≥ 60</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-warning" />
          <span className="text-ink-muted"><span className="text-warning font-medium">CONSIDER</span> — expected pays back, floor does not</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-critical" />
          <span className="text-ink-muted"><span className="text-critical font-medium">DON&apos;T BUILD</span> — expected case does not pay back</span>
        </div>
      </div>
      <a
        href="/methodology"
        className="mt-4 inline-flex items-center gap-1 text-[11px] text-brand hover:text-brand/80 transition-colors"
      >
        Read the full methodology
        <ArrowRight className="w-3 h-3" />
      </a>
    </div>
  )
}

// ─── Metrics computation ─────────────────────────────────────────────────────

function computeMetrics(projects: SavedProject[]) {
  const total = projects.length
  const buildCount = projects.filter(p => p.recommendation === 'build').length
  const considerCount = projects.filter(p => p.recommendation === 'consider').length
  const dontBuildCount = projects.filter(p => p.recommendation === 'dont_build').length
  const sharedCount = projects.filter(p => p.shareEngagement && p.shareEngagement.viewCount > 0).length
  const totalViews = projects.reduce((sum, p) => sum + (p.shareEngagement?.viewCount ?? 0), 0)
  const buildRate = total > 0 ? Math.round((buildCount / total) * 100) : 0

  // Cases this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const casesThisMonth = projects.filter(p => new Date(p.createdAt) >= monthStart).length

  // Approval rate (from share decisionState)
  const shared = projects.filter(p => p.shareEngagement)
  const approved = shared.filter(p => p.shareEngagement?.decisionState === 'approved').length
  const approvalRate = shared.length > 0 ? Math.round((approved / shared.length) * 100) : 0

  // Last 7 days new cases
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const newThisWeek = projects.filter(p => new Date(p.createdAt) >= weekAgo).length

  return {
    total, buildCount, considerCount, dontBuildCount,
    sharedCount, totalViews, buildRate, casesThisMonth, approvalRate, newThisWeek,
  }
}

// ─── Main Dashboard View ─────────────────────────────────────────────────────

export function DashboardView() {
  const { projects, go, startCalculator, reopenProject } = useApp()
  const tier = useTier()
  const [loading, setLoading] = useState(true)

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

  const metrics = useMemo(() => computeMetrics(projects), [projects])
  const recentCases = useMemo(() =>
    [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6)
  , [projects])

  const handleCaseClick = async (id: string) => {
    const ok = await reopenProject(id)
    if (!ok) go('projects')
  }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto w-full">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-surface-raised" />
            <div className="h-4 w-56 animate-pulse rounded bg-surface-raised" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="p-5 bg-surface-raised rounded-xl border border-border/50 space-y-3">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-surface" />
              <div className="h-7 w-20 animate-pulse rounded bg-surface" />
              <div className="h-3 w-16 animate-pulse rounded bg-surface" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          <div className="h-[340px] bg-surface-raised rounded-xl border border-border/50 animate-pulse" />
          <div className="h-[340px] bg-surface-raised rounded-xl border border-border/50 animate-pulse" />
        </div>
      </div>
    )
  }

  // ── Empty state ──
  if (projects.length === 0) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto w-full">
        <DashboardHeader tier={tier} metrics={metrics} onNewCase={() => startCalculator()} />
        <div className="mt-10">
          <EmptyCasesState onNewCase={() => startCalculator()} onSeeExample={() => {
            window.location.href = '/start?start=1&example=apex'
          }} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto w-full">
      <DashboardHeader tier={tier} metrics={metrics} onNewCase={() => startCalculator()} />

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Cases this month"
          value={metrics.casesThisMonth}
          trend={metrics.newThisWeek > 0 ? 'up' : 'neutral'}
          trendValue={metrics.newThisWeek > 0 ? `+${metrics.newThisWeek}` : undefined}
          trendGood={metrics.newThisWeek > 0}
          icon={FileText}
          accentColor="brand"
        />
        <MetricCard
          label="BUILD rate"
          value={metrics.buildRate}
          suffix="%"
          trend={metrics.buildRate >= 50 ? 'up' : 'down'}
          trendValue={`${metrics.buildCount} cases`}
          trendGood={metrics.buildRate >= 50}
          icon={Zap}
          accentColor={metrics.buildRate >= 50 ? 'success' : 'warning'}
        />
        <MetricCard
          label="Client docs shared"
          value={metrics.sharedCount}
          trend={metrics.sharedCount > 0 ? 'up' : 'neutral'}
          trendValue={metrics.totalViews > 0 ? `${metrics.totalViews} views` : undefined}
          trendGood={metrics.sharedCount > 0}
          icon={Share2}
          accentColor="brand"
        />
        <MetricCard
          label="Approval rate"
          value={metrics.approvalRate}
          suffix="%"
          trend={metrics.approvalRate >= 50 ? 'up' : 'neutral'}
          trendValue={metrics.sharedCount > 0 ? `${metrics.sharedCount} shared` : 'no shares'}
          trendGood={metrics.approvalRate >= 50}
          icon={Percent}
          accentColor={metrics.approvalRate >= 50 ? 'success' : 'warning'}
        />
      </div>

      {/* ── Main grid: chart + distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <CasesOverTimeChart projects={projects} />
        <div className="flex flex-col gap-4">
          <VerdictDistribution metrics={metrics} />
          <DecisionTip />
        </div>
      </div>

      {/* ── Usage + Recent cases ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <UsageMeter casesThisMonth={metrics.casesThisMonth} tier={tier} />
        <RecentCases cases={recentCases} onCaseClick={handleCaseClick} onNewCase={() => startCalculator()} total={metrics.total} />
      </div>
    </div>
  )
}

// ─── Dashboard Header ─────────────────────────────────────────────────────────

function DashboardHeader({ tier, metrics, onNewCase }: { tier: string; metrics: ReturnType<typeof computeMetrics>; onNewCase: () => void }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Overview</h1>
          <StatusPill variant={tier === 'free' ? 'draft' : 'paid'}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </StatusPill>
        </div>
        <p className="text-[13px] text-ink-muted/70">
          {metrics.total > 0
            ? `${metrics.total} cases · ${metrics.buildCount} build · ${metrics.sharedCount} shared`
            : 'Your automation ROI case portfolio'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-ink-muted/50">
          <Clock className="w-3 h-3" />
          Updated just now
        </span>
        <button
          onClick={onNewCase}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-canvas bg-brand hover:bg-brand/90 rounded-lg transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          New Case
        </button>
      </div>
    </div>
  )
}

// ─── Recent Cases ────────────────────────────────────────────────────────────

function RecentCases({ cases, onCaseClick, onNewCase, total }: { cases: SavedProject[]; onCaseClick: (id: string) => void; onNewCase: () => void; total: number }) {
  return (
    <div className="bg-surface-raised rounded-xl border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand/8 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-[13px] font-medium text-ink">Recent cases</h3>
            <p className="text-[11px] text-ink-muted/60">Latest ROI analyses</p>
          </div>
        </div>
        {total > 6 && (
          <button
            onClick={() => useApp.getState().go('projects')}
            className="text-[11px] text-ink-muted/60 hover:text-ink flex items-center gap-1 h-7 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {cases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {cases.map((c) => {
            const meta = VERDICT_META[c.recommendation]
            const Icon = meta.icon
            const hasShare = c.shareEngagement && c.shareEngagement.viewCount > 0
            const views = c.shareEngagement?.viewCount ?? 0
            const decision = c.shareEngagement?.decisionState
            return (
              <button
                key={c.id}
                onClick={() => onCaseClick(c.id)}
                className="p-3 bg-surface/60 rounded-lg hover:bg-surface hover:border-border/80 border border-transparent transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className={cn('w-2 h-2 rounded-full shrink-0', meta.dot)} />
                    <span className="text-[12.5px] font-medium text-ink truncate group-hover:text-brand transition-colors">
                      {c.clientName || 'Untitled case'}
                    </span>
                  </div>
                  <Icon className={cn('w-3.5 h-3.5 shrink-0', meta.text)} strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-between">
                  <StatusPill variant={meta.pill}>
                    {meta.label.charAt(0) + meta.label.slice(1).toLowerCase()}
                  </StatusPill>
                  <span className="text-[10px] font-mono text-ink-muted/40">
                    {formatRelativeTime(c.updatedAt)}
                  </span>
                </div>
                {hasShare && (
                  <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-ink-muted/60">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {views} {views === 1 ? 'view' : 'views'}
                    </span>
                    {decision && decision !== 'sent' && (
                      <span className={cn(
                        'font-medium',
                        decision === 'approved' && 'text-success',
                        decision === 'changes_requested' && 'text-warning',
                        decision === 'viewed' && 'text-ink-muted',
                      )}>
                        {decision === 'approved' ? 'Approved' : decision === 'changes_requested' ? 'Changes requested' : decision === 'viewed' ? 'Viewed' : decision}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-[13px] text-ink-muted/60 mb-3">No cases yet. Start your first analysis.</p>
          <button
            onClick={onNewCase}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-canvas bg-brand hover:bg-brand/90 rounded-lg transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Run Your First Case
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Empty State (no cases) ─────────────────────────────────────────────────

function EmptyCasesState({ onNewCase, onSeeExample }: { onNewCase: () => void; onSeeExample: () => void }) {
  return (
    <div className="bg-surface-raised rounded-xl border border-border/50 p-10 max-w-2xl mx-auto text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand/8 flex items-center justify-center mx-auto mb-5">
        <Sparkles className="w-6 h-6 text-brand" strokeWidth={1.5} />
      </div>
      <h2 className="text-[18px] font-semibold text-ink mb-2">No cases yet.</h2>
      <p className="text-[14px] text-ink-muted/70 max-w-md mx-auto leading-relaxed mb-6">
        Run your first analysis — free. The math is the same one we publish on the
        Methodology page. Hours, rates, volumes, a fee — and a verdict.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onNewCase}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-medium text-canvas bg-brand hover:bg-brand/90 rounded-lg transition-colors w-full sm:w-auto justify-center"
        >
          <Zap className="w-4 h-4" />
          Run Your First Case
        </button>
        <button
          onClick={onSeeExample}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-medium text-ink-muted hover:text-ink border border-border hover:border-border/80 rounded-lg transition-colors w-full sm:w-auto justify-center"
        >
          <Eye className="w-4 h-4" />
          See a Completed Example
        </button>
      </div>
      <div className="mt-8 pt-6 border-t border-border/40 grid grid-cols-3 gap-4 text-left max-w-md mx-auto">
        <div>
          <div className="text-[11px] font-medium text-ink-faint uppercase tracking-wider mb-1">3 scenarios</div>
          <p className="text-[11px] text-ink-muted/60">Conservative, Expected, Upside</p>
        </div>
        <div>
          <div className="text-[11px] font-medium text-ink-faint uppercase tracking-wider mb-1">Confidence</div>
          <p className="text-[11px] text-ink-muted/60">0–100, transparent</p>
        </div>
        <div>
          <div className="text-[11px] font-medium text-ink-faint uppercase tracking-wider mb-1">Verdict</div>
          <p className="text-[11px] text-ink-muted/60">BUILD · CONSIDER · DON&apos;T</p>
        </div>
      </div>
    </div>
  )
}
