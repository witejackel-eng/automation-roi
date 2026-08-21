import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import {
  PageHero,
  Section,
  ClosingCTA,
  BreadcrumbJsonLd,
} from '@/components/marketing/marketing-primitives';
import {
  LegalProse,
  LegalH2,
  LegalH3,
  LegalP,
  LegalUl,
  LegalLi,
  LegalOl,
  LegalLiNumber,
  LegalBlockquote,
  LegalStrong,
  LegalMeta,
  LegalPre,
  LegalLink,
} from '@/components/marketing/legal-prose';

export const metadata: Metadata = {
  title: 'Documentation | Viableo',
  description:
    'Learn how Viableo works, how to build automation business cases, understand scenarios, stress-test assumptions, and use client-ready outputs.',
  alternates: { canonical: '/docs' },
  openGraph: {
    type: 'website',
    title: 'Documentation | Viableo',
    description:
      'Learn how Viableo works, how to build automation business cases, understand scenarios, stress-test assumptions, and use client-ready outputs.',
    url: '/docs',
  },
  robots: { index: true, follow: true },
};

// TODO_HUMAN_DOMAIN: replace with the canonical production domain before publication.
const SUPPORT_EMAIL = 'support@TODO_HUMAN_DOMAIN';
const PRIVACY_EMAIL = 'privacy@TODO_HUMAN_DOMAIN';

const TOC_LINKS: { href: string; label: string }[] = [
  { href: '#what-is-viableo', label: '1. What Is Viableo?' },
  { href: '#run-your-first-case', label: '2. Run Your First Case' },
  { href: '#understand-the-results', label: '3. Understand the Results' },
  { href: '#build-consider-dont-build', label: '4. BUILD / CONSIDER / DON\u2019T BUILD' },
  { href: '#confidence', label: '5. Confidence' },
  { href: '#scenarios', label: '6. Scenarios' },
  { href: '#break-it-on-purpose', label: '7. Break It on Purpose' },
  { href: '#sensitivity-analysis', label: '8. Sensitivity Analysis' },
  { href: '#payback', label: '9. Payback' },
  { href: '#roi', label: '10. ROI' },
  { href: '#client-ready-business-cases', label: '11. Client-Ready Business Cases' },
  { href: '#reports', label: '12. Reports' },
  { href: '#proposals', label: '13. Proposals' },
  { href: '#client-share-links', label: '14. Client Share Links' },
  { href: '#client-approval-change-requests', label: '15. Client Approval and Change Requests' },
  { href: '#cases-and-client-history', label: '16. Cases and Client History' },
  { href: '#branding', label: '17. Branding' },
  { href: '#team-use', label: '18. Team Use' },
  { href: '#billing-and-plans', label: '19. Billing and Plans' },
  { href: '#what-viableo-does-not-guarantee', label: '20. What Viableo Does Not Guarantee' },
  { href: '#data-and-privacy', label: '21. Data and Privacy' },
  { href: '#account-security', label: '22. Account Security' },
  { href: '#support', label: '23. Support' },
  { href: '#recommended-operating-workflow', label: '24. Recommended Operating Workflow' },
];

