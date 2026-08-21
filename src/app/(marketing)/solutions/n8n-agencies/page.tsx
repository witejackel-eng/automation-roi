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
  title: 'For n8n agencies',
  description:
    'For n8n agencies. Model the economics behind n8n workflows before you build them — labor savings, revenue opportunity, first-year cost. No official integration required.',
  alternates: { canonical: '/solutions/n8n-agencies' },
  openGraph: {
    type: 'website',
    title: 'For n8n agencies | Viableo',
    description:
      'Model the economics behind n8n workflows. See the return, break the case, walk in with a signed report.',
    url: '/solutions/n8n-agencies',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For n8n agencies | Viableo',
    description:
      'Model the economics behind n8n workflows. See the return, break the case, walk in with a signed report.',
  },
};

const APEX = calculateScenario(APEX_INPUTS, 'expected');

const REASONS = [
  {
    n: '1',
    title: 'Model the workflow before you build it.',
    body: 'A node-by-node workflow is the implementation. The economics live one level up: which hours it removes, which conversions it lifts, what it costs to run. Viableo computes those before you wire the first node.',
  },
  {
    n: '2',
    title: 'Price the run, not the build.',
    body: 'Monthly AI/API cost and software fees are real line items in a Viableo report. They sit beside the implementation fee, so the client sees the recurring cost of keeping the workflow alive.',
  },
  {
    n: '3',
    title: 'Sign the report before you commit the build.',
    body: 'A PDF business case with your logo on the cover. Executive summary, financial impact, scenario analysis, recommendation, assumptions. The client signs before you write the workflow.',
  },
] as const;

export default function N8nAgenciesPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions/automation-agencies' },
          { name: 'n8n agencies', path: '/solutions/n8n-agencies' },
        ]}
      />
      <main id="main-content" className="w-full">
        <PageHero eyebrow="Solutions · n8n agencies" title="For n8n agencies.">
          <p>
            Viableo models the economics behind n8n workflows. The labor and
            revenue math is the same whether you ship in n8n or anywhere else —
            you just enter your numbers and read the verdict.
          </p>
          <p className="mt-4 text-[13px] leading-[1.55] text-black/40">
            Viableo is an independent tool. It does not connect to n8n, and is not
            affiliated with or endorsed by n8n.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        <Section className="bg-black/[0.02]">
          <SectionHeading
            eyebrow="Three reasons"
            title="The math, before the workflow."
          >
            <p>
              An n8n workflow is the delivery vehicle. The decision to build it
              is an economic one. Viableo makes that decision a number you can
              defend.
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
              . The same model works on a single n8n workflow or a multi-workflow
              engagement.
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
            { href: '/solutions/make-agencies', label: 'For Make agencies' },
            { href: '/solutions/zapier-agencies', label: 'For Zapier agencies' },
            { href: '/', label: 'Automation ROI — the number, before you build' },
          ]}
        />

        <ClosingCTA
          headline="Run the math. Then build the workflow."
          body="The economics behind an n8n workflow, in minutes."
        />
      </main>
    </MarketingShell>
  );
}
