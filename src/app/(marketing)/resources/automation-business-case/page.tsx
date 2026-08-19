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
import {
  REPORT_NAME,
  DECISION_LABELS,
} from '@/lib/brand';

export const metadata: Metadata = {
  title: 'What is an automation business case?',
  description:
    'An automation business case is the document a client signs before you build. Viableo produces one with six sections: cover, executive summary, financial impact, scenario analysis, recommendation, assumptions.',
  alternates: { canonical: '/resources/automation-business-case' },
  openGraph: {
    type: 'article',
    title: 'Automation business case | Viableo Resources',
    description:
      'What an automation business case is, the six sections Viableo produces, and how each one reads.',
    url: '/resources/automation-business-case',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Automation business case | Viableo Resources',
    description:
      'What an automation business case is, the six sections Viableo produces, and how each one reads.',
  },
};

const APEX = calculateScenario(APEX_INPUTS, 'expected');

const SECTIONS = [
  {
    n: '1',
    label: 'Cover',
    body: 'Client name, project name, date, your logo. The page a client sees first. Nothing else. The agency tier puts your branding on every page of the document.',
  },
  {
    n: '2',
    label: 'Executive summary',
    body: 'One paragraph. The opportunity, the recommended decision, and the headline number. A reader who stops here still knows what to do.',
  },
  {
    n: '3',
    label: 'Financial impact',
    body: 'Labor savings, revenue opportunity, first-year cost, net annual benefit, ROI, payback. Tabular numerals. Every dollar traces to an input the client can see.',
  },
  {
    n: '4',
    label: 'Scenario analysis',
    body: 'Conservative, expected, upside. The floor, the claim, the ceiling. The reader sees the range, not just the middle.',
  },
  {
    n: '5',
    label: 'Recommendation',
    body: 'One of three words: BUILD, CONSIDER, DON\u2019T BUILD. The decision the numbers support. One paragraph of context underneath.',
  },
  {
    n: '6',
    label: 'Assumptions',
    body: 'Every input listed. Every estimate labeled. The reader can challenge any line and recompute. Nothing is hidden to make the story better.',
  },
] as const;

export default function ResourceAutomationBusinessCasePage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources/automation-roi' },
          { name: 'Automation business case', path: '/resources/automation-business-case' },
        ]}
      />
      <main id="main-content" className="w-full">
        <PageHero eyebrow="Resources · Concept" title="Automation business case.">
          <p>
            An automation business case is the document a client signs before you
            build. Viableo produces one with six sections — the same structure on
            every project, so a reader who has seen one can read them all.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        {/* ── What it is ────────────────────────────────────────── */}
        <Section className="bg-surface">
          <SectionHeading
            eyebrow="What it is"
            title="A document the client can sign."
          >
            <p>
              A business case is not a pitch deck. It is the financial case for
              spending money, written down. It says what the automation costs,
              what it returns, and what the recommendation is. It survives being
              read out of order.
            </p>
            <p className="mt-4">
              The Viableo output is called the{' '}
              <span className="font-medium text-ink">{REPORT_NAME}</span>. It is
              a PDF. Six sections. The same structure every time.
            </p>
          </SectionHeading>
        </Section>

        {/* ── The six sections ──────────────────────────────────── */}
        <Section className="bg-canvas">
          <SectionHeading
            eyebrow="The six sections"
            title="Cover. Summary. Math. Range. Verdict. Inputs."
          >
            <p>
              Each section answers one question. A reader who only reads the
              executive summary still knows the recommendation. A reader who
              reads the assumptions can recompute it themselves.
            </p>
          </SectionHeading>

          <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {SECTIONS.map((s) => (
              <li key={s.n}>
                <article className="flex h-full flex-col rounded-md border border-border bg-surface p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-ink">
                      {s.n}
                    </span>
                    <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                      {s.label}
                    </h3>
                  </div>
                  <p className="mt-3 text-[14px] leading-[1.6] text-ink-muted">
                    {s.body}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── What the recommendation looks like ───────────────── */}
        <Section className="bg-surface">
          <SectionHeading
            eyebrow="The recommendation"
            title="Four words. One verdict."
          >
            <p>
              The recommendation is the page the client actually reads. It is
              one of four words. The same four words on every business case.
            </p>
          </SectionHeading>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { label: DECISION_LABELS.build, when: 'The numbers hold up — even in the floor case.' },
              { label: DECISION_LABELS.consider, when: 'The math works. The timeline might not.' },
              { label: DECISION_LABELS.dont_build, when: 'The numbers do not support it. Better to know now.' },
            ].map((d) => (
              <li
                key={d.label}
                className="flex min-h-[44px] items-start gap-3 rounded-md border border-border bg-canvas p-4"
              >
                <Dot size="sm" className="mt-1.5" />
                <div>
                  <p className="text-[14px] font-semibold uppercase tracking-[0.04em] text-ink">
                    {d.label}
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.5] text-ink-muted">
                    {d.when}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-md border border-border bg-canvas p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
              Apex golden case · what the recommendation says
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-ink-muted">
              The Apex math returns{' '}
              <span className="font-mono tnum text-ink">
                {formatRoi(APEX.roiPct)}
              </span>{' '}
              ROI, paid back in{' '}
              <span className="font-mono tnum text-ink">
                {formatPayback(APEX.paybackMonths)}
              </span>
              , for a net annual benefit of{' '}
              <span className="font-mono tnum text-ink">
                {formatCurrency(APEX.netAnnualBenefit)}
              </span>
              . The recommendation page on that report reads{' '}
              <span className="font-semibold uppercase tracking-[0.04em] text-ink">
                {DECISION_LABELS.build}
              </span>
              .
            </p>
            <p className="mt-4 text-[13px] leading-[1.55] text-ink-faint">
              Figures are estimates, not financial advice. The full decision tree
              is on the <InlineLink href="/methodology">methodology page</InlineLink>.
            </p>
          </div>
        </Section>

        <DotRule className="bg-canvas" />

        <SiblingLinks
          label="Keep reading"
          links={[
            { href: '/resources/automation-roi', label: 'Automation ROI — the headline number' },
            { href: '/resources/automation-payback', label: 'Automation payback — how fast it earns back' },
            { href: '/resources/automation-cost', label: 'Automation cost — what to count in year one' },
            { href: '/solutions/automation-agencies', label: 'For automation agencies — put your logo on it' },
          ]}
        />

        <ClosingCTA
          headline="Generate the document. Then sign it."
          body="A six-section business case, on your project, in minutes."
        />
      </main>
    </MarketingShell>
  );
}