export default function DocsPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Documentation', path: '/docs' },
        ]}
      />
      <main id="main-content" className="w-full">
        <PageHero eyebrow="Documentation" title="How Viableo works.">
          <p>
            Viableo helps automation agencies turn uncertain automation
            opportunities into financially defensible, stress-tested,
            client-ready business decisions.
          </p>
          <LegalMeta className="mt-8">
            Version 1.0 · Last Updated: August 21, 2026
          </LegalMeta>
        </PageHero>

        <Section>
          {/* ── Table of contents ─────────────────────────────────── */}
          <div className="mb-12 rounded-lg border border-black/10 bg-white p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">
              Contents
            </p>
            <nav aria-label="Documentation table of contents">
              <ol className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                {TOC_LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-[13px] leading-[1.6] text-black/60 underline-offset-4 hover:text-[#111] hover:underline"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <blockquote className="mt-6 border-l-2 border-black/15 pl-4 text-[14px] italic text-black/55">
              <LegalStrong>Core idea:</LegalStrong> Know what&apos;s worth building.
            </blockquote>
          </div>

          <LegalProse>
            <LegalH2 id="what-is-viableo">1. What Is Viableo?</LegalH2>
            <LegalP>
              Viableo helps automation agencies and automation consultants
              answer:
            </LegalP>
            <LegalBlockquote>
              Is this automation worth building, and can I defend that decision
              to my client?
            </LegalBlockquote>
            <LegalP>Core workflow:</LegalP>
            <LegalPre>
              Automation opportunity → business inputs → financial model → confidence → scenarios → stress test → verdict → business case → client output
            </LegalPre>

            <LegalH2 id="run-your-first-case">2. Run Your First Case</LegalH2>
            <LegalP>
              A Viableo case starts with the automation opportunity you are
              evaluating.
            </LegalP>
            <LegalP>You will typically provide information about:</LegalP>
            <LegalUl>
              <LegalLi>people/process affected;</LegalLi>
              <LegalLi>workload and labor cost;</LegalLi>
              <LegalLi>revenue/conversion opportunity where applicable;</LegalLi>
              <LegalLi>expected automation coverage;</LegalLi>
              <LegalLi>implementation cost;</LegalLi>
              <LegalLi>recurring software/API costs; and</LegalLi>
              <LegalLi>other assumptions required by the model.</LegalLi>
            </LegalUl>
            <LegalP>
              Use realistic values. When a value is uncertain, use an estimate
              rather than presenting an assumption as a fact.
            </LegalP>

            <LegalH2 id="understand-the-results">
              3. Understand the Results
            </LegalH2>
            <LegalP>Results can include:</LegalP>
            <LegalUl>
              <LegalLi>annual opportunity;</LegalLi>
              <LegalLi>annual benefit;</LegalLi>
              <LegalLi>implementation cost;</LegalLi>
              <LegalLi>ongoing cost;</LegalLi>
              <LegalLi>first-year cost;</LegalLi>
              <LegalLi>net benefit;</LegalLi>
              <LegalLi>ROI;</LegalLi>
              <LegalLi>payback period;</LegalLi>
              <LegalLi>confidence;</LegalLi>
              <LegalLi>scenario results;</LegalLi>
              <LegalLi>stress-test thresholds;</LegalLi>
              <LegalLi>sensitivity analysis; and</LegalLi>
              <LegalLi>recommendation.</LegalLi>
            </LegalUl>
            <LegalP>
              Treat the output as decision support, not a guaranteed prediction.
            </LegalP>

            <LegalH2 id="build-consider-dont-build">
              4. BUILD / CONSIDER / DON&apos;T BUILD
            </LegalH2>

            <LegalH3 id="verdict-build">BUILD</LegalH3>
            <LegalP>
              The case clears the configured economic criteria, subject to
              normal business and implementation review.
            </LegalP>

            <LegalH3 id="verdict-consider">CONSIDER</LegalH3>
            <LegalP>
              The economics are positive but slower, more sensitive, or
              otherwise require greater scrutiny.
            </LegalP>

            <LegalH3 id="verdict-dont-build">DON&apos;T BUILD</LegalH3>
            <LegalP>
              The current case does not justify the automation under the
              configured criteria.
            </LegalP>
            <LegalP>
              This may indicate that scope, cost, impact, or assumptions should
              change — or that the project should stop.
            </LegalP>

            <LegalH2 id="confidence">5. Confidence</LegalH2>
            <LegalP>
              Viableo distinguishes input quality so users can understand how
              much of a recommendation depends on known information versus
              assumptions.
            </LegalP>
            <LegalP>Inputs may be treated as:</LegalP>
            <LegalUl>
              <LegalLi>
                <LegalStrong>Provided</LegalStrong> — supplied information;
              </LegalLi>
              <LegalLi>
                <LegalStrong>Estimated</LegalStrong> — an informed estimate;
              </LegalLi>
              <LegalLi>
                <LegalStrong>Assumption</LegalStrong> — a value that should be
                validated.
              </LegalLi>
            </LegalUl>
            <LegalP>
              Confidence is not a probability that an automation will succeed.
              It indicates how strongly the current case is supported by input
              quality.
            </LegalP>

            <LegalH2 id="scenarios">6. Scenarios</LegalH2>

            <LegalH3 id="scenario-conservative">Conservative</LegalH3>
            <LegalP>A cautious outcome view.</LegalP>

            <LegalH3 id="scenario-expected">Expected</LegalH3>
            <LegalP>The primary case based on supplied assumptions.</LegalP>

            <LegalH3 id="scenario-upside">Upside</LegalH3>
            <LegalP>A stronger outcome scenario where supported by the model.</LegalP>

            <LegalP>
              Do not choose the most attractive scenario simply because it is
              attractive. Use scenarios to understand the range of outcomes.
            </LegalP>

            <LegalH2 id="break-it-on-purpose">7. Break It on Purpose</LegalH2>
            <LegalBlockquote>Break it on purpose.</LegalBlockquote>
            <LegalP>
              Stress testing helps identify where a business case stops
              working, such as when implementation cost becomes too high,
              automation coverage falls too low, conversion improvement is
              insufficient, or recurring costs become too large.
            </LegalP>
            <LegalP>
              The goal is to understand the limits of the case — not to make the
              case look better.
            </LegalP>

            <LegalH2 id="sensitivity-analysis">
              8. Sensitivity Analysis
            </LegalH2>
            <LegalP>
              Sensitivity analysis identifies inputs with the greatest effect
              on the outcome.
            </LegalP>
            <LegalP>Use it to answer:</LegalP>
            <LegalBlockquote>
              Which number is most likely to change the decision?
            </LegalBlockquote>
            <LegalP>
              Those assumptions deserve the strongest validation.
            </LegalP>

            <LegalH2 id="payback">9. Payback</LegalH2>
            <LegalP>
              Payback represents the modeled time required for the economic
              benefit to recover the relevant investment under Viableo&apos;s
              methodology.
            </LegalP>
            <LegalP>
              Payback depends on implementation cost, ongoing costs, labor
              savings, revenue/profit assumptions, and timing assumptions.
            </LegalP>
            <LegalP>Always review the assumptions alongside the number.</LegalP>

            <LegalH2 id="roi">10. ROI</LegalH2>
            <LegalP>
              ROI is a modeled financial metric based on the inputs and
              methodology used by Viableo.
            </LegalP>
            <LegalP>
              For client-facing communication, pair ROI with assumptions,
              payback, investment, net benefit, scenario range, confidence, and
              stress-test results.
            </LegalP>

            <LegalH2 id="client-ready-business-cases">
              11. Client-Ready Business Cases
            </LegalH2>
            <LegalP>A strong business case should clearly explain:</LegalP>
            <LegalOl>
              <LegalLiNumber>What is being proposed.</LegalLiNumber>
              <LegalLiNumber>What it costs.</LegalLiNumber>
              <LegalLiNumber>What it could produce/save.</LegalLiNumber>
              <LegalLiNumber>Which assumptions matter.</LegalLiNumber>
              <LegalLiNumber>What the downside looks like.</LegalLiNumber>
              <LegalLiNumber>How quickly it could pay back.</LegalLiNumber>
              <LegalLiNumber>How confident the agency should be.</LegalLiNumber>
              <LegalLiNumber>What the recommendation is.</LegalLiNumber>
              <LegalLiNumber>What should happen next.</LegalLiNumber>
            </LegalOl>

            <LegalH2 id="reports">12. Reports</LegalH2>
            <LegalP>Where report generation is available:</LegalP>
            <LegalOl>
              <LegalLiNumber>Complete and review the case.</LegalLiNumber>
              <LegalLiNumber>Confirm inputs.</LegalLiNumber>
              <LegalLiNumber>Review scenarios and stress testing.</LegalLiNumber>
              <LegalLiNumber>Confirm the recommendation.</LegalLiNumber>
              <LegalLiNumber>Generate the report.</LegalLiNumber>
              <LegalLiNumber>Review the report before external distribution.</LegalLiNumber>
            </LegalOl>

            <LegalH2 id="proposals">13. Proposals</LegalH2>
            <LegalP>
              Where proposal generation is available, use the proposal as a
              commercial follow-through from the business case.
            </LegalP>
            <LegalP>
              Review scope, implementation cost, timeline, financial figures,
              assumptions, recommendation, and next steps before sending.
            </LegalP>

            <LegalH2 id="client-share-links">14. Client Share Links</LegalH2>
            <LegalP>
              Share links let agencies present an appropriate business case to
              a client.
            </LegalP>
            <LegalP>Before sharing:</LegalP>
            <LegalUl>
              <LegalLi>confirm the case is correct;</LegalLi>
              <LegalLi>remove information the client should not see;</LegalLi>
              <LegalLi>confirm the recipient; and</LegalLi>
              <LegalLi>use expiration/revocation controls where available.</LegalLi>
            </LegalUl>
            <LegalP>
              Treat a share link as a disclosure mechanism, not as an internal
              draft.
            </LegalP>

            <LegalH2 id="client-approval-change-requests">
              15. Client Approval and Change Requests
            </LegalH2>
            <LegalP>
              Where enabled, clients may review a case, approve it, or request
              changes.
            </LegalP>
            <LegalP>
              Approval is a workflow event, not necessarily a legally binding
              contract or purchase commitment.
            </LegalP>

            <LegalH2 id="cases-and-client-history">
              16. Cases and Client History
            </LegalH2>
            <LegalP>
              Paid plans may provide saved cases and history. Keep the case
              context current when assumptions materially change.
            </LegalP>

            <LegalH2 id="branding">17. Branding</LegalH2>
            <LegalP>
              Where supported, agency branding can be applied to client-facing
              materials. Check the logo, organization name, client name,
              contact details, disclaimers, and report content before
              distribution.
            </LegalP>

            <LegalH2 id="team-use">18. Team Use</LegalH2>
            <LegalP>
              Use individual user accounts. Assign appropriate roles, remove
              former members, and do not share credentials.
            </LegalP>

            <LegalH2 id="billing-and-plans">19. Billing and Plans</LegalH2>
            <LegalP>Current canonical pricing:</LegalP>
            <div className="my-6 overflow-hidden rounded-md border border-black/10">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-black/[0.02] text-[12px] uppercase tracking-[0.06em] text-black/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Billing</th>
                  </tr>
                </thead>
                <tbody className="font-mono tnum text-[#111]">
                  <tr className="border-t border-black/10">
                    <td className="px-4 py-3 font-sans text-[#111]">Starter</td>
                    <td className="px-4 py-3">$0</td>
                    <td className="px-4 py-3 font-sans text-black/50">Forever</td>
                  </tr>
                  <tr className="border-t border-black/10">
                    <td className="px-4 py-3 font-sans text-[#111]">Pro</td>
                    <td className="px-4 py-3">$49</td>
                    <td className="px-4 py-3 font-sans text-black/50">Monthly</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <LegalP>
              Legacy Agency ($79/month) and Agency Pro ($790/year) tiers are
              retired; their entitlements are now included in Pro. Billing and
              entitlement availability depend on the active subscription.
            </LegalP>

            <LegalH2 id="what-viableo-does-not-guarantee">
              20. What Viableo Does Not Guarantee
            </LegalH2>
            <LegalP>
              Viableo does not guarantee that an automation will succeed,
              projected savings/revenue will occur, payback will be achieved, a
              client will approve a case, or a BUILD recommendation is
              appropriate for every context.
            </LegalP>
            <LegalP>
              The model is only as useful as its inputs, assumptions,
              methodology, and context.
            </LegalP>

            <LegalH2 id="data-and-privacy">21. Data and Privacy</LegalH2>
            <LegalP>
              Viableo can contain commercially sensitive information. Use
              appropriate access controls and do not enter information you are
              not authorized to process.
            </LegalP>
            <LegalP>
              See <LegalLink href="/privacy">/privacy</LegalLink> and{' '}
              <LegalLink href="/terms">/terms</LegalLink> for governing privacy
              and service terms.
            </LegalP>

            <LegalH2 id="account-security">22. Account Security</LegalH2>
            <LegalP>
              Viableo supports Google and GitHub authentication. Do not share
              credentials. If you suspect unauthorized access, secure your
              identity-provider account, sign out where possible, contact
              support, and review organization membership and shared cases.
            </LegalP>

            <LegalH2 id="support">23. Support</LegalH2>
            <LegalP>
              <LegalStrong>Support:</LegalStrong>{' '}
              <LegalLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</LegalLink>
              <br />
              <LegalStrong>Privacy:</LegalStrong>{' '}
              <LegalLink href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</LegalLink>
            </LegalP>
            <LegalP>
              Before publication, confirm these addresses are active.
            </LegalP>

            <LegalH2 id="recommended-operating-workflow">
              24. Recommended Operating Workflow
            </LegalH2>
            <LegalOl>
              <LegalLiNumber>
                <LegalStrong>Intake</LegalStrong> — describe the automation.
              </LegalLiNumber>
              <LegalLiNumber>
                <LegalStrong>Model</LegalStrong> — enter business and operational inputs.
              </LegalLiNumber>
              <LegalLiNumber>
                <LegalStrong>Validate</LegalStrong> — review facts, estimates, and assumptions.
              </LegalLiNumber>
              <LegalLiNumber>
                <LegalStrong>Analyze</LegalStrong> — review conservative, expected, and upside outcomes.
              </LegalLiNumber>
              <LegalLiNumber>
                <LegalStrong>Stress-test</LegalStrong> — try to break the case.
              </LegalLiNumber>
              <LegalLiNumber>
                <LegalStrong>Decide</LegalStrong> — BUILD / CONSIDER / DON&apos;T BUILD.
              </LegalLiNumber>
              <LegalLiNumber>
                <LegalStrong>Produce</LegalStrong> — generate the business case, report, or proposal.
              </LegalLiNumber>
              <LegalLiNumber>
                <LegalStrong>Share</LegalStrong> — send the client-facing version.
              </LegalLiNumber>
              <LegalLiNumber>
                <LegalStrong>Review</LegalStrong> — handle approval or change requests.
              </LegalLiNumber>
              <LegalLiNumber>
                <LegalStrong>Re-model</LegalStrong> — update the case when material assumptions change.
              </LegalLiNumber>
            </LegalOl>
          </LegalProse>
        </Section>

        <ClosingCTA
          headline="Build what pays back."
          body="Run one case. If the answer is don\u2019t build, you have saved yourself a project."
        />
      </main>
    </MarketingShell>
  );
}
