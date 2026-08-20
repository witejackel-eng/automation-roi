/**
 * ComputeHomepage — the full marketing homepage, rebuilt from scratch using
 * the COMPUTE template as the exact visual blueprint.
 *
 * Server component. Computes real Apex engine numbers at module scope and
 * renders them as static HTML. Client-interactive sections (hero, pricing,
 * faq, cta) are imported as separate client components.
 *
 * Section architecture (per master prompt §10):
 *   1. HERO
 *   2. KEY NUMBERS / DECISION PROOF
 *   3. CAPABILITIES (what Viableo answers)
 *   4. PROCESS (scope → model → stress-test → decide)
 *   5. DECISION FRAMEWORK (scenarios + confidence + breaking point)
 *   6. LIVE BUSINESS-CASE METRICS
 *   7. AGENCY WORKFLOW (discovery → decision)
 *   8. PRACTITIONER PROOF (real r/agency + r/n8n sources)
 *   9. CLIENT BUSINESS CASE
 *  10. PRICING
 *  11. FAQ
 *  12. FINAL CTA
 */
import * as React from 'react';
import Link from 'next/link';
import {
  Container,
  SectionLabel,
  DisplayHeading,
  NumberedSection,
  Metric,
  Card,
  Rule,
  PrimaryButton,
  SecondaryButton,
} from './primitives';
import { ComputeHero } from './hero';
import { ComputePricing } from './pricing';
import { ComputeFAQ } from './faq';
import { ComputeCTA } from './cta';
import { ComputeFeatures } from './features';
import { ComputeHowItWorks } from './how-it-works';
import { ComputeInfrastructure } from './infrastructure';
import { ComputeIntegrations } from './integrations';
import { ComputeDevelopers } from './developers';

import { APEX_INPUTS } from '@/lib/golden-case';
import {
  calculateScenario,
  calculateAllScenarios,
  type CalculatorInputs,
} from '@/lib/calculations/engine';
import { recommend } from '@/lib/calculations/recommendation';
import { computeBreakEven, computeSensitivity, PERMUTATION_COUNT } from '@/lib/calculations/stress-test';
import {
  computeConfidenceScore,
  confidenceLabel,
  type InputStatus,
} from '@/lib/calculations/confidence';
import {
  formatCurrency,
  formatPayback,
  formatRoi,
} from '@/lib/format';
import {
  HERO_HEADLINE,
  HERO_SUBHEAD,
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
  PROBLEM_HEADLINE,
  PROBLEM_SUBHEAD,
  PROBLEM_PARAS,
  WHAT_HEADLINE,
  WHAT_SUBHEAD,
  WHAT_ITEMS,
  BREAK_HEADLINE,
  BREAK_BREAKING_POINT_LABEL,
  CONSEQUENCE_ITEMS,
  CONSEQUENCE_CLOSING,
  CONSEQUENCE_CLOSING_SOURCE,
} from '@/lib/brand';

// ── Real Apex numbers, computed once at module load ─────────────────
const APEX_EXPECTED = calculateScenario(APEX_INPUTS, 'expected');
const APEX_ALL = calculateAllScenarios(APEX_INPUTS);
const APEX_BREAK_EVEN = computeBreakEven(APEX_INPUTS, 'expected');
const APEX_SENSITIVITY = computeSensitivity(APEX_INPUTS, 'expected');
const APEX_RECOMMENDATION = recommend(APEX_EXPECTED);
const APEX_CONFIDENCE_STATUSES: Record<string, InputStatus> = {
  hourlyCost: 'provided',
  leadsPerMonth: 'provided',
  implementationFee: 'provided',
  expectedAutomationPct: 'estimated',
  expectedConversionImprovementPct: 'estimated',
  errorCost: 'assumption',
  otherInputs: 'assumption',
};
const APEX_CONFIDENCE = computeConfidenceScore(APEX_CONFIDENCE_STATUSES);
const BREAK_POINT_FEE = APEX_BREAK_EVEN.implementationFee ?? 0;
const APEX_VERDICT = APEX_RECOMMENDATION.recommendation;

const FMT_NET = formatCurrency(APEX_EXPECTED.netAnnualBenefit);
const FMT_PAYBACK = formatPayback(APEX_EXPECTED.paybackMonths);
const FMT_BREAK = formatCurrency(BREAK_POINT_FEE);
const FMT_ROI = formatRoi(APEX_EXPECTED.roiPct);
const FMT_BENEFIT = formatCurrency(APEX_EXPECTED.totalAnnualBenefit);
const FMT_COST = formatCurrency(APEX_EXPECTED.totalFirstYearCost);

