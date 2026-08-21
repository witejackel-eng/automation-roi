'use client';

/**
 * OverviewContent — the default dashboard section.
 *
 * Pulse-style layout:
 *   1. Four metric cards (icon pill + trend badge + big mono value + label).
 *   2. Stacked verdict-distribution chart (BUILD / CONSIDER / DON'T BUILD)
 *      over the last 6 months — reuses Recharts like the existing dashboard.
 *   3. Verdict distribution summary + decision-tip card (how Viableo decides).
 *   4. Recent cases grid (verdict pill, client name, relative time, share
 *      status) — clicking a case calls reopenProject(id).
 *
 * HONEST METRICS NOTE
 *   The /api/projects list payload returns projects WITHOUT the results JSON
 *   (only id, clientName, recommendation, createdAt, updatedAt, shareEngagement).
 *   So Average ROI (Expected) and Median payback CANNOT be computed from the
 *   list. Per spec we render "—" with a tooltip "Open a case to see this
 *   metric" instead of fabricating numbers. Cases-this-month and BUILD rate
 *   are computable from the list and render real values.
 */
import * as React from 'react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FileText,
  TrendingUp,
  CalendarClock,
  Zap,
  ArrowRight,
  Eye,
  Clock,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import type { SavedProject } from '@/lib/store';
import { StatusPill } from '@/components/status-pill';
import {
  VERDICT_META,
  verdictMetaFor,
  formatRelativeTime,
  casesThisMonth,
  casesLastMonth,
  casesInLastDays,
} from '../verdict';
import { MetricCard } from '../metric-card';

interface OverviewContentProps {
  projects: SavedProject[];
  loading: boolean;
  onNewCase: () => void;
}

export function OverviewContent({ projects, loading, onNewCase }: OverviewContentProps) {
  const reopenProject = useApp((s) => s.reopenProject);
  const go = useApp((s) => s.go);

  // ── Metrics derived from the list payload ──
  const metrics = React.useMemo(() => {
    const total = projects.length;
    const buildCount = projects.filter((p) => p.recommendation === 'build').length;
    const considerCount = projects.filter((p) => p.recommendation === 'consider').length;
    const dontBuildCount = projects.filter((p) => p.recommendation === 'dont_build').length;
    const sharedCount = projects.filter((p) => p.shareEngagement && p.shareEngagement.viewCount > 0).length;
    const totalViews = projects.reduce((sum, p) => sum + (p.shareEngagement?.viewCount ?? 0), 0);
    const buildRate = total > 0 ? Math.round((buildCount / total) * 100) : 0;
    const thisMonth = casesThisMonth(projects);
    const lastMonth = casesLastMonth(projects);
    const newThisWeek = casesInLastDays(projects, 7);
    const monthDelta = thisMonth - lastMonth;
    return {
      total,
      buildCount,
      considerCount,
      dontBuildCount,
      sharedCount,
      totalViews,
      buildRate,
      thisMonth,
      lastMonth,
      monthDelta,
      newThisWeek,
    };
  }, [projects]);

  const recentCases = React.useMemo(
    () =>
      [...projects]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [projects],
  );

  const handleCaseClick = async (id: string) => {
    const ok = await reopenProject(id);
    if (!ok) go('projects');
  };

  // ── Loading skeleton ──
  if (loading) {
    return <OverviewSkeleton />;
  }

  // ── Empty state ──
  if (projects.length === 0) {
    return <EmptyOverview onNewCase={onNewCase} onSeeExample={() => { window.location.href = '/start?start=1&example=apex'; }} />;
  }

  // ── Trend deltas ──
  const casesTrend = metrics.monthDelta === 0 ? 'neutral' : metrics.monthDelta > 0 ? 'up' : 'down';
  const casesTrendGood = metrics.monthDelta > 0; // more cases isn't strictly "good" but it's "activity up"

  return (
    <div className="space-y-5">
      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Cases this month"
          value={metrics.thisMonth}
          trend={casesTrend}
          trendValue={metrics.monthDelta === 0 ? 'no change' : `${metrics.monthDelta > 0 ? '+' : ''}${metrics.monthDelta} vs last`}
          trendGood={casesTrendGood}
          icon={FileText}
          accentColor="brand"
        />
        <MetricCard
          label="Avg ROI (Expected)"
          value={0}
          unavailable
          hint="Open a case to see this metric"
          icon={TrendingUp}
          accentColor="muted"
        />
        <MetricCard
          label="BUILD rate"
          value={metrics.buildRate}
          suffix="%"
          trend={metrics.buildRate >= 50 ? 'up' : 'down'}
          trendValue={`${metrics.buildCount} of ${metrics.total}`}
          trendGood={metrics.buildRate >= 50}
          icon={Zap}
          accentColor={metrics.buildRate >= 50 ? 'build' : 'consider'}
        />
        <MetricCard
          label="Median payback"
          value={0}
          unavailable
          hint="Open a case to see payback"
          icon={CalendarClock}
          accentColor="muted"
        />
      </div>

      {/* ── Chart + Decision tip ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <CasesOverTimeChart projects={projects} />
        <div className="flex flex-col gap-4">
          <VerdictDistribution
            total={metrics.total}
            buildCount={metrics.buildCount}
            considerCount={metrics.considerCount}
            dontBuildCount={metrics.dontBuildCount}
          />
          <DecisionTip />
        </div>
      </div>

      {/* ── Recent cases ── */}
      <RecentCases cases={recentCases} onCaseClick={handleCaseClick} onNewCase={onNewCase} total={metrics.total} onSeeAll={() => go('projects')} />
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────

interface MonthlyBucket {
  month: string;
  build: number;
  consider: number;
  dont_build: number;
}

function buildMonthlyBuckets(projects: SavedProject[]): MonthlyBucket[] {
  const buckets: Record<string, MonthlyBucket> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = {
      month: d.toLocaleString('default', { month: 'short' }),
      build: 0,
      consider: 0,
      dont_build: 0,
    };
  }
  for (const p of projects) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (buckets[key]) {
      buckets[key][p.recommendation === 'build' ? 'build' : p.recommendation === 'consider' ? 'consider' : 'dont_build']++;
    }
  }
  return Object.values(buckets);
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-md border border-border bg-surface-raised p-3 shadow-floating"
    >
      <p className="mb-1.5 text-[11px] font-medium text-ink">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px]">
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-ink-muted">{entry.name}:</span>
          <span className="font-mono font-medium text-ink">{entry.value}</span>
        </div>
      ))}
    </motion.div>
  );
}

