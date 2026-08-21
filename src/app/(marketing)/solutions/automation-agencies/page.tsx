import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import {
  BreadcrumbJsonLd,
  PageHero,
  Section,
  SectionHeading,
  ClosingCTA,
  SiblingLinks,
  PrimaryCTA,
  SecondaryCTA,
} from '@/components/marketing/marketing-primitives';
import { APEX_INPUTS } from '@/lib/golden-case';
import { calculateScenario, calculateAllScenarios } from '@/lib/calculations/engine';
import { formatCurrency, formatPayback, formatRoi, formatPercent } from '@/lib/format';

export const metadata: Metadata = {
  title: 'For automation agencies',
  description:
    'For automation agencies. Model the economics, stress-test the assumptions, walk in with a report the client can sign. Prove the value before you build.',
  alternates: { canonical: '/solutions/automation-agencies' },
  openGraph: {
    type: 'website',
    title: 'For automation agencies | Viableo',
    description:
      'Model the economics, stress-test the assumptions, walk in with a signed report.',
    url: '/solutions/automation-agencies',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For automation agencies | Viableo',
    description: 'Prove the value before you build.',
  },
};

// Apex golden case — real numbers, computed once.
const APEX = calculateScenario(APEX_INPUTS, 'expected');
const APEX_ALL = calculateAllScenarios(APEX_INPUTS);

const STEPS = [
  {
    n: '01',
    title: 'SEE IT',
    question: 'What will this automation return?',
    body: 'Run the economics before you commit engineering time. Labor savings plus revenue opportunity minus first-year cost. One number the client can sign.',
    detail: `The Apex golden case: ${formatCurrency(APEX.netAnnualBenefit)} net annual benefit at a ${formatRoi(APEX.roiPct)} return, paid back in ${formatPayback(APEX.paybackMonths)}.`,
  },
  {
    n: '02',
    title: 'BREAK IT',
    question: 'What could invalidate the case?',
    body: 'Three scenarios run automatically — conservative, expected, upside. The conservative case is the floor. If the floor does not hold, the build does not hold.',
    detail: `Conservative case: ${formatRoi(APEX_ALL.conservative.roiPct)} ROI, ${formatCurrency(APEX_ALL.conservative.netAnnualBenefit)} net, ${formatPayback(APEX_ALL.conservative.paybackMonths)} payback.`,
  },
  {
    n: '03',
    title: 'SIGN IT',
    question: 'What do I send the client?',
    body: 'A client-ready business case in PDF. Executive summary, financial impact, scenario analysis, recommendation, assumptions table. Every number traced to a labelled input.',
    detail: 'Cover page. Executive verdict. Financial impact. Scenario comparison. Assumptions audit. Your logo on the cover.',
  },
] as const;

