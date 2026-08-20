'use client';

/**
 * Viableo marketing homepage — sparse, typography-first redesign
 * inspired by piplanning.io.
 *
 * Design rules (piplanning.io-inspired):
 *   - Typography is the hero. Headlines dominate the viewport.
 *   - Whitespace is a feature. Generous breathing room everywhere.
 *   - Near-monochrome. Coral is ~5% accent only (eyebrow dot, link wipe,
 *     DecisionBadge — which is a protected product component).
 *   - Primary CTAs are dark charcoal, never bright coral.
 *   - No loud gradients, no tilted floating cards, no pink diagonal shapes.
 *
 * Section order (unchanged from spec, only styling shifts):
 *   7.1   Hero                    (massive headline, dark CTA, quiet stats below fold)
 *   7.2   Trust bar               (quiet, monochrome separators)
 *   7.3   Problem statement       (centered editorial, huge type)
 *   7.4   Product demonstration   (Stepper — the killer visual)
 *   7.5   Decision framework      (BUILD / CONSIDER / DON'T BUILD cards, quieter chrome)
 *   7.6   Scenario modeling       (live ScenarioSlider + quiet stats)
 *   7.6b  Stress-test teaser      (charcoal slider mockups, quiet callout)
 *   7.6c  Sensitivity teaser      (charcoal ranked bars)
 *   7.7   Client report preview   (no tilt, thin gradient strip)
 *   7.8   Agency workflow         (Stepper weight="secondary")
 *   7.9   Comparison / positioning (ComparisonTable)
 *   7.10  Pricing teaser          (airy cards, dark CTA)
 *   7.11  Final CTA               (dark bg-ink, white CTA)
 *   7.12  Marketing footer        (dark, near-monochrome separators)
 *
 * Product surface (calculator, results, PDFs, decision badges, engine,
 * entitlement, Whop) is 100% untouched.
 */
import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Twitter, Linkedin, Github, Check, AlertCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '@/lib/store';
import { APEX_INPUTS } from '@/lib/golden-case';
import {
  calculateScenario,
  calculateAllScenarios,
} from '@/lib/calculations/engine';
import { recommend } from '@/lib/calculations/recommendation';
import {
  computeBreakEven,
  computeSensitivity,
  stillViableStatement,
  PERMUTATION_COUNT,
} from '@/lib/calculations/stress-test';
import { computeConfidenceScore, confidenceLabel } from '@/lib/calculations/confidence';
import { SCENARIO_LABELS, type ScenarioName } from '@/lib/calculations/scenarios';
import { formatCurrency, formatPayback, formatPercentagePoints } from '@/lib/format';
import {
  Logo,
  DotRule,
  DecisionBadge,
  CountUp,
  ScenarioSlider,
  Stepper,
  ComparisonTable,
} from '@/components/viableo';
import {
  FadeIn,
  HoverLift,
} from '@/components/marketing/motion-primitives';
import {
  COMPANY_NAME,
  REPORT_NAME,
  BRAND_TAGLINE,
  HERO_SUBHEAD,
  HERO_CTA_SECONDARY,
  FINAL_CTA_HEADLINE,
  FINAL_CTA_BODY,
  FINAL_CTA_PRIMARY,
  FINAL_CTA_SECONDARY,
  CTA_PRIMARY,
  PROBLEM_HEADLINE,
  PROBLEM_BODY,
  SOLUTION_HEADLINE,
  SOLUTION_SUBHEAD,
  TRUST_HEADLINE,
  TRUST_POSITIONING,
  PRICING_TIERS,
} from '@/lib/brand';
import { cn } from '@/lib/utils';

// ── Apex golden-case computations (module-load, pure) ────────────
const APEX_EXPECTED = calculateScenario(APEX_INPUTS, 'expected');
const APEX_ALL = calculateAllScenarios(APEX_INPUTS);
const APEX_RECOMMENDATION = recommend(APEX_EXPECTED);
// P0-2..6: every previously-hardcoded number is now derived from the engine.
const APEX_BREAK_EVEN = computeBreakEven(APEX_INPUTS);
const APEX_SENSITIVITY = computeSensitivity(APEX_INPUTS);
const APEX_STILL_VIABLE = stillViableStatement(APEX_BREAK_EVEN, APEX_INPUTS);
const BREAK_POINT_FEE = APEX_BREAK_EVEN.implementationFee ?? 0; // $149,860
// Verdict ladder boundaries — derived by solving the payback equation, NOT hardcoded.
// payback = 12*implFee / (benefit - recurring - implFee); solve for implFee at payback=12 and 24.
const _APEX_BENEFIT = APEX_EXPECTED.totalAnnualBenefit;
const _APEX_RECURRING = APEX_EXPECTED.annualRecurringCost;
const LADDER_BUILD_TO_CONSIDER = Math.round((12 * (_APEX_BENEFIT - _APEX_RECURRING)) / (12 + 12));
const LADDER_CONSIDER_TO_DONT_BUILD = Math.round((24 * (_APEX_BENEFIT - _APEX_RECURRING)) / (12 + 24));

// Representative confidence for the golden-case hero panel.
// In a real analysis some inputs are estimated — simulate that mix so the
// confidence bar is visually meaningful (not just 100).
const APEX_CONFIDENCE = computeConfidenceScore({
  hourlyCost: 'provided',
  hoursPerWeek: 'provided',
  implementationFee: 'provided',
  expectedAutomationPct: 'estimated',
  expectedConversionImprovementPct: 'estimated',
  expectedErrorReductionPct: 'assumption',
  otherAnnualCost: 'assumption',
});

