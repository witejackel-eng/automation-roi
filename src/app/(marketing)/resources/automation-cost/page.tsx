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
  FigureBlock,
  InlineLink,
} from '@/components/marketing/marketing-primitives';
import { Dot, DotRule } from '@/components/viableo';
import { APEX_INPUTS } from '@/lib/golden-case';
import { calculateScenario } from '@/lib/calculations/engine';
import { formatCurrency, formatPayback, formatRoi } from '@/lib/format';

export const metadata: Metadata = {
  title: 'What is automation cost?',
  description:
    'Automation cost is what it costs to build and run an automation in year one. Four line items: implementation fee, monthly AI/API, monthly software, other annual. A worked example with real numbers.',
  alternates: { canonical: '/resources/automation-cost' },
  openGraph: {
    type: 'article',
    title: 'Automation cost | Viableo Resources',
    description:
      'What automation cost is, the four line items that make it up, and a worked example using real numbers.',
    url: '/resources/automation-cost',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Automation cost | Viableo Resources',
    description:
      'What automation cost is, the four line items that make it up, and a worked example using real numbers.',
  },
};

const APEX = calculateScenario(APEX_INPUTS, 'expected');

const LINE_ITEMS = [
  {
    label: 'Implementation fee',
    apex: APEX_INPUTS.implementationFee,
    note: 'One-time cost to design, build, and deploy. Engineering hours, integration, QA, launch.',
  },
  {
    label: 'Monthly AI/API cost',
    apex: APEX_INPUTS.monthlyAiApiCost,
    note: 'Per-run cost of the language model, vector DB, or third-party API the automation calls.',
    monthly: true,
  },
  {
    label: 'Monthly software cost',
    apex: APEX_INPUTS.monthlySoftwareCost,
    note: 'Platform licensing — n8n, Make, Zapier, a queue, a database, monitoring.',
    monthly: true,
  },
  {
    label: 'Other annual cost',
    apex: APEX_INPUTS.otherAnnualCost,
    note: 'Maintenance, support contracts, training, anything that recurs once a year.',
  },
] as const;

export default function ResourceAutomationCostPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources/automation-roi' },
          { name: 'Automation cost', path: '/resources/automation-cost' },
        ]}
      />
      <main id="main-content" className="w-full">
        <PageHero eyebrow="Resources · Concept" title="Automation cost.">
          <p>
            Automation cost is what it costs to build and run an automation in
            year one. Four line items. One total. No hidden recurring fees. The
            number that sits on the other side of the ROI equation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        {/* ── The four line items ──────────────────────────────── */}
        <Section className="bg-surface">
          <SectionHeading
            eyebrow="The four line items"
            title="Build once. Run for a year."
          >
            <p>
              Viableo splits first-year cost into four parts. Implementation is
              paid once. The other three recur. Adding them up gives the
              denominator of the ROI ratio.
            </p>
          </SectionHeading>

          <div className="mt-8 overflow-hidden rounded-md border border-border bg-canvas">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th scope="col" className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                    Line item
                  </th>
                  <th scope="col" className="px-5 py-3 text-right text-[12px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                    Apex value
                  </th>
                  <th scope="col" className="hidden px-5 py-3 text-[12px] font-medium uppercase tracking-[0.06em] text-ink-muted md:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {LINE_ITEMS.map((item) => (
                  <tr key={item.label} className="border-b border-border last:border-b-0">
                    <td className="px-5 py-4 align-top">
                      <p className="text-[15px] font-medium text-ink">{item.label}</p>
                      {'monthly' in item && item.monthly ? (
                        <p className="mt-0.5 text-[12px] text-ink-faint">× 12 months</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <span className="font-mono tnum text-[15px] text-ink">
                        {formatCurrency(item.apex)}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 align-top text-[13px] leading-[1.55] text-ink-muted md:table-cell">
                      {item.note}
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface">
                  <td className="px-5 py-4">
                    <p className="text-[15px] font-semibold text-ink">First-year cost</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-mono tnum text-[18px] font-semibold text-brand">
                      {formatCurrency(APEX.totalFirstYearCost)}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 text-[13px] leading-[1.55] text-ink-muted md:table-cell">
                    Implementation + (AI/API × 12) + (software × 12) + other annual.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-[13px] leading-[1.55] text-ink-faint">
            The same four line items feed the denominator of every ROI calculation
            in Viableo. Cost inputs are held constant across all three scenarios
            — only the benefit assumptions move.
          </p>
        </Section>

        {/* ── Worked example ───────────────────────────────────── */}
        <Section className="bg-canvas">
          <SectionHeading
            eyebrow="Worked example"
            title="What it buys you."
          >
            <p>
              The Apex build costs{' '}
              <span className="font-mono tnum text-ink">
                {formatCurrency(APEX.totalFirstYearCost)}
              </span>{' '}
              in year one. The benefit it returns is{' '}
              <span className="font-mono tnum text-ink">
                {formatCurrency(APEX.totalAnnualBenefit)}
              </span>
              . The math from there is short.
            </p>
          </SectionHeading>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FigureBlock
              label="First-year cost"
              value={formatCurrency(APEX.totalFirstYearCost)}
              caption="The four line items above."
              accent
            />
            <FigureBlock
              label="Net annual benefit"
              value={formatCurrency(APEX.netAnnualBenefit)}
              caption="Benefit minus the cost above."
            />
            <FigureBlock
              label="ROI · payback"
              value={`${formatRoi(APEX.roiPct)}`}
              caption={`Paid back in ${formatPayback(APEX.paybackMonths)}.`}
            />
          </div>

          <p className="mt-8 text-[14px] leading-[1.6] text-ink-muted">
            Read the full cost-to-benefit math on{' '}
            <InlineLink href="/resources/automation-roi">Automation ROI</InlineLink>{' '}
            and the run-time math on{' '}
            <InlineLink href="/resources/automation-payback">Automation payback</InlineLink>.
            Apex is the Viableo golden case. Figures are estimates, not
            financial advice.
          </p>
        </Section>

        <DotRule className="bg-surface" />

        <SiblingLinks
          label="Keep reading"
          links={[
            { href: '/resources/automation-roi', label: 'Automation ROI — what the cost buys' },
            { href: '/resources/automation-payback', label: 'Automation payback — how fast it earns back' },
            { href: '/resources/automation-business-case', label: 'Automation business case — the document' },
            { href: '/methodology', label: 'Methodology — the full model' },
          ]}
        />

        <ClosingCTA
          headline="Count every dollar. Then decide."
          body="The four line items, on your project, in minutes."
        />
      </main>
    </MarketingShell>
  );
}
