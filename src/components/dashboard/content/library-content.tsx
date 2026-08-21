'use client';

/**
 * LibraryContent — the "Library" section.
 *
 * The existing AgencyLibraryView requires an `organizationId` prop and
 * renders its own full-page header — embedding it inside the dashboard main
 * area would create nested layouts and an awkward second header. Cleanest
 * integration: render an honest pointer to the projects view (which IS the
 * library) with a single CTA.
 */
import { Library as LibraryIcon, ArrowRight, ChevronRight, FileText } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useTier } from '@/lib/store';

export function LibraryContent() {
  const go = useApp((s) => s.go);
  const tier = useTier();
  const isPro = tier === 'pro' || tier === 'agency' || tier === 'agency_pro';

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface-raised p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle">
            <LibraryIcon className="h-4 w-4 text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[14px] font-medium text-ink">Case library</h2>
            <p className="text-[11px] text-ink-faint">Every saved analysis, searchable and filterable</p>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          Your case library is the projects view — every saved analysis with search, client filter, verdict filter, and a date-range picker. Click a case to reopen it in the results view.
        </p>
        <button
          type="button"
          onClick={() => go('projects')}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-cta px-4 py-2 text-[12px] font-medium text-brand-foreground transition-colors hover:bg-brand-cta-hover"
        >
          <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
          Open Case Library
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Helper copy */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-raised p-4">
          <h3 className="mb-1 text-[12.5px] font-medium text-ink">Search and filter</h3>
          <p className="text-[11.5px] leading-relaxed text-ink-muted">
            Filter by client name, verdict, or last 7 / 30 / 90 days. The list
            shows share views when a case has been shared.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-raised p-4">
          <h3 className="mb-1 text-[12.5px] font-medium text-ink">
            {isPro ? 'Client history reuse' : 'Reuse with Pro'}
          </h3>
          <p className="text-[11.5px] leading-relaxed text-ink-muted">
            {isPro
              ? 'Start a new case from a prior client\'s inputs to keep default assumptions consistent across engagements.'
              : 'Pro unlocks client history — start a new case pre-filled with a prior client\'s assumptions.'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => go('projects')}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-raised p-4 text-left transition-colors hover:border-border-strong"
      >
        <div>
          <p className="text-[13px] font-medium text-ink">Open Case Library</p>
          <p className="text-[11px] text-ink-faint">All saved analyses with filters</p>
        </div>
        <ChevronRight className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
      </button>
    </div>
  );
}
