'use client';

/**
 * Projects view — Viableo voice.
 *
 * Lists saved client analyses (agency+ client history, Section 18). Each row
 * shows the client name, the Viableo Decision (via DECISION_LABELS), and the
 * created / updated stamps. The verdict pill uses the canonical decision
 * labels — never a hardcoded 'BUILD' / 'CONSIDER' / 'DON\u2019T BUILD' string.
 */
import * as React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { FileText, Plus, Search, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { has } from '@/lib/entitlement';
import { StatusPill } from '@/components/status-pill';
import { Skeleton } from '@/components/ui/skeleton';
import { DECISION_LABELS, TERM, type DecisionKey } from '@/lib/brand';
import type { SavedProject } from '@/lib/store';

export function ProjectsView() {
  const { entitlement, projects, setProjects, startCalculator, reopenProject, go } = useApp(
    useShallow((s) => ({
      entitlement: s.entitlement,
      projects: s.projects,
      setProjects: s.setProjects,
      startCalculator: s.startCalculator,
      reopenProject: s.reopenProject,
      go: s.go,
    }))
  );
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  const canList = !!entitlement && has(entitlement, 'client_history');

  React.useEffect(() => {
    if (!canList) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.status === 403) {
          toast({
            title: 'Project history requires Agency or higher.',
            variant: 'destructive',
          });
          return;
        }
        if (!res.ok) return;
        const data = (await res.json()) as { projects: SavedProject[] };
        if (!cancelled) setProjects(data.projects ?? []);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canList, setProjects, toast]);

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-12 md:px-6">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold leading-[1.02] tracking-[-0.02em] text-ink">
            Your {TERM.analysis}s
          </h1>
          <p className="mt-1 text-[15px] text-ink-muted">
            Every client analysis you&apos;ve saved. Reopen to regenerate PDFs or update
            assumptions.
          </p>
        </div>
        <Button
          onClick={() => startCalculator()}
          className="min-h-[44px] gap-1.5 bg-brand-cta text-white hover:bg-brand-cta-hover"
        >
          <Plus className="size-4" strokeWidth={1.75} aria-hidden="true" />
          New analysis
        </Button>
      </header>

      {!canList ? (
        <EmptyState
          title="Project history requires the Agency tier."
          body="Upgrade to keep every analysis you calculate, revisit the numbers, and regenerate reports."
          cta="View pricing"
          onCta={() => go('pricing')}
        />
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No saved analyses yet."
          body="Run a calculation, then save it to keep it here for future reference."
          cta="Open the calculator"
          onCta={() => startCalculator()}
        />
      ) : (
        <div className="space-y-4">
          {/* Search filter */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" strokeWidth={1.75} aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name…"
              className="h-10 w-full max-w-sm rounded-lg border border-border bg-surface pl-9 pr-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40"
              aria-label="Search projects"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
            <table className="w-full text-[14px]" aria-label="Saved analyses">
              <thead className="border-b border-border bg-surface">
                <tr>
                  <th className="px-5 py-2.5 text-left font-medium text-ink-muted">Client</th>
                  <th className="px-5 py-2.5 text-left font-medium text-ink-muted">
                    {TERM.decision}
                  </th>
                  <th className="px-5 py-2.5 text-right font-medium text-ink-muted">Created</th>
                  <th className="px-5 py-2.5 text-right font-medium text-ink-muted">Updated</th>
                  <th className="px-5 py-2.5 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {projects
                  .filter((p) =>
                    search
                      ? p.clientName.toLowerCase().includes(search.toLowerCase())
                      : true
                  )
                  .map((p) => {
                  const decisionKey = p.recommendation as DecisionKey;
                  return (
                    <tr
                      key={p.id}
                      className="group border-b border-border last:border-b-0 hover:bg-surface/50"
                    >
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => reopenProject(p.id)}
                          className="font-medium text-ink hover:text-brand transition-colors duration-hover text-left"
                        >
                          {p.clientName}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill variant={p.recommendation}>
                          {DECISION_LABELS[decisionKey]}
                        </StatusPill>
                        {p.shareEngagement && p.shareEngagement.viewCount > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-ink-faint">
                            <Eye className="size-3" strokeWidth={1.75} aria-hidden="true" />
                            Client opened {p.shareEngagement.viewCount} {p.shareEngagement.viewCount === 1 ? 'time' : 'times'}
                            {p.shareEngagement.lastViewed && (
                              <> · {relativeTime(p.shareEngagement.lastViewed)}</>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-mono tnum text-ink-muted">
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3 text-right font-mono tnum text-ink-muted">
                        {new Date(p.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Delete “${p.clientName}”? This cannot be undone.`)) return;
                            try {
                              const res = await fetch(`/api/projects/${p.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                setProjects(projects.filter((x) => x.id !== p.id));
                                toast({ title: 'Analysis deleted.' });
                              }
                            } catch {
                              /* ignore */
                            }
                          }}
                          className="inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded text-ink-faint opacity-0 transition-all duration-hover hover:text-dont-build hover:bg-dont-build/5 focus:opacity-100 group-hover:opacity-100"
                          aria-label={`Delete ${p.clientName}`}
                        >
                          <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/** Format a date string as a relative time like "2 hours ago" or "3 days ago". */
function relativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? 'hour' : 'hours'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  const diffMo = Math.floor(diffDay / 30);
  return `${diffMo} ${diffMo === 1 ? 'month' : 'months'} ago`;
}

function EmptyState({
  title,
  body,
  cta,
  onCta,
}: {
  title: string;
  body: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-surface-raised py-16 text-center">
      <FileText className="size-8 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
      <div>
        <p className="font-display text-[18px] font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-[420px] text-[14px] text-ink-muted">{body}</p>
      </div>
      <Button
        onClick={onCta}
        className="mt-2 min-h-[44px] bg-brand-cta text-white hover:bg-brand-cta-hover"
      >
        {cta}
      </Button>
    </div>
  );
}
