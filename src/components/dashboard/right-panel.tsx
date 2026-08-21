'use client';

/**
 * RightPanel — the contextual right rail of the dashboard shell.
 *
 * Three cards, all derived from real store data (no fabricated events):
 *   1. Entitlement Status — Starter X/10 with reset date OR Pro unlimited.
 *   2. Secondary metrics — Average confidence (omitted when results aren't
 *      in the list payload) + Share views this week.
 *   3. Recent Activity — derived from project timestamps + shareEngagement.
 *
 * The Recent Activity feed is the honest one: every entry traces back to a
 * concrete project row's updatedAt / shareEngagement fields. We do NOT
 * invent fictional "deploy" / "incident" events.
 */
import * as React from 'react';
import {
  Activity,
  Wallet,
  Eye,
  FileText,
  Share2,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import { useTier } from '@/lib/store';
import { CASES_PER_MONTH, TIER_LABEL } from '@/lib/entitlement';
import type { SavedProject } from '@/lib/store';
import type { Section, ActivityEntry } from './types';
import { casesThisMonth, formatRelativeTime } from './verdict';

interface RightPanelProps {
  activeSection: Section;
  projects: SavedProject[];
  loading: boolean;
  onOpenSection: (s: Section) => void;
}

export function RightPanel({
  activeSection,
  projects,
  loading,
  onOpenSection,
}: RightPanelProps) {
  const tier = useTier();
  const entitlement = useApp((s) => s.entitlement);

  const used = casesThisMonth(projects);
  const isPro = tier === 'pro' || tier === 'agency' || tier === 'agency_pro';
  const limit = CASES_PER_MONTH[tier] ?? CASES_PER_MONTH.free;
  const isUnlimited = !Number.isFinite(limit);
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));

  // Reset date = first of next month.
  const resetDate = React.useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }, []);
  const resetLabel = resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Share views this week (last 7 days from lastViewed).
  const viewsThisWeek = React.useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return projects.reduce((sum, p) => {
      if (!p.shareEngagement?.lastViewed) return sum;
      const viewed = new Date(p.shareEngagement.lastViewed).getTime();
      return viewed >= cutoff ? sum + p.shareEngagement.viewCount : sum;
    }, 0);
  }, [projects]);

  // Recent activity — derived from real project timestamps + share data.
  const activity = React.useMemo<ActivityEntry[]>(() => {
    const entries: ActivityEntry[] = [];
    for (const p of projects) {
      // Case saved (createdAt) — only show if not the same as updatedAt.
      entries.push({
        id: `${p.id}-saved`,
        kind: 'case_saved',
        title: p.clientName ? `Case saved · ${p.clientName}` : 'Case saved',
        at: p.createdAt,
      });
      // Case updated (updatedAt), only if meaningfully different from createdAt.
      const created = new Date(p.createdAt).getTime();
      const updated = new Date(p.updatedAt).getTime();
      if (updated - created > 60 * 1000) {
        entries.push({
          id: `${p.id}-updated`,
          kind: 'case_updated',
          title: p.clientName ? `Case updated · ${p.clientName}` : 'Case updated',
          at: p.updatedAt,
        });
      }
      // PDF generated / share sent / share viewed — only when shareEngagement exists.
      if (p.shareEngagement) {
        const eng = p.shareEngagement;
        const label = p.clientName ? ` · ${p.clientName}` : '';
        if (eng.viewCount > 0 && eng.lastViewed) {
          entries.push({
            id: `${p.id}-viewed`,
            kind: 'share_viewed',
            title: `Share link viewed${label}`,
            at: eng.lastViewed,
          });
        } else {
          entries.push({
            id: `${p.id}-sent`,
            kind: 'share_sent',
            title: `Share link sent${label}`,
            at: p.updatedAt,
          });
        }
        // Verdict-changed entry when decisionState is non-default.
        if (eng.decisionState === 'approved' || eng.decisionState === 'changes_requested') {
          entries.push({
            id: `${p.id}-verdict`,
            kind: 'verdict_changed',
            title:
              eng.decisionState === 'approved'
                ? `Verdict accepted${label}`
                : `Changes requested${label}`,
            at: eng.lastViewed ?? p.updatedAt,
          });
        }
      }
    }
    // Sort by timestamp desc, take 8.
    return entries
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8);
  }, [projects]);

  return (
    <aside
      className="flex h-full w-full flex-col gap-4 overflow-y-auto border-l border-border bg-surface p-4 lg:p-5"
      aria-label="Dashboard context"
    >
      {/* ── Entitlement Status ── */}
      <section className="rounded-lg border border-border bg-surface-raised p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-subtle">
              <Wallet className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h3 className="text-[13px] font-medium text-ink">Entitlement</h3>
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
              isPro ? 'bg-brand-subtle text-brand' : 'bg-surface text-ink-muted',
            )}
          >
            {TIER_LABEL[tier]}
          </span>
        </div>

        {isUnlimited ? (
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            <span className="font-mono text-ink">{used}</span> case{used === 1 ? '' : 's'} this month. Pro unlocks unlimited cases.
          </p>
        ) : (
          <>
            <div className="mb-2 flex items-baseline justify-between text-[12.5px]">
              <span className="text-ink-muted">
                <span className="font-mono text-ink">{used}</span> of <span className="font-mono text-ink">{limit}</span> cases
              </span>
              <span className="text-ink-faint">Resets {resetLabel}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit}>
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  pct >= 100 ? 'bg-dont-build' : pct >= 75 ? 'bg-consider' : 'bg-brand',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => onOpenSection('usage')}
              className="mt-3 flex w-full items-center justify-between rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11px] text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
            >
              <span>Manage usage</span>
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </>
        )}
      </section>

      {/* ── Secondary metrics ── */}
      <section className="rounded-lg border border-border bg-surface-raised p-4">
        <h3 className="mb-3 text-[13px] font-medium text-ink">This week</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <MetricCell
            icon={Eye}
            label="Share views"
            value={loading ? null : viewsThisWeek}
            hint="Last 7 days"
          />
          <MetricCell
            icon={ShieldCheck}
            label="Avg confidence"
            value={null}
            hint="Open a case to see"
          />
        </div>
      </section>

      {/* ── Recent Activity ── */}
      <section className="flex-1 rounded-lg border border-border bg-surface-raised p-4">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="text-[13px] font-medium text-ink">Recent activity</h3>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-surface" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-ink-muted">
            No activity yet. Run your first case to populate the feed.
          </p>
        ) : (
          <ul className="space-y-1">
            {activity.map((entry) => (
              <ActivityRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </section>

      {/* Footer pointer to active section */}
      <p className="text-center text-[10px] text-ink-faint">
        Viewing <span className="font-mono text-ink-muted">{activeSection}</span> ·
        <span className="ml-1">{entitlement ? TIER_LABEL[tier] : 'Starter'}</span>
      </p>
    </aside>
  );
}

interface MetricCellProps {
  icon: typeof Eye;
  label: string;
  value: number | null;
  hint: string;
}

function MetricCell({ icon: Icon, label, value, hint }: MetricCellProps) {
  return (
    <div className="rounded-md border border-border bg-surface p-2.5">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
          {label}
        </span>
      </div>
      {value === null ? (
        <p className="font-mono text-[14px] text-ink-faint">—</p>
      ) : (
        <p className="font-mono text-[16px] font-semibold tabular-nums text-ink">{value}</p>
      )}
      <p className="mt-0.5 text-[10px] text-ink-faint">{hint}</p>
    </div>
  );
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const tone = activityTone(entry.kind);
  return (
    <li>
      <div className="flex items-start gap-2.5 rounded-md px-1.5 py-1.5 transition-colors hover:bg-surface">
        <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md', tone.bg)}>
          {renderActivityIcon(entry.kind, tone.text)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-ink">{entry.title}</p>
          <p className="flex items-center gap-1 text-[10px] text-ink-faint">
            <Clock className="h-2.5 w-2.5" strokeWidth={1.5} />
            {formatRelativeTime(entry.at)}
          </p>
        </div>
      </div>
    </li>
  );
}

function renderActivityIcon(kind: ActivityEntry['kind'], text: string) {
  const className = cn('h-3.5 w-3.5', text);
  switch (kind) {
    case 'verdict_changed':
      return <ShieldCheck className={className} strokeWidth={1.5} aria-hidden="true" />;
    case 'share_sent':
      return <Share2 className={className} strokeWidth={1.5} aria-hidden="true" />;
    case 'share_viewed':
      return <Eye className={className} strokeWidth={1.5} aria-hidden="true" />;
    case 'case_saved':
    case 'case_updated':
    case 'pdf_generated':
    default:
      return <FileText className={className} strokeWidth={1.5} aria-hidden="true" />;
  }
}

function activityTone(kind: ActivityEntry['kind']): { bg: string; text: string } {
  switch (kind) {
    case 'case_saved':
    case 'case_updated':
      return { bg: 'bg-brand-subtle', text: 'text-brand' };
    case 'verdict_changed':
      return { bg: 'bg-build-bg', text: 'text-build' };
    case 'pdf_generated':
      return { bg: 'bg-surface', text: 'text-ink-muted' };
    case 'share_sent':
      return { bg: 'bg-consider-bg', text: 'text-consider' };
    case 'share_viewed':
      return { bg: 'bg-brand-subtle', text: 'text-brand' };
    default:
      return { bg: 'bg-surface', text: 'text-ink-muted' };
  }
}
