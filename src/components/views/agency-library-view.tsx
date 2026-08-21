'use client';

/**
 * AgencyLibraryView — filterable case repository for agency organizations.
 *
 * Fetches projects for the organization and provides search, filters
 * (client, verdict, date range), and card-based results. Clicking navigates
 * to the project results view.
 */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, ArrowUpDown, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusPill } from '@/components/status-pill';
import { DECISION_LABELS, TERM, type DecisionKey } from '@/lib/brand';

interface AgencyLibraryViewProps {
  organizationId: string;
}

interface ProjectItem {
  id: string;
  clientName: string;
  recommendation: string;
  createdAt: string;
  updatedAt: string;
  shareEngagement?: {
    viewCount: number;
    lastViewed: string | null;
    decisionState: string;
  } | null;
}

export function AgencyLibraryView({ organizationId }: AgencyLibraryViewProps) {
  const router = useRouter();
  const [projects, setProjects] = React.useState<ProjectItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [verdictFilter, setVerdictFilter] = React.useState<string>('all');
  const [dateRange, setDateRange] = React.useState<string>('all');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) return;
        const data = (await res.json()) as { projects: ProjectItem[] };
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
  }, [organizationId]);

  // Unique client names for the filter.
  const clientNames = React.useMemo(() => {
    const names = new Set(projects.map((p) => p.clientName).filter(Boolean));
    return Array.from(names).sort();
  }, [projects]);
  const [clientFilter, setClientFilter] = React.useState<string>('all');

  const filtered = React.useMemo(() => {
    let result = projects;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.clientName.toLowerCase().includes(q));
    }
    if (verdictFilter !== 'all') {
      result = result.filter((p) => p.recommendation === verdictFilter);
    }
    if (clientFilter !== 'all') {
      result = result.filter((p) => p.clientName === clientFilter);
    }
    if (dateRange !== 'all') {
      const now = Date.now();
      const ms = dateRange === '7d' ? 7 * 86400000
        : dateRange === '30d' ? 30 * 86400000
        : dateRange === '90d' ? 90 * 86400000
        : Infinity;
      result = result.filter((p) => now - new Date(p.createdAt).getTime() <= ms);
    }

    return result;
  }, [projects, search, verdictFilter, clientFilter, dateRange]);

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-12 md:px-6">
      <header className="mb-8">
        <h1 className="font-display text-[28px] font-bold leading-[1.02] tracking-[-0.02em] text-ink">
          Case Library
        </h1>
        <p className="mt-1 text-[15px] text-ink-muted">
          Every {TERM.businessCase.toLowerCase()} your team has built. Search, filter, and review.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name…"
            className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40"
            aria-label="Search cases"
          />
        </div>

        {/* Client filter */}
        {clientNames.length > 0 && (
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger size="sm" className="w-[180px] bg-surface text-[13px]">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {clientNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Verdict filter */}
        <Select value={verdictFilter} onValueChange={setVerdictFilter}>
          <SelectTrigger size="sm" className="w-[160px] bg-surface text-[13px]">
            <SelectValue placeholder="All verdicts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All verdicts</SelectItem>
            <SelectItem value="build">BUILD</SelectItem>
            <SelectItem value="consider">CONSIDER</SelectItem>
            <SelectItem value="dont_build">DON&apos;T BUILD</SelectItem>
          </SelectContent>
        </Select>

        {/* Date range filter */}
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger size="sm" className="w-[140px] bg-surface text-[13px]">
            <ArrowUpDown className="mr-1.5 size-3.5 text-ink-faint" strokeWidth={1.75} aria-hidden="true" />
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-surface-raised py-16 text-center">
          <FileText className="size-8 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
          <div>
            <p className="font-display text-[18px] font-semibold text-ink">
              {projects.length === 0
                ? 'No cases yet.'
                : 'No cases match your filters.'}
            </p>
            <p className="mt-1 max-w-[420px] text-[14px] text-ink-muted">
              {projects.length === 0
                ? 'Run your first analysis to get started.'
                : 'Try adjusting your search or filters.'}
            </p>
          </div>
          {projects.length === 0 && (
            <Button
              onClick={() => router.push('/start')}
              className="mt-2 min-h-[44px] bg-brand-cta text-white hover:bg-brand-cta-hover"
            >
              Run your first case
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const decisionKey = p.recommendation as DecisionKey;
            const shareState = p.shareEngagement?.decisionState;
            const shareViews = p.shareEngagement?.viewCount ?? 0;
            const shareStateLabel =
              shareState === 'approved' ? 'Approved' :
              shareState === 'changes_requested' ? 'Changes requested' :
              shareState === 'viewed' ? 'Viewed' :
              shareState === 'sent' ? 'Sent' : null;
            const shareStateVariant: 'build' | 'consider' | 'paid' | 'draft' | null =
              shareState === 'approved' ? 'build' :
              shareState === 'changes_requested' ? 'consider' :
              shareState === 'viewed' ? 'paid' :
              shareState === 'sent' ? 'draft' : null;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => router.push('/start')}
                className="group rounded-lg border border-border bg-surface-raised p-4 text-left transition-colors duration-hover hover:border-border-strong hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink group-hover:text-brand transition-colors duration-hover">
                    {p.clientName}
                  </h3>
                  <StatusPill variant={p.recommendation as DecisionKey}>
                    {DECISION_LABELS[decisionKey]}
                  </StatusPill>
                </div>

                <div className="mt-3 flex items-center gap-3 text-[12px] text-ink-faint">
                  <span className="font-mono tnum">
                    {new Date(p.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {p.shareEngagement && p.shareEngagement.viewCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3" strokeWidth={1.75} aria-hidden="true" />
                      {p.shareEngagement.viewCount} {p.shareEngagement.viewCount === 1 ? 'view' : 'views'}
                    </span>
                  )}
                </div>

                {/* Share decision-state row — the agency's feedback loop */}
                {shareStateLabel && shareStateVariant ? (
                  <div className="mt-2.5 pt-2.5 border-t border-border/50 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-faint">
                      <Share2 className="size-3" strokeWidth={1.75} aria-hidden="true" />
                      Client share
                    </span>
                    <StatusPill variant={shareStateVariant}>
                      {shareStateLabel}
                    </StatusPill>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {!loading && projects.length > 0 && (
        <p className="mt-4 text-[12px] text-ink-faint">
          Showing {filtered.length} of {projects.length} {projects.length === 1 ? 'case' : 'cases'}
        </p>
      )}
    </div>
  );
}
