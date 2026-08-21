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
  FigureBlock,
} from '@/components/marketing/marketing-primitives';
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
    'ROI tells you the return. Viableo tells you whether to build. The three inputs that drive automation ROI, a worked example, and why the number alone is not enough.',
  alternates: { canonical: '/resources/automation-roi' },
  openGraph: {
    type: 'article',
    title: 'What is automation ROI? | Viableo',
    description:
      'ROI tells you the return. Viableo tells you whether to build.',
    url: '/resources/automation-roi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What is automation ROI? | Viableo',
    description: 'ROI tells you the return. Viableo tells you whether to build.',
  },
};

const APEX_EXPECTED = calculateScenario(APEX_INPUTS, 'expected');
const APEX_ALL = calculateAllScenarios(APEX_INPUTS);

const INPUT_CARDS = [
  {
    n: '01',
    label: 'LABOR SAVINGS',
    what: 'The dollar value of hours the automation absorbs.',
    formula: 'employees × hours/week × hourly cost × 52 × automation %',
    why: 'Most automations start here. A process that handles enough hours at a high enough rate will justify the build on labor savings alone. The automation rate is the variable that matters most — and the one most teams overestimate.',
    apexValue: formatCurrency(APEX_EXPECTED.annualLaborSavings),
    apexCaption: `${APEX_INPUTS.employeesAffected} employees × ${APEX_INPUTS.hoursPerWeek} hrs × $${APEX_INPUTS.hourlyCost}/hr × 52 × ${formatPercent(APEX_EXPECTED.automationPct * 100)}`,
  },
  {
    n: '02',
    label: 'REVENUE OPPORTUNITY',
    what: 'The gross profit from extra customers the automation converts.',
    formula: 'leads/month × conversion lift × 12 × avg customer value × gross margin',
    why: 'Not every automation drives revenue. For the ones that do — lead routing, follow-up sequences, qualification bots — the conversion lift is often small in percentage points but large in dollars. The gross margin term turns a top-line number into a bottom-line one.',
    apexValue: formatCurrency(APEX_EXPECTED.additionalGrossProfit),
    apexCaption: `${APEX_INPUTS.leadsPerMonth} leads × ${(APEX_EXPECTED.conversionImprovementPct * 100).toFixed(1)}pp × 12 × $${APEX_INPUTS.averageCustomerValue} × ${formatPercent((APEX_INPUTS.grossMarginPct ?? 0) * 100)} margin`,
  },
  {
    n: '03',
    label: 'FIRST-YEAR COST',
    what: 'Everything it takes to build and run the automation for twelve months.',
    formula: 'implementation + (monthly AI/API × 12) + (monthly software × 12) + other annual',
    why: 'Most teams calculate the implementation fee. Fewer remember the API costs, the platform seat, and the ongoing maintenance hours. Cost inputs are held constant across all three scenarios — they are the one thing you can quote with the most confidence.',
    apexValue: formatCurrency(APEX_EXPECTED.totalFirstYearCost),
    apexCaption: `$${APEX_INPUTS.implementationFee} implementation + $${APEX_INPUTS.monthlyAiApiCost}/mo AI/API + $${APEX_INPUTS.monthlySoftwareCost}/mo software + $${APEX_INPUTS.otherAnnualCost} other`,
  },
] as const;

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
        <PageHero eyebrow="Resources" title="Automation ROI.">
          <p>
            Automation ROI is the annual return on an automation project,
            expressed as a percentage of what it cost to build. But ROI alone
            does not tell you whether to build. Viableo does.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        {/* ── Why ROI alone is not enough ──────────────────────── */}
        <Section>
          <SectionHeading
            eyebrow="The problem"
            title="Why ROI alone isn't enough"
          >
            <p>
              ROI tells you the return. Viableo tells you whether to build.
            </p>
          </SectionHeading>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className="bg-white border border-[#111]/[0.06] rounded-lg p-6 md:p-8">
              <h3 className="text-[17px] font-semibold text-[#111] leading-snug">
                A single ROI number has two problems.
              </h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#9B0A2E]" aria-hidden="true" />
                  <span className="text-[14px] leading-[1.6] text-[#111]/50">
                    <span className="font-medium text-[#111]">It does not test itself.</span> A 300% ROI built on optimistic assumptions is a different proposition than a 300% ROI that holds in the worst case.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#9B0A2E]" aria-hidden="true" />
                  <span className="text-[14px] leading-[1.6] text-[#111]/50">
                    <span className="font-medium text-[#111]">It does not say no.</span> An ROI calculator will happily give you a positive number on a case that should not be built. It has no decision framework.
                  </span>
                </li>
              </ul>
            </article>
            <article className="bg-white border border-[#111]/[0.06] rounded-lg p-6 md:p-8">
              <h3 className="text-[17px] font-semibold text-[#111] leading-snug">
                What Viableo adds.
              </h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#0D6B3F]" aria-hidden="true" />
                  <span className="text-[14px] leading-[1.6] text-[#111]/50">
                    <span className="font-medium text-[#111]">Three scenarios.</span> Conservative, expected, upside. The floor case is the one that matters.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#0D6B3F]" aria-hidden="true" />
                  <span className="text-[14px] leading-[1.6] text-[#111]/50">
                    <span className="font-medium text-[#111]">A verdict.</span> BUILD, CONSIDER, or DON&rsquo;T BUILD — with published rules for when each fires.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#0D6B3F]" aria-hidden="true" />
                  <span className="text-[14px] leading-[1.6] text-[#111]/50">
                    <span className="font-medium text-[#111]">A confidence score.</span> Based on how many inputs are measured versus assumed. Guess more, and the score falls.
                  </span>
                </li>
              </ul>
            </article>
          </div>
        </Section>

        {/* ── The three inputs ────────────────────────────────── */}
        <Section>
          <SectionHeading
            eyebrow="The inputs"
            title="The three inputs."
          >
            <p>
              Every automation ROI calculation needs three things: what the
              automation saves, what it earns, and what it costs. The formulas
              are fixed. The inputs come from you.
            </p>
          </SectionHeading>

          <div className="mt-10 space-y-6">
            {INPUT_CARDS.map((card) => (
              <article
                key={card.n}
                className="bg-white border border-[#111]/[0.06] rounded-lg p-6 md:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-semibold text-[#111]/30">
                    {card.n}
                  </span>
                  <h3 className="text-[15px] font-semibold uppercase tracking-[0.04em] text-[#111]">
                    {card.label}
                  </h3>
                </div>
                <p className="mt-2 text-[15px] font-medium text-[#111]">
                  {card.what}
                </p>
                <p className="mt-3 font-mono text-[14px] leading-[1.6] text-[#111]">
                  {card.formula}
                </p>
                <p className="mt-3 text-[14px] leading-[1.6] text-[#111]/50">
                  {card.why}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-10 text-[15px] leading-[1.6] text-[#111]/50 max-w-2xl">
            The formulas produce the number. The stress test tells you whether
            you should trust the case.
          </p>
        </Section>

        {/* ── Worked example ──────────────────────────────────── */}
        <Section>
          <SectionHeading
            eyebrow="Worked example"
            title="Apex Home Services."
          >
            <p>
              A 12-person operations team. The automation removes 20% of their
              manual work and lifts lead conversion by 1.5 percentage points.
              Here is what the math produces.
            </p>
          </SectionHeading>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="mt-10 bg-white border border-[#111]/[0.06] rounded-lg p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#111]/50">
              The verdict
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-[#111]/50">
              <span className="font-mono text-2xl font-semibold text-[#111] md:text-3xl">
                {formatRoi(APEX_EXPECTED.roiPct)}
              </span>{' '}
              ROI. Paid back in{' '}
              <span className="font-mono text-[#111]">
                {formatPayback(APEX_EXPECTED.paybackMonths)}
              </span>
              . Net annual benefit of{' '}
              <span className="font-mono text-[#111]">
                {formatCurrency(APEX_EXPECTED.netAnnualBenefit)}
              </span>
              .
            </p>
            <p className="mt-4 text-[13px] leading-[1.55] text-[#111]/30">
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

          <p className="mt-8 text-[13px] leading-[1.6] text-[#111]/30">
            Apex Home Services is the Viableo golden case — a fixed, reproducible
            worked example. Figures are estimates, not financial advice.
          </p>
        </Section>

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
