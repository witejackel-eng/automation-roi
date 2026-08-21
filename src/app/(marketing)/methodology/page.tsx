import type { Metadata } from 'next';
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
import {
  METHODOLOGY_HEADLINE,
  METHODOLOGY_BODY,
  DECISION_LABELS,
  VERDICT_GATES,
  VERDICT_GATE_NOTE,
  VERDICT_CLOSING,
  VERDICT_BAND_LABELS,
} from '@/lib/brand';
import { APEX_INPUTS } from '@/lib/golden-case';
import { calculateScenario, calculateAllScenarios } from '@/lib/calculations/engine';
import { formatCurrency, formatPayback, formatRoi, formatPercent } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Methodology',
  description: 'No black box. Just the math. Every number in a Viableo report traces back to an input you can see.',
  alternates: { canonical: '/methodology' },
  openGraph: {
    type: 'website',
    title: 'Methodology | Viableo',
    description: 'No black box. Just the math. Every number traces back to an input you can see.',
    url: '/methodology',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Methodology | Viableo',
    description: 'No black box. Just the math. Every number traces back to an input you can see.',
  },
};

// ── Real Apex numbers, computed once at module load ──────────────────
const APEX_EXPECTED = calculateScenario(APEX_INPUTS, 'expected');
const APEX_ALL = calculateAllScenarios(APEX_INPUTS);

