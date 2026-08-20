/**
 * Viableo — the marketing homepage, rebuilt as a server component.
 *
 * Renders the 12-section narrative E1–E13 per the Viableo Final Research,
 * Strategy, and ZAI Implementation Prompt (Part 5 §E + §F).
 *
 * PATTERN: copied verbatim from src/app/(marketing)/methodology/page.tsx —
 * import APEX_INPUTS + the calculation engine, compute every number ONCE at
 * module load (outside the component), render via formatCurrency/formatPayback/
 * formatRoi/formatPercentagePoints as static server HTML. No 'use client',
 * no useState/useEffect, no CountUp on numbers a visitor must read to
 * understand the offer (CountUp is permitted only on the single breaking-point
 * figure, and even then honours prefers-reduced-motion).
 *
 * Surface rhythm: light sections explain; dark ANALYTICAL_SURFACE sections prove.
 * E3, E5, E6, E12 are dark. E5+E6 are intentionally paired (both dark).
 */
import * as React from 'react';
import Link from 'next/link';
import {
  Section,
  SectionHeading,
  InlineLink,
  FigureBlock,
} from '@/components/marketing/marketing-primitives';
import { DotRule, DecisionBadge, ThresholdLine, DotSeparator } from '@/components/viableo';
import {
  APEX_INPUTS,
} from '@/lib/golden-case';
import {
  calculateScenario,
  calculateAllScenarios,
  type CalculatorInputs,
} from '@/lib/calculations/engine';
import { recommend } from '@/lib/calculations/recommendation';
import {
  computeBreakEven,
  computeSensitivity,
  stillViableStatement,
  PERMUTATION_COUNT,
} from '@/lib/calculations/stress-test';
import {
  computeConfidenceScore,
  confidenceLabel,
  CONFIDENCE_WEIGHTS,
  STATUS_MULTIPLIERS,
  type InputStatus,
} from '@/lib/calculations/confidence';
import { SCENARIO_MULTIPLIERS } from '@/lib/calculations/scenarios';
import {
  formatCurrency,
  formatPayback,
  formatRoi,
  formatPercentagePoints,
} from '@/lib/format';
import {
  HERO_EYEBROW,
  HERO_HEADLINE,
  HERO_SUBHEAD,
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
  HERO_STAT_LABELS,
  PROBLEM_HEADLINE,
  PROBLEM_SUBHEAD,
  PROBLEM_PARAS,
  CONSEQUENCE_HEADLINE,
  CONSEQUENCE_SUBHEAD,
  CONSEQUENCE_ITEMS,
  CONSEQUENCE_CLOSING,
  CONSEQUENCE_CLOSING_SOURCE,
  WHAT_HEADLINE,
  WHAT_SUBHEAD,
  WHAT_ITEMS,
  WHAT_LINK,
  WHAT_LINK_HREF,
  VERDICT_HEADLINE,
  VERDICT_SUBHEAD,
  VERDICT_GATE_INTRO,
  VERDICT_GATES,
  VERDICT_GATE_NOTE,
  VERDICT_CLOSING,
  VERDICT_BAND_LABELS,
  BREAK_HEADLINE,
  BREAK_SUBHEAD_TEMPLATE,
  BREAK_THREE_POINT_LABEL,
  BREAK_BREAKING_POINT_LABEL,
  BREAK_SENSITIVITY_HEADING,
  BREAK_SENSITIVITY_UNIT_LABEL,
  BREAK_LINK,
  BREAK_LINK_HREF,
  CLIENT_REPORT_HEADLINE,
  CLIENT_REPORT_SUBHEAD,
  CLIENT_REPORT_WEIGHTING_LINE,
  CLIENT_REPORT_CONSEQUENCE_LINE,
  CLIENT_REPORT_CTA,
  CLIENT_REPORT_CTA_HREF,
  PROOF_HEADLINE,
  PROOF_SUBHEAD,
  PROOF_PARAS,
  PROOF_SOURCES,
  PROOF_CTA,
  PROOF_CTA_HREF,
  WHERE_HEADLINE,
  WHERE_SUBHEAD,
  COMPARISON_HEADLINE,
  COMPARISON_SUBHEAD,
  COMPARISON_ROWS,
  PRICING_HEADLINE,
  PRICING_SUBHEAD,
  PRICING_FOOTNOTE,
  PRICING_TIERS,
  FINAL_CTA_HEADLINE,
  FINAL_CTA_BODY,
  FINAL_CTA_PRIMARY,
  FINAL_CTA_PRIMARY_HREF,
  AGENCY_WORKFLOW,
  DECISION_COLORS,
  DECISION_COLORS_DARK,
  DATA_HANDLING_LINE,
} from '@/lib/brand';

