'use client';

/**
 * EngagementDashboard — share link analytics for a specific share.
 *
 * Shows total views, avg time on page, section engagement breakdown,
 * and verdict distribution. Clean card-based layout.
 */
import * as React from 'react';
import { Eye, Clock, BarChart3, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DECISION_LABELS, DECISION_COLORS, type DecisionKey } from '@/lib/brand';

interface EngagementDashboardProps {
  shareId: string;
}

interface AnalyticsData {
 shareId: string;
  decisionState: string;
  totalViews: number;
  avgTimeOnPage: number;
  sectionEngagement: Record<string, { scrollCount: number; avgDepth: number }>;
  verdictDistribution: Record<string, number>;
  recentApprovals: { action: string; createdAt: string }[];
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatSectionName(section: string): string {
  return section
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const DECISION_STATES: Record<string, { label: string; className: string }> = {
  sent: { label: 'Sent', className: 'bg-surface text-ink-muted' },
  viewed: { label: 'Viewed', className: 'bg-indigo-bg text-indigo' },
  approved: { label: 'Approved', className: 'bg-build-bg text-build' },
  changes_requested: { label: 'Changes Requested', className: 'bg-consider-bg text-consider' },
};

export function EngagementDashboard({ shareId }: EngagementDashboardProps) {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/share/${shareId}/analytics`);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          if (!cancelled) setError(body.error ?? 'Failed to load analytics.');
          return;
        }
        const json = (await res.json()) as AnalyticsData;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError('Could not reach the service.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface-raised py-12 text-center">
        <AlertCircle className="size-7 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
        <p className="text-[14px] text-ink-muted">{error ?? 'No analytics available.'}</p>
      </div>
    );
  }

  const sections = Object.entries(data.sectionEngagement).sort(
    (a, b) => b[1].scrollCount - a[1].scrollCount,
  );

  const maxScrollCount = Math.max(1, ...sections.map(([, v]) => v.scrollCount));

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Eye className="size-5" strokeWidth={1.75} />}
          label="Total views"
          value={String(data.totalViews)}
        />
        <MetricCard
          icon={<Clock className="size-5" strokeWidth={1.75} />}
          label="Avg. time on page"
          value={formatSeconds(data.avgTimeOnPage)}
        />
        <MetricCard
          icon={<BarChart3 className="size-5" strokeWidth={1.75} />}
          label="Sections viewed"
          value={String(sections.length)}
        />
        <MetricCard
          icon={<CheckCircle2 className="size-5" strokeWidth={1.75} />}
          label="Decision state"
          value={DECISION_STATES[data.decisionState]?.label ?? data.decisionState}
          valueClassName={DECISION_STATES[data.decisionState]?.className}
        />
      </div>

      {/* Section engagement breakdown */}
      {sections.length > 0 && (
        <div className="rounded-lg border border-border bg-surface-raised p-5">
          <h3 className="mb-4 text-[14px] font-semibold text-ink">Section engagement</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sections.map(([section, engagement]) => (
              <div key={section} className="flex items-center gap-3">
                <span className="min-w-[140px] truncate text-[13px] text-ink-muted">
                  {formatSectionName(section)}
                </span>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-surface">
                    <div
                      className="h-2 rounded-full bg-brand transition-all duration-300"
                      style={{ width: `${(engagement.scrollCount / maxScrollCount) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={engagement.scrollCount}
                      aria-valuemax={maxScrollCount}
                      aria-label={`${formatSectionName(section)}: ${engagement.scrollCount} scrolls`}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-[12px] font-mono tnum text-ink-faint w-16 text-right">
                  {engagement.scrollCount} scrolls
                </span>
                <span className="shrink-0 text-[12px] font-mono tnum text-ink-faint w-16 text-right">
                  {engagement.avgDepth}% avg
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verdict distribution */}
      <div className="rounded-lg border border-border bg-surface-raised p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-ink">Verdict distribution</h3>
        <div className="flex flex-wrap gap-3">
          {(['build', 'consider', 'dont_build'] as const).map((key) => {
            const count = data.verdictDistribution[key] ?? 0;
            const colors = DECISION_COLORS[key];
            return (
              <div
                key={key}
                className="flex items-center gap-2 rounded-lg border px-4 py-2.5"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.bg,
                }}
              >
                <span
                  className="text-[14px] font-semibold"
                  style={{ color: colors.text }}
                >
                  {count}
                </span>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: colors.text }}
                >
                  {DECISION_LABELS[key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent approvals */}
      {data.recentApprovals.length > 0 && (
        <div className="rounded-lg border border-border bg-surface-raised p-5">
          <h3 className="mb-4 text-[14px] font-semibold text-ink">Recent activity</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.recentApprovals.map((approval, i) => (
              <div key={i} className="flex items-center justify-between text-[13px]">
                <span className={approval.action === 'approve' ? 'text-build font-medium' : 'text-consider font-medium'}>
                  {approval.action === 'approve' ? 'Approved' : 'Changes requested'}
                </span>
                <span className="font-mono tnum text-ink-faint">
                  {new Date(approval.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <div className="flex items-center gap-2 text-ink-faint">
        {icon}
        <span className="text-[12px] text-ink-faint">{label}</span>
      </div>
      <p className={`mt-2 text-[24px] font-bold tracking-tight text-ink ${valueClassName ?? ''}`}>
        {value}
      </p>
    </div>
  );
}
