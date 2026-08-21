'use client';

/**
 * PerformanceContent — the "ROI Performance" section.
 *
 * Honest state. The /api/projects list payload does NOT include the `results`
 * JSON (only id, clientName, recommendation, createdAt, updatedAt,
 * shareEngagement), so per-case ROI, payback, and scenario breakdown CANNOT
 * be computed from the list without an N+1 fetch.
 *
 * We refuse to fabricate. The section points the user to the Cases list to
 * open an individual case for its full economics, and links to the
 * Methodology page for the math.
 */
import { ArrowRight, Gauge, FileText, BookOpen } from 'lucide-react';

export function PerformanceContent() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface-raised p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle">
            <Gauge className="h-4 w-4 text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[14px] font-medium text-ink">Per-case economics</h2>
            <p className="text-[11px] text-ink-faint">Open a case to see its ROI, payback, and scenario breakdown.</p>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          Viableo computes three scenarios per case — Conservative, Expected,
          and Upside — and reports the first-year net, payback months, and
          breaking-point fee for each. These figures live on the case detail,
          not in the dashboard list, so we do not surface an aggregate here.
          Open a case from the Cases list to inspect its numbers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-raised p-5">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
            <h3 className="text-[12.5px] font-medium text-ink">Where to find them</h3>
          </div>
          <p className="text-[12px] leading-relaxed text-ink-muted">
            Each case in the Cases list opens to its full breakdown: scenario
            table, sensitivity bars, breaking-point line, and the verdict stamp.
            Aggregate ROI across cases is not a meaningful number — a $4k
            payback on a $2k case is not the same as $400k on a $200k case.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-raised p-5">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
            <h3 className="text-[12.5px] font-medium text-ink">How Viableo computes ROI</h3>
          </div>
          <p className="text-[12px] leading-relaxed text-ink-muted">
            Three scenarios (Conservative / Expected / Upside) across 64
            permutations. BUILD requires the Conservative case to pay back
            within 12 months and confidence ≥ 60. The full math is published.
          </p>
          <a
            href="/methodology"
            className="mt-3 inline-flex items-center gap-1 text-[11px] text-brand transition-colors hover:text-brand-hover"
          >
            Read the methodology
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </div>
  );
}
