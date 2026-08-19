import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import {
  PageHero,
  Section,
  SectionHeading,
  ClosingCTA,
  BreadcrumbJsonLd,
  InlineLink,
} from '@/components/marketing/marketing-primitives';

export const metadata: Metadata = {
  title: 'Terms — Viableo',
  description: 'The terms under which Viableo is licensed.',
  alternates: { canonical: '/terms' },
  openGraph: {
    type: 'website',
    title: 'Terms | Viableo',
    description: 'The terms under which Viableo is licensed.',
    url: '/terms',
  },
  robots: { index: true, follow: true },
};

// TODO_HUMAN_TERMS_EMAIL: replace with a monitored address before production launch.
const TERMS_EMAIL = 'terms@TODO_HUMAN_DOMAIN';

export default function TermsPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Terms', path: '/terms' },
        ]}
      />
      <main className="w-full">
        <PageHero eyebrow="Terms" title="The terms under which Viableo is licensed.">
          <p>
            Viableo is a decision instrument for automation agencies — it
            converts operational inputs into a BUILD, CONSIDER, or
            DON&apos;T BUILD verdict and a client-ready business case. This
            page sets out the terms on which you may use it. By using Viableo
            you agree to them.
          </p>
        </PageHero>

        <Section className="bg-canvas">
          <div className="space-y-16 md:space-y-24">
            <div>
              <SectionHeading eyebrow="The service" title="What Viableo is.">
                <p>
                  Viableo is software-as-a-service for automation agencies.
                  You enter the operational inputs for a prospective
                  automation project — hours saved, hourly cost, lead volume,
                  conversion lift, average customer value, gross margin,
                  implementation fee, monthly AI/API cost, monthly software
                  cost, and other annual cost. Viableo runs the math against
                  three scenarios, scores the confidence of your inputs,
                  stress-tests the breaking point, and returns a verdict with
                  a client-ready report.
                </p>
                <p>
                  Viableo is a decision instrument. Its outputs are estimates
                  produced from the inputs you supplied. They are not
                  financial advice, and they are not guarantees of future
                  performance.
                </p>
              </SectionHeading>
            </div>

            <div>
              <SectionHeading
                eyebrow="Licenses"
                title="Monthly and annual subscriptions."
              >
                <p>
                  Viableo is licensed as a subscription. There are four tiers.
                  The value metric is a case — one full idea to decision to
                  business-case run.
                </p>
                <div className="mt-8 overflow-hidden rounded-md border border-border">
                  <table className="w-full text-left text-[14px]">
                    <thead className="bg-surface text-[12px] uppercase tracking-[0.06em] text-ink-muted">
                      <tr>
                        <th className="px-4 py-3 font-medium">Tier</th>
                        <th className="px-4 py-3 font-medium">Price</th>
                        <th className="px-4 py-3 font-medium">Scope</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono tnum text-ink">
                      <tr className="border-t border-border">
                        <td className="px-4 py-3 font-sans text-ink">Free</td>
                        <td className="px-4 py-3">$0 / forever</td>
                        <td className="px-4 py-3 font-sans text-ink-muted">
                          One case per month. Full analytical rigor. Watermarked
                          report.
                        </td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-4 py-3 font-sans text-ink">
                          Pro
                        </td>
                        <td className="px-4 py-3">$29 per month</td>
                        <td className="px-4 py-3 font-sans text-ink-muted">
                          Five cases per month. Unwatermarked PDFs, share links.
                        </td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-4 py-3 font-sans text-ink">Agency</td>
                        <td className="px-4 py-3">$79 per month</td>
                        <td className="px-4 py-3 font-sans text-ink-muted">
                          Unlimited cases. Your branding on every document.
                        </td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-4 py-3 font-sans text-ink">
                          Agency Pro
                        </td>
                        <td className="px-4 py-3">$790 per year</td>
                        <td className="px-4 py-3 font-sans text-ink-muted">
                          Everything in Agency, plus team seats and API access.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-6 text-[13px] leading-[1.6] text-ink-faint">
                  Monthly and annual subscriptions. Cancel any time.
                </p>
              </SectionHeading>
            </div>

            <div>
              <SectionHeading eyebrow="Acceptable use" title="What you may not do.">
                <p>
                  You may not resell individual cases — a case is licensed to
                  you for the analysis you are running, not as inventory to
                  re-trade. You may not scrape, crawl, or otherwise extract
                  Viableo&apos;s computed results, recommendation logic, or
                  benchmark data through automated means. You may not
                  re-label, alter, or selectively trim Viableo outputs in a
                  way that misrepresents the underlying numbers to your
                  client.
                </p>
                <p>
                  The verdict, the scenario results, and the confidence score
                  are produced from the inputs you supplied. Show them as
                  they came out. If a number does not flatter the case, that
                  is information, not a typo to fix.
                </p>
              </SectionHeading>
            </div>

            <div>
              <SectionHeading eyebrow="Refunds" title="Contact within fourteen days.">
                <p>
                  Pro subscriptions are refundable on request within fourteen days
                  of purchase, provided the cases have not been consumed. If
                  you have used one or more of the cases in a pack and are not
                  satisfied, write to us — we will look at it and, where the
                  failure was on our side, refund the unused portion. Free
                  and unlimited (Agency, Agency Pro) tiers are not refundable
                  because they are zero-recurring and access has already been
                  granted.
                </p>
              </SectionHeading>
            </div>

            <div>
              <SectionHeading
                eyebrow="Liability"
                title="Estimates for decision support."
              >
                <p>
                  Viableo outputs are estimates produced from the inputs you
                  supplied. They are intended for decision support — to help
                  you decide whether to build, to narrow the first phase, or
                  to walk away — and they are not financial advice, not
                  investment advice, and not a guarantee of future revenue,
                  cost savings, or payback.
                </p>
                <p>
                  You remain responsible for the decisions you make on the
                  basis of a Viableo report, including the decision to share
                  the report with a client. To the maximum extent permitted by
                  law, Viableo is provided as-is, without warranty of any
                  kind, and our liability for any claim arising from your use
                  of the service is limited to the amount you paid us in the
                  preceding twelve months.
                </p>
              </SectionHeading>
            </div>

            <div>
              <SectionHeading
                eyebrow="Changes to these terms"
                title="We will say so, in advance."
              >
                <p>
                  If we change these terms, we will update this page and bump
                  the date below. For material changes — pricing, acceptable
                  use, liability — we will also notify active account holders
                  by email at least seven days before the change takes effect.
                  Continued use after the effective date is agreement to the
                  updated terms.
                </p>
              </SectionHeading>
            </div>

            <div>
              <SectionHeading eyebrow="Contact" title="Email us.">
                <p>
                  Questions about these terms go to{' '}
                  <a
                    href={`mailto:${TERMS_EMAIL}`}
                    className="link-underline text-ink underline-offset-4 hover:text-brand"
                  >
                    {TERMS_EMAIL}
                  </a>{' '}
                  — a placeholder address until a monitored mailbox is set
                  up. For how we handle your data, see{' '}
                  <InlineLink href="/privacy">the Privacy page</InlineLink>.
                </p>
              </SectionHeading>
            </div>
          </div>

          <p className="mt-12 text-[13px] leading-[1.6] text-ink-faint">
            Last updated: Phase 3. Figures are estimates, not financial advice.
          </p>
        </Section>

        <ClosingCTA
          headline="Build what pays back."
          body="Run the numbers before you commit the build."
        />
      </main>
    </MarketingShell>
  );
}
