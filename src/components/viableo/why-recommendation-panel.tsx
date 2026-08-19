'use client';

/**
 * WhyRecommendationPanel — Expandable panel showing why the verdict was reached.
 *
 * Reads the decision tree branches from recommendation.ts (Section 10) and
 * presents them in an Accordion. Shows:
 *   1. Threshold analysis (confidence vs 60, payback vs 12mo, ROI > 50%)
 *   2. Which branch of the decision tree fired
 *   3. A plain-language rationale sentence
 */
import * as React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Dot } from './dot';
import { DecisionBadge } from './decision-badge';
import { cn } from '@/lib/utils';
import { generateRationaleSentence, getDecisionTreeBranch } from '@/lib/recommendation-helpers';
import type { DecisionKey } from '@/lib/brand';

// ── Types ──────────────────────────────────────────────────

type Verdict = 'build' | 'consider' | 'dont_build';

export interface WhyRecommendationPanelProps {
  verdict: Verdict;
  confidence: number;
  conservativePayback: number;
  bestCaseRoi: number;
  className?: string;
}

// ── Threshold gate component ────────────────────────────────

interface GateProps {
  label: string;
  value: string;
  threshold: string;
  passed: boolean;
}

function ThresholdGate({ label, value, threshold, passed }: GateProps) {
  return (
    <div className="flex items-center gap-3 min-h-[44px]">
      {/* Status indicator */}
      <span
        className={cn(
          'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
          passed
            ? 'bg-build-bg text-build'
            : 'bg-dont-build-bg text-dont-build',
        )}
        aria-label={passed ? 'Passed' : 'Failed'}
      >
        {passed ? '\u2713' : '\u2717'}
      </span>
      <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono tnum text-[13px] text-ink">{value}</span>
          <span className="text-[12px] text-ink-muted">vs</span>
          <span className="font-mono tnum text-[12px] text-ink-muted">{threshold}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────

export function WhyRecommendationPanel({
  verdict,
  confidence,
  conservativePayback,
  bestCaseRoi,
  className,
}: WhyRecommendationPanelProps) {
  const decision = verdict as DecisionKey;
  const rationale = generateRationaleSentence(verdict, confidence, conservativePayback);
  const branchDescription = getDecisionTreeBranch(
    verdict,
    confidence,
    conservativePayback,
    bestCaseRoi,
  );

  // Threshold checks for BUILD gates
  const confidencePasses = confidence >= 60;
  const paybackPasses = conservativePayback != null && conservativePayback <= 12;
  const roiPasses = bestCaseRoi > 50;

  const paybackDisplay =
    conservativePayback != null
      ? `${conservativePayback.toFixed(1)} mo`
      : 'N/A';

  return (
    <section
      className={cn('rounded-lg border border-border bg-surface p-5 md:p-6', className)}
      aria-label="Why this recommendation"
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
          <Dot size="sm" />
          Why this verdict
        </div>
        <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-ink">
          How the decision was reached
        </h3>
      </div>

      {/* Verdict badge + rationale sentence */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <DecisionBadge decision={decision} size="lg" />
        <p className="text-[14px] leading-snug text-ink-muted">{rationale}</p>
      </div>

      {/* Accordion sections */}
      <Accordion type="multiple" className="w-full">
        {/* Threshold analysis */}
        <AccordionItem value="thresholds" className="border-border">
          <AccordionTrigger className="text-[13px] font-medium text-ink hover:no-underline">
            Threshold analysis
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <ThresholdGate
                label="Confidence score"
                value={`${confidence}`}
                threshold="\u2265 60"
                passed={confidencePasses}
              />
              <ThresholdGate
                label="Conservative payback"
                value={paybackDisplay}
                threshold="\u2264 12 mo"
                passed={!!paybackPasses}
              />
              <ThresholdGate
                label="Conservative ROI"
                value={`${Math.round(bestCaseRoi)}%`}
                threshold="> 50%"
                passed={roiPasses}
              />
            </div>
            <p className="mt-4 text-[12px] text-ink-muted">
              BUILD requires all three gates to pass. CONSIDER fires when the economics
              are positive but one or more gates fail, or confidence is in the 40–59 band.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Decision tree branch */}
        <AccordionItem value="branch" className="border-border">
          <AccordionTrigger className="text-[13px] font-medium text-ink hover:no-underline">
            Which branch fired
          </AccordionTrigger>
          <AccordionContent>
            <div className="rounded-md border border-border bg-canvas p-4">
              <p className="text-[14px] leading-snug text-ink">
                {branchDescription}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
