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

      {/* ── 3. CAPABILITIES (What Viableo answers) ───────────── */}
      <NumberedSection number="02" title="Capabilities">
        <DisplayHeading className="mb-8">
          {WHAT_HEADLINE}
        </DisplayHeading>
        <p className="mb-16 max-w-2xl text-lg leading-relaxed text-ink-muted">
          {WHAT_SUBHEAD}
        </p>
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-2">
          {WHAT_ITEMS.map((item, i) => (
            <Card key={i} className="border-0 bg-canvas">
              <div className="flex items-start gap-6">
                <span className="font-mono text-sm text-amber-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h3 className="mb-3 text-lg font-medium text-ink">{item.q}</h3>
                  <p className="text-base leading-relaxed text-ink-muted">{item.a}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </NumberedSection>

      {/* ── 4. PROCESS ──────────────────────────────────────── */}
      <NumberedSection number="03" title="Process">
        <DisplayHeading className="mb-16">
          Scope. Model.
          <br />
          <span className="text-ink-muted">Stress-test. Decide.</span>
        </DisplayHeading>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {[
            { n: '01', title: 'Scope', desc: 'Drop in the workload, the labor cost, and the fee you\u2019re considering.' },
            { n: '02', title: 'Model', desc: 'ROI, payback, annual benefit, and net first-year value \u2014 computed deterministically.' },
            { n: '03', title: 'Stress-test', desc: 'Sweep every assumption \u00B120%. 64 permutations. Find the breaking point.' },
            { n: '04', title: 'Decide', desc: 'BUILD, CONSIDER, or DON\u2019T BUILD \u2014 with the confidence score and the business case.' },
          ].map((step) => (
            <div key={step.n}>
              <span className="mb-4 block font-mono text-sm text-amber-400">{step.n}</span>
              <h3 className="mb-3 font-display text-2xl tracking-tight text-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </NumberedSection>

      {/* ── 5. DECISION FRAMEWORK ───────────────────────────── */}
      <NumberedSection number="04" title="Decision framework">
        <DisplayHeading className="mb-16">
          {BREAK_HEADLINE}
        </DisplayHeading>
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-ink/10 bg-ink/10 lg:grid-cols-3">
          {/* Conservative */}
          <Card className="border-0 bg-canvas">
            <span className="mb-4 block font-mono text-xs text-ink-muted">CONSERVATIVE</span>
            <Metric
              value={formatCurrency(APEX_ALL.conservative.netAnnualBenefit)}
              label="Net annual benefit"
              sublabel={`ROI ${formatRoi(APEX_ALL.conservative.roiPct)} · ${formatPayback(APEX_ALL.conservative.paybackMonths)} payback`}
            />
          </Card>
          {/* Expected */}
          <Card className="border-0 bg-canvas">
            <span className="mb-4 block font-mono text-xs text-amber-400">EXPECTED</span>
            <Metric
              value={FMT_NET}
              label="Net annual benefit"
              sublabel={`ROI ${FMT_ROI} · ${FMT_PAYBACK} payback`}
            />
          </Card>
          {/* Upside */}
          <Card className="border-0 bg-canvas">
            <span className="mb-4 block font-mono text-xs text-ink-muted">UPSIDE</span>
            <Metric
              value={formatCurrency(APEX_ALL.upside.netAnnualBenefit)}
              label="Net annual benefit"
              sublabel={`ROI ${formatRoi(APEX_ALL.upside.roiPct)} · ${formatPayback(APEX_ALL.upside.paybackMonths)} payback`}
            />
          </Card>
        </div>

        {/* Breaking point + confidence */}
        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden border border-ink/10 bg-ink/10 lg:grid-cols-2">
          <Card className="border-0 bg-canvas">
            <span className="mb-4 block font-mono text-xs text-ink-muted">{BREAK_BREAKING_POINT_LABEL}</span>
            <Metric value={FMT_BREAK} label="Maximum defensible implementation fee" />
          </Card>
          <Card className="border-0 bg-canvas">
            <span className="mb-4 block font-mono text-xs text-ink-muted">CONFIDENCE</span>
            <Metric
              value={String(APEX_CONFIDENCE.score)}
              label={confidenceLabel(APEX_CONFIDENCE.score)}
              sublabel={`${PERMUTATION_COUNT} permutations swept`}
            />
          </Card>
        </div>
      </NumberedSection>

      {/* ── 6. LIVE BUSINESS-CASE METRICS ───────────────────── */}
      <NumberedSection number="05" title="Live business-case metrics">
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

      {/* ── 7. AGENCY WORKFLOW ──────────────────────────────── */}
      <NumberedSection number="06" title="Agency workflow">
        <DisplayHeading className="mb-16">
          From discovery
          <br />
          <span className="text-ink-muted">to decision.</span>
        </DisplayHeading>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {[
            { step: 'Discovery', desc: 'Client asks you to build an automation. You have a rough scope and a fee in mind.' },
            { step: 'Economics', desc: 'Viableo structures the inputs and computes the full economic picture deterministically.' },
            { step: 'Proposal', desc: 'The business case is generated \u2014 scenarios, sensitivity, confidence, verdict.' },
            { step: 'Client decision', desc: 'The client sees the same document you see. No black box. The answer defends itself.' },
          ].map((item, i) => (
            <div key={i}>
              <span className="mb-4 block font-mono text-sm text-amber-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mb-3 text-lg font-medium text-ink">{item.step}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </NumberedSection>

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

      {/* ── 9. CLIENT BUSINESS CASE ─────────────────────────── */}
      <NumberedSection number="08" title="Client business case">
        <DisplayHeading className="mb-16">
          What your client
          <br />
          <span className="text-ink-muted">actually receives.</span>
        </DisplayHeading>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Metric value={FMT_ROI} label="ROI" />
              <Metric value={FMT_PAYBACK} label="Payback" />
              <Metric value={FMT_NET} label="Net benefit" />
              <Metric value={FMT_BREAK} label="Breaking point" />
            </div>
            <p className="text-base leading-relaxed text-ink-muted">
              The verdict, the fee where it flips, and a document your client can
              check line by line \u2014 inputs, math, scenarios, sensitivity, confidence.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/start?start=1">Run your first case</PrimaryButton>
              <SecondaryButton href="/start?start=1&example=apex">See a completed case</SecondaryButton>
            </div>
          </div>
          {/* Report preview mock */}
          <Card className="flex flex-col gap-4">
            <span className="font-mono text-xs text-ink-muted">BUSINESS CASE PREVIEW</span>
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <span className="text-lg font-medium text-ink">Apex Home Services</span>
              <span className="font-mono text-sm text-amber-400">
                {APEX_VERDICT === 'build' ? 'BUILD' : APEX_VERDICT === 'consider' ? 'CONSIDER' : "DON'T BUILD"}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-4 font-mono text-sm">
              <div>
                <dt className="text-ink-muted">Implementation fee</dt>
                <dd className="text-ink">{formatCurrency(APEX_INPUTS.implementationFee)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Annual benefit</dt>
                <dd className="text-ink">{FMT_BENEFIT}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">First-year cost</dt>
                <dd className="text-ink">{FMT_COST}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Confidence</dt>
                <dd className="text-ink">{APEX_CONFIDENCE.score}/100</dd>
              </div>
            </dl>
            <div className="border-t border-ink/10 pt-4 text-xs text-ink-muted">
              Generated by Viableo \u2014 every number traces to an input you can see.
            </div>
          </Card>
        </div>
      </NumberedSection>

      {/* ── 10. PRICING ─────────────────────────────────────── */}
      <ComputePricing />

      {/* ── 11. FAQ ────────────────────────────────────────── */}
      <ComputeFAQ />

      {/* ── 12. FINAL CTA ─────────────────────────────────── */}
      <ComputeCTA />
    </main>
  );
}