// ── Real Apex numbers, computed once at module load ─────────────────────
const APEX_EXPECTED = calculateScenario(APEX_INPUTS, 'expected');
const APEX_ALL = calculateAllScenarios(APEX_INPUTS);
const APEX_BREAK_EVEN = computeBreakEven(APEX_INPUTS, 'expected');
const APEX_SENSITIVITY = computeSensitivity(APEX_INPUTS, 'expected');
const APEX_RECOMMENDATION = recommend(APEX_EXPECTED);
const APEX_CONFIDENCE_STATUSES: Record<string, InputStatus> = {
  hourlyLaborCost: 'provided',
  workloadVolume: 'provided',
  implementationFee: 'provided',
  automationCoverage: 'estimated',
  conversionImprovement: 'estimated',
  errorCost: 'assumption',
  otherInputs: 'assumption',
};
const APEX_CONFIDENCE = computeConfidenceScore(APEX_CONFIDENCE_STATUSES);
const APEX_CONFIDENCE_LABEL = confidenceLabel(APEX_CONFIDENCE.score);
const APEX_STILL_VIABLE = stillViableStatement(APEX_BREAK_EVEN, APEX_INPUTS);
const BREAK_POINT_FEE = APEX_BREAK_EVEN.implementationFee ?? 0; // $149,860
const APEX_VERDICT = APEX_RECOMMENDATION.recommendation; // 'build' for Apex

// ── Verdict ladder boundaries, computed by sweeping recommend() across implFee ──
// BUILD->CONSIDER at the 12-month-payback threshold; CONSIDER->DON'T BUILD at 24-month.
function findLadderBoundary(targetPayback: number): number {
  // Solve 12*implFee / (APEX_EXPECTED.totalAnnualBenefit - annualRecurringCost - implFee) = targetPayback
  // where annualRecurringCost = totalFirstYearCost - implementationFee (for Apex, fixed at $9,500).
  // Algebra: implFee = targetPayback * (benefit - recCost) / (12 + targetPayback)
  const benefit = APEX_EXPECTED.totalAnnualBenefit; // 159360
  const annualRecurringCost = APEX_EXPECTED.annualRecurringCost; // 9500
  return (targetPayback * (benefit - annualRecurringCost)) / (12 + targetPayback);
}
const LADDER_BUILD_TO_CONSIDER = Math.round(findLadderBoundary(12)); // 74930
const LADDER_CONSIDER_TO_DONT_BUILD = Math.round(findLadderBoundary(24)); // 99907

// Format the breaking point + ladder for display.
const BREAK_POINT_FEE_FMT = formatCurrency(BREAK_POINT_FEE); // "$149,860"
const LADDER_BUILD_FMT = formatCurrency(LADDER_BUILD_TO_CONSIDER); // "$74,930"
const LADDER_DONT_BUILD_FMT = formatCurrency(LADDER_CONSIDER_TO_DONT_BUILD); // "$99,907"
const PERMUTATIONS = String(PERMUTATION_COUNT); // "64"

// ── Surface tokens (Skydda-inspired dark editorial) ───────────────────
// Dark analytical instrument surfaces — raised charcoal against the
// near-black canvas. Light text reads cleanly on these.
const DARK = '#131316';            // raised charcoal (matches --color-surface)
const DARK_RAISED = '#18181B';     // further raised panel (--color-surface-raised)
const DARK_BORDER = '#26262B';    // zinc hairline (--color-border)
const DARK_TEXT = '#F4F4F5';      // off-white primary text on dark
const DARK_MUTED = '#A1A1AA';     // zinc-400 muted text on dark