export default function AutomationAgenciesPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions/automation-agencies' },
          { name: 'Automation agencies', path: '/solutions/automation-agencies' },
        ]}
      />
      <main id="main-content" className="w-full">
        <PageHero eyebrow="Solutions" title="For automation agencies.">
          <p>
            Model the economics. Stress-test the assumptions. Walk in with a
            report the client can sign. Prove the value before you build.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        {/* ── See it. Break it. Sign it. ─────────────────────── */}
        <Section>
          <SectionHeading
            eyebrow="The process"
            title="See it. Break it. Sign it."
          >
            <p>
              The same three beats run on every client opportunity. The work is
              the same. The numbers are different.
            </p>
          </SectionHeading>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <article
                key={s.n}
                className="bg-white border border-[#111]/[0.06] rounded-lg p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-semibold text-[#111]/30">
                    {s.n}
                  </span>
                  <h3 className="text-[15px] font-semibold uppercase tracking-[0.04em] text-[#111]">
                    {s.title}
                  </h3>
                </div>
                <p className="mt-3 text-[17px] font-medium leading-snug text-[#111]">
                  {s.question}
                </p>
                <p className="mt-3 text-[14px] leading-[1.6] text-[#111]/50">
                  {s.body}
                </p>
                <p className="mt-4 text-[13px] leading-[1.5] text-[#111]/30">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#0D6B3F] mr-1.5 align-middle" aria-hidden="true" />
                  {s.detail}
                </p>
              </article>
            ))}
          </div>
        </Section>

        {/* ── Walk in with the answer ────────────────────────── */}
        <Section>
          <SectionHeading
            eyebrow="The output"
            title="Walk in with the answer."
          >
            <p>
              This is what the client sees. Every number traced to an input.
              Every input labelled by how you got it.
            </p>
          </SectionHeading>

          <div className="mt-10 bg-white border border-[#111]/[0.06] rounded-lg overflow-hidden">
            {/* Header bar */}
            <div className="border-b border-[#111]/[0.06] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#0D6B3F]" aria-hidden="true" />
                <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#111]/50">
                  Viableo Business Case
                </span>
              </div>
              <span className="text-[13px] text-[#111]/30">
                Apex Home Services
              </span>
            </div>

            {/* Verdict strip */}
            <div className="border-b border-[#111]/[0.06] px-6 py-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#111]/30">
                Recommendation
              </p>
              <p className="mt-2 text-[22px] font-semibold tracking-tight text-[#0D6B3F]">
                BUILD
              </p>
              <p className="mt-1 text-[14px] text-[#111]/50">
                The numbers hold up — even in the worst case.
              </p>
            </div>

            {/* Key figures */}
            <div className="border-b border-[#111]/[0.06] grid grid-cols-2 md:grid-cols-4">
              <div className="px-6 py-5 border-b md:border-b-0 md:border-r border-[#111]/[0.06]">
                <p className="text-[11px] uppercase tracking-[0.06em] text-[#111]/30">
                  ROI
                </p>
                <p className="mt-2 font-mono text-xl font-semibold text-[#111]">
                  {formatRoi(APEX.roiPct)}
                </p>
              </div>
              <div className="px-6 py-5 border-b md:border-b-0 md:border-r border-[#111]/[0.06]">
                <p className="text-[11px] uppercase tracking-[0.06em] text-[#111]/30">
                  Net / year
                </p>
                <p className="mt-2 font-mono text-xl font-semibold text-[#111]">
                  {formatCurrency(APEX.netAnnualBenefit)}
                </p>
              </div>
              <div className="px-6 py-5 border-b md:border-b-0 md:border-r border-[#111]/[0.06]">
                <p className="text-[11px] uppercase tracking-[0.06em] text-[#111]/30">
                  Payback
                </p>
                <p className="mt-2 font-mono text-xl font-semibold text-[#111]">
                  {formatPayback(APEX.paybackMonths)}
                </p>
              </div>
              <div className="px-6 py-5">
                <p className="text-[11px] uppercase tracking-[0.06em] text-[#111]/30">
                  First-year cost
                </p>
                <p className="mt-2 font-mono text-xl font-semibold text-[#111]">
                  {formatCurrency(APEX.totalFirstYearCost)}
                </p>
              </div>
            </div>

            {/* Scenarios */}
            <div className="px-6 py-5">
              <p className="text-[11px] uppercase tracking-[0.06em] text-[#111]/30 mb-3">
                Scenario comparison
              </p>
              <dl className="grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.06em] text-[#111]/30">Conservative</dt>
                  <dd className="mt-1 font-mono text-[15px] text-[#111]">{formatRoi(APEX_ALL.conservative.roiPct)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.06em] text-[#111] font-medium">Expected</dt>
                  <dd className="mt-1 font-mono text-[15px] font-semibold text-[#111]">{formatRoi(APEX_ALL.expected.roiPct)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.06em] text-[#111]/30">Upside</dt>
                  <dd className="mt-1 font-mono text-[15px] text-[#111]">{formatRoi(APEX_ALL.upside.roiPct)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <p className="mt-8 text-[14px] leading-[1.6] text-[#111]/50">
            The full method is documented on the{' '}
            <Link href="/methodology" className="text-[#111] underline underline-offset-2 decoration-[#111]/20 hover:decoration-[#111]/60 hover:text-[#111]/70">
              methodology page
            </Link>
            . Figures are estimates, not financial advice.
          </p>
        </Section>

        {/* ── Whatever you build with ────────────────────────── */}
        <Section>
          <SectionHeading
            eyebrow="Built for your stack"
            title="Whatever you build with, the math is the same."
          >
            <p>
              Viableo does not connect to your tools. It models the economics
              behind them. The labor and revenue math is identical whether you
              ship the workflow in n8n, Make, Zapier, or custom code.
            </p>
          </SectionHeading>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { href: '/solutions/n8n-agencies', label: 'For n8n agencies' },
              { href: '/solutions/make-agencies', label: 'For Make agencies' },
              { href: '/solutions/zapier-agencies', label: 'For Zapier agencies' },
            ].map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="flex min-h-[44px] items-center justify-between bg-white border border-[#111]/[0.06] rounded-lg px-4 py-3 text-[15px] font-medium text-[#111] hover:border-[#111]/[0.12] transition-colors"
                >
                  {s.label}
                  <span aria-hidden="true" className="text-[#111]/30">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <SiblingLinks
          label="Related"
          links={[
            { href: '/', label: 'Automation ROI — the number, before you build' },
            { href: '/methodology', label: 'Methodology — how the math works' },
            { href: '/resources/automation-business-case', label: 'Resource: Automation business case' },
            { href: '/solutions/n8n-agencies', label: 'For n8n agencies' },
          ]}
        />

        <ClosingCTA
          headline="Prove the value. Then build."
          body="Run the same model on your next client opportunity."
        />
      </main>
    </MarketingShell>
  );
}