function CasesOverTimeChart({ projects }: { projects: SavedProject[] }) {
  const data = React.useMemo(() => buildMonthlyBuckets(projects), [projects]);
  const totalInWindow = data.reduce((s, m) => s + m.build + m.consider + m.dont_build, 0);

  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-medium text-ink">Verdicts over time</h3>
          <p className="mt-0.5 text-[11px] text-ink-faint">6-month breakdown by decision</p>
        </div>
        <div className="flex items-center gap-3">
          {(['build', 'consider', 'dont_build'] as const).map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className={cn('h-1.5 w-1.5 rounded-full', VERDICT_META[k].dot)} />
              <span className="text-[11px] text-ink-muted">{VERDICT_META[k].labelPretty}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="dashColorBuild" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashColorConsider" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashColorDontBuild" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dx={-4} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="build" stroke="#34d399" strokeWidth={1.5} fillOpacity={1} fill="url(#dashColorBuild)" name="Build" dot={false} animationDuration={600} />
            <Area type="monotone" dataKey="consider" stroke="#fbbf24" strokeWidth={1.5} fillOpacity={1} fill="url(#dashColorConsider)" name="Consider" dot={false} animationDuration={600} />
            <Area type="monotone" dataKey="dont_build" stroke="#f87171" strokeWidth={1.5} fillOpacity={1} fill="url(#dashColorDontBuild)" name="Don't Build" dot={false} animationDuration={600} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {totalInWindow === 0 && (
        <p className="mt-3 text-center text-[11px] text-ink-faint">
          No cases in the last 6 months yet. Run your first analysis to populate the trend.
        </p>
      )}
    </div>
  );
}

// ─── Verdict Distribution ────────────────────────────────────────────────────

interface VerdictDistributionProps {
  total: number;
  buildCount: number;
  considerCount: number;
  dontBuildCount: number;
}

