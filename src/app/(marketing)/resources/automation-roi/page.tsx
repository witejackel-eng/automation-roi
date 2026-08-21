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
import { calculateScenario, calculateAllScenarios } from '@/lib/calculations/engine';
import {
  formatCurrency,
  formatPayback,
  formatRoi,
  formatPercent,
} from '@/lib/format';

export const metadata: Metadata = {
  title: 'What is automation ROI?',
  description:
    'Automation ROI is the annual return on an automation project, as a percentage of what it cost to build. The formula, a worked example, and how Viableo computes it across three scenarios.',
  alternates: { canonical: '/resources/automation-roi' },
  openGraph: {
    type: 'article',
    title: 'Automation ROI | Viableo Resources',
    description:
      'What automation ROI is, how to calculate it, and a worked example using real numbers.',
    url: '/resources/automation-roi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Automation ROI | Viableo Resources',
    description:
      'What automation ROI is, how to calculate it, and a worked example using real numbers.',
  },
};

const APEX_EXPECTED = calculateScenario(APEX_INPUTS, 'expected');
const APEX_ALL = calculateAllScenarios(APEX_INPUTS);

export default function ResourceAutomationRoiPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources/automation-roi' },
          { name: 'Automation ROI', path: '/resources/automation-roi' },
        ]}
      />
      <main id="main-content" className="w-full">
        <PageHero eyebrow="Resources · Concept" title="Automation ROI.">
          <p>
            Automation ROI is the annual return on an automation project,
            expressed as a percentage of what it cost to build. A 100% ROI means
            the project paid for itself in a year and returned its cost again on
            top. A 500% ROI means it returned six times its cost.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        {/* ── What it is ────────────────────────────────────────── */}
        <Section className="bg-surface">
          <SectionHeading eyebrow="What it is" title="The number that tells you whether to build.">
            <p>
              ROI stands for return on investment. In automation, it is the
              annual financial return on a build, measured against the cost of
              building and running it for one year.
            </p>
            <p className="mt-4">
              The number does two things. It tells you whether the project pays
              back. And it tells you how fast. A 500% ROI that pays back in two
              months is a different decision from a 500% ROI that pays back in
              twenty.
            </p>
          </SectionHeading>
        </Section>

        {/* ── The formula ───────────────────────────────────────── */}
        <Section className="bg-canvas">
          <SectionHeading eyebrow="The formula" title="Three lines. One ratio.">
            <p>
              ROI is the net annual benefit divided by the first-year cost. The
              net annual benefit is what the automation saves plus what it earns,
              minus what it costs to run.
            </p>
          </SectionHeading>

          <div className="mt-8 space-y-4">
            <div className="rounded-md border border-border bg-surface p-6 md:p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                Step 1 — Labor savings
              </p>
              <p className="mt-3 font-mono tnum text-[15px] leading-[1.6] text-ink">
                employees × hours/week × hourly cost × 52 × automation %
              </p>
            </div>
            <div className="rounded-md border border-border bg-surface p-6 md:p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                Step 2 — Revenue opportunity
              </p>
              <p className="mt-3 font-mono tnum text-[15px] leading-[1.6] text-ink">
                leads/month × conversion lift × 12 × average customer value × gross margin
              </p>
            </div>
            <div className="rounded-md border border-border bg-surface p-6 md:p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                Step 3 — First-year cost
              </p>
              <p className="mt-3 font-mono tnum text-[15px] leading-[1.6] text-ink">
                implementation + (monthly AI/API × 12) + (monthly software × 12) + other annual
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-md border-2 border-ink/10 bg-surface p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand">
              The ratio
            </p>
            <p className="mt-3 font-mono tnum text-2xl font-semibold tracking-[-0.01em] text-ink md:text-3xl">
              ROI = (savings + revenue − cost) ÷ cost
            </p>
            <p className="mt-4 text-[15px] leading-[1.6] text-ink-muted">
              The full method is documented on the{' '}
              <InlineLink href="/methodology">methodology page</InlineLink>.
            </p>
          </div>
        </Section>

        {/* ── Worked example ───────────────────────────────────── */}
        <Section className="bg-surface">
          <SectionHeading
            eyebrow="Worked example"
            title="Apex Home Services."
          >
            <p>
              A worked example with real numbers. Apex runs a 12-person operations
              team. The automation removes 20% of their manual work and lifts lead
              conversion by 1.5 percentage points.
            </p>
          </SectionHeading>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FigureBlock
              label="Labor savings"
              value={formatCurrency(APEX_EXPECTED.annualLaborSavings)}
              caption={`${APEX_INPUTS.employeesAffected} employees × ${APEX_INPUTS.hoursPerWeek} hrs × $${APEX_INPUTS.hourlyCost}/hr × 52 × ${formatPercent(APEX_EXPECTED.automationPct * 100)}`}
            />
            <FigureBlock
              label="Revenue opportunity"
              value={formatCurrency(APEX_EXPECTED.additionalGrossProfit)}
              caption={`${APEX_INPUTS.leadsPerMonth} leads × ${(APEX_EXPECTED.conversionImprovementPct * 100).toFixed(1)}pp × 12 × $${APEX_INPUTS.averageCustomerValue} × ${formatPercent((APEX_INPUTS.grossMarginPct ?? 0) * 100)} margin`}
            />
            <FigureBlock
              label="First-year cost"
              value={formatCurrency(APEX_EXPECTED.totalFirstYearCost)}
              caption={`$${APEX_INPUTS.implementationFee} implementation + recurring AI/API + software`}
              accent
            />
            <FigureBlock
              label="Net annual benefit"
              value={formatCurrency(APEX_EXPECTED.netAnnualBenefit)}
              caption="Savings + revenue − first-year cost."
            />
          </div>

          <div className="mt-8 rounded-md border border-border bg-canvas p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
              The verdict
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-ink-muted">
              <span className="font-mono tnum text-2xl font-semibold text-ink md:text-3xl">
                {formatRoi(APEX_EXPECTED.roiPct)}
              </span>{' '}
              ROI. Paid back in{' '}
              <span className="font-mono tnum text-ink">
                {formatPayback(APEX_EXPECTED.paybackMonths)}
              </span>
              . Net annual benefit of{' '}
              <span className="font-mono tnum text-ink">
                {formatCurrency(APEX_EXPECTED.netAnnualBenefit)}
              </span>
              .
            </p>
            <p className="mt-4 text-[13px] leading-[1.55] text-ink-faint">
              The same math runs across three scenarios — conservative, expected,
              upside — so you can see the floor and the ceiling, not just the
              middle.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FigureBlock
              label="Conservative"
              value={formatRoi(APEX_ALL.conservative.roiPct)}
              caption={`Net ${formatCurrency(APEX_ALL.conservative.netAnnualBenefit)} · ${formatPayback(APEX_ALL.conservative.paybackMonths)} payback.`}
            />
            <FigureBlock
              label="Expected"
              value={formatRoi(APEX_ALL.expected.roiPct)}
              caption={`Net ${formatCurrency(APEX_ALL.expected.netAnnualBenefit)} · ${formatPayback(APEX_ALL.expected.paybackMonths)} payback.`}
              accent
            />
            <FigureBlock
              label="Upside"
              value={formatRoi(APEX_ALL.upside.roiPct)}
              caption={`Net ${formatCurrency(APEX_ALL.upside.netAnnualBenefit)} · ${formatPayback(APEX_ALL.upside.paybackMonths)} payback.`}
            />
          </div>

          <p className="mt-8 text-[13px] leading-[1.6] text-ink-faint">
            Apex Home Services is the Viableo golden case — a fixed, reproducible
            worked example. Figures are estimates, not financial advice. Read
            more on the <InlineLink href="/automation-roi">Automation ROI</InlineLink>{' '}
            product page.
          </p>
        </Section>

        <DotRule className="bg-canvas" />

        <SiblingLinks
          label="Keep reading"
          links={[
            { href: '/resources/automation-payback', label: 'Automation payback — how fast the money comes back' },
            { href: '/resources/automation-cost', label: 'Automation cost — what to count in year one' },
            { href: '/resources/automation-business-case', label: 'Automation business case — the document' },
            { href: '/methodology', label: 'Methodology — the full model' },
          ]}
        />

        <ClosingCTA
          headline="Run the same math on your project."
          body="Three scenarios, one recommendation, a report you can sign."
        />
      </main>
    </MarketingShell>
  );
}