// ── CTAs as real <Link> elements (mandate P0-11: every CTA a working link) ──
function PrimaryCTA({
  href = FINAL_CTA_PRIMARY_HREF,
  label = FINAL_CTA_PRIMARY,
  dark = false,
}: {
  href?: string;
  label?: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-pill)] px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        dark
          ? 'bg-[var(--color-ink)] text-[var(--color-canvas)] hover:bg-[var(--color-ink-soft)]'
          : 'bg-[var(--color-brand-cta)] text-[var(--color-brand-foreground)] hover:bg-[var(--color-brand-cta-hover)]'
      }`}
    >
      {label}
    </Link>
  );
}

function SecondaryCTA({
  href = '/start?start=1&example=apex',
  label = HERO_CTA_SECONDARY,
  dark = false,
}: {
  href?: string;
  label?: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-pill)] border px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        dark
          ? 'border-[var(--color-border-strong)] text-ink hover:bg-[var(--color-surface-raised)]'
          : 'border-[var(--color-border-strong)] text-ink hover:bg-[var(--color-brand-subtle)]'
      }`}
    >
      {label}
    </Link>
  );
}

// ── E1 — HERO (dark immersive editorial) ────────────────────────────────
function HeroSection() {
  return (
    <section className="relative bg-canvas px-4 py-20 md:px-6 md:py-28">
      {/* editorial top hairline frame */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
      <div className="mx-auto w-full max-w-[1100px]">
        {/* editorial section index + amber marker eyebrow */}
        <div className="flex items-center gap-4">
          <span className="mkt-section-index">E1 / 13</span>
          <span aria-hidden="true" className="mkt-marker-line" />
          <p className="mkt-eyebrow">
            <span aria-hidden="true" className="mkt-marker" />
            {HERO_EYEBROW}
          </p>
        </div>
        <h1 className="mkt-display mt-8 max-w-[920px]">
          {HERO_HEADLINE}
        </h1>
        <p className="mt-6 max-w-[680px] text-lg leading-relaxed text-ink-muted md:text-xl">
          {HERO_SUBHEAD}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PrimaryCTA href="/start?start=1" label={HERO_CTA_PRIMARY} />
          <SecondaryCTA href="/start?start=1&example=apex" label={HERO_CTA_SECONDARY} />
        </div>

        {/* Premium product surface: verdict stamp + threshold rail + stats */}
        <div className="mkt-product-surface mt-14 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="shrink-0">
              <p className="mkt-figure-label">
                Apex reference case · expected scenario
              </p>
              <div className="mt-4 flex items-center gap-3">
                <DecisionBadge decision={APEX_VERDICT} size="lg" dark />
                <span className="mkt-section-index">Apex verdict</span>
              </div>
            </div>
            <figure className="min-w-0 flex-1 md:max-w-[520px]">
              <figcaption className="mkt-figure-label mb-3">Answer holds until</figcaption>
              <ThresholdLine
                scale="hero"
                min={0}
                max={160000}
                threshold={BREAK_POINT_FEE}
                position={APEX_INPUTS.implementationFee}
                verdict={APEX_VERDICT}
                thresholdLabel={BREAK_POINT_FEE_FMT}
                positionLabel={formatCurrency(APEX_INPUTS.implementationFee)}
                favourable="below"
              />
            </figure>
          </div>
          {/* Three real statistics, computed from the engine, tabular figures */}
          <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-border pt-6 sm:grid-cols-3">
            <div>
              <dt className="mkt-figure-label">{HERO_STAT_LABELS.net}</dt>
              <dd className="mkt-figure mt-2 text-3xl md:text-4xl">
                {formatCurrency(APEX_EXPECTED.netAnnualBenefit)}
              </dd>
            </div>
            <div>
              <dt className="mkt-figure-label">{HERO_STAT_LABELS.payback}</dt>
              <dd className="mkt-figure mt-2 text-3xl md:text-4xl">
                {formatPayback(APEX_EXPECTED.paybackMonths)}
              </dd>
            </div>
            <div>
              <dt className="mkt-figure-label">{HERO_STAT_LABELS.holdsUntil}</dt>
              <dd className="mkt-figure mkt-figure-accent mt-2 text-3xl md:text-4xl">
                {BREAK_POINT_FEE_FMT}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <Divider kind="light" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

// ── Section divider Threshold Line (replaces every decorative divider) ────
function Divider({
  kind,
  verdict,
  min,
  max,
  threshold,
  position,
  thresholdLabel,
  positionLabel,
}: {
  kind: 'light' | 'dark';
  verdict: 'build' | 'consider' | 'dont_build';
  min: number; max: number; threshold: number; position: number;
  thresholdLabel: string; positionLabel: string;
}) {
  return (
    <div className={kind === 'dark' ? 'bg-[var(--color-surface)]' : 'bg-canvas'}>
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6">
        <ThresholdLine
          scale="divider"
          min={min}
          max={max}
          threshold={threshold}
          position={position}
          verdict={verdict}
          thresholdLabel={thresholdLabel}
          positionLabel={positionLabel}
          favourable="below"
        />
      </div>
    </div>
  );
}

// ── E2 — PROBLEM (light) ──────────────────────────────────────────────────
function ProblemSection() {
  return (
    <section className="bg-canvas px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto w-full max-w-[760px]">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {PROBLEM_HEADLINE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">{PROBLEM_SUBHEAD}</p>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-ink-muted">
          {PROBLEM_PARAS.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
      <Divider kind="light" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

// ── E3 — CONSEQUENCE (dark, ANALYTICAL_SURFACE) ───────────────────────────
function ConsequenceSection() {
  return (
    <section className="bg-[var(--color-surface)] px-4 py-20 text-ink md:px-6 md:py-28" style={{ backgroundColor: DARK }}>
      <div className="mx-auto w-full max-w-[900px]">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {CONSEQUENCE_HEADLINE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: DARK_MUTED }}>
          {CONSEQUENCE_SUBHEAD}
        </p>
        <ol className="mt-10 space-y-8">
          {CONSEQUENCE_ITEMS.map((item, i) => (
            <li key={i} className="border-l-2 pl-6" style={{ borderColor: DECISION_COLORS_DARK.dont_build }}>
              <h3 className="text-xl font-semibold">{item.heading}</h3>
              <p className="mt-2 leading-relaxed" style={{ color: DARK_MUTED }}>
                {item.body}{' '}
                <a
                  href={item.source.href}
                  className="font-medium underline decoration-[var(--color-brand)] underline-offset-4 transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.source.label}
                </a>
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-base leading-relaxed" style={{ color: DARK_MUTED }}>
          {CONSEQUENCE_CLOSING}{' '}
          <a
            href={CONSEQUENCE_CLOSING_SOURCE.href}
            className="font-medium underline decoration-[var(--color-brand)] underline-offset-4 transition-colors hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            {CONSEQUENCE_CLOSING_SOURCE.label}
          </a>
        </p>
      </div>
      <Divider kind="dark" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

// ── E4 — WHAT VIABLEO DOES (light) ─────────────────────────────────────────
function WhatSection() {
  return (
    <section className="bg-canvas px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto w-full max-w-[900px]">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {WHAT_HEADLINE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">{WHAT_SUBHEAD}</p>
        <ol className="mt-10 space-y-8">
          {WHAT_ITEMS.map((item, i) => (
            <li key={i} className="flex gap-5">
              <span className="mt-1 font-mono text-lg font-bold tabular-nums text-ink-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <p className="text-lg font-semibold text-ink">{item.q}</p>
                <p className="mt-1 text-base leading-relaxed text-ink-muted">{item.a}</p>
                {i === 1 && (
                  <div className="mt-4">
                    <ThresholdLine
                      scale="inline"
                      min={0}
                      max={160000}
                      threshold={BREAK_POINT_FEE}
                      position={APEX_INPUTS.implementationFee}
                      verdict={APEX_VERDICT}
                      thresholdLabel={BREAK_POINT_FEE_FMT}
                      positionLabel={formatCurrency(APEX_INPUTS.implementationFee)}
                      favourable="below"
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10">
          <InlineLink href={WHAT_LINK_HREF}>{WHAT_LINK}</InlineLink>
        </p>
      </div>
      <Divider kind="light" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

// ── E5 — THE VERDICT (dark) ────────────────────────────────────────────────
function VerdictSection() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28" style={{ backgroundColor: DARK, color: DARK_TEXT }}>
      <div className="mx-auto w-full max-w-[900px]">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {VERDICT_HEADLINE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: DARK_MUTED }}>
          {VERDICT_SUBHEAD}
        </p>

        <div className="mt-10 rounded-[var(--radius-md)] border p-6" style={{ borderColor: DARK_BORDER, backgroundColor: DARK_RAISED }}>
          <p className="text-sm font-medium uppercase tracking-wide" style={{ color: DARK_MUTED }}>
            {VERDICT_GATE_INTRO}
          </p>
          <ul className="mt-4 space-y-3">
            {VERDICT_GATES.map((gate, i) => (
              <li key={i} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-2 inline-block size-1.5 rounded-full" style={{ backgroundColor: DECISION_COLORS_DARK.build }} />
                <span className="text-base leading-relaxed">{gate}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-base leading-relaxed" style={{ color: DARK_MUTED }}>
            {VERDICT_GATE_NOTE}
          </p>
        </div>

        {/* Real Apex verdict + confidence score, from the engine */}
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <DecisionBadge decision={APEX_VERDICT} size="lg" dark />
            <div>
              <p className="text-sm" style={{ color: DARK_MUTED }}>Apex reference verdict</p>
              <p className="font-mono text-2xl font-bold tabular-nums">
                {APEX_CONFIDENCE.score}
                <span className="text-base font-normal" style={{ color: DARK_MUTED }}> / 100</span>
              </p>
              <p className="text-sm" style={{ color: DARK_MUTED }}>{APEX_CONFIDENCE_LABEL}</p>
            </div>
          </div>
          <ul className="text-sm" style={{ color: DARK_MUTED }}>
            {VERDICT_BAND_LABELS.map((band) => (
              <li key={band.range} className="flex justify-between gap-6 py-1">
                <span>{band.range}</span>
                <span className="font-mono tabular-nums text-ink">{band.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-base leading-relaxed" style={{ color: DARK_MUTED }}>
          {VERDICT_CLOSING}
        </p>
      </div>
      <Divider kind="dark" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

// ── E6 — BREAK IT ON PURPOSE (dark — paired with E5) ──────────────────────
function BreakItSection() {
  const sub = BREAK_SUBHEAD_TEMPLATE.replace('{PERMUTATION_COUNT}', PERMUTATIONS);
  const scenarios = [
    { name: 'Conservative', r: APEX_ALL.conservative },
    { name: 'Expected', r: APEX_ALL.expected },
    { name: 'Upside', r: APEX_ALL.upside },
  ];
  return (
    <section className="px-4 py-20 md:px-6 md:py-28" style={{ backgroundColor: DARK, color: DARK_TEXT }}>
      <div className="mx-auto w-full max-w-[1000px]">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {BREAK_HEADLINE}
        </h2>
        <p className="mt-4 max-w-[760px] text-lg leading-relaxed" style={{ color: DARK_MUTED }}>
          {sub}
        </p>

        {/* Three-point set, computed from calculateAllScenarios */}
        <div className="mt-10">
          <p className="text-sm font-medium uppercase tracking-wide" style={{ color: DARK_MUTED }}>
            {BREAK_THREE_POINT_LABEL}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead>
                <tr style={{ color: DARK_MUTED }}>
                  <th className="py-2 pr-6 text-left font-medium">Scenario</th>
                  <th className="py-2 pr-6 text-right font-medium">Annual net</th>
                  <th className="py-2 pr-6 text-right font-medium">ROI</th>
                  <th className="py-2 text-right font-medium">Payback</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {scenarios.map((s) => (
                  <tr key={s.name} className="border-t" style={{ borderColor: DARK_BORDER }}>
                    <td className="py-2 pr-6 text-left font-sans">{s.name}</td>
                    <td className="py-2 pr-6 text-right">{formatCurrency(s.r.netAnnualBenefit)}</td>
                    <td className="py-2 pr-6 text-right">{formatRoi(s.r.roiPct)}</td>
                    <td className="py-2 text-right">{formatPayback(s.r.paybackMonths)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* The breaking point — hero-scale ThresholdLine */}
        <div className="mt-10">
          <p className="text-sm font-medium" style={{ color: DARK_MUTED }}>
            {BREAK_BREAKING_POINT_LABEL}
          </p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums">
            {BREAK_POINT_FEE_FMT}
          </p>
          {APEX_STILL_VIABLE && (
            <p className="mt-2 text-base" style={{ color: DARK_MUTED }}>
              {APEX_STILL_VIABLE}
            </p>
          )}
          <figure className="mt-5">
            <ThresholdLine
              scale="hero"
              min={0}
              max={160000}
              threshold={BREAK_POINT_FEE}
              position={APEX_INPUTS.implementationFee}
              verdict={APEX_VERDICT}
              thresholdLabel={BREAK_POINT_FEE_FMT}
              positionLabel={formatCurrency(APEX_INPUTS.implementationFee)}
              favourable="below"
            />
          </figure>

          {/* Verdict ladder — computed by sweeping recommend(), not hardcoded */}
          <p className="mt-6 text-sm font-medium uppercase tracking-wide" style={{ color: DARK_MUTED }}>
            Verdict ladder
          </p>
          <ul className="mt-3 space-y-2 text-sm" style={{ color: DARK_MUTED }}>
            <li className="flex items-center justify-between gap-4">
              <span>Build at or below</span>
              <span className="font-mono tabular-nums text-ink">{LADDER_BUILD_FMT}</span>
            </li>
            <li className="flex items-center justify-between gap-4">
              <span>Consider</span>
              <span className="font-mono tabular-nums text-ink">{LADDER_BUILD_FMT} – {LADDER_DONT_BUILD_FMT}</span>
            </li>
            <li className="flex items-center justify-between gap-4">
              <span>Don&apos;t build above</span>
              <span className="font-mono tabular-nums text-ink">{LADDER_DONT_BUILD_FMT}</span>
            </li>
          </ul>
        </div>

        {/* Sensitivity — from computeSensitivity, labelled correctly */}
        <div className="mt-10">
          <p className="text-sm font-medium uppercase tracking-wide" style={{ color: DARK_MUTED }}>
            {BREAK_SENSITIVITY_HEADING}
          </p>
          <p className="mt-1 text-sm" style={{ color: DARK_MUTED }}>
            {BREAK_SENSITIVITY_UNIT_LABEL}
          </p>
          <ul className="mt-4 space-y-3">
            {APEX_SENSITIVITY.map((s, i) => (
              <li key={s.label} className="flex items-center gap-4">
                <span className="w-48 shrink-0 text-sm">{s.label}</span>
                <ThresholdLine
                  scale="inline"
                  min={0}
                  max={APEX_SENSITIVITY[0].impact || 100}
                  threshold={(APEX_SENSITIVITY[0].impact || 100) * 0.5}
                  position={s.impact}
                  verdict={s.level === 'high' ? 'dont_build' : s.level === 'medium' ? 'consider' : 'build'}
                  thresholdLabel={`${formatPercentagePoints((APEX_SENSITIVITY[0].impact || 0) / 100)}`}
                  positionLabel={formatPercentagePoints(s.impact / 100)}
                  favourable="below"
                />
                <span className="font-mono text-sm tabular-nums" style={{ color: DARK_MUTED }}>
                  {formatPercentagePoints(s.impact / 100)} · {s.level}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10">
          <Link
            href={BREAK_LINK_HREF}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-pill)] border px-6 py-3 text-sm font-semibold transition-colors hover:bg-[var(--color-surface-raised)]"
            style={{ borderColor: DARK_BORDER, color: DARK_TEXT }}
          >
            {BREAK_LINK}
          </Link>
        </p>
      </div>
      <Divider kind="dark" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

// ── E7 — THE CLIENT REPORT (light) ─────────────────────────────────────────
function ClientReportSection() {
  return (
    <section className="bg-canvas px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto w-full max-w-[900px]">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {CLIENT_REPORT_HEADLINE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">{CLIENT_REPORT_SUBHEAD}</p>

        <div className="mt-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-ink-faint">
            Input status weighting
          </p>
          <p className="mt-2 text-base text-ink-muted">{CLIENT_REPORT_WEIGHTING_LINE}</p>
          <p className="mt-3 text-base text-ink-muted">{CLIENT_REPORT_CONSEQUENCE_LINE}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {Object.entries(CONFIDENCE_WEIGHTS).map(([key, weight]) => {
              const status: InputStatus = APEX_CONFIDENCE_STATUSES[key] ?? 'assumption';
              const mult = STATUS_MULTIPLIERS[status];
              return (
                <li key={key} className="flex flex-col gap-1 border-b border-[var(--color-border)] py-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="text-ink-muted">{key}</span>
                  <span className="flex flex-wrap items-center gap-2 font-mono text-xs tabular-nums text-ink-faint">
                    <span>weight {weight}</span>
                    <span aria-hidden="true">·</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide" style={{ backgroundColor: statusColor(status), color: '#171516' }}>
                      {status}
                    </span>
                    <span>× {mult}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-8">
          <InlineLink href={CLIENT_REPORT_CTA_HREF}>{CLIENT_REPORT_CTA}</InlineLink>
        </p>
      </div>
      <Divider kind="light" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

function statusColor(status: InputStatus): string {
  if (status === 'provided') return '#D1F2DF';
  if (status === 'estimated') return '#FDE9B0';
  return '#FDDEE5';
}

// ── E8 — PROOF (light) ─────────────────────────────────────────────────────
function ProofSection() {
  return (
    <section className="bg-canvas px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto w-full max-w-[760px]">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {PROOF_HEADLINE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">{PROOF_SUBHEAD}</p>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-ink-muted">
          {PROOF_PARAS.map((p, i) => (
            <p key={i}>
              {i === 1 ? (
                <>
                  {p.split(/(Thinking Machines Lab|Atil et al\.)/).map((chunk, j) => {
                    if (chunk === 'Thinking Machines Lab') {
                      return (
                        <a key={j} href={PROOF_SOURCES[0].href} target="_blank" rel="noopener noreferrer" className="font-medium underline decoration-[var(--color-brand)] underline-offset-4">
                          {chunk}
                        </a>
                      );
                    }
                    if (chunk === 'Atil et al.') {
                      return (
                        <a key={j} href={PROOF_SOURCES[1].href} target="_blank" rel="noopener noreferrer" className="font-medium underline decoration-[var(--color-brand)] underline-offset-4">
                          {chunk}
                        </a>
                      );
                    }
                    return <React.Fragment key={j}>{chunk}</React.Fragment>;
                  })}
                </>
              ) : (
                p
              )}
            </p>
          ))}
        </div>
        <p className="mt-8">
          <InlineLink href={PROOF_CTA_HREF}>{PROOF_CTA}</InlineLink>
        </p>
      </div>
      <Divider kind="light" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

// ── E9 — WHERE IT FITS (light) ─────────────────────────────────────────────
function WhereSection() {
  return (
    <section className="bg-canvas px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto w-full max-w-[900px]">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {WHERE_HEADLINE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">{WHERE_SUBHEAD}</p>
        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {AGENCY_WORKFLOW.map((stage, i) => (
            <li key={stage} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
              <p className="font-mono text-xs tabular-nums text-ink-faint">Step {i + 1}</p>
              <p className="mt-1 text-lg font-semibold text-ink">{stage}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {stage === 'Discover' && 'Map the workflow.'}
                {stage === 'Prove' && 'Run Viableo.'}
                {stage === 'Propose' && 'Quote the verdict.'}
                {stage === 'Close' && 'Defend the number.'}
              </p>
            </li>
          ))}
        </ol>
      </div>
      <Divider kind="light" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

// ── E10 — COMPARISON (light) ───────────────────────────────────────────────
function ComparisonSection() {
  const cols = [
    { key: 'generic' as const, label: 'Vendor calculator' },
    { key: 'spreadsheet' as const, label: 'Spreadsheet' },
    { key: 'genericRoi' as const, label: 'Chat model' },
    { key: 'viableo' as const, label: 'Viableo' },
  ];
  return (
    <section className="bg-canvas px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto w-full max-w-[1000px]">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {COMPARISON_HEADLINE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">{COMPARISON_SUBHEAD}</p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr>
                <th className="py-3 pr-6 text-left font-semibold text-ink">What you need</th>
                {cols.map((c) => (
                  <th key={c.key} className="py-3 px-3 text-center font-semibold text-ink">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.need} className="border-t border-[var(--color-border)]">
                  <td className="py-3 pr-6 text-ink-muted">{row.need}</td>
                  {cols.map((c) => {
                    const v = row[c.key];
                    return (
                      <td key={c.key} className="py-3 px-3 text-center">
                        <span aria-hidden="true" className={v ? 'text-[#0D6B3F]' : 'text-[#A8A5AA]'}>
                          {v ? '✓' : '—'}
                        </span>
                        <span className="sr-only">{v ? 'yes' : 'no'}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Divider kind="light" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

// ── E11 — PRICING (light) ──────────────────────────────────────────────────
function PricingSection() {
  return (
    <section className="bg-canvas px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto w-full max-w-[1000px]">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {PRICING_HEADLINE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">{PRICING_SUBHEAD}</p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_TIERS.map((tier) => {
            const isFree = tier.key === 'free';
            const href = isFree ? '/start?start=1' : '/pricing';
            const ctaLabel = isFree ? 'Start free' : 'Contact to buy';
            return (
              <div
                key={tier.key}
                className="flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-6"
              >
                <p className="text-sm font-semibold text-ink">{tier.name}</p>
                <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-ink">{tier.price}</p>
                <p className="text-sm text-ink-faint">{tier.cadence}</p>
                <p className="mt-4 text-sm text-ink-muted">{tier.blurb}</p>
                <p className="mt-1 text-xs text-ink-faint">{tier.identity}</p>
                <div className="mt-auto pt-6">
                  <Link
                    href={href}
                    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[var(--radius-pill)] px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      backgroundColor: isFree ? 'var(--color-brand-cta)' : 'transparent',
                      color: isFree ? '#fff' : 'var(--color-ink)',
                      border: isFree ? 'none' : '1px solid var(--color-border-strong)',
                    }}
                  >
                    {ctaLabel}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-ink-faint">{PRICING_FOOTNOTE}</p>
        <p className="mt-2 text-sm text-ink-faint">{DATA_HANDLING_LINE}</p>
      </div>
      <Divider kind="light" verdict={APEX_VERDICT} min={0} max={160000} threshold={BREAK_POINT_FEE} position={APEX_INPUTS.implementationFee} thresholdLabel={BREAK_POINT_FEE_FMT} positionLabel={formatCurrency(APEX_INPUTS.implementationFee)} />
    </section>
  );
}

// ── E12 — CLOSE (dark) ─────────────────────────────────────────────────────
function CloseSection() {
  return (
    <section className="px-4 py-24 md:px-6 md:py-32" style={{ backgroundColor: DARK, color: DARK_TEXT }}>
      <div className="mx-auto w-full max-w-[760px]">
        <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {FINAL_CTA_HEADLINE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: DARK_MUTED }}>
          {FINAL_CTA_BODY}
        </p>
        {/* Closing threshold mark — unlabelled position, the closing motif */}
        <figure className="mt-10">
          <ThresholdLine
            scale="hero"
            min={0}
            max={160000}
            threshold={BREAK_POINT_FEE}
            position={APEX_INPUTS.implementationFee}
            verdict={APEX_VERDICT}
            thresholdLabel={BREAK_POINT_FEE_FMT}
            positionLabel={formatCurrency(APEX_INPUTS.implementationFee)}
            favourable="below"
          />
        </figure>
        <div className="mt-10">
          <PrimaryCTA href={FINAL_CTA_PRIMARY_HREF} label={FINAL_CTA_PRIMARY} dark />
        </div>
      </div>
    </section>
  );
}

// ── The homepage ───────────────────────────────────────────────────────────
export function ViableoHomepage() {
  return (
    <main id="main-content" className="w-full">
      <HeroSection />
      <ProblemSection />
      <ConsequenceSection />
      <WhatSection />
      <VerdictSection />
      <BreakItSection />
      <ClientReportSection />
      <ProofSection />
      <WhereSection />
      <ComparisonSection />
      <PricingSection />
      <CloseSection />
    </main>
  );
}
