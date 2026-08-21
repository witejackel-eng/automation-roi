import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import {
  HERO_EYEBROW,
  HERO_HEADLINE,
  HERO_SUBHEAD,
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
  PROBLEM_HEADLINE,
  WHAT_HEADLINE,
  WHAT_SUBHEAD,
  WHAT_ITEMS,
  VERDICT_HEADLINE,
  VERDICT_GATE_INTRO,
  VERDICT_GATES,
  VERDICT_GATE_NOTE,
  VERDICT_CLOSING,
  CLIENT_REPORT_HEADLINE,
  PROOF_HEADLINE,
  PROOF_SUBHEAD,
  PROOF_CTA,
  PROOF_CTA_HREF,
  COMPARISON_HEADLINE,
  COMPARISON_ROWS,
  FINAL_CTA_HEADLINE,
  FINAL_CTA_BODY,
  FINAL_CTA_PRIMARY,
  FINAL_CTA_PRIMARY_HREF,
  DECISION_COLORS,
} from '@/lib/brand';
import { APEX_INPUTS } from '@/lib/golden-case';
import { calculateAllScenarios, calculateScenario } from '@/lib/calculations/engine';
import { formatCurrency, formatRoi, formatPayback, formatCount } from '@/lib/format';
import { Dot } from '@/components/viableo';

// Dark-surface verdict colors (Section 4.4)
const DECISION_COLORS_DARK = {
  build: '#34D399',
  consider: '#FBBF24',
  dont_build: '#F87171',
} as const;

// ── Helper: calculate the implementation fee breaking point ────────────────
// The fee at which monthly net benefit = 0:
//   totalFirstYearCost = fee + annualRecurringCost
//   netAnnualBenefit  = totalAnnualBenefit - totalFirstYearCost = 0
//   => fee = totalAnnualBenefit - annualRecurringCost
function calculateBreakingPoint(inputs: typeof APEX_INPUTS): number {
  const result = calculateScenario(inputs, 'expected');
  return result.totalAnnualBenefit - result.annualRecurringCost;
}

export const metadata: Metadata = {
  title: 'Viableo — Know what\u2019s worth building.',
  description: 'Turn a rough automation scope into a stress-tested verdict \u2014 and the business case that defends it.',
  alternates: { canonical: '/' },
};

// ── Calculated data (runs at build / request time, zero client JS) ────────
const scenarios = calculateAllScenarios(APEX_INPUTS);
const expected = scenarios.expected;
const conservative = scenarios.conservative;
const upside = scenarios.upside;

