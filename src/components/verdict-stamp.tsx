'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPayback, verdictLabel } from '@/lib/format';

interface VerdictStampProps {
  recommendation: 'build' | 'consider' | 'dont_build';
  paybackMonths: number | null;
  roiPct: number | null;
  netAnnualBenefit: number;
  size?: 'lg' | 'md';
  className?: string;
}

/**
 * The signature element of the product: a stamped rectangle with a thin
 * DOUBLE-rule border (auditor's sign-off / currency-seal grammar), the verdict
 * word set in heavy tracked capitals, and the payback + net annual benefit in
 * tabular mono numerals beside it.
 *
 * Renders identically (same visual grammar) in the app, the PDF, and the
 * proposal. Has NO interactive states — it is a sign-off.
 */
const BORDER_TOKEN: Record<VerdictStampProps['recommendation'], string> = {
  build: 'border-build outline-build',
  consider: 'border-consider outline-consider',
  dont_build: 'border-dont-build outline-dont-build',
};

const TEXT_TOKEN: Record<VerdictStampProps['recommendation'], string> = {
  build: 'text-build',
  consider: 'text-consider',
  dont_build: 'text-dont-build',
};

export function VerdictStamp({
  recommendation,
  paybackMonths,
  // roiPct is part of the public API (so callers can flow it through) but is
  // intentionally not rendered inside the stamp — the two headline numbers
  // are payback and net annual benefit, by design.
  netAnnualBenefit,
  size = 'lg',
  className,
}: VerdictStampProps) {
  const isLg = size === 'lg';
  const border = BORDER_TOKEN[recommendation];
  const text = TEXT_TOKEN[recommendation];

  return (
    <div
      role="status"
      aria-label={`Verdict ${verdictLabel(recommendation)}, payback ${formatPayback(
        paybackMonths
      )}, net annual benefit ${formatCurrency(netAnnualBenefit)}`}
      className={cn(
        'inline-flex items-center rounded-lg border-2 bg-canvas outline outline-1 outline-offset-2',
        border,
        isLg ? 'gap-6 px-8 py-6' : 'gap-4 px-5 py-4',
        className
      )}
    >
      <div
        className={cn(
          'font-display font-bold uppercase tracking-[0.12em]',
          text,
          isLg ? 'text-4xl' : 'text-2xl'
        )}
      >
        {verdictLabel(recommendation)}
      </div>

      <div className="w-px bg-border-strong h-10" aria-hidden="true" />

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-muted">
          Payback
        </span>
        <span
          className={cn(
            'font-mono tnum font-medium text-ink',
            isLg ? 'text-3xl' : 'text-xl'
          )}
        >
          {formatPayback(paybackMonths)}
        </span>
      </div>

      {isLg && (
        <>
          <div className="w-px bg-border-strong h-12" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-ink-muted">
              Net annual benefit
            </span>
            <span className="font-mono tnum text-3xl font-medium text-ink">
              {formatCurrency(netAnnualBenefit, { compact: true })}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
