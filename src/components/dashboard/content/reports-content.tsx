'use client';

/**
 * ReportsContent — the "Reports" section.
 *
 * Reports in Viableo are generated PER CASE (client report + proposal PDFs),
 * not as a separate top-level entity. The /api/projects list payload does not
 * include reports, so we render an honest state pointing to the Cases list
 * with the per-case actions ("Generate client report" / "Generate proposal")
 * that live on the case detail view.
 *
 * No fabricated report counts.
 */
import { FileBarChart, ArrowRight, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useTier } from '@/lib/store';
import type { SavedProject } from '@/lib/store';

interface ReportsContentProps {
  projects: SavedProject[];
}

export function ReportsContent({ projects }: ReportsContentProps) {
  const go = useApp((s) => s.go);
  const tier = useTier();
  const isPro = tier === 'pro' || tier === 'agency' || tier === 'agency_pro';
  const hasCases = projects.length > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface-raised p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle">
            <FileBarChart className="h-4 w-4 text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[14px] font-medium text-ink">Per-case reports</h2>
            <p className="text-[11px] text-ink-faint">Generated from each saved analysis</p>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          Reports are generated per case. Open a case and click <span className="font-medium text-ink">Generate client report</span> or <span className="font-medium text-ink">Generate proposal</span> on the case detail view. The report PDF is built fresh from the project&apos;s inputs and results — every figure traced, every input labelled.
        </p>

        <button
          type="button"
          onClick={() => go('projects')}
          disabled={!hasCases}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-cta px-4 py-2 text-[12px] font-medium text-brand-foreground transition-colors hover:bg-brand-cta-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileBarChart className="h-3.5 w-3.5" strokeWidth={1.5} />
          Open a case to generate
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Honest states */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StateCard
          label="Client report"
          body="The full case — verdict, scenarios, sensitivity, breaking point. Starter gets watermarked; Pro is clean."
          locked={!isPro}
        />
        <StateCard
          label="Proposal PDF"
          body="A client-facing proposal built from the case. Pro unlocks branding and unwatermarked export."
          locked={!isPro}
        />
        <StateCard
          label="Share link"
          body="Send a read-only view with approval tracking. Decision state flows back to your dashboard."
          locked={!isPro}
        />
      </div>

      {!hasCases && (
        <div className="rounded-lg border border-border bg-surface-raised p-5 text-center">
          <p className="text-[13px] text-ink-muted">
            Run your first case to unlock report generation.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => go('projects')}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-raised p-4 text-left transition-colors hover:border-border-strong"
      >
        <div>
          <p className="text-[13px] font-medium text-ink">Open Case Library</p>
          <p className="text-[11px] text-ink-faint">Pick a case, then generate</p>
        </div>
        <ChevronRight className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function StateCard({ label, body, locked }: { label: string; body: string; locked: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-[12.5px] font-medium text-ink">{label}</h3>
        {locked && (
          <span className="rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-ink-faint">
            Pro
          </span>
        )}
      </div>
      <p className="text-[11.5px] leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
