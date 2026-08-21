'use client';

/**
 * CasesContent — full cases list (the "Cases" section of the dashboard).
 *
 * Richer table than the Recent Cases tile: columns are Client · Verdict ·
 * Created · Last activity · Share status. Reuses the /api/projects payload.
 *
 * Empty state copy: "No cases yet. Run your first analysis — free. The engine
 * is the same one documented on the Methodology page." Plus a Run New Case
 * button.
 */
import * as React from 'react';
import { FileText, Zap, Search, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import type { SavedProject } from '@/lib/store';
import { StatusPill } from '@/components/status-pill';
import {
  verdictMetaFor,
  formatRelativeTime,
  shareStatusLabel,
} from '../verdict';

interface CasesContentProps {
  projects: SavedProject[];
  loading: boolean;
}

type VerdictFilter = 'all' | 'build' | 'consider' | 'dont_build';

export function CasesContent({ projects, loading }: CasesContentProps) {
  const startCalculator = useApp((s) => s.startCalculator);
  const reopenProject = useApp((s) => s.reopenProject);
  const go = useApp((s) => s.go);
  const [search, setSearch] = React.useState('');
  const [verdict, setVerdict] = React.useState<VerdictFilter>('all');

  const filtered = React.useMemo(() => {
    let list = projects;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.clientName.toLowerCase().includes(q));
    }
    if (verdict !== 'all') {
      list = list.filter((p) => p.recommendation === verdict);
    }
    return [...list].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [projects, search, verdict]);

  const handleCaseClick = async (id: string) => {
    const ok = await reopenProject(id);
    if (!ok) go('projects');
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface-raised p-5">
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return <EmptyCasesState onNewCase={() => startCalculator()} onSeeExample={() => { window.location.href = '/start?start=1&example=apex'; }} />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name…"
            className="h-9 w-full rounded-lg border border-border bg-surface-raised pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Search cases by client name"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-raised p-0.5" role="tablist" aria-label="Filter by verdict">
          {(['all', 'build', 'consider', 'dont_build'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={verdict === v}
              onClick={() => setVerdict(v)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                verdict === v ? 'bg-surface text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              {v === 'all' ? 'All' : v === 'dont_build' ? "Don't build" : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-border text-[10px] uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Verdict</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
                <th className="px-4 py-2.5 font-medium">Last activity</th>
                <th className="px-4 py-2.5 font-medium">Share status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    No cases match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const meta = verdictMetaFor(p.recommendation);
                  const share = shareStatusLabel(p);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleCaseClick(p.id)}
                      className="cursor-pointer border-b border-border/50 transition-colors last:border-b-0 hover:bg-surface"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden="true" />
                          <span className="font-medium text-ink">{p.clientName || 'Untitled case'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill variant={meta.key}>{meta.labelPretty}</StatusPill>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ink-muted">
                        {formatRelativeTime(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ink-muted">
                        {formatRelativeTime(p.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <ShareStatusBadge label={share.label} tone={share.tone} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Count */}
      <p className="text-[11px] text-ink-faint">
        Showing <span className="font-mono text-ink-muted">{filtered.length}</span> of{' '}
        <span className="font-mono text-ink-muted">{projects.length}</span>{' '}
        {projects.length === 1 ? 'case' : 'cases'}
      </p>
    </div>
  );
}

function ShareStatusBadge({ label, tone }: { label: string; tone: 'idle' | 'viewed' | 'approved' | 'changes' | 'none' }) {
  const toneClass = {
    idle: 'bg-surface text-ink-muted',
    viewed: 'bg-brand-subtle text-brand',
    approved: 'bg-build-bg text-build',
    changes: 'bg-consider-bg text-consider',
    none: 'bg-surface text-ink-faint',
  }[tone];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', toneClass)}>
      {label}
    </span>
  );
}

function EmptyCasesState({ onNewCase, onSeeExample }: { onNewCase: () => void; onSeeExample: () => void }) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-border bg-surface-raised p-10 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle">
        <FileText className="h-6 w-6 text-brand" strokeWidth={1.5} />
      </div>
      <h2 className="mb-2 text-[18px] font-semibold text-ink">No cases yet.</h2>
      <p className="mx-auto mb-6 max-w-md text-[14px] leading-relaxed text-ink-muted">
        Run your first analysis — free. The engine is the same one documented on the Methodology page.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onNewCase}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-cta px-5 py-2.5 text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand-cta-hover sm:w-auto"
        >
          <Zap className="h-4 w-4" strokeWidth={1.5} />
          Run New Case
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
    </div>
  );
}