export default function HomePage() {
  return (
    <MarketingShell>
      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO — ATTENTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="pt-36 md:pt-44 pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#111]/40 mb-6">
              {HERO_EYEBROW}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] leading-[1.1] tracking-[-0.02em] text-[#111] mb-6">
              {HERO_HEADLINE}
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-[#111]/50 mb-10 max-w-xl">
              {HERO_SUBHEAD}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                href="/start?start=1"
                className="inline-flex items-center justify-center min-h-[44px] px-7 rounded-full bg-[#111] text-white text-sm tracking-wide hover:bg-[#333] transition-colors"
              >
                {HERO_CTA_PRIMARY}
              </Link>
              <Link
                href="/start?start=1&example=apex"
                className="inline-flex items-center justify-center min-h-[44px] px-7 rounded-full border border-[#111]/[0.15] text-[#111]/70 text-sm tracking-wide hover:border-[#111]/30 hover:text-[#111] transition-colors"
              >
                {HERO_CTA_SECONDARY}
              </Link>
            </div>
          </div>

          {/* ── Hero preview card ──────────────────────────────────────────── */}
          <article className="mt-16 md:mt-20 max-w-lg">
            <div className="bg-white border border-[#111]/[0.06] rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#111]/30 font-medium">
                  Viableo Business Case
                </p>
                <span
                  className="inline-block text-[11px] font-semibold tracking-[0.1em] px-3 py-1 rounded-full"
                  style={{
                    color: DECISION_COLORS.build.text,
                    backgroundColor: DECISION_COLORS.build.bg,
                  }}
                >
                  BUILD
                </span>
              </div>
              <p className="text-sm font-medium text-[#111] mb-4">Apex Home Services</p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <dt className="text-[11px] tracking-wide uppercase text-[#111]/30 mb-0.5">Annual benefit</dt>
                  <dd className="text-xl font-semibold tracking-tight text-[#111] tabular-nums">
                    {formatCurrency(expected.netAnnualBenefit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-wide uppercase text-[#111]/30 mb-0.5">Implementation</dt>
                  <dd className="text-xl font-semibold tracking-tight text-[#111] tabular-nums">
                    {formatCurrency(APEX_INPUTS.implementationFee)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-wide uppercase text-[#111]/30 mb-0.5">Payback</dt>
                  <dd className="text-xl font-semibold tracking-tight text-[#111] tabular-nums">
                    {formatPayback(expected.paybackMonths)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-wide uppercase text-[#111]/30 mb-0.5">Confidence</dt>
                  <dd className="text-xl font-semibold tracking-tight text-[#111]">High</dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. PROBLEM
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl tracking-[-0.02em] text-[#111] leading-tight mb-4">
              {PROBLEM_HEADLINE}
            </h2>
            <p className="text-lg text-[#111]/50 mb-14">
              The expensive way to find out is to build it.
            </p>
          </div>
          <ol className="max-w-2xl space-y-8">
            <li className="flex gap-5">
              <span className="shrink-0 text-sm font-mono text-[#111]/25 mt-0.5">01</span>
              <div>
                <p className="text-[#111] text-lg leading-relaxed">
                  Quote a build that won&apos;t pay back.
                </p>
              </div>
            </li>
            <li className="flex gap-5">
              <span className="shrink-0 text-sm font-mono text-[#111]/25 mt-0.5">02</span>
              <div>
                <p className="text-[#111] text-lg leading-relaxed">
                  Spend hours rebuilding the economics in spreadsheets.
                </p>
              </div>
            </li>
            <li className="flex gap-5">
              <span className="shrink-0 text-sm font-mono text-[#111]/25 mt-0.5">03</span>
              <div>
                <p className="text-[#111] text-lg leading-relaxed">
                  Walk into the client call without a defensible answer.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. SOLUTION — WHAT VIABLEO DOES
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl tracking-[-0.02em] text-[#111] leading-tight mb-4">
              {WHAT_HEADLINE}
            </h2>
            <p className="text-lg text-[#111]/50">
              {WHAT_SUBHEAD}
            </p>
          </div>
          <dl className="max-w-2xl divide-y divide-[#111]/[0.06]">
            {WHAT_ITEMS.map((item, i) => (
              <div key={i} className="py-6 first:pt-0 last:pb-0 flex gap-5">
                <span aria-hidden="true" className="mt-1.5 shrink-0">
                  <Dot size="sm" />
                </span>
                <div>
                  <dt className="text-[#111] font-medium text-lg leading-relaxed mb-1">
                    {item.q}
                  </dt>
                  <dd className="text-[#111]/50 text-base leading-relaxed">
                    {item.a}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. VERDICT
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl md:text-4xl tracking-[-0.02em] text-[#111] leading-tight mb-4">
              {VERDICT_HEADLINE}
            </h2>
          </div>
          <div className="max-w-2xl">
            <p className="text-[#111]/50 text-base mb-8">{VERDICT_GATE_INTRO}</p>
            <ul className="space-y-4 mb-8">
              {VERDICT_GATES.map((gate, i) => (
                <li key={i} className="flex gap-4 items-baseline">
                  <span aria-hidden="true" className="mt-2 shrink-0">
                    <Dot size="xs" className="opacity-50" />
                  </span>
                  <span className="text-[#111] text-base leading-relaxed">{gate}</span>
                </li>
              ))}
            </ul>
            <p className="text-[#111]/40 text-sm leading-relaxed mb-10">
              {VERDICT_GATE_NOTE}
            </p>
            <p className="text-[#111]/70 text-base leading-relaxed max-w-xl">
              {VERDICT_CLOSING}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          5. BREAK IT ON PURPOSE (dark surface)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#111] py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl tracking-[-0.02em] text-white leading-tight mb-4">
              Break it on purpose.
            </h2>
            <p className="text-lg text-white/50">
              Find the number that breaks your case before your client does.
            </p>
          </div>

          {/* ── Threshold visual ───────────────────────────────────────────── */}
          <div className="max-w-2xl">
            <div className="relative mb-8">
              {/* Gradient bar */}
              <div className="h-10 rounded-md flex overflow-hidden">
                <div
                  className="flex items-center justify-center text-[11px] font-semibold tracking-[0.1em] uppercase"
                  style={{
                    flex: '2',
                    backgroundColor: DECISION_COLORS_DARK.build,
                    color: '#111',
                  }}
                >
                  BUILD
                </div>
                <div
                  className="flex items-center justify-center text-[11px] font-semibold tracking-[0.1em] uppercase"
                  style={{
                    flex: '1',
                    backgroundColor: DECISION_COLORS_DARK.consider,
                    color: '#111',
                  }}
                >
                  CONSIDER
                </div>
                <div
                  className="flex items-center justify-center text-[11px] font-semibold tracking-[0.1em] uppercase"
                  style={{
                    flex: '1',
                    backgroundColor: DECISION_COLORS_DARK.dont_build,
                    color: '#fff',
                  }}
                >
                  DON&apos;T BUILD
                </div>
              </div>
              {/* Breaking-point marker */}
              <div className="absolute top-0 h-full flex flex-col items-center" style={{ left: '66%' }}>
                <div className="w-px h-full bg-white/30" />
                <p className="mt-3 text-[10px] tracking-widest uppercase text-white/30">
                  Breaking point
                </p>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Conservative &middot; Expected &middot; Upside
            </p>
            <p className="text-white/30 text-sm leading-relaxed mt-2">
              The answer holds until the implementation fee passes{' '}
              <span className="text-white/60 font-semibold tabular-nums">
                {formatCurrency(calculateBreakingPoint(APEX_INPUTS))}
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. CLIENT OUTPUT
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl tracking-[-0.02em] text-[#111] leading-tight mb-4">
              {CLIENT_REPORT_HEADLINE}
            </h2>
            <p className="text-lg text-[#111]/50">
              Walk into the call with the answer.
            </p>
          </div>

          {/* ── Report artifact card ───────────────────────────────────────── */}
          <article className="max-w-2xl">
            <div className="bg-white border border-[#111]/[0.06] rounded-lg p-6 md:p-8 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#111]/[0.06]">
                <div>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-[#111]/30 font-medium mb-1">
                    Viableo Business Case
                  </p>
                  <p className="text-base font-medium text-[#111]">Apex Home Services</p>
                </div>
                <span
                  className="inline-block text-[11px] font-semibold tracking-[0.1em] px-3 py-1 rounded-full"
                  style={{
                    color: DECISION_COLORS.build.text,
                    backgroundColor: DECISION_COLORS.build.bg,
                  }}
                >
                  BUILD
                </span>
              </div>

              {/* Key metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pb-5 border-b border-[#111]/[0.06]">
                <div>
                  <dt className="text-[11px] tracking-wide uppercase text-[#111]/30 mb-1">Net annual benefit</dt>
                  <dd className="text-lg font-semibold text-[#111] tabular-nums">
                    {formatCurrency(expected.netAnnualBenefit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-wide uppercase text-[#111]/30 mb-1">ROI</dt>
                  <dd className="text-lg font-semibold text-[#111] tabular-nums">
                    {formatRoi(expected.roiPct)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-wide uppercase text-[#111]/30 mb-1">Payback</dt>
                  <dd className="text-lg font-semibold text-[#111] tabular-nums">
                    {formatPayback(expected.paybackMonths)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-wide uppercase text-[#111]/30 mb-1">Confidence</dt>
                  <dd className="text-lg font-semibold text-[#111]">High</dd>
                </div>
              </div>

              {/* Scenario comparison */}
              <div className="mb-6 pb-5 border-b border-[#111]/[0.06]">
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#111]/30 font-medium mb-3">
                  Scenario comparison
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] tracking-wide uppercase text-[#111]/30">
                      <th className="text-left pb-2 font-medium">Scenario</th>
                      <th className="text-right pb-2 font-medium">Benefit</th>
                      <th className="text-right pb-2 font-medium">ROI</th>
                      <th className="text-right pb-2 font-medium">Payback</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    <tr className="border-t border-[#111]/[0.04]">
                      <td className="py-2 text-[#111]/70">Conservative</td>
                      <td className="py-2 text-right text-[#111]">{formatCurrency(conservative.netAnnualBenefit)}</td>
                      <td className="py-2 text-right text-[#111]">{formatRoi(conservative.roiPct)}</td>
                      <td className="py-2 text-right text-[#111]">{formatPayback(conservative.paybackMonths)}</td>
                    </tr>
                    <tr className="border-t border-[#111]/[0.04]">
                      <td className="py-2 text-[#111] font-medium">Expected</td>
                      <td className="py-2 text-right text-[#111] font-medium">{formatCurrency(expected.netAnnualBenefit)}</td>
                      <td className="py-2 text-right text-[#111] font-medium">{formatRoi(expected.roiPct)}</td>
                      <td className="py-2 text-right text-[#111] font-medium">{formatPayback(expected.paybackMonths)}</td>
                    </tr>
                    <tr className="border-t border-[#111]/[0.04]">
                      <td className="py-2 text-[#111]/70">Upside</td>
                      <td className="py-2 text-right text-[#111]">{formatCurrency(upside.netAnnualBenefit)}</td>
                      <td className="py-2 text-right text-[#111]">{formatRoi(upside.roiPct)}</td>
                      <td className="py-2 text-right text-[#111]">{formatPayback(upside.paybackMonths)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Assumptions + Stress test summary */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-[#111]/30 font-medium mb-2">
                    Key assumptions
                  </p>
                  <ul className="space-y-1.5 text-sm text-[#111]/50">
                    <li className="flex gap-2">
                      <span aria-hidden="true" className="mt-1.5 shrink-0"><Dot size="xs" className="opacity-40" /></span>
                      <span>{formatCount(APEX_INPUTS.employeesAffected)} employees at {formatCurrency(APEX_INPUTS.hourlyCost)}/hr</span>
                    </li>
                    <li className="flex gap-2">
                      <span aria-hidden="true" className="mt-1.5 shrink-0"><Dot size="xs" className="opacity-40" /></span>
                      <span>{APEX_INPUTS.hoursPerWeek} hrs/wk automated at {(APEX_INPUTS.expectedAutomationPct * 100).toFixed(0)}%</span>
                    </li>
                    <li className="flex gap-2">
                      <span aria-hidden="true" className="mt-1.5 shrink-0"><Dot size="xs" className="opacity-40" /></span>
                      <span>{formatCount(APEX_INPUTS.leadsPerMonth)} leads/mo, {(APEX_INPUTS.expectedConversionImprovementPct * 100).toFixed(1)}pp conversion lift</span>
                    </li>
                    <li className="flex gap-2">
                      <span aria-hidden="true" className="mt-1.5 shrink-0"><Dot size="xs" className="opacity-40" /></span>
                      <span>Gross margin {(APEX_INPUTS.grossMarginPct! * 100).toFixed(0)}%</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-[#111]/30 font-medium mb-2">
                    Stress-test result
                  </p>
                  <p className="text-sm text-[#111]/50 leading-relaxed">
                    Verdict holds in the conservative case ({formatRoi(conservative.roiPct)} ROI, {formatPayback(conservative.paybackMonths)} payback). Breaking point at {formatCurrency(calculateBreakingPoint(APEX_INPUTS))} implementation fee.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          7. PROOF / TRUST
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl tracking-[-0.02em] text-[#111] leading-tight mb-4">
              {PROOF_HEADLINE}
            </h2>
            <p className="text-lg text-[#111]/50 mb-6">
              {PROOF_SUBHEAD}
            </p>
            <p className="text-base text-[#111]/50 leading-relaxed mb-4">
              Every figure on this page is computed when the page is built, from the
              reference case inputs published on the methodology page. Nothing here
              is typed in by hand.
            </p>
            <p className="text-base text-[#111]/50 leading-relaxed mb-8">
              If the model changes, these numbers change with it. That is the
              difference between a number you can defend and a number you hope is
              right.
            </p>
            <Link
              href={PROOF_CTA_HREF}
              className="inline-flex items-center justify-center min-h-[44px] px-7 rounded-full border border-[#111]/[0.15] text-[#111]/70 text-sm tracking-wide hover:border-[#111]/30 hover:text-[#111] transition-colors"
            >
              {PROOF_CTA} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8. COMPARISON / OBJECTIONS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl tracking-[-0.02em] text-[#111] leading-tight mb-4">
              {COMPARISON_HEADLINE}
            </h2>
          </div>
          <div className="max-w-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] tracking-wide uppercase text-[#111]/30">
                  <th className="text-left pb-3 pr-4 font-medium">Need</th>
                  <th className="text-center pb-3 px-3 font-medium">Generic LLM</th>
                  <th className="text-center pb-3 px-3 font-medium">Spreadsheet</th>
                  <th className="text-center pb-3 px-3 font-medium">Generic ROI</th>
                  <th className="text-center pb-3 pl-3 font-medium text-[#111]">Viableo</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className={i < COMPARISON_ROWS.length - 1 ? 'border-t border-[#111]/[0.04]' : ''}
                  >
                    <td className="py-3 pr-4 text-[#111]">{row.need}</td>
                    <td className="py-3 px-3 text-center text-[#111]/25">{row.generic ? '✓' : '—'}</td>
                    <td className="py-3 px-3 text-center text-[#111]/25">{row.spreadsheet ? '✓' : '—'}</td>
                    <td className="py-3 px-3 text-center text-[#111]/25">{row.genericRoi ? '✓' : '—'}</td>
                    <td className="py-3 pl-3 text-center font-medium" style={{ color: '#0D6B3F' }}>
                      {row.viableo ? '✓' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          9. FINAL CTA (dark section)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#111] py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl tracking-[-0.02em] text-white leading-tight mb-4">
              {FINAL_CTA_HEADLINE}
            </h2>
            <p className="text-lg text-white/50 mb-10">
              {FINAL_CTA_BODY}
            </p>
            <Link
              href={FINAL_CTA_PRIMARY_HREF}
              className="inline-flex items-center justify-center min-h-[44px] px-7 rounded-full bg-white text-[#111] text-sm font-medium tracking-wide hover:bg-white/90 transition-colors"
            >
              {FINAL_CTA_PRIMARY}
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}


