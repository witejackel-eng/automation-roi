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
  title: 'For automation agencies',
  description:
    'For automation agencies. Viableo proves the value before you build — model the economics, stress-test the assumptions, walk in with a signed report.',
  alternates: { canonical: '/solutions/automation-agencies' },
  openGraph: {
    type: 'website',
    title: 'For automation agencies | Viableo',
    description:
      'Agencies sell automation. Viableo proves the value before they build. See the return, break the case, walk in with a signed report.',
    url: '/solutions/automation-agencies',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For automation agencies | Viableo',
    description:
      'Agencies sell automation. Viableo proves the value before they build.',
  },
};

// Apex golden case — real numbers, computed once.
const APEX = calculateScenario(APEX_INPUTS, 'expected');

const REASONS = [
  {
    n: '1',
    title: 'See the return before the build.',
    body: 'Run the economics before you commit engineering time. Labor savings plus revenue opportunity minus first-year cost. One number the client can sign.',
    stat: `${formatRoi(APEX.roiPct)} ROI`,
    caption: `Apex golden case · paid back in ${formatPayback(APEX.paybackMonths)}.`,
  },
  {
    n: '2',
    title: 'Break the case before the client does.',
    body: 'Three scenarios run automatically — conservative, expected, upside. Move the assumptions. Watch the recommendation change. The floor case is the one that matters.',
    stat: '3 scenarios',
    caption: 'Conservative · Expected · Upside, on every analysis.',
  },
  {
    n: '3',
    title: 'Walk in with a signed report.',
    body: 'A client-ready business case in PDF. Cover, executive summary, financial impact, scenario analysis, recommendation, assumptions. Your logo on the cover.',
    stat: '1 PDF',
    caption: 'Agency-tier branding on every page.',
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
        <PageHero eyebrow="Solutions · Automation agencies" title="For automation agencies.">
          <p>
            Agencies sell automation. Viableo proves the value before they build.
            Model the economics in minutes. Stress-test every assumption. Walk in
            with a report the client can sign.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCTA />
            <SecondaryCTA />
          </div>
        </PageHero>

        {/* ── Three reasons ─────────────────────────────────────── */}
        <Section className="bg-surface">
          <SectionHeading
            eyebrow="Three reasons"
            title="See it. Break it. Sign it."
          >
            <p>
              The same three beats run on every client opportunity. The work is
              the same. The numbers are different.
            </p>
          </SectionHeading>

          <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {REASONS.map((r) => (
              <li key={r.n}>
                <article className="flex h-full flex-col rounded-md border border-border bg-canvas p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-[13px] font-semibold text-ink">
                      {r.n}
                    </span>
                    <span className="font-mono tnum text-[13px] font-semibold uppercase tracking-[0.06em] text-brand">
                      {r.stat}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
                    {r.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.6] text-ink-muted">
                    {r.body}
                  </p>
                  <p className="mt-auto pt-5 text-[12px] leading-[1.5] text-ink-faint">
                    <Dot size="sm" className="mr-1.5 align-middle" />
                    {r.caption}
                  </p>
                </article>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-[14px] leading-[1.6] text-ink-muted">
            The full method is on the{' '}
            <InlineLink href="/methodology">methodology page</InlineLink>. The
            worked example uses the Apex Home Services golden case —{' '}
            <span className="font-mono tnum">
              {formatCurrency(APEX.netAnnualBenefit)}
            </span>{' '}
            net annual benefit at a{' '}
            <span className="font-mono tnum">{formatRoi(APEX.roiPct)}</span>{' '}
            return. Figures are estimates, not financial advice.
          </p>
        </Section>

        {/* ── Who else uses Viableo ─────────────────────────────── */}
        <Section className="bg-canvas">
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
                <a
                  href={s.href}
                  className="link-underline flex min-h-[44px] items-center justify-between rounded-md border border-border bg-surface px-4 py-3 text-[15px] font-medium text-ink hover:border-border-strong"
                >
                  {s.label}
                  <Dot size="sm" />
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <DotRule className="bg-surface" />

        <SiblingLinks
          label="Related"
          links={[
            { href: '/automation-roi', label: 'Automation ROI — the number, before you build' },
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