function VerdictDistribution({ total, buildCount, considerCount, dontBuildCount }: VerdictDistributionProps) {
  const items: { key: 'build' | 'consider' | 'dont_build'; count: number }[] = [
    { key: 'build', count: buildCount },
    { key: 'consider', count: considerCount },
    { key: 'dont_build', count: dontBuildCount },
  ];
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-subtle">
          <TrendingUp className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-[13px] font-medium text-ink">Verdict distribution</h3>
          <p className="text-[11px] text-ink-faint">Across all {total} cases</p>
        </div>
      </div>
      <div className="space-y-4">
        {items.map(({ key, count }) => {
          const meta = VERDICT_META[key];
          const Icon = meta.icon;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-3.5 w-3.5', meta.text)} strokeWidth={1.5} />
                  <span className="text-[12.5px] font-medium text-ink">{meta.labelPretty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] text-ink-muted">{count}</span>
                  <span className="font-mono text-[11px] text-ink-faint">{pct}%</span>
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-surface">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', meta.bar)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Decision Tip (right rail explainer) ─────────────────────────────────────

function DecisionTip() {
  return (
    <div className="rounded-lg border border-border bg-surface-analytical p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-subtle">
          <Lightbulb className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
        </div>
        <h3 className="text-[13px] font-medium text-ink">How Viableo decides</h3>
      </div>
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        The conservative scenario is the floor. If even the floor pays back inside 12 months and confidence is at least 60, the model says BUILD.
      </p>
      <div className="flex flex-col gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-build" />
          <span className="text-ink-muted">
            <span className="font-medium text-build">BUILD</span> — floor pays back ≤ 12mo, confidence ≥ 60
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-consider" />
          <span className="text-ink-muted">
            <span className="font-medium text-consider">CONSIDER</span> — expected pays back, floor does not
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-dont-build" />
          <span className="text-ink-muted">
            <span className="font-medium text-dont-build">DON&apos;T BUILD</span> — expected case does not pay back
          </span>
        </div>
      </div>
      <a
        href="/methodology"
        className="mt-4 inline-flex items-center gap-1 text-[11px] text-brand transition-colors hover:text-brand-hover"
      >
        Read the full methodology
        <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
      </a>
    </div>
  );
}

// ─── Recent cases ────────────────────────────────────────────────────────────

interface RecentCasesProps {
  cases: SavedProject[];
  onCaseClick: (id: string) => void;
  onNewCase: () => void;
  total: number;
  onSeeAll: () => void;
}

function RecentCases({ cases, onCaseClick, onNewCase, total, onSeeAll }: RecentCasesProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-subtle">
            <Clock className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-[13px] font-medium text-ink">Recent cases</h3>
            <p className="text-[11px] text-ink-faint">Latest ROI analyses</p>
          </div>
        </div>
        {total > 6 && (
          <button
            type="button"
            onClick={onSeeAll}
            className="flex h-7 items-center gap-1 text-[11px] text-ink-muted transition-colors hover:text-ink"
          >
            View all
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {cases.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => {
            const meta = verdictMetaFor(c.recommendation);
            const Icon = meta.icon;
            const hasShare = c.shareEngagement && c.shareEngagement.viewCount > 0;
            const views = c.shareEngagement?.viewCount ?? 0;
            const decision = c.shareEngagement?.decisionState;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCaseClick(c.id)}
                className="group rounded-md border border-transparent bg-surface p-3 text-left transition-all hover:border-border hover:bg-surface-raised"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <div className={cn('h-2 w-2 shrink-0 rounded-full', meta.dot)} />
                    <span className="truncate text-[12.5px] font-medium text-ink group-hover:text-brand">
                      {c.clientName || 'Untitled case'}
                    </span>
                  </div>
                  <Icon className={cn('h-3.5 w-3.5 shrink-0', meta.text)} strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-between">
                  <StatusPill variant={meta.key}>{meta.labelPretty}</StatusPill>
                  <span className="font-mono text-[10px] text-ink-faint">{formatRelativeTime(c.updatedAt)}</span>
                </div>
                {hasShare && (
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[10px] text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" strokeWidth={1.5} />
                      {views} {views === 1 ? 'view' : 'views'}
                    </span>
                    {decision && decision !== 'sent' && (
                      <span className={cn(
                        'font-medium',
                        decision === 'approved' && 'text-build',
                        decision === 'changes_requested' && 'text-consider',
                        decision === 'viewed' && 'text-ink-muted',
                      )}>
                        {decision === 'approved' ? 'Approved' : decision === 'changes_requested' ? 'Changes requested' : 'Viewed'}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="mb-3 text-[13px] text-ink-muted">No cases yet. Start your first analysis.</p>
          <button
            type="button"
            onClick={onNewCase}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-cta px-4 py-2 text-[12px] font-medium text-brand-foreground transition-colors hover:bg-brand-cta-hover"
          >
            <Zap className="h-3.5 w-3.5" strokeWidth={1.5} />
            Run Your First Case
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Loading + Empty states ───────────────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3 rounded-lg border border-border bg-surface-raised p-4">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-surface" />
            <div className="h-7 w-20 animate-pulse rounded bg-surface" />
            <div className="h-3 w-16 animate-pulse rounded bg-surface" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="h-[340px] animate-pulse rounded-lg border border-border bg-surface-raised" />
        <div className="h-[340px] animate-pulse rounded-lg border border-border bg-surface-raised" />
      </div>
    </div>
  );
}

function EmptyOverview({ onNewCase, onSeeExample }: { onNewCase: () => void; onSeeExample: () => void }) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-border bg-surface-raised p-10 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle">
        <Sparkles className="h-6 w-6 text-brand" strokeWidth={1.5} />
      </div>
      <h2 className="mb-2 text-[18px] font-semibold text-ink">No cases yet.</h2>
      <p className="mx-auto mb-6 max-w-md text-[14px] leading-relaxed text-ink-muted">
        Run your first analysis — free. The math is the same one we publish on the
        Methodology page. Hours, rates, volumes, a fee — and a verdict.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onNewCase}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-cta px-5 py-2.5 text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand-cta-hover sm:w-auto"
        >
          <Zap className="h-4 w-4" strokeWidth={1.5} />
          Run Your First Case
        </button>
        <button
          type="button"
          onClick={onSeeExample}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-border-strong hover:text-ink sm:w-auto"
        >
          <Eye className="h-4 w-4" strokeWidth={1.5} />
          See a Completed Example
        </button>
      </div>
      <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6 text-left">
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">3 scenarios</div>
          <p className="text-[11px] text-ink-muted">Conservative, Expected, Upside</p>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Confidence</div>
          <p className="text-[11px] text-ink-muted">0–100, transparent</p>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Verdict</div>
          <p className="text-[11px] text-ink-muted">BUILD · CONSIDER · DON&apos;T</p>
        </div>
      </div>
    </div>
  );
}
