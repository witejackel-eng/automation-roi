import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import {
  PageHero,
  Section,
  SectionHeading,
  ClosingCTA,
  SiblingLinks,
  BreadcrumbJsonLd,
  PrimaryCTA,
  SecondaryCTA,
  InlineLink,
} from '@/components/marketing/marketing-primitives';
import { Dot, DotRule } from '@/components/viableo';
import { APEX_INPUTS } from '@/lib/golden-case';
import { calculateScenario } from '@/lib/calculations/engine';
import { formatCurrency, formatPayback, formatRoi } from '@/lib/format';

export const metadata: Metadata = {
  title: 'For Zapier agencies',
  description:
    'For Zapier agencies. Model the economics behind Zapier automations before you build them — labor savings, revenue opportunity, first-year cost. No official integration required.',
  alternates: { canonical: '/solutions/zapier-agencies' },
  openGraph: {
    type: 'website',
    title: 'For Zapier agencies | Viableo',
    description:
      'Model the economics behind Zapier automations. See the return, break the case, walk in with a signed report.',
    url: '/solutions/zapier-agencies',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For Zapier agencies | Viableo',
    description:
      'Model the economics behind Zapier automations. See the return, break the case, walk in with a signed report.',
  },
};

const APEX = calculateScenario(APEX_INPUTS, 'expected');

const REASONS = [
  {
    n: '1',
    title: 'Model the Zap before you build it.',
    body: 'A Zap is the implementation. The economics live one level up: which hours it removes, which conversions it lifts, what it costs to run. Viableo computes those before you wire the first step.',
  },
  {
    n: '2',
    title: 'Price the tasks, not just the build.',
    body: 'Monthly AI/API cost and software fees are real line items in a Viableo report. They sit beside the implementation fee, so the client sees the recurring cost of keeping the Zap alive.',
  },
  {
    n: '3',
    title: 'Sign the report before you commit the build.',
    body: 'A PDF business case with your logo on the cover. Executive summary, financial impact, scenario analysis, recommendation, assumptions. The client signs before you build the Zap.',
  },
] as const;

export default function ZapierAgenciesPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions/automation-agencies' },
          { name: 'Zapier agencies', path: '/solutions/zapier-agencies' },
        ]}
      />
      <main id="main-content" className="w-full">
        <PageHero eyebrow="Solutions · Zapier agencies" title="For Zapier agencies.">
          <p>
            Viableo models the economics behind Zapier automations. The labor and
            revenue math is the same whether you ship in Zapier or anywhere else —
            you just enter your numbers and read the verdict.
          </p>
          <p className="mt-4 text-[13px] leading-[1.55] text-black/40">
            Viableo is an independent tool. It does not connect to Zapier, and is
            not affiliated with or endorsed by Zapier.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        <Section className="bg-black/[0.02]">
          <SectionHeading
            eyebrow="Three reasons"
            title="The math, before the Zap."
          >
            <p>
              A Zap is the delivery vehicle. The decision to build it is an
              economic one. Viableo makes that decision a number you can defend.
            </p>
          </SectionHeading>

          <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {REASONS.map((r) => (
              <li key={r.n}>
                <article className="flex h-full flex-col rounded-md border border-black/10  p-6">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.02] text-[13px] font-semibold text-[#111]">
                    {r.n}
                  </span>
                  <h3 className="mt-4 text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-[#111]">
                    {r.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.6] text-black/50">
                    {r.body}
                  </p>
                </article>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-md border border-black/10  p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/50">
              Worked example
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-black/50">
              Apex Home Services golden case. An automation removing{' '}
              <span className="font-mono tnum text-[#111]">20%</span> of a{' '}
              <span className="font-mono tnum text-[#111]">
                {formatCurrency(APEX.annualLaborCost)}
              </span>{' '}
              annual labor cost and lifting conversion by{' '}
              <span className="font-mono tnum text-[#111]">
                {(APEX.conversionImprovementPct * 100).toFixed(1)}pp
              </span>
              . The math returns{' '}
              <span className="font-mono tnum text-[#111]">
                {formatRoi(APEX.roiPct)}
              </span>{' '}
              ROI, paid back in{' '}
              <span className="font-mono tnum text-[#111]">
                {formatPayback(APEX.paybackMonths)}
              </span>
              , for a net annual benefit of{' '}
              <span className="font-mono tnum text-[#111]">
                {formatCurrency(APEX.netAnnualBenefit)}
              </span>
              . The same model works on a single Zap or a multi-Zap engagement.
            </p>
            <p className="mt-4 text-[13px] leading-[1.55] text-black/40">
              Figures are estimates, not financial advice. Full method on the{' '}
              <InlineLink href="/methodology">methodology page</InlineLink>.
            </p>
          </div>
        </Section>

        <DotRule />

        <SiblingLinks
          label="Related"
          links={[
            { href: '/solutions/automation-agencies', label: 'For automation agencies' },
            { href: '/solutions/n8n-agencies', label: 'For n8n agencies' },
            { href: '/solutions/make-agencies', label: 'For Make agencies' },
            { href: '/', label: 'Automation ROI — the number, before you build' },
          ]}
        />

        <ClosingCTA
          headline="Run the math. Then build the Zap."
          body="The economics behind a Zapier automation, in minutes."
        />
      </main>
    </MarketingShell>
  );
}
