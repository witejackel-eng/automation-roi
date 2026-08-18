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
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { has } from '@/lib/entitlement';
import { StatusPill } from '@/components/status-pill';
import { Skeleton } from '@/components/ui/skeleton';
import { DECISION_LABELS, TERM, type DecisionKey } from '@/lib/brand';
import type { SavedProject } from '@/lib/store';

export function ProjectsView() {
  const { entitlement, projects, setProjects, startCalculator, go } = useApp(
    useShallow((s) => ({
      entitlement: s.entitlement,
      projects: s.projects,
      setProjects: s.setProjects,
      startCalculator: s.startCalculator,
      go: s.go,
    }))
  );
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);

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
          className="min-h-[44px] gap-1.5 bg-brand text-brand-foreground hover:bg-brand-hover"
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
        <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
          <table className="w-full text-[14px]">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium text-ink-muted">Client</th>
                <th className="px-5 py-2.5 text-left font-medium text-ink-muted">
                  {TERM.decision}
                </th>
                <th className="px-5 py-2.5 text-right font-medium text-ink-muted">Created</th>
                <th className="px-5 py-2.5 text-right font-medium text-ink-muted">Updated</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const decisionKey = p.recommendation as DecisionKey;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface/50"
                  >
                    <td className="px-5 py-3 font-medium text-ink">{p.clientName}</td>
                    <td className="px-5 py-3">
                      <StatusPill variant={p.recommendation}>
                        {DECISION_LABELS[decisionKey]}
                      </StatusPill>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
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
        className="mt-2 min-h-[44px] bg-brand text-brand-foreground hover:bg-brand-hover"
      >
        {cta}
      </Button>
    </div>
  );
}
