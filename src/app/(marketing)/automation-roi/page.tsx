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
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Automation ROI',
  description:
    'Automation ROI is the number that tells you whether to build. Viableo calculates it before you commit: labor savings + revenue opportunity, minus first-year cost.',
  alternates: { canonical: '/automation-roi' },
  openGraph: {
    type: 'website',
    title: 'Automation ROI | Viableo',
    description:
      'Automation ROI, before you build. See the return, break it on purpose, walk in with the answer.',
    url: '/automation-roi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Automation ROI | Viableo',
    description:
      'Automation ROI, before you build. See the return, break it on purpose, walk in with the answer.',
  },
};

// ── Real Apex golden-case numbers (pure function, module scope) ──────
const APEX_EXPECTED = calculateScenario(APEX_INPUTS, 'expected');
const APEX_ALL = calculateAllScenarios(APEX_INPUTS);

function roiAsMultiplier(roiPct: number | null | undefined): string {
  if (roiPct == null || !Number.isFinite(roiPct)) return 'N/A';
  return `${(roiPct / 100).toFixed(1)}×`;
}

export default function AutomationRoiPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Automation ROI', path: '/automation-roi' },
        ]}
      />
      <main className="w-full">
        <PageHero
          eyebrow="Automation ROI"
          title="Automation ROI, before you build."
        >
          <p>
            Automation ROI is the number that tells you whether to build. Viableo
            turns the idea into that number before you commit a single hour of
            engineering time.
          </p>
          <p className="mt-4">
            See the return. Break it on purpose. Walk in with the answer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        {/* ── What it is ─────────────────────────────────────────── */}
        <Section className="bg-surface">
          <SectionHeading eyebrow="What it is" title="One number. The whole decision.">
            <p>
              Automation ROI is the annual return on an automation project,
              expressed as a percentage of what it cost to build. A 100% ROI means
              you double your money in a year. A 500% ROI means you multiply it
              six-fold.
            </p>
            <p className="mt-4">
              The number does two things at once. It tells you whether the project
              pays back. And it tells you how fast. That is the whole decision in a
              single figure.
            </p>
          </SectionHeading>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FigureBlock
              label="What you save"
              value={formatCurrency(APEX_EXPECTED.annualLaborSavings)}
              caption="Labor hours Viableo credits back, per year, on the Apex golden case."
            />
            <FigureBlock
              label="What you earn"
              value={formatCurrency(APEX_EXPECTED.additionalGrossProfit)}
              caption="Gross profit from the conversion lift the automation produces."
            />
            <FigureBlock
              label="What it costs"
              value={formatCurrency(APEX_EXPECTED.totalFirstYearCost)}
              caption="Implementation + recurring AI/API + software + other annual."
              accent
            />
          </div>
        </Section>

        {/* ── How it's calculated ───────────────────────────────── */}
        <Section className="bg-canvas">
          <SectionHeading
            eyebrow="How it's calculated"
            title="Three lines of math. No black box."
          >
            <p>
              The model adds up what the automation saves and what it earns, then
              subtracts what it costs. The full method lives on the{' '}
              <InlineLink href="/methodology">methodology page</InlineLink>.
            </p>
          </SectionHeading>

          <div className="mt-10 space-y-6">
            <FormulaCard
              step="1"
              label="Labor savings"
              formula="employees × hours/week × hourly cost × 52 × automation %"
              result={formatCurrency(APEX_EXPECTED.annualLaborSavings)}
              note="The hours a person still gets paid for, but no longer spends on the work the automation now does."
            />
            <FormulaCard
              step="2"
              label="Revenue opportunity"
              formula="leads/month × conversion lift × 12 × average customer value × gross margin"
              result={formatCurrency(APEX_EXPECTED.additionalGrossProfit)}
              note="The gross profit from the extra customers the automation converts. Skip the margin term to label it as a revenue opportunity instead."
            />
            <FormulaCard
              step="3"
              label="First-year cost"
              formula="implementation fee + (monthly AI/API × 12) + (monthly software × 12) + other annual"
              result={formatCurrency(APEX_EXPECTED.totalFirstYearCost)}
              note="Every dollar it takes to build and run the automation in year one."
              accent
            />
          </div>

          <div className="mt-10 rounded-md border border-border bg-surface p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
              The bottom line
            </p>
            <p className="mt-3 font-mono tnum text-2xl font-semibold tracking-[-0.01em] text-ink md:text-3xl">
              ROI = (annual benefit − first-year cost) ÷ first-year cost
            </p>
            <p className="mt-4 text-[15px] leading-[1.6] text-ink-muted">
              On the Apex golden case, that math returns{' '}
              <span className="font-mono tnum text-ink">
                {formatRoi(APEX_EXPECTED.roiPct)}
              </span>{' '}
              — a{' '}
              <span className="font-mono tnum text-ink">
                {roiAsMultiplier(APEX_EXPECTED.roiPct)}
              </span>{' '}
              return on the build, paid back in{' '}
              <span className="font-mono tnum text-ink">
                {formatPayback(APEX_EXPECTED.paybackMonths)}
              </span>
              .
            </p>
          </div>
        </Section>

        {/* ── See it on your project ────────────────────────────── */}
        <Section className="bg-surface">
          <SectionHeading
            eyebrow="See it on your project"
            title="The same math, on your numbers."
          >
            <p>
              The Apex case above is a worked example. Run the same model on a real
              client opportunity and the numbers become yours. Three scenarios.
              One recommendation. A report you can sign.
            </p>
          </SectionHeading>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FigureBlock
              label="Conservative"
              value={formatRoi(APEX_ALL.conservative.roiPct)}
              caption={`Net ${formatCurrency(APEX_ALL.conservative.netAnnualBenefit)} · payback ${formatPayback(APEX_ALL.conservative.paybackMonths)}.`}
            />
            <FigureBlock
              label="Expected"
              value={formatRoi(APEX_ALL.expected.roiPct)}
              caption={`Net ${formatCurrency(APEX_ALL.expected.netAnnualBenefit)} · payback ${formatPayback(APEX_ALL.expected.paybackMonths)}.`}
              accent
            />
            <FigureBlock
              label="Upside"
              value={formatRoi(APEX_ALL.upside.roiPct)}
              caption={`Net ${formatCurrency(APEX_ALL.upside.netAnnualBenefit)} · payback ${formatPayback(APEX_ALL.upside.paybackMonths)}.`}
            />
          </div>

          <p className="mt-8 text-[13px] leading-[1.6] text-ink-faint">
            Apex Home Services golden case. Automation{' '}
            <span className="font-mono tnum">
              {formatPercent(APEX_EXPECTED.automationPct * 100)}
            </span>{' '}
            of{' '}
            <span className="font-mono tnum">
              {formatCurrency(APEX_EXPECTED.annualLaborCost)}
            </span>{' '}
            annual labor cost. Figures are estimates, not financial advice.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </Section>

        <DotRule className="bg-canvas" />

        <SiblingLinks
          label="Related"
          links={[
            { href: '/methodology', label: 'Methodology — how every number is computed' },
            { href: '/resources/automation-roi', label: 'Resource: Automation ROI' },
            { href: '/resources/automation-payback', label: 'Resource: Automation payback' },
            { href: '/solutions/automation-agencies', label: 'For automation agencies' },
          ]}
        />

        <ClosingCTA />
      </main>
    </MarketingShell>
  );
}

// ── Local presentational helper ─────────────────────────────────────

function FormulaCard({
  step,
  label,
  formula,
  result,
  note,
  accent = false,
}: {
  step: string;
  label: string;
  formula: string;
  result: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <article className="rounded-md border border-border bg-surface p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-ink">
          {step}
        </span>
        <h3 className="text-[15px] font-semibold uppercase tracking-[0.04em] text-ink">
          {label}
        </h3>
      </div>
      <p className="mt-4 font-mono tnum text-[14px] leading-[1.6] text-ink md:text-[15px]">
        {formula}
      </p>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-mono tnum text-2xl font-semibold tracking-[-0.01em] text-ink md:text-3xl">
          {result}
        </span>
        <span
          className={cn(
            'inline-flex items-center text-[12px] font-medium uppercase tracking-[0.08em]',
            accent ? 'text-brand' : 'text-ink-muted'
          )}
        >
          <Dot size="sm" className="mr-1.5 align-middle" />
          {accent ? 'subtracted' : 'added'}
        </span>
      </div>
      <p className="mt-3 text-[14px] leading-[1.6] text-ink-muted">{note}</p>
    </article>
  );
}