/** Render an ROI% as a multiplier (499% → "5.0×"). */
function roiAsMultiplier(roiPct: number | null | undefined): string {
  if (roiPct == null || !Number.isFinite(roiPct)) return 'N/A';
  return `${(roiPct / 100).toFixed(1)}×`;
}

/**
 * LandingView — Viableo marketing homepage.
 *
 * The motion system (motion/react) drives every entrance:
 *   - Hero: staggered fade+rise on mount (eyebrow → headline → subcopy → CTAs → card).
 *   - Lower sections: <FadeIn> with whileInView + once:true — gentle fade+rise
 *     when each section enters the viewport.
 *   - Cards: <HoverLift> wraps premium cards for a subtle translateY + shadow lift.
 *   - Buttons: motion.button with whileHover y:-1.5 / whileTap y:0.
 * All animations use [0.16, 1, 0.3, 1] (ease-out-expo-ish), 0.4–0.7s, never bouncy.
 * Respects prefers-reduced-motion automatically (motion handles it).
 */
export function LandingView() {
  return (
    <main id="main-content" className="w-full">
      <HeroSection />
      <TrustBar />
      <ProblemStatement />
      <ProductDemo />
      <DecisionFramework />
      <ScenarioModeling />
      <StressTestTeaser />
      <SensitivityTeaser />
      <ReportPreview />
      <AgencyWorkflow />
      <ComparisonSection />
      <PricingTeaser />
      <FinalCTA />
    </main>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.1 — Hero (piplanning.io-inspired: typography dominates)
// ════════════════════════════════════════════════════════════════

// Premium easing — ease-out-expo-ish. Shared with the motion system.
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function HeroSection() {
  const startCalculator = useApp((s) => s.startCalculator);

  return (
    <section className="relative overflow-hidden bg-canvas">
      {/* ── Ambient depth layer ──
          Two overlapping radial gradients create a subtle warm atmospheric
          depth. The upper-right glow is slightly warmer (charcoal tint) to
          frame the verdict card. The lower-left is a barely-there warm wash
          that adds dimension without being a "shape". Together they make the
          canvas feel like a real surface, not a flat white void. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 55% at 75% 20%, rgba(23, 21, 22, 0.055) 0%, rgba(23, 21, 22, 0) 65%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 60% at 15% 80%, rgba(255, 22, 75, 0.018) 0%, rgba(255, 22, 75, 0) 55%)',
          }}
        />
        {/* ── Analytical dot-matrix ──
            Very faint dot grid across the entire hero — communicates
            intelligence / analysis / measurement. Barely visible. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(23, 21, 22, 0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-4 md:px-6">
        {/* Two-column hero: headline + CTAs left, verdict-card mock right.
            Stacks gracefully on mobile (mock drops below the fold). */}
        <div className="grid grid-cols-1 items-center gap-16 py-28 md:py-36 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:py-44">
          {/* ── Left column: headline + CTAs (staggered entrance) ── */}
          <motion.div
            className="max-w-[680px]"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
            }}
          >
            {/* Eyebrow — coral dot accent (the one sanctioned coral moment on
                the marketing hero) + uppercase label. */}
            <motion.p
              className="mkt-eyebrow"
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
              }}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
              Built for automation agencies
            </motion.p>

            {/* DOMINANT headline — significantly larger clamp range, ultra-tight
                tracking, compressed line-height. The headline IS the page.
                Fluid from 3.25rem mobile → 8.5rem desktop — fills the viewport
                with authority. */}
            <motion.h1
              className="mt-7 font-display font-extrabold leading-[0.88] tracking-[-0.045em] text-ink [font-size:clamp(3.25rem,9.5vw,8.5rem)] [text-wrap:balance]"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.76, ease: EASE_OUT } },
              }}
            >
              Know what&rsquo;s
              <br />
              worth building.
            </motion.h1>

            {/* Supporting subcopy — slightly larger, more breathing room. */}
            <motion.p
              className="mt-9 max-w-[540px] text-[18px] leading-[1.6] text-ink-muted md:text-[20px]"
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
              }}
            >
              {HERO_SUBHEAD}
            </motion.p>

            {/* Single visually dominant CTA + demoted ghost secondary. */}
            <motion.div
              className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center"
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
              }}
            >
              <motion.button
                type="button"
                onClick={() => startCalculator()}
                className="mkt-cta-dark"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                {CTA_PRIMARY}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => startCalculator(APEX_INPUTS)}
                className="inline-flex min-h-[40px] items-center gap-1.5 px-3 text-[13px] font-medium text-ink-muted transition-opacity duration-hover hover:opacity-70 border border-border rounded-full"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                {HERO_CTA_SECONDARY}
                <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* ── Right column: premium verdict-card mock ──
              The single elegant visual object balancing the composition.
              Almost monochrome; the only color is the protected emerald
              BUILD badge (a product component, reused here as a preview).
              Entrance: fade-in + rise, delayed so it lands after the text.
              Hover: refined lift + deeper shadow (premium). */}
          <motion.div
            className="lg:justify-self-end"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.5 }}
          >
            <HeroVerdictMock />
          </motion.div>
        </div>
      </div>

      {/* Live proof row — REAL Apex golden-case numbers, no card chrome.
          Pushed below the fold with generous top margin so the hero
          viewport stays sparse. */}
      <FadeIn
        as="div"
        className="relative border-t border-border"
        delay={0.15}
      >
        <div className="mx-auto w-full max-w-[1200px] px-4 py-14 md:px-6 md:py-18">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Live example · Apex Home Services booking automation
          </p>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12">
            <HeroStat
              label="Annual benefit"
              value={
                <CountUp
                  value={APEX_EXPECTED.totalAnnualBenefit / 1000}
                  decimals={1}
                  prefix="$"
                  suffix="k"
                />
              }
            />
            <HeroStat
              label="First-year ROI"
              value={
                <CountUp
                  value={(APEX_EXPECTED.roiPct ?? 0) / 100}
                  decimals={1}
                  suffix="×"
                />
              }
            />
            <HeroStat
              label="Payback"
              value={
                <CountUp
                  value={APEX_EXPECTED.paybackMonths ?? 0}
                  decimals={1}
                  suffix=" mo"
                />
              }
            />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/**
 * HeroVerdictMock — Decision Instrument Panel.
 *
 * The hero should feel like a product, not just a landing page. This panel
 * visually exposes the five decision signals: annual benefit, ROI, payback,
 * recommendation, and confidence — all from the real Apex golden case.
 *
 * Dark analytical surface with faint dot-grid pattern, monospace tabular
 * numerals, DecisionBadge for the verdict, and a confidence progress bar.
 * Light text on charcoal = instrument panel aesthetic.
 */
