'use client';

/**
 * RiskContent — the "Risk" section.
 *
 * Lists cases whose verdict is CONSIDER or DON'T BUILD — these are the cases
 * that warrant founder attention. Each row shows client name, verdict pill,
 * relative time, and (if available) share status.
 *
 * Empty state: "No risk cases. Every case you've saved came back BUILD."
 */
import * as React from 'react';
import { ShieldCheck, ShieldAlert, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import type { SavedProject } from '@/lib/store';
import { StatusPill } from '@/components/status-pill';
import {
  verdictMetaFor,
  formatRelativeTime,
  shareStatusLabel,
} from '../verdict';

interface RiskContentProps {
  projects: SavedProject[];
  loading: boolean;
}

export function RiskContent({ projects, loading }: RiskContentProps) {
  const reopenProject = useApp((s) => s.reopenProject);
  const go = useApp((s) => s.go);
  const startCalculator = useApp((s) => s.startCalculator);

  const riskCases = React.useMemo(
    () =>
      projects
        .filter((p) => p.recommendation === 'consider' || p.recommendation === 'dont_build')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [projects],
  );

  const considerCount = riskCases.filter((p) => p.recommendation === 'consider').length;
  const dontBuildCount = riskCases.filter((p) => p.recommendation === 'dont_build').length;

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface-raised p-5">
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (riskCases.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-surface-raised p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-build-bg">
          <ShieldCheck className="h-6 w-6 text-build" strokeWidth={1.5} />
        </div>
        <h2 className="mb-2 text-[18px] font-semibold text-ink">No risk cases.</h2>
        <p className="mx-auto mb-6 max-w-md text-[14px] leading-relaxed text-ink-muted">
          Every case you&apos;ve saved came back BUILD. The model is willing to
          say no — when it does, those cases land here.
        </p>
        <button
          type="button"
          onClick={() => startCalculator()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-cta px-5 py-2.5 text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand-cta-hover"
        >
          <Zap className="h-4 w-4" strokeWidth={1.5} />
          Run New Case
        </button>
      </div>
    );
  }

  const handleCaseClick = async (id: string) => {
    const ok = await reopenProject(id);
    if (!ok) go('projects');
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCell
          icon={ShieldAlert}
          label="Risk cases"
          value={riskCases.length}
          tone="critical"
        />
        <SummaryCell
          icon={ShieldAlert}
          label="CONSIDER"
          value={considerCount}
          tone="consider"
        />
        <SummaryCell
          icon={ShieldAlert}
          label="DON'T BUILD"
          value={dontBuildCount}
          tone="critical"
        />
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
        <div className="border-b border-border px-4 py-2.5">
          <h3 className="text-[13px] font-medium text-ink">Cases flagged for review</h3>
          <p className="text-[11px] text-ink-faint">CONSIDER and DON&apos;T BUILD verdicts</p>
        </div>
        <ul className="divide-y divide-border/50">
          {riskCases.map((p) => {
            const meta = verdictMetaFor(p.recommendation);
            const share = shareStatusLabel(p);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => handleCaseClick(p.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dot)} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{p.clientName || 'Untitled case'}</p>
                    <p className="text-[11px] text-ink-faint">Updated {formatRelativeTime(p.updatedAt)}</p>
                  </div>
                  <StatusPill variant={meta.key}>{meta.labelPretty}</StatusPill>
                  <span className="hidden font-mono text-[10px] text-ink-faint sm:inline">{share.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function SummaryCell({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ShieldAlert;
  label: string;
  value: number;
  tone: 'consider' | 'critical';
}) {
  const toneClass = tone === 'critical' ? 'text-dont-build bg-dont-build-bg' : 'text-consider bg-consider-bg';
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', toneClass)}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">{label}</span>
      </div>
      <p className="font-mono text-[22px] font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
