'use client';

/**
 * OperationalDashboard — superadmin health monitor.
 *
 * Fetches aggregated engagement analytics and presents:
 *   - System Health (total views, avg time, total shares)
 *   - Feature Adoption (top scrolled sections)
 *   - Decision Distribution (verdict breakdown, decision states)
 *
 * Only visible to superadmin users (server-side gate on the API).
 */
import * as React from 'react';
import {
  Eye,
  Clock,
  Share2,
  BarChart3,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DECISION_LABELS, DECISION_COLORS, type DecisionKey } from '@/lib/brand';

interface EngagementData {
  totalViews: number;
  avgTimeOnPage: number;
  verdictDistribution: Record<string, number>;
  totalShares: number;
  decisionStateDistribution: Record<string, number>;
  topSections: { section: string; count: number }[];
}

const DECISION_STATE_LABELS: Record<string, string> = {
  sent: 'Sent',
  viewed: 'Viewed',
  approved: 'Approved',
  changes_requested: 'Changes Requested',
};

const DECISION_STATE_COLORS: Record<string, string> = {
  sent: 'bg-surface text-ink-muted',
  viewed: 'bg-indigo-bg text-indigo',
  approved: 'bg-build-bg text-build',
  changes_requested: 'bg-consider-bg text-consider',
};

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatSectionName(section: string): string {
  return section
    ? section.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Unknown';
}

export function OperationalDashboard() {
  const [data, setData] = React.useState<EngagementData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/analytics/engagement');
        if (res.status === 403) {
          if (!cancelled) setError('Superadmin access required.');
          return;
        }
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          if (!cancelled) setError(body.error ?? 'Failed to load analytics.');
          return;
        }
        const json = (await res.json()) as EngagementData;
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
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
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

  const totalCases =
    (data.verdictDistribution.build ?? 0) +
    (data.verdictDistribution.consider ?? 0) +
    (data.verdictDistribution.dont_build ?? 0);

  const maxSectionCount = Math.max(1, ...data.topSections.map((s) => s.count));

  return (
    <div className="space-y-8">
      {/* System Health */}
      <section aria-label="System health">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="size-4 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
          <h3 className="text-[16px] font-semibold text-ink">System Health</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            icon={<Eye className="size-5" strokeWidth={1.75} />}
            label="Total views"
            value={data.totalViews.toLocaleString()}
          />
          <AdminMetricCard
            icon={<Clock className="size-5" strokeWidth={1.75} />}
            label="Avg. time on page"
            value={formatSeconds(data.avgTimeOnPage)}
          />
          <AdminMetricCard
            icon={<Share2 className="size-5" strokeWidth={1.75} />}
            label="Total shares"
            value={data.totalShares.toLocaleString()}
          />
          <AdminMetricCard
            icon={<BarChart3 className="size-5" strokeWidth={1.75} />}
            label="Total cases"
            value={totalCases.toLocaleString()}
          />
        </div>
      </section>

      {/* Feature Adoption — top sections */}
      {data.topSections.length > 0 && (
        <section aria-label="Feature adoption">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
            <h3 className="text-[16px] font-semibold text-ink">Feature Adoption</h3>
            <span className="text-[12px] text-ink-faint">Top scrolled sections</span>
          </div>
          <div className="rounded-lg border border-border bg-surface-raised p-5">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.topSections.map((s, i) => (
                <div key={s.section ?? i} className="flex items-center gap-3">
                  <span className="w-6 shrink-0 text-right text-[12px] font-mono tnum text-ink-faint">
                    {i + 1}
                  </span>
                  <span className="min-w-[160px] truncate text-[13px] text-ink-muted">
                    {formatSectionName(s.section)}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-surface">
                      <div
                        className="h-2 rounded-full bg-indigo transition-all duration-300"
                        style={{ width: `${(s.count / maxSectionCount) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={s.count}
                        aria-valuemax={maxSectionCount}
                        aria-label={`${formatSectionName(s.section)}: ${s.count} scrolls`}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 w-20 text-right text-[12px] font-mono tnum text-ink-faint">
                    {s.count.toLocaleString()} scrolls
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Decision Distribution */}
      <section aria-label="Decision distribution">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="size-4 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
          <h3 className="text-[16px] font-semibold text-ink">Decision Distribution</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Verdict breakdown */}
          <div className="rounded-lg border border-border bg-surface-raised p-5">
            <h4 className="mb-4 text-[13px] font-medium text-ink-muted uppercase tracking-wider">
              Verdicts
            </h4>
            <div className="space-y-3">
              {(['build', 'consider', 'dont_build'] as const).map((key) => {
                const count = data.verdictDistribution[key] ?? 0;
                const colors = DECISION_COLORS[key];
                const pct = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div
                      className="inline-flex min-w-[110px] items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {DECISION_LABELS[key]}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-surface">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: colors.text,
                          }}
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemax={100}
                          aria-label={`${DECISION_LABELS[key]}: ${pct}%`}
                        />
                      </div>
                    </div>
                    <span className="w-20 text-right text-[12px] font-mono tnum text-ink-faint">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision state distribution */}
          {Object.keys(data.decisionStateDistribution).length > 0 && (
            <div className="rounded-lg border border-border bg-surface-raised p-5">
              <h4 className="mb-4 text-[13px] font-medium text-ink-muted uppercase tracking-wider">
                Share States
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.decisionStateDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([state, count]) => (
                    <div
                      key={state}
                      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 ${DECISION_STATE_COLORS[state] ?? 'bg-surface text-ink-muted'}`}
                    >
                      <span className="text-[18px] font-bold">{count}</span>
                      <span className="text-[13px] font-medium">
                        {DECISION_STATE_LABELS[state] ?? state}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AdminMetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <div className="flex items-center gap-2 text-ink-faint">
        {icon}
        <span className="text-[12px] text-ink-faint">{label}</span>
      </div>
      <p className="mt-2 text-[24px] font-bold tracking-tight text-ink">{value}</p>
    </div>
  );
}