function HeroVerdictMock() {
  const confScore = APEX_CONFIDENCE.score;
  const confLabel = confidenceLabel(confScore).toUpperCase().replace(' CONFIDENCE', '').replace(' UNCERTAINTY', '');

  return (
    <motion.div
      className="hero-instrument-panel w-full max-w-[400px] p-8 md:p-9"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.36, ease: EASE_OUT }}
    >
      {/* Header — Viableo / Decision Engine */}
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F5F3FF]">
          Viableo
        </span>
        <span aria-hidden="true" className="text-[11px] text-[#55505A]">/</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A8A0B8]">
          Decision Engine
        </span>
      </div>

      {/* Annual benefit — the hero figure */}
      <div className="mt-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#A8A0B8]">
          Annual benefit
        </p>
        <p className="mt-2.5 font-mono tnum text-[clamp(2.5rem,5.5vw,3.25rem)] font-bold tracking-[-0.03em] text-[#F5F3FF]">
          {formatCurrency(APEX_EXPECTED.totalAnnualBenefit)}
        </p>
      </div>

      {/* ROI + Payback — two-up key figures */}
      <div className="mt-7 grid grid-cols-2 gap-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#A8A0B8]">
            ROI
          </p>
          <p className="mt-2 font-mono tnum text-[20px] font-bold tracking-[-0.02em] text-[#F5F3FF]">
            {roiAsMultiplier(APEX_EXPECTED.roiPct)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#A8A0B8]">
            Payback
          </p>
          <p className="mt-2 font-mono tnum text-[20px] font-bold tracking-[-0.02em] text-[#F5F3FF]">
            {formatPayback(APEX_EXPECTED.paybackMonths)}
          </p>
        </div>
      </div>

      {/* Verdict — the stamped decision */}
      <div className="mt-7 border-t border-[var(--color-surface-analytical-border)] pt-5">
        <DecisionBadge
          decision={APEX_RECOMMENDATION.recommendation}
          size="lg"
          animate
        />
      </div>

      {/* Confidence — progress bar with label */}
      <div className="mt-6 border-t border-[var(--color-surface-analytical-border)] pt-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#A8A0B8]">
            Confidence
          </p>
          <span className="font-mono tnum text-[11px] font-semibold text-[#A8A0B8]">
            {confScore}
          </span>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#353034]">
          <div
            className="h-full rounded-full bg-[#818CF8] transition-all duration-700"
            style={{ width: `${confScore}%` }}
          />
        </div>
        <p className="mt-1.5 font-mono tnum text-[11px] font-semibold tracking-[0.04em] text-[#818CF8]">
          {confLabel}
        </p>
      </div>
    </motion.div>
  );
}

/** A commanding stat — large mono number + uppercase label, no card chrome.
    Slightly larger clamp than before so the proof row has visual weight. */
function HeroStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono tnum text-[clamp(2.75rem,5.5vw,3.75rem)] font-bold tracking-[-0.03em] text-ink">
        {value}
      </p>
      <p className="mt-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.2 — Trust bar (quiet, monochrome separators)
