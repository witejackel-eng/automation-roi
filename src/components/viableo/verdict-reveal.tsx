'use client';

/**
 * VerdictReveal — P2 feature extending CountUp (Section 10.1, 10.3).
 *
 * Applies count-up animation to the confidence score and ROI multiple
 * on first reveal. Respects prefers-reduced-motion — shows final values
 * immediately if reduced motion is preferred. Uses the existing CountUp
 * component pattern.
 */
import * as React from 'react';
import { CountUp } from './count-up';
import { cn } from '@/lib/utils';

interface VerdictRevealProps {
  /** Confidence score 0–100. */
  confidenceScore: number;
  /** ROI multiple (e.g. 4.99 for 499%). */
  roiMultiple: number | null;
  /** Net annual benefit in dollars. */
  netAnnualBenefit: number;
  className?: string;
}

export function VerdictReveal({
  confidenceScore,
  roiMultiple,
  netAnnualBenefit,
  className,
}: VerdictRevealProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-5 sm:grid-cols-3',
        className,
      )}
      aria-label="Key metrics"
    >
      {/* Confidence score */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] uppercase tracking-wide text-ink-muted">
          Confidence
        </span>
        <div className="font-mono tnum">
          <CountUp
            value={confidenceScore}
            suffix="/100"
            decimals={0}
            retriggerOnValueChange
            className="text-[32px] font-medium leading-none text-ink md:text-[36px]"
          />
        </div>
        <span className="text-[12px] text-ink-muted">
          How much rests on real data
        </span>
      </div>

      {/* ROI multiple */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] uppercase tracking-wide text-ink-muted">
          ROI
        </span>
        <div className="font-mono tnum">
          {roiMultiple == null ? (
            <span className="text-[32px] font-medium leading-none text-ink-muted md:text-[36px]">
              N/A
            </span>
          ) : (
            <CountUp
              value={roiMultiple}
              suffix="×"
              decimals={1}
              retriggerOnValueChange
              className="text-[32px] font-medium leading-none text-ink md:text-[36px]"
            />
          )}
        </div>
        <span className="text-[12px] text-ink-muted">
          Return on first-year cost
        </span>
      </div>

      {/* Net annual benefit */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] uppercase tracking-wide text-ink-muted">
          Net annual benefit
        </span>
        <div className="font-mono tnum">
          <CountUp
            value={netAnnualBenefit}
            prefix="$"
            decimals={0}
            retriggerOnValueChange
            className={cn(
              'text-[32px] font-medium leading-none md:text-[36px]',
              netAnnualBenefit >= 0 ? 'text-build' : 'text-dont-build',
            )}
          />
        </div>
        <span className="text-[12px] text-ink-muted">
          Annual benefit minus first-year cost
        </span>
      </div>
    </div>
  );
}