export default function MethodologyPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Methodology', path: '/methodology' },
        ]}
      />
      <main id="main-content" className="w-full">
        <PageHero eyebrow="Methodology" title={METHODOLOGY_HEADLINE}>
          <p>{METHODOLOGY_BODY}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        {/* ── The three formulas ────────────────────────────────── */}
        <Section>
          <SectionHeading
            eyebrow="The model"
            title="Three formulas. One bottom line."
          >
            <p>
              Every dollar in a Viableo report traces to one of the three
              formulas below. Estimates are labeled. Assumptions are labeled.
              Nothing is hidden to make the story better.
            </p>
          </SectionHeading>

          <div className="mt-10 space-y-6">
            <FormulaCard
              step="1"
              label="Labor savings"
              formula="employees × hours/week × hourly cost × 52 × automation %"
              result={formatCurrency(APEX_EXPECTED.annualLaborSavings)}
              tag="added"
              note="The work the automation now does. The people are still on payroll — they spend those hours on higher-leverage work instead."
              inputs={[
                { k: 'employees', v: String(APEX_INPUTS.employeesAffected) },
                { k: 'hours/week', v: String(APEX_INPUTS.hoursPerWeek) },
                { k: 'hourly cost', v: `$${APEX_INPUTS.hourlyCost}` },
                { k: 'automation %', v: formatPercent(APEX_EXPECTED.automationPct * 100) },
              ]}
            />
            <FormulaCard
              step="2"
              label="Revenue opportunity"
              formula="leads/month × conversion lift × 12 × avg customer value × gross margin"
              result={formatCurrency(APEX_EXPECTED.additionalGrossProfit)}
              tag="added"
              note="The gross profit from the extra customers the automation converts. Skip the margin term to label the line as a revenue opportunity instead."
              inputs={[
                { k: 'leads/month', v: String(APEX_INPUTS.leadsPerMonth) },
                { k: 'conversion lift', v: `${(APEX_EXPECTED.conversionImprovementPct * 100).toFixed(1)}pp` },
                { k: 'avg customer value', v: `$${APEX_INPUTS.averageCustomerValue}` },
                { k: 'gross margin', v: formatPercent((APEX_INPUTS.grossMarginPct ?? 0) * 100) },
              ]}
            />
            <FormulaCard
              step="3"
              label="First-year cost"
              formula="implementation + (monthly AI/API × 12) + (monthly software × 12) + other annual"
              result={formatCurrency(APEX_EXPECTED.totalFirstYearCost)}
              tag="subtracted"
              note="Every dollar it takes to build and run the automation in year one. Cost inputs are held constant across all three scenarios."
              inputs={[
                { k: 'implementation', v: formatCurrency(APEX_INPUTS.implementationFee) },
                { k: 'monthly AI/API', v: formatCurrency(APEX_INPUTS.monthlyAiApiCost) },
                { k: 'monthly software', v: formatCurrency(APEX_INPUTS.monthlySoftwareCost) },
                { k: 'other annual', v: formatCurrency(APEX_INPUTS.otherAnnualCost) },
              ]}
            />
          </div>

          <div className="mt-10 bg-white border border-[#111]/[0.06] rounded-lg p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#111]/50">
              Net annual benefit
            </p>
            <p className="mt-3 font-mono text-2xl font-semibold tracking-[-0.01em] text-[#111] md:text-3xl">
              labor savings + revenue opportunity − first-year cost
            </p>
            <p className="mt-4 text-[15px] leading-[1.6] text-[#111]/50">
              On the Apex golden case, that equals{' '}
              <span className="font-mono text-[#111]">
                {formatCurrency(APEX_EXPECTED.netAnnualBenefit)}
              </span>{' '}
              — a return of{' '}
              <span className="font-mono text-[#111]">
                {formatRoi(APEX_EXPECTED.roiPct)}
              </span>{' '}
              on a{' '}
              <span className="font-mono text-[#111]">
                {formatCurrency(APEX_EXPECTED.totalFirstYearCost)}
              </span>{' '}
              build, paid back in{' '}
              <span className="font-mono text-[#111]">
                {formatPayback(APEX_EXPECTED.paybackMonths)}
              </span>
              .
            </p>
          </div>
        </Section>

        {/* ── The three scenarios ───────────────────────────────── */}
        <Section>
          <SectionHeading
            eyebrow="Scenarios"
            title="Three cases. One recommendation."
          >
            <p>
              Viableo runs every project through three scenarios. Cost inputs stay
              constant — only the benefit assumptions move. The conservative case
              is the floor. The expected case is your claim. The upside case is the
              ceiling.
            </p>
          </SectionHeading>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ScenarioCard
              label="Conservative"
              tag="The floor"
              change="Automation rate × 0.65. Conversion lift credited at zero."
              roi={formatRoi(APEX_ALL.conservative.roiPct)}
              net={formatCurrency(APEX_ALL.conservative.netAnnualBenefit)}
              payback={formatPayback(APEX_ALL.conservative.paybackMonths)}
            />
            <ScenarioCard
              label="Expected"
              tag="Your claim"
              change="Your entered assumptions, used unchanged."
              roi={formatRoi(APEX_ALL.expected.roiPct)}
              net={formatCurrency(APEX_ALL.expected.netAnnualBenefit)}
              payback={formatPayback(APEX_ALL.expected.paybackMonths)}
              accent
            />
            <ScenarioCard
              label="Upside"
              tag="The ceiling"
              change="Automation × 1.25, conversion lift × 1.5. Automation capped at 95%."
              roi={formatRoi(APEX_ALL.upside.roiPct)}
              net={formatCurrency(APEX_ALL.upside.netAnnualBenefit)}
              payback={formatPayback(APEX_ALL.upside.paybackMonths)}
            />
          </div>

          <p className="mt-8 text-[13px] leading-[1.6] text-[#111]/30">
            Apex Home Services golden case. Figures are estimates, not financial
            advice.
          </p>
        </Section>

        {/* ── The recommendation ladder ─────────────────────────── */}
        <Section>
          <SectionHeading
            eyebrow="The recommendation"
            title="Three words. One verdict."
          >
            <p>
              Viableo collapses every analysis into one of three decisions. The
              ladder runs from strongest commitment to firmest rejection. The
              expected case drives it, the conservative case guards it, and the
              confidence score decides whether you commit or consider first.
            </p>
          </SectionHeading>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <DecisionCard
              label={DECISION_LABELS.build}
              tone="build"
              when="Expected ROI is strong, the conservative case still pays back inside 12 months, and confidence is at least 60."
              means="Commit to the build. The math holds up even in the floor case."
            />
            <DecisionCard
              label={DECISION_LABELS.consider}
              tone="consider"
              when="ROI is positive but the conservative case is weaker, confidence sits in the 40–59 band, or payback stretches past 12 months."
              means="Narrow the first phase. Validate assumptions. Renegotiate implementation cost."
            />
            <DecisionCard
              label={DECISION_LABELS.dont_build}
              tone="dont_build"
              when="Net annual benefit is zero or negative, or payback exceeds 24 months."
              means="Do not build as scoped. Better to know now than after the invoice."
            />
          </div>

          <div className="mt-10 bg-white border border-[#111]/[0.06] rounded-lg p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#111]/50">
              BUILD requires all three
            </p>
            <ul className="mt-4 space-y-3">
              {VERDICT_GATES.map((gate, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#0D6B3F]" />
                  <span className="text-[15px] leading-[1.6] text-[#111]/50">{gate}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[14px] leading-[1.6] text-[#111]/30">
              {VERDICT_GATE_NOTE}
            </p>
            <p className="mt-4 text-[14px] leading-[1.6] text-[#111]/50">
              {VERDICT_CLOSING}
            </p>
          </div>

          <div className="mt-6 bg-white border border-[#111]/[0.06] rounded-lg p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#111]/50">
              Confidence bands
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
              {VERDICT_BAND_LABELS.map((band) => (
                <div key={band.range}>
                  <dt className="text-[12px] text-[#111]/30">{band.range}</dt>
                  <dd className="mt-0.5 text-[15px] font-medium text-[#111]">{band.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <SiblingLinks
          label="Related"
          links={[
            { href: '/', label: 'Automation ROI — the number, before you build' },
            { href: '/resources/automation-roi', label: 'Resource: Automation ROI' },
            { href: '/resources/automation-payback', label: 'Resource: Automation payback' },
            { href: '/resources/automation-cost', label: 'Resource: Automation cost' },
          ]}
        />

        <ClosingCTA
          headline="Read the math. Then run it."
          body="The same formulas run on your project, with your inputs, in a few minutes."
        />
      </main>
    </MarketingShell>
  );
}

// ── Local presentational helpers ────────────────────────────────────

function FormulaCard({
  step,
  label,
  formula,
  result,
  note,
  inputs,
  tag,
}: {
  step: string;
  label: string;
  formula: string;
  result: string;
  note: string;
  inputs: { k: string; v: string }[];
  tag: string;
}) {
  return (
    <article className="bg-white border border-[#111]/[0.06] rounded-lg p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F4F0] text-[13px] font-semibold text-[#111]">
          {step}
        </span>
        <h3 className="text-[15px] font-semibold uppercase tracking-[0.04em] text-[#111]">
          {label}
        </h3>
      </div>
      <p className="mt-4 font-mono text-[14px] leading-[1.6] text-[#111] md:text-[15px]">
        {formula}
      </p>
      <p className="mt-3 text-[14px] leading-[1.6] text-[#111]/50">{note}</p>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#111]/[0.06] pt-4 sm:grid-cols-4">
        {inputs.map((i) => (
          <div key={i.k}>
            <dt className="text-[11px] uppercase tracking-[0.06em] text-[#111]/30">
              {i.k}
            </dt>
            <dd className="mt-1 font-mono text-[14px] text-[#111]">{i.v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex items-baseline gap-3">
        <span className="font-mono text-2xl font-semibold tracking-[-0.01em] text-[#111] md:text-3xl">
          {result}
        </span>
        <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#111]/30">
          <span
            className={
              tag === 'subtracted'
                ? 'inline-block h-2 w-2 rounded-full bg-[#9B0A2E] mr-1.5 align-middle'
                : 'inline-block h-2 w-2 rounded-full bg-[#0D6B3F] mr-1.5 align-middle'
            }
            aria-hidden="true"
          />
          {tag}
        </span>
      </div>
    </article>
  );
}

function ScenarioCard({
  label,
  tag,
  change,
  roi,
  net,
  payback,
  accent = false,
}: {
  label: string;
  tag: string;
  change: string;
  roi: string;
  net: string;
  payback: string;
  accent?: boolean;
}) {
  return (
    <article
      className={
        accent
          ? 'bg-white border border-[#111]/[0.12] rounded-lg p-6'
          : 'bg-white border border-[#111]/[0.06] rounded-lg p-6'
      }
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold uppercase tracking-[0.04em] text-[#111]">
          {label}
        </h3>
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#111]/30">
          {tag}
        </span>
      </div>
      <p className="mt-3 text-[14px] leading-[1.55] text-[#111]/50">{change}</p>
      <dl className="mt-5 space-y-2 border-t border-[#111]/[0.06] pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[12px] uppercase tracking-[0.06em] text-[#111]/30">
            ROI
          </dt>
          <dd className="font-mono text-[18px] font-semibold text-[#111]">
            {roi}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[12px] uppercase tracking-[0.06em] text-[#111]/30">
            Net / year
          </dt>
          <dd className="font-mono text-[15px] text-[#111]">{net}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[12px] uppercase tracking-[0.06em] text-[#111]/30">
            Payback
          </dt>
          <dd className="font-mono text-[15px] text-[#111]">{payback}</dd>
        </div>
      </dl>
    </article>
  );
}

function DecisionCard({
  label,
  tone,
  when,
  means,
}: {
  label: string;
  tone: 'build' | 'consider' | 'dont_build';
  when: string;
  means: string;
}) {
  const dotColor =
    tone === 'build'
      ? 'bg-[#0D6B3F]'
      : tone === 'consider'
        ? 'bg-[#8B5E0A]'
        : 'bg-[#9B0A2E]';
  return (
    <article className="bg-white border border-[#111]/[0.06] rounded-lg p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`inline-block h-2.5 w-2.5 rounded-full ${dotColor}`}
        />
        <h3 className="text-[17px] font-semibold uppercase tracking-[0.02em] text-[#111]">
          {label}
        </h3>
      </div>
      <p className="mt-4 text-[14px] leading-[1.6] text-[#111]/50">
        <span className="font-medium text-[#111]">When it fires. </span>
        {when}
      </p>
      <p className="mt-3 text-[14px] leading-[1.6] text-[#111]/50">
        <span className="font-medium text-[#111]">What it means. </span>
        {means}
      </p>
    </article>
  );
}
