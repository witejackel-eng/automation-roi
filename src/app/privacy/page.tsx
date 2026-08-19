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
  title: 'Privacy — Viableo',
  description: 'How Viableo handles data.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    type: 'website',
    title: 'Privacy | Viableo',
    description: 'How Viableo handles data.',
    url: '/privacy',
  },
  robots: { index: true, follow: true },
};

// NOTE: privacy@viableo.app is an honest placeholder — swap for a real
// monitored address before production launch.
const PRIVACY_EMAIL = 'privacy@viableo.app';

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Privacy', path: '/privacy' },
        ]}
      />
      <main className="w-full">
        <PageHero eyebrow="Privacy" title="How Viableo handles data.">
          <p>
            Viableo needs no client-identifying data to return a verdict.
            Hours, rates, volumes, and a fee are enough. This page describes
            what we do collect, what we do not, how long we keep it, and how to
            have it changed or removed.
          </p>
        </PageHero>

        <Section className="bg-canvas">
          <div className="space-y-16 md:space-y-24">
            <div>
              <SectionHeading eyebrow="What we collect" title="The minimum, on purpose.">
                <p>
                  We collect only what is required to operate the service. When
                  you create an account through GitHub OAuth, we receive the
                  email address attached to that account and the public
                  profile fields GitHub passes through (typically name and
                  avatar URL). If you set an organization name, we store that
                  string as you typed it.
                </p>
                <p>
                  When you run an analysis, we store the inputs you typed —
                  hours per week, hourly cost, leads per month, average
                  customer value, gross margin, implementation fee, monthly
                  AI/API cost, monthly software cost, other annual cost, and
                  the notes you added to the case. None of these are
                  client-identifying. They are operational inputs.
                </p>
              </SectionHeading>
            </div>

            <div>
              <SectionHeading
                eyebrow="What we do not collect"
                title="No client PII. No card details."
              >
                <p>
                  Viableo does not require any client-identifying information
                  to return a verdict. The decision instrument operates on
                  operational inputs alone. You can run, save, and share an
                  analysis without ever entering a client name — the share
                  link uses an opaque random identifier, not the client name or
                  project id.
                </p>
                <p>
                  We do not collect payment card details. Billing is handled
                  by Whop, our payment provider. Card data flows between your
                  browser and Whop directly; it never touches our servers and
                  is not stored in our database.
                </p>
              </SectionHeading>
            </div>

            <div>
              <SectionHeading
                eyebrow="How long we keep it"
                title="For the life of the account."
              >
                <p>
                  We keep your account data, projects, and saved analyses for
                  the life of your account, so you can return to a case weeks
                  or months later and pick up where you left off. Shared
                  client reports remain accessible until the share link is
                  revoked, expires, or you delete the underlying project.
                </p>
                <p>
                  On request, we will export or delete your account data. See
                  the contact section below. We will act on a deletion request
                  within thirty days and confirm by email when it is
                  complete.
                </p>
              </SectionHeading>
            </div>

            <div>
              <SectionHeading
                eyebrow="Your rights"
                title="Export or delete, on request."
              >
                <p>
                  You can request a copy of the data we hold about you, or ask
                  for it to be deleted. Email the address below from the
                  address attached to your account and tell us what you need.
                  We do not require a reason. We do not charge for it.
                </p>
                <p>
                  If you have signed in through GitHub, you can also revoke
                  our access at any time from the GitHub application settings
                  page; we will simply stop receiving fresh profile data on
                  your next sign-in.
                </p>
              </SectionHeading>
            </div>

            <div>
              <SectionHeading eyebrow="Contact" title="Email us.">
                <p>
                  Questions, export requests, or deletion requests go to{' '}
                  <a
                    href={`mailto:${PRIVACY_EMAIL}`}
                    className="link-underline text-ink underline-offset-4 hover:text-brand"
                  >
                    {PRIVACY_EMAIL}
                  </a>{' '}
                  — a placeholder address until a monitored mailbox is set up.
                  For the legal terms that apply to your use of Viableo, see{' '}
                  <InlineLink href="/terms">the Terms page</InlineLink>.
                </p>
              </SectionHeading>
            </div>
          </div>

          <p className="mt-12 text-[13px] leading-[1.6] text-ink-faint">
            Last updated: Phase 3. Figures are estimates, not financial advice.
          </p>
        </Section>

        <ClosingCTA
          headline="Run the numbers before you build."
          body="Viableo is a decision instrument. Hours, rates, volumes, a fee — and a verdict."
        />
      </main>
    </MarketingShell>
  );
}