export function ComputeHomepage() {
  return (
    <main>
      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <ComputeHero
        netAnnualBenefit={FMT_NET}
        paybackMonths={FMT_PAYBACK}
        breakPointFee={FMT_BREAK}
      />

      {/* ── 2. KEY NUMBERS / DECISION PROOF ──────────────────── */}
      <NumberedSection number="01" title="Decision proof">
        <DisplayHeading className="mb-16">
          The answer, before
          <br />
          <span className="text-ink-muted">you read a word.</span>
        </DisplayHeading>
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-3">
          <Card className="border-0 bg-canvas">
            <Metric value={FMT_NET} label="Expected first-year net" sublabel="Apex reference case" />
          </Card>
          <Card className="border-0 bg-canvas">
            <Metric value={FMT_PAYBACK} label="Payback period" sublabel="months to break even" />
          </Card>
          <Card className="border-0 bg-canvas">
            <Metric value={FMT_BREAK} label="Answer holds until" sublabel="implementation fee threshold" />
          </Card>
        </div>
      </NumberedSection>

      {/* ── 3. CAPABILITIES (What Viableo answers) — COMPUTE features section ── */}
      <ComputeFeatures />

      {/* ── 4. PROCESS — COMPUTE how-it-works section (tree image) ──────── */}
      <ComputeHowItWorks />

      {/* ── 5. DECISION FRAMEWORK — COMPUTE infrastructure section (globe) ── */}
      <ComputeInfrastructure />

      {/* ── 6. LIVE BUSINESS-CASE METRICS ───────────────────── */}
      <NumberedSection number="05" title="Live business-case metrics">
        {/* The actual COMPUTE real-time graph image (preserved per directive §4) */}
        <div className="mb-8 w-full">
          { }
          <img
            src="/marketing/compute/metrics/real-time-graph.png"
            alt="Real-time business-case metrics visualization"
            className="h-auto w-full object-cover"
          />
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-0 bg-canvas">
            <Metric value={FMT_ROI} label="ROI" sublabel="expected scenario" />
          </Card>
          <Card className="border-0 bg-canvas">
            <Metric value={FMT_PAYBACK} label="Payback" sublabel="months" />
          </Card>
          <Card className="border-0 bg-canvas">
            <Metric value={FMT_BENEFIT} label="Annual benefit" sublabel="labor + revenue" />
          </Card>
          <Card className="border-0 bg-canvas">
            <Metric value={FMT_COST} label="First-year cost" sublabel="implementation + recurring" />
          </Card>
          <Card className="border-0 bg-canvas">
            <Metric value={FMT_BREAK} label="Threshold" sublabel="answer holds until" />
          </Card>
        </div>
      </NumberedSection>

      {/* ── 7. WORKFLOW — COMPUTE integrations section (connection image) ── */}
      <ComputeIntegrations />

      {/* ── 8. PRACTITIONER PROOF ───────────────────────────── */}
      <NumberedSection number="07" title="Practitioner proof">
        <DisplayHeading className="mb-16">
          What practitioners
          <br />
          <span className="text-ink-muted">actually report.</span>
        </DisplayHeading>
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-3">
          {CONSEQUENCE_ITEMS.map((item, i) => (
            <Card key={i} className="border-0 bg-canvas">
              <div className="mb-6 text-4xl font-bold text-amber-400">&ldquo;</div>
              <p className="mb-8 min-h-[120px] text-base leading-relaxed text-ink">
                {item.body}
              </p>
              <a
                href={item.source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors hover:text-amber-400"
              >
                Source: {item.source.label}
              </a>
            </Card>
          ))}
        </div>
        <div className="mt-8 max-w-2xl text-base leading-relaxed text-ink-muted">
          {CONSEQUENCE_CLOSING}{' '}
          <a
            href={CONSEQUENCE_CLOSING_SOURCE.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 underline underline-offset-4 hover:text-amber-300"
          >
            {CONSEQUENCE_CLOSING_SOURCE.label}
          </a>
        </div>
      </NumberedSection>

      {/* ── 9. CLIENT BUSINESS CASE — COMPUTE developers section (bottom-right image) ── */}
      <ComputeDevelopers />

      {/* ── 10. PRICING ─────────────────────────────────────── */}
      <ComputePricing />

      {/* ── 11. FAQ ────────────────────────────────────────── */}
      <ComputeFAQ />

      {/* ── 12. FINAL CTA ─────────────────────────────────── */}
      <ComputeCTA />
    </main>
  );
}
