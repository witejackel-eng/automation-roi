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
import {
  formatCurrency,
  formatPayback,
  formatRoi,
} from '@/lib/format';

export const metadata: Metadata = {
  title: 'What is automation payback?',
  description:
    'Automation payback is how long it takes an automation to earn back its implementation cost. The formula is implementation cost ÷ net monthly benefit. A worked example with real numbers.',
  alternates: { canonical: '/resources/automation-payback' },
  openGraph: {
    type: 'article',
    title: 'Automation payback | Viableo Resources',
    description:
      'What automation payback is, how to calculate it, and a worked example using real numbers.',
    url: '/resources/automation-payback',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Automation payback | Viableo Resources',
    description:
      'What automation payback is, how to calculate it, and a worked example using real numbers.',
  },
};

const APEX = calculateScenario(APEX_INPUTS, 'expected');

export default function ResourceAutomationPaybackPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources/automation-roi' },
          { name: 'Automation payback', path: '/resources/automation-payback' },
        ]}
      />
      <main className="w-full">
        <PageHero eyebrow="Resources · Concept" title="Automation payback.">
          <p>
            Automation payback is how long it takes an automation to earn back
            its implementation cost. It answers a different question than ROI:
            not <em>how much</em>, but <em>how fast</em>.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        {/* ── What it is ────────────────────────────────────────── */}
        <Section className="bg-surface">
          <SectionHeading eyebrow="What it is" title="The clock, not the score.">
            <p>
              Payback measures time. ROI measures return. A 500% ROI on a build
              that pays back in two months is a different decision from a 500%
              ROI on one that pays back in twenty.
            </p>
            <p className="mt-4">
              Payback matters most when the future is uncertain. The shorter the
              payback, the less time anything has to go wrong. A 6-month payback
              survives a lot. A 24-month payback survives less.
            </p>
          </SectionHeading>
        </Section>

        {/* ── The formula ───────────────────────────────────────── */}
        <Section className="bg-canvas">
          <SectionHeading eyebrow="The formula" title="Implementation cost ÷ net monthly benefit.">
            <p>
              Take the implementation fee. Divide it by the net monthly benefit —
              the annual benefit minus the first-year cost, divided by twelve.
              The result is the number of months until the implementation fee is
              paid back.
            </p>
          </SectionHeading>

          <div className="mt-8 rounded-md border-2 border-ink/10 bg-surface p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand">
              The formula
            </p>
            <p className="mt-3 font-mono tnum text-2xl font-semibold tracking-[-0.01em] text-ink md:text-3xl">
              payback (months) = implementation fee ÷ monthly net benefit
            </p>
            <p className="mt-4 font-mono tnum text-[15px] leading-[1.6] text-ink-muted">
              where monthly net benefit = (annual savings + annual revenue − first-year cost) ÷ 12
            </p>
            <p className="mt-4 text-[15px] leading-[1.6] text-ink-muted">
              When monthly net benefit is zero or negative, payback never comes.
              Viableo reports <span className="font-mono tnum text-ink">Never</span>{' '}
              in that case rather than printing a meaningless number.
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
              Apex pays an{' '}
              <span className="font-mono tnum text-ink">
                {formatCurrency(APEX_INPUTS.implementationFee)}
              </span>{' '}
              implementation fee. The annual math returns a net annual benefit
              of{' '}
              <span className="font-mono tnum text-ink">
                {formatCurrency(APEX.netAnnualBenefit)}
              </span>
              .
            </p>
          </SectionHeading>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FigureBlock
              label="Implementation fee"
              value={formatCurrency(APEX_INPUTS.implementationFee)}
              caption="One-time build cost."
            />
            <FigureBlock
              label="Net monthly benefit"
              value={formatCurrency(APEX.monthlyNetBenefit)}
              caption="Net annual benefit ÷ 12."
            />
            <FigureBlock
              label="Payback"
              value={formatPayback(APEX.paybackMonths)}
              caption="Implementation fee ÷ net monthly benefit."
              accent
            />
          </div>

          <div className="mt-8 rounded-md border border-border bg-canvas p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
              The number
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-ink-muted">
              <span className="font-mono tnum text-2xl font-semibold text-ink md:text-3xl">
                {formatCurrency(APEX_INPUTS.implementationFee)}
              </span>{' '}
              ÷{' '}
              <span className="font-mono tnum text-2xl font-semibold text-ink md:text-3xl">
                {formatCurrency(APEX.monthlyNetBenefit)}
              </span>{' '}
              per month ={' '}
              <span className="font-mono tnum text-2xl font-semibold text-brand md:text-3xl">
                {formatPayback(APEX.paybackMonths)}
              </span>
              .
            </p>
            <p className="mt-4 text-[15px] leading-[1.6] text-ink-muted">
              That same automation returns{' '}
              <span className="font-mono tnum text-ink">
                {formatRoi(APEX.roiPct)}
              </span>{' '}
              on the year — but payback is the number that tells you whether the
              bet is short enough to take.
            </p>
            <p className="mt-4 text-[13px] leading-[1.55] text-ink-faint">
              Apex is the Viableo golden case. Figures are estimates, not
              financial advice. Read more on{' '}
              <InlineLink href="/resources/automation-roi">Automation ROI</InlineLink>{' '}
              and{' '}
              <InlineLink href="/resources/automation-cost">Automation cost</InlineLink>.
            </p>
          </div>
        </Section>

        <DotRule className="bg-canvas" />

        <SiblingLinks
          label="Keep reading"
          links={[
            { href: '/resources/automation-roi', label: 'Automation ROI — the return side of the same coin' },
            { href: '/resources/automation-cost', label: 'Automation cost — what counts in year one' },
            { href: '/resources/automation-business-case', label: 'Automation business case — the document' },
            { href: '/methodology', label: 'Methodology — the full model' },
          ]}
        />

        <ClosingCTA
          headline="See the payback on your project."
          body="Implementation cost ÷ net monthly benefit, on your numbers."
        />
      </main>
    </MarketingShell>
  );
}