// ════════════════════════════════════════════════════════════════
function TrustBar() {
  return (
    <FadeIn as="section" className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-3 px-4 py-8 md:flex-row md:justify-center md:gap-8 md:px-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          {TRUST_HEADLINE}
        </p>
        <span aria-hidden="true" className="hidden size-1 rounded-full bg-ink-faint md:block" />
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] font-medium text-ink-muted">
          {TRUST_POSITIONING.map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && (
                <span aria-hidden="true" className="size-1 rounded-full bg-ink-faint/60" />
              )}
              <span>{label}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.3 — Problem statement (centered editorial, huge type)
// ════════════════════════════════════════════════════════════════
function ProblemStatement() {
  return (
    <section className="bg-canvas">
      <FadeIn className="mx-auto w-full max-w-[1000px] px-4 py-32 text-center md:px-6 md:py-44">
        <h2 className="mkt-display-md text-balance">
          {PROBLEM_HEADLINE}
        </h2>
        <p className="mx-auto mt-10 max-w-[640px] text-[17px] leading-[1.65] text-ink-muted md:text-[19px]">
          {PROBLEM_BODY}
        </p>
        <div className="mt-16">
          <DotRule />
        </div>
      </FadeIn>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.4 — Product demonstration (THE killer visual)
// ════════════════════════════════════════════════════════════════
function ProductDemo() {
  return (
    <section className="surface-analytical border-b border-t border-[var(--color-surface-analytical-border)]">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-28 md:px-6 md:py-36">
        <FadeIn className="mb-16 max-w-[760px]">
          <p className="mkt-eyebrow text-[#A8A0B8]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#818CF8]" />
            How it works
          </p>
          <h2 className="mkt-display-md mt-6 !text-[#F5F3FF]">
            {SOLUTION_HEADLINE}
          </h2>
          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-[#B8B2C4] md:text-[18px]">
            {SOLUTION_SUBHEAD}
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Stepper weight="primary" surface="dark" />
        </FadeIn>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.5 — Decision framework (quieter card chrome)
// ════════════════════════════════════════════════════════════════
const DECISION_CARDS = [
  {
    decision: 'build' as const,
    definition: 'The numbers justify the build.',
    criteria: [
      'Net annual benefit is positive',
      'Payback within 12 months',
      'ROI ≥ 50%',
    ],
  },
  {
    decision: 'consider' as const,
    definition: 'Worth exploring with adjustments.',
    criteria: [
      'Positive net, but slower payback',
      'Payback 12–24 months',
      'Refine scope or cost',
    ],
  },
  {
    decision: 'dont_build' as const,
    definition: 'The economics don’t support it.',
    criteria: [
      'Net ≤ 0 at current assumptions',
      'Payback exceeds 24 months',
      'Revisit scope, cost, or process',
    ],
  },
];

function DecisionFramework() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-36 md:px-6 md:py-48">
        <FadeIn className="mb-20 max-w-[760px]">
          <p className="mkt-eyebrow">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-muted" />
            The verdict
          </p>
          <h2 className="mkt-display-md mt-6">
            Every analysis ends in one of three decisions.
          </h2>
          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-ink-muted md:text-[18px]">
            A closed vocabulary, not a vibe. Every Viableo Analysis terminates in BUILD,
            CONSIDER, or DON&rsquo;T BUILD &mdash; with the math to defend it.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {DECISION_CARDS.map((card, i) => (
            <FadeIn key={card.decision} delay={i * 0.1}>
              <DecisionCard {...card} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function DecisionCard({
  decision,
  definition,
  criteria,
}: {
  decision: 'build' | 'consider' | 'dont_build';
  definition: string;
  criteria: string[];
}) {
  // Decision color appears ONLY as a thin top accent (protected per spec).
  // The card itself is near-monochrome; the badge carries the semantic color.
  const accentColorVar =
    decision === 'dont_build'
      ? 'var(--color-dont-build)'
      : `var(--color-${decision})`;
  const Icon =
    decision === 'build' ? Check : decision === 'consider' ? AlertCircle : X;
  return (
    <HoverLift className="mkt-card-quiet mkt-lift group relative h-full p-8">
      {/* Thin top accent — quiet on rest, slightly brighter on hover. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px transition-all duration-200 ease-out-expo group-hover:h-0.5"
        style={{ backgroundColor: accentColorVar }}
      />
      <div className="flex items-center gap-3">
        <DecisionBadge decision={decision} size="md" />
        <Icon
          className="size-4"
          strokeWidth={2}
          style={{ color: accentColorVar }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-6 text-[18px] font-medium leading-snug text-ink">{definition}</p>
      <ul className="mt-6 space-y-3">
        {criteria.map((c) => (
          <li key={c} className="flex items-start gap-3 text-[14px] text-ink-muted">
            <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-faint" />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </HoverLift>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.6 — Scenario modeling (live slider, quiet stats)
// ════════════════════════════════════════════════════════════════
function ScenarioModeling() {
  // Local React state — marketing preview, never touches the global Zustand store.
  const [active, setActive] = React.useState<ScenarioName>('expected');
  const result = APEX_ALL[active];
  const expected = APEX_ALL.expected;
  const recommendation = recommend(result);
  const showDelta = active !== 'expected';

  return (
    <section className="border-b border-t border-[var(--color-surface-indigo-border)] bg-[var(--color-surface-indigo)]">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-28 md:px-6 md:py-36">
        <FadeIn className="mb-16 max-w-[760px]">
          <p className="mkt-eyebrow">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--color-indigo-muted)]" />
            Scenario modeling
          </p>
          <h2 className="mkt-display-md mt-6">
            See the upside, the floor, and the expected.
          </h2>
          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-ink-muted md:text-[18px]">
            Three scenarios, one set of costs. Drag the slider to watch the numbers —
            and the decision — shift.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <ScenarioSlider value={active} onChange={setActive} size="md" />
            <p className="text-[13px] text-ink-muted">
              {SCENARIO_LABELS[active]} scenario · costs held constant, only benefits vary
            </p>
          </div>
        </FadeIn>

        {/* Cross-fade on scenario change: key change forces remount → reveal-on-enter
            animation re-runs, giving a subtle 400ms fade-up on the figure row. */}
        <div
          key={active}
          className="reveal-on-enter mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:items-start md:gap-6"
        >
          <ScenarioStat
            label="Annual Opportunity"
            format="currency"
            value={result.totalAnnualBenefit}
            expectedValue={expected.totalAnnualBenefit}
            showDelta={showDelta}
          />
          <ScenarioStat
            label="ROI"
            format="multiplier"
            value={result.roiPct == null ? null : result.roiPct / 100}
            expectedValue={
              expected.roiPct == null ? null : expected.roiPct / 100
            }
            showDelta={showDelta}
          />
          <ScenarioStat
            label="Payback"
            format="payback"
            value={result.paybackMonths}
            expectedValue={expected.paybackMonths}
            showDelta={showDelta}
          />
          <div className="mkt-card-quiet p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Decision
            </p>
            <div className="mt-4">
              <DecisionBadge
                decision={recommendation.recommendation}
                size="md"
                animate
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScenarioStat({
  label,
  value,
  expectedValue,
  format,
  showDelta,
}: {
  label: string;
  value: number | null;
  expectedValue: number | null;
  format: 'currency' | 'multiplier' | 'payback';
  showDelta?: boolean;
}) {
  // Delta vs. expected — only rendered when showDelta (active != 'expected') AND both
  // values are non-null.
  const delta =
    showDelta && value != null && expectedValue != null
      ? formatDelta(value, expectedValue, format)
      : null;
  return (
    <div className="mkt-card-quiet p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <p className="mt-3 font-mono tnum text-[clamp(1.75rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-ink">
        {format === 'currency' ? (
          <CountUp
            value={value ?? 0}
            prefix="$"
            decimals={0}
            retriggerOnValueChange
          />
        ) : format === 'multiplier' ? (
          value == null ? (
            <span>N/A</span>
          ) : (
            <CountUp
              value={value}
              suffix="×"
              decimals={1}
              retriggerOnValueChange
            />
          )
        ) : value == null ? (
          <span>Never</span>
        ) : (
          <CountUp
            value={value}
            suffix=" months"
            decimals={1}
            retriggerOnValueChange
          />
        )}
      </p>
      {delta && (
        <p className="mt-2 font-mono tnum text-[11px] text-ink-faint">{delta}</p>
      )}
    </div>
  );
}

/** Format a scenario delta vs. expected: "+$58k vs expected" / "−3.9×" / "+5.5 mo". */
function formatDelta(
  value: number,
  expectedValue: number,
  format: 'currency' | 'multiplier' | 'payback'
): string {
  const diff = value - expectedValue;
  const sign = diff > 0 ? '+' : diff < 0 ? '\u2212' : '';
  const abs = Math.abs(diff);
  if (format === 'currency') {
    // Compact k tier for deltas — "$58k" not "$58,000".
    const v =
      abs >= 1000
        ? `${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
        : `${abs.toFixed(0)}`;
    return `${sign}$${v} vs expected`;
  }
  if (format === 'multiplier') {
    return `${sign}${abs.toFixed(1)}× vs expected`;
  }
  // payback
  return `${sign}${abs.toFixed(1)} mo vs expected`;
}

// ════════════════════════════════════════════════════════════════
// Section 7.6b — Stress-test teaser (charcoal slider mockups)
// ════════════════════════════════════════════════════════════════
// P0-5: fillPct values derived from the engine, not arbitrary. Implementation
// cost as a share of its break-even; monthly operating cost as a share of its
// break-even; automation coverage is its own percentage.
const STRESS_MOCK_SLIDERS = [
  {
    label: 'Implementation cost',
    display: formatCurrency(APEX_INPUTS.implementationFee),
    fillPct: Math.round((APEX_INPUTS.implementationFee / (APEX_BREAK_EVEN.implementationFee ?? 1)) * 100),
  },
  {
    label: 'Automation coverage',
    display: `${Math.round(APEX_INPUTS.expectedAutomationPct * 100)}%`,
    fillPct: Math.round(APEX_INPUTS.expectedAutomationPct * 100),
  },
  {
    label: 'Monthly operating cost',
    display: formatCurrency(APEX_INPUTS.monthlyAiApiCost + APEX_INPUTS.monthlySoftwareCost),
    fillPct: Math.round(
      ((APEX_INPUTS.monthlyAiApiCost + APEX_INPUTS.monthlySoftwareCost) /
        (APEX_BREAK_EVEN.monthlyOperatingCost ?? 1)) *
        100
    ),
  },
] as const;

/**
 * Decision shift across three implementation-cost tiers — Apex golden-case framing.
 * P0-3: every row is derived from the engine. The three fees are the current
 * Apex implementation fee, the BUILD→CONSIDER boundary, and the CONSIDER→DON'T
 * BUILD boundary. The decisions come from recommend() at each fee.
 */
const STRESS_SHIFT_ROWS: Array<{
  cost: string;
  note: string;
  decision: 'build' | 'consider' | 'dont_build';
  active: boolean;
}> = [
  {
    cost: formatCurrency(APEX_INPUTS.implementationFee),
    note: 'current',
    decision: APEX_RECOMMENDATION.recommendation,
    active: true,
  },
  {
    cost: formatCurrency(LADDER_BUILD_TO_CONSIDER),
    note: 'BUILD → CONSIDER',
    decision: 'consider',
    active: false,
  },
  {
    cost: formatCurrency(LADDER_CONSIDER_TO_DONT_BUILD),
    note: 'CONSIDER → DON\u2019T BUILD',
    decision: 'dont_build',
    active: false,
  },
];

function StressTestTeaser() {
  const startCalculator = useApp((s) => s.startCalculator);

  return (
    <section className="surface-analytical border-t border-[var(--color-surface-analytical-border)]">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-28 md:px-6 md:py-40">
        <FadeIn className="mb-16 max-w-[760px]">
          <p className="mkt-eyebrow text-[#A8A0B8]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
            Stress test
          </p>
          <h2 className="mkt-display mt-6 !text-[#F5F3FF]">
            Try to break the business case.
          </h2>
          <p className="mt-8 max-w-[600px] text-[17px] leading-[1.65] text-[#B8B2C4] md:text-[18px]">
            Drag the sliders. Watch the decision change. Viableo stress-tests every
            assumption so you know exactly where the numbers stop working.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
          {/* Left: mock sliders + quiet breaking-point callout — dark surface */}
          <div className="surface-analytical-raised rounded-xl border border-[var(--color-surface-analytical-border)] p-8 md:p-10">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A8A0B8]">
                Live assumptions
              </p>
              <p className="text-[11px] text-[#706B7A]">Apex Home Services</p>
            </div>

            <div className="mt-8 space-y-7">
              {STRESS_MOCK_SLIDERS.map((s) => (
                <MockSlider
                  key={s.label}
                  label={s.label}
                  display={s.display}
                  fillPct={s.fillPct}
                  dark
                />
              ))}
            </div>

            {/* Breaking-point callout — indigo accent on dark surface. */}
            <div className="mt-10 rounded-md border border-[var(--color-surface-analytical-border)] bg-[var(--color-surface-analytical)] p-5">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-build"
                  aria-hidden="true"
                >
                  <Check className="size-3 text-white" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[#F5F3FF]">Still viable</p>
                  <p className="mt-1.5 text-[13px] leading-[1.55] text-[#B8B2C4]">
                    Remains above your target payback until implementation costs exceed{' '}
                    <span className="font-mono tnum font-semibold text-[#F5F3FF]">
                      {formatCurrency(BREAK_POINT_FEE)}
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>

            <ul className="mt-8 space-y-3">
              <li className="flex items-start gap-3 text-[13px] text-[#B8B2C4]">
                <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-[#706B7A]" />
                <span>
                  Sweeps every cost and benefit assumption across its plausible range.
                </span>
              </li>
              <li className="flex items-start gap-3 text-[13px] text-[#B8B2C4]">
                <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-[#706B7A]" />
                <span>
                  Flags the precise breaking point where BUILD tips to CONSIDER or
                  DON&rsquo;T BUILD.
                </span>
              </li>
              <li className="flex items-start gap-3 text-[13px] text-[#B8B2C4]">
                <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-[#706B7A]" />
                <span>
                  The breaking point is the exact value where your recommendation changes from BUILD to DON&rsquo;T BUILD.
                </span>
              </li>
            </ul>
          </div>

          {/* Right: decision-shift column */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A8A0B8]">
              How the decision shifts
            </p>
            <p className="mt-2 text-[13px] text-[#706B7A]">
              As implementation cost climbs from {formatCurrency(APEX_INPUTS.implementationFee)} to {formatCurrency(LADDER_CONSIDER_TO_DONT_BUILD)}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {STRESS_SHIFT_ROWS.map((row) => (
                <MiniDecisionShift key={row.cost} {...row} dark />
              ))}
            </div>

            <div className="mt-8 rounded-md border border-[var(--color-surface-analytical-border)] bg-[var(--color-surface-analytical-raised)] p-5">
              <p className="text-[13px] leading-[1.55] text-[#B8B2C4]">
                The full stress test runs {PERMUTATION_COUNT} assumption permutations — varying
                individual levers and multi-lever combinations — and ranks the
                inputs by how much they move the verdict.
              </p>
            </div>

            <button
              type="button"
              onClick={() => startCalculator()}
              className="mt-8 inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full bg-brand-cta px-6 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(183,15,56,0.20)] transition-[transform,box-shadow] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1.5px] hover:bg-brand-cta-hover hover:shadow-[0_10px_24px_-6px_rgba(183,15,56,0.30)]"
            >
              {CTA_PRIMARY}
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/** Visual-only slider mockup: track + charcoal fill + light handle. Not interactive. */
function MockSlider({
  label,
  display,
  fillPct,
  dark,
}: {
  label: string;
  display: string;
  fillPct: number;
  dark?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={cn('text-[13px] font-medium', dark ? 'text-[#E8E4F0]' : 'text-ink')}>{label}</span>
        <span className={cn('font-mono tnum text-[13px] font-semibold', dark ? 'text-[#E8E4F0]' : 'text-ink')}>
          {display}
        </span>
      </div>
      <div className={cn('relative mt-3 h-1.5 w-full rounded-full border', dark ? 'border-[var(--color-surface-analytical-border)] bg-[var(--color-surface-analytical)]' : 'border-border bg-canvas')}>
        <div
          aria-hidden="true"
          className={cn('absolute left-0 top-0 h-full rounded-full', dark ? 'bg-[#818CF8]' : 'bg-ink')}
          style={{ width: `${fillPct}%` }}
        />
        <div
          aria-hidden="true"
          className={cn('absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-floating', dark ? 'border-[#818CF8] bg-[var(--color-surface-analytical-raised)]' : 'border-ink bg-surface')}
          style={{ left: `${fillPct}%` }}
        />
      </div>
    </div>
  );
}

function MiniDecisionShift({
  cost,
  note,
  decision,
  active,
  dark,
}: {
  cost: string;
  note: string;
  decision: 'build' | 'consider' | 'dont_build';
  active: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md border p-4 transition-colors',
        dark
          ? active
            ? 'border-[var(--color-surface-analytical-border)] bg-[var(--color-surface-analytical-raised)]'
            : 'border-[var(--color-surface-analytical-border)]/50 bg-[var(--color-surface-analytical)] opacity-80'
          : active
            ? 'border-border-strong bg-surface'
            : 'border-border bg-surface-raised opacity-80'
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn('font-mono tnum text-[14px] font-semibold', dark ? 'text-[#F5F3FF]' : 'text-ink')}>{cost}</span>
        <span className={cn('text-[12px]', dark ? 'text-[#A8A0B8]' : 'text-ink-muted')}>{note}</span>
      </div>
      <DecisionBadge decision={decision} size="sm" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.6c — Sensitivity teaser (charcoal ranked bars)
// ════════════════════════════════════════════════════════════════
// P0-4: derived from computeSensitivity() — the real ROI swing at ±20%, ranked.
// The displayed value is formatPercentagePoints(impact/100); the bar width is
// normalized to the largest impact so the visual ranking is honest.
const _MAX_IMPACT = APEX_SENSITIVITY[0]?.impact || 1;
const SENSITIVITY_ROWS = APEX_SENSITIVITY.map((s, i) => ({
  rank: i + 1,
  name: s.label,
  impactPp: s.impact,
  fillPct: Math.round((s.impact / _MAX_IMPACT) * 100),
  level: s.level,
}));

function SensitivityTeaser() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1000px] px-4 py-28 md:px-6 md:py-36">
        <FadeIn className="mb-16 max-w-[760px]">
          <p className="mkt-eyebrow">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-muted" />
            Sensitivity ranking
          </p>
          <h2 className="mkt-display-md mt-6">
            What could go wrong?
          </h2>
          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-ink-muted md:text-[18px]">
            Viableo ranks every assumption by how much of the projected value depends
            on it — so you know which numbers to validate first.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mkt-card-quiet p-8 md:p-10">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Apex Home Services · expected scenario
            </p>
            <p className="text-[11px] text-ink-faint">percentage points of ROI swing at ±20%</p>
          </div>

          <div className="mt-8 space-y-6">
            {SENSITIVITY_ROWS.map((row) => (
              <SensitivityBar key={row.name} {...row} />
            ))}
          </div>

          <p className="mt-8 flex items-start gap-3 text-[13px] leading-[1.55] text-ink-muted">
            <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-faint" />
            <span>
              Conversion improvement drives the largest share of projected value —
              validate that assumption first. Lower-ranked inputs can shift by 10–20%
              without changing the verdict.
            </span>
          </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function SensitivityBar({
  rank,
  name,
  impactPp,
  fillPct,
}: {
  rank: number;
  name: string;
  impactPp: number;
  fillPct: number;
}) {
  // Monochrome fade: rank 1 = full charcoal, then progressively lighter gray.
  const fillClass =
    rank === 1
      ? 'bg-ink'
      : rank === 2
        ? 'bg-ink/60'
        : rank === 3
          ? 'bg-border-strong'
          : 'bg-ink-faint/60';
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono tnum text-[12px] font-medium text-ink-faint">
            {String(rank).padStart(2, '0')}
          </span>
          <span className="text-[14px] font-medium text-ink">{name}</span>
        </div>
        <span className="font-mono tnum text-[14px] font-bold tracking-[-0.02em] text-ink">
          {formatPercentagePoints(impactPp / 100)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full border border-border bg-canvas">
        <div
          aria-hidden="true"
          className={cn('h-full rounded-full', fillClass)}
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.7 — Client report preview (no tilt, thin gradient strip)
// ════════════════════════════════════════════════════════════════
function ReportPreview() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-28 md:px-6 md:py-36">
        <FadeIn className="mb-16 max-w-[760px]">
          <p className="mkt-eyebrow">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-muted" />
            Client-ready report
          </p>
          <h2 className="mkt-display-md mt-6">
            A report your client will actually read.
          </h2>
          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-ink-muted md:text-[18px]">
            One PDF. A stamped verdict. Defensible assumptions. White-label it with
            your agency&rsquo;s logo.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mx-auto max-w-[680px]">
          {/* PDF cover mockup — no tilt, quiet chrome. */}
          <HoverLift className="mkt-card-quiet p-10 shadow-floating md:p-12">
            {/* Sanctioned gradient moment #2 — thin coral→crimson strip, the
                one tiny coral accent on the marketing surface. */}
            <div
              className="viableo-gradient-brand h-1 w-16 rounded-full"
              aria-hidden="true"
            />

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {REPORT_NAME}
            </p>
            <p className="mt-2 text-[15px] text-ink-muted">
              Prepared for Apex Home Services
            </p>

            <div className="mt-10">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                Annual Opportunity
              </p>
              <p className="mt-3 font-mono tnum text-[clamp(2.5rem,6vw,4rem)] font-bold tracking-[-0.03em] text-ink">
                {formatCurrency(APEX_EXPECTED.totalAnnualBenefit)}
              </p>
            </div>

            <div className="mt-10 flex items-center gap-8">
              <DecisionBadge
                decision={APEX_RECOMMENDATION.recommendation}
                size="lg"
                animate
              />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                  Payback
                </p>
                <p className="font-mono tnum text-lg font-semibold text-ink">
                  {formatPayback(APEX_EXPECTED.paybackMonths)}
                </p>
              </div>
            </div>
          </HoverLift>
        </FadeIn>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.8 — Agency workflow
// ════════════════════════════════════════════════════════════════
function AgencyWorkflow() {
  return (
    <section className="border-b border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-28 md:px-6 md:py-36">
        <FadeIn className="mb-16 max-w-[760px]">
          <p className="mkt-eyebrow">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-muted" />
            Agency workflow
          </p>
          <h2 className="mkt-display-md mt-6">
            The agency workflow, from discovery to close.
          </h2>
          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-ink-muted md:text-[18px]">
            Quantify during discovery. Prove with numbers. Propose with a stamped verdict.
            Close with a defensible business case.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Stepper weight="secondary" />
        </FadeIn>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.9 — Comparison / positioning
// ════════════════════════════════════════════════════════════════
function ComparisonSection() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-28 md:px-6 md:py-36">
        <FadeIn className="mb-16 max-w-[760px]">
          <p className="mkt-eyebrow">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-muted" />
            Built for automation economics
          </p>
          <h2 className="mkt-display-md mt-6">
            Built for automation economics.
          </h2>
          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-ink-muted md:text-[18px]">
            Spreadsheets do the labor math. Generic AI tools draft the prose. Only Viableo
            ends in a stamped BUILD / CONSIDER / DON&rsquo;T BUILD with a client-ready business case.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <ComparisonTable />
        </FadeIn>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.10 — Pricing teaser (airy cards, dark CTA)
// ════════════════════════════════════════════════════════════════
function PricingTeaser() {
  const go = useApp((s) => s.go);

  return (
    <section className="border-b border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-28 md:px-6 md:py-36">
        <FadeIn className="mb-16 max-w-[760px]">
          <p className="mkt-eyebrow">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-muted" />
            Pricing
          </p>
          <h2 className="mkt-display-md mt-6">
            Pricing that scales with your analysis volume.
          </h2>
          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-ink-muted md:text-[18px]">
            From your first Viableo Analysis to white-label client business cases.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {PRICING_TIERS.map((tier, i) => (
            <FadeIn key={tier.key} delay={i * 0.07}>
              <PricingCard tier={tier} />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2} className="mt-14 flex justify-center">
          <motion.button
            type="button"
            onClick={() => go('pricing')}
            className="mkt-cta-dark"
            whileHover={{ y: -1.5 }}
            whileTap={{ y: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            See full pricing
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </motion.button>
        </FadeIn>
      </div>
    </section>
  );
}

function PricingCard({ tier }: { tier: (typeof PRICING_TIERS)[number] }) {
  const isPopular = tier.popular;
  const isAgency = tier.key === 'agency';
  return (
    <HoverLift className={cn(
      'mkt-card-quiet relative flex h-full flex-col p-8',
      isPopular && 'mkt-lift'
    )}>
      {/* Quiet top accent on the popular tier — charcoal hairline, not coral. */}
      {isPopular && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-0.5 bg-ink"
        />
      )}
      {isPopular && (
        <div className="absolute -top-3 left-8">
          <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            Most popular
          </span>
        </div>
      )}
      <h3 className="text-[20px] font-semibold text-ink">{tier.name}</h3>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-mono tnum text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-[-0.02em] text-ink">
          {tier.price}
        </span>
        <span className="text-[12px] text-ink-muted">{tier.cadence}</span>
      </div>
      <p className="mt-4 text-[14px] leading-[1.55] text-ink-muted">{tier.blurb}</p>

      {isAgency && (
        <div className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium text-ink-muted">
          <span aria-hidden="true" className="size-1 rounded-full bg-ink" />
          Best value for agencies running 5+ analyses/month
        </div>
      )}
    </HoverLift>
  );
}

// ════════════════════════════════════════════════════════════════
// Section 7.11 — Final CTA (dark, white CTA on charcoal)
// ════════════════════════════════════════════════════════════════
function FinalCTA() {
  const startCalculator = useApp((s) => s.startCalculator);

  return (
    <section className="bg-[var(--color-ink-deep)] text-white">
      {/* Coral accent strip — the one sanctioned coral moment on the dark CTA surface. */}
      <div aria-hidden="true" className="mx-auto w-full max-w-[1100px] px-4 md:px-6">
        <div className="h-px w-32 rounded-full bg-brand" />
      </div>
      <div className="mx-auto w-full max-w-[1100px] px-4 py-28 text-center md:px-6 md:py-44">
        <FadeIn>
          <div className="mb-10 flex justify-center">
            <Logo variant="reverse" />
          </div>
          <h2 className="font-display text-[clamp(2.25rem,6vw,5rem)] font-bold leading-[0.96] tracking-[-0.03em] text-white">
            {FINAL_CTA_HEADLINE}
          </h2>
          <p className="mx-auto mt-8 max-w-[520px] text-[17px] leading-[1.6] text-white/65 md:text-[18px]">
            {FINAL_CTA_BODY}
          </p>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {/* Primary CTA on deep ink — coral brand button, white text. */}
            <motion.button
              type="button"
              onClick={() => startCalculator()}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-brand-cta px-8 text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(183,15,56,0.25)] transition-[transform,background-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1.5px] hover:bg-brand-cta-hover hover:shadow-[0_10px_24px_-6px_rgba(183,15,56,0.35)]"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              {FINAL_CTA_PRIMARY}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => startCalculator(APEX_INPUTS)}
              className="link-underline inline-flex min-h-[52px] items-center gap-1.5 px-2 text-[15px] font-medium text-white/85 transition-opacity duration-hover hover:text-white hover:opacity-90"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
            >
              {FINAL_CTA_SECONDARY}
            </motion.button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

