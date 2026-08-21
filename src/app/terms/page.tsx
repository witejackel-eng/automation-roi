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
  LegalBlockquote,
  LegalStrong,
  LegalMeta,
  LegalHr,
  LegalLink,
} from '@/components/marketing/legal-prose';

export const metadata: Metadata = {
  title: 'Terms of Service | Viableo',
  description:
    'The terms that govern your use of Viableo, including accounts, subscriptions, customer content, and business-case outputs.',
  alternates: { canonical: '/terms' },
  openGraph: {
    type: 'website',
    title: 'Terms of Service | Viableo',
    description:
      'The terms that govern your use of Viableo, including accounts, subscriptions, customer content, and business-case outputs.',
    url: '/terms',
  },
  robots: { index: true, follow: true },
};

// TODO_HUMAN_TERMS_EMAIL: replace with a monitored address before production launch.
// TODO_HUMAN_DOMAIN: replace with the canonical production domain before publication.
const LEGAL_EMAIL = 'legal@TODO_HUMAN_DOMAIN';
const SUPPORT_EMAIL = 'support@TODO_HUMAN_DOMAIN';

export default function TermsPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Terms', path: '/terms' },
        ]}
      />
      <main id="main-content" className="w-full">
        <PageHero eyebrow="Terms" title="Viableo Terms of Service">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
            and use of Viableo (&ldquo;Viableo&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;, or &ldquo;our&rdquo;), including the website,
            application, reports, proposals, share links, APIs, and related
            services (the &ldquo;Service&rdquo;).
          </p>
          <p className="mt-4">
            By creating an account, accessing the Service, subscribing to a paid
            plan, or otherwise using the Service, you agree to these Terms. If
            you use Viableo on behalf of an organization, you represent that you
            have authority to bind that organization.
          </p>
          <LegalMeta className="mt-8">
            Effective Date: August 21, 2026 · Last Updated: August 21, 2026
          </LegalMeta>
        </PageHero>

        <Section>
          <LegalProse>
            <LegalBlockquote>
              <LegalStrong>Important:</LegalStrong> These Terms are a strong
              operational baseline, not a guarantee of legal sufficiency in
              every jurisdiction. Before publication, the operator should have
              counsel confirm the legal entity, governing law, mandatory
              consumer rules, tax treatment, refund rules, and
              jurisdiction-specific provisions.
            </LegalBlockquote>

            <LegalH2 id="eligibility-and-authority">
              1. Eligibility and Authority
            </LegalH2>
            <LegalP>
              You must be legally capable of entering into a binding contract in
              your jurisdiction. If you use Viableo for an organization, you
              represent that you are authorized to do so, your organization is
              responsible for activity under its account, and your organization
              is responsible for ensuring submitted data may lawfully be
              processed.
            </LegalP>
            <LegalP>
              Viableo is intended for professional and business use.
            </LegalP>

            <LegalH2 id="the-service">2. The Service</LegalH2>
            <LegalP>
              Depending on plan and enabled features, Viableo may provide guided
              business-case creation, deterministic financial calculations,
              Conservative/Expected/Upside scenarios, confidence scoring, stress
              testing, sensitivity analysis, BUILD/CONSIDER/DON&apos;T BUILD
              recommendations, saved cases, reports, proposals, client-facing
              share links, approval/change-request workflows, team features,
              agency branding, white-label outputs, and API/webhook
              functionality.
            </LegalP>
            <LegalP>
              Features depend on the active plan and the Service actually
              offered.
            </LegalP>

            <LegalH2 id="business-disclaimer">
              3. Business and Financial Decision Disclaimer
            </LegalH2>
            <LegalP>
              Viableo is a business-analysis and decision-support tool. It does
              not provide investment, financial, accounting, tax, legal,
              engineering certification, or other professional advice, and it
              does not guarantee business outcomes.
            </LegalP>
            <LegalP>
              ROI, payback, savings, revenue opportunity, margins, confidence
              scores, scenarios, stress tests, and recommendations depend on
              user inputs, assumptions, and the methodology implemented by
              Viableo.
            </LegalP>
            <LegalP>
              A BUILD recommendation does not guarantee project success. A
              DON&apos;T BUILD recommendation is an analytical result based on
              the case as modeled.
            </LegalP>
            <LegalP>
              You are responsible for reviewing inputs, assumptions, outputs,
              and client-specific circumstances before making business
              decisions.
            </LegalP>

            <LegalH2 id="accounts">4. Accounts</LegalH2>
            <LegalP>
              You may authenticate using supported third-party identity
              providers, including Google and GitHub.
            </LegalP>
            <LegalP>
              You are responsible for keeping account access secure, maintaining
              accurate account information, notifying us of suspected
              unauthorized access, and activity reasonably attributable to your
              account.
            </LegalP>
            <LegalP>
              You may not impersonate another person/organization, create
              fraudulent accounts, bypass authentication/authorization, share
              credentials in a way that defeats access controls, or obtain
              unauthorized access to another organization.
            </LegalP>

            <LegalH2 id="organizations-team">
              5. Organizations and Team Access
            </LegalH2>
            <LegalP>
              Organizations may contain multiple members with different
              permissions. Organization owners are responsible for invitations,
              roles, removals, and access to client information.
            </LegalP>

            <LegalH2 id="your-data">6. Your Data</LegalH2>
            <LegalP>
              You retain ownership of the business information, text, files,
              assumptions, and other content you submit (&ldquo;Customer
              Content&rdquo;), subject to the rights necessary for us to operate
              the Service.
            </LegalP>
            <LegalP>
              You grant Viableo a limited, non-exclusive, worldwide license to
              host, reproduce, transmit, process, format, and otherwise use
              Customer Content only as reasonably necessary to provide, secure,
              troubleshoot, support, and maintain the Service and comply with
              law.
            </LegalP>
            <LegalP>
              We do not claim ownership of your Customer Content.
            </LegalP>

            <LegalH2 id="responsibility-for-content">
              7. Responsibility for Customer Content
            </LegalH2>
            <LegalP>
              You represent that you have the right to submit Customer Content;
              have obtained required permissions for third-party personal
              information; and will not knowingly submit unlawful, infringing,
              malicious, or unauthorized content.
            </LegalP>
            <LegalP>
              You are responsible for the accuracy and legality of information
              you enter.
            </LegalP>

            <LegalH2 id="client-share-links">
              8. Client Share Links
            </LegalH2>
            <LegalP>
              If you create a share link, you are responsible for deciding what
              information to share and with whom. Use available
              expiration/revocation controls appropriately. Recipients may
              retain information they previously accessed or downloaded.
            </LegalP>

            <LegalH2 id="plans-and-subscriptions">
              9. Plans and Subscriptions
            </LegalH2>
            <LegalP>
              Viableo&apos;s canonical commercial model is:
            </LegalP>

            <LegalH3 id="plan-starter">Starter</LegalH3>
            <LegalP>
              <LegalStrong>$0 — forever</LegalStrong>
              <br />
              10 cases per month. Full analytical engine (three scenarios,
              confidence scoring, stress test, verdict). Watermarked client
              PDFs.
            </LegalP>

            <LegalH3 id="plan-pro">Pro</LegalH3>
            <LegalP>
              <LegalStrong>$49/month — recurring monthly subscription</LegalStrong>
              <br />
              Unlimited cases. Clean, unwatermarked client reports and
              proposals. Agency branding. Share links with approval tracking.
              Client directory and case library. Case versioning and challenge
              workflow. Client history reuse. Team seats.
            </LegalP>

            <LegalP>
              The active pricing page and checkout control the features and
              prices available at purchase. Legacy Agency ($79/month) and Agency
              Pro ($790/year) tiers are retired; their entitlements are now
              included in Pro.
            </LegalP>

            <LegalH2 id="billing-and-payments">
              10. Billing and Payments
            </LegalH2>
            <LegalP>
              Paid subscriptions are billed according to the selected billing
              interval through the applicable payment provider. Applicable
              taxes may be added where required. Subscription changes are
              subject to the provider&apos;s billing rules and applicable law.
            </LegalP>
            <LegalP>
              Viableo may store subscription/payment metadata needed to
              administer the account. Payment-card credentials are handled by
              the applicable payment provider unless expressly stated otherwise.
            </LegalP>

            <LegalH2 id="cancellation">11. Cancellation</LegalH2>
            <LegalP>
              You may cancel through the billing mechanism provided by Viableo
              or its payment provider. Unless otherwise required by law or
              expressly stated at checkout, cancellation prevents future renewal
              but does not necessarily end paid access immediately. Paid access
              generally continues through the applicable paid period.
            </LegalP>

            <LegalH2 id="refunds">12. Refunds</LegalH2>
            <LegalP>
              Refund eligibility depends on applicable checkout terms,
              payment-provider rules, and mandatory consumer law. Unless another
              written policy applies, refunds are not guaranteed solely because a
              user changes their mind after using paid functionality.
            </LegalP>
            <LegalP>Nothing limits mandatory consumer rights.</LegalP>

            <LegalH2 id="downgrades-retention">
              13. Downgrades and Data Retention
            </LegalH2>
            <LegalP>
              When a paid subscription ends, paid capabilities may become
              unavailable while historical Customer Content may remain stored
              under the applicable retention policy. Reactivation may restore
              features subject to the current plan.
            </LegalP>
            <LegalP>
              Customers do not necessarily lose historical data immediately when
              paid access ends.
            </LegalP>

            <LegalH2 id="fair-use">14. Fair Use and Usage Limits</LegalH2>
            <LegalP>
              Plans may contain case, seat, report, API, overage, or other
              documented limits. You may not circumvent usage, rate, or
              entitlement controls or materially abuse service capacity.
            </LegalP>

            <LegalH2 id="acceptable-use">15. Acceptable Use</LegalH2>
            <LegalP>
              You may not use Viableo to violate law, infringe rights,
              distribute malware, attack systems without authorization, bypass
              access/billing controls, manipulate webhooks or payments, scrape
              the Service abusively, interfere with other users, process data
              without authorization, or create deceptive financial claims.
            </LegalP>

            <LegalH2 id="intellectual-property">
              16. Intellectual Property
            </LegalH2>
            <LegalP>
              Viableo and its licensors retain rights to the Service, software,
              interfaces, designs, trademarks, documentation, methodologies, and
              proprietary materials. No ownership rights are transferred except
              as expressly granted.
            </LegalP>
            <LegalP>
              You may use generated reports/proposals for legitimate business
              purposes subject to your plan and applicable restrictions.
            </LegalP>

            <LegalH2 id="feedback">17. Feedback</LegalH2>
            <LegalP>
              You may provide suggestions or feedback. We may use such feedback
              without compensation, provided we do not disclose your
              confidential Customer Content merely because it was included in
              feedback.
            </LegalP>

            <LegalH2 id="third-party-services">
              18. Third-Party Services
            </LegalH2>
            <LegalP>
              The Service may depend on third parties for authentication,
              hosting, databases, payments, storage, communications, or AI/model
              functionality. Those providers may have separate terms and
              policies.
            </LegalP>

            <LegalH2 id="availability-changes">
              19. Availability and Changes
            </LegalH2>
            <LegalP>
              We aim to provide a reliable Service but do not guarantee
              uninterrupted or error-free availability. We may modify features,
              limits, components, or availability for maintenance, security,
              product development, or other legitimate reasons.
            </LegalP>

            <LegalH2 id="security-incidents">
              20. Security Incidents
            </LegalH2>
            <LegalP>
              If we become aware of a security incident affecting Customer
              Content, we will investigate and take reasonable remediation
              steps, including legally required notification where applicable.
            </LegalP>

            <LegalH2 id="suspension-termination">
              21. Suspension and Termination
            </LegalH2>
            <LegalP>
              We may suspend or terminate access when reasonably necessary to
              prevent security threats/fraud, comply with law, enforce these
              Terms, address non-payment, or protect the Service or users. Where
              practical and legally permitted, we will provide an explanation
              and an opportunity to remedy the issue.
            </LegalP>

            <LegalH2 id="disclaimers">22. Disclaimers</LegalH2>
            <LegalP>
              To the maximum extent permitted by law, the Service is provided on
              an &ldquo;as available&rdquo; and &ldquo;as is&rdquo; basis.
            </LegalP>
            <LegalP>
              We do not warrant that every calculation will match an
              independent model, every assumption will be appropriate for every
              business, projected savings/revenue will occur, client approval
              will result, or the Service will always be uninterrupted or
              error-free.
            </LegalP>

            <LegalH2 id="limitation-of-liability">
              23. Limitation of Liability
            </LegalH2>
            <LegalP>
              To the maximum extent permitted by applicable law, Viableo and
              its officers, employees, affiliates, and service providers will
              not be liable for indirect, incidental, consequential, special,
              exemplary, or punitive damages, or for lost profits, lost
              revenue, lost data, lost business opportunities, or business
              interruption arising from use of the Service.
            </LegalP>
            <LegalP>
              Any exclusions or limits are subject to mandatory rights and
              liabilities that cannot legally be excluded.
            </LegalP>
            <LegalBlockquote>
              <LegalStrong>
                Before publication, counsel should insert the appropriate
                liability cap and confirm the jurisdiction-specific formulation.
                Do not publish an invented cap.
              </LegalStrong>
            </LegalBlockquote>

            <LegalH2 id="indemnification">24. Indemnification</LegalH2>
            <LegalP>
              To the extent permitted by law, you agree to defend and indemnify
              Viableo against third-party claims arising from your unlawful use
              of the Service, Customer Content, or breach of these Terms.
              Mandatory consumer protections are not waived.
            </LegalP>

            <LegalH2 id="governing-law">
              25. Governing Law and Disputes
            </LegalH2>
            <LegalBlockquote>
              <LegalStrong>
                This section must be completed before publication.
              </LegalStrong>{' '}
              Insert the legal entity&apos;s governing jurisdiction, applicable
              law, venue/arbitration structure, and mandatory consumer-law
              carve-outs after legal review.
            </LegalBlockquote>
            <LegalP>Do not publish a guessed jurisdiction.</LegalP>

            <LegalH2 id="changes-to-terms">
              26. Changes to These Terms
            </LegalH2>
            <LegalP>
              We may update these Terms as the Service or law changes. Material
              changes will be notified where required. The updated Terms will
              state the new effective date.
            </LegalP>

            <LegalH2 id="contact">27. Contact</LegalH2>
            <LegalP>
              <LegalStrong>Legal:</LegalStrong>{' '}
              <LegalLink href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</LegalLink>
              <br />
              <LegalStrong>Support:</LegalStrong>{' '}
              <LegalLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</LegalLink>
            </LegalP>
            <LegalP>
              Before publication, confirm these addresses are active and
              monitored.
            </LegalP>
            <LegalP>
              <LegalStrong>Viableo</LegalStrong>
              <br />
              [Insert legal entity name and registered/business address before
              publication if required.]
            </LegalP>

            <LegalHr />

            <LegalH2 id="publication-checklist">
              Terms Publication Checklist
            </LegalH2>
            <LegalUl>
              <LegalLi>Legal entity name inserted.</LegalLi>
              <LegalLi>Governing law inserted.</LegalLi>
              <LegalLi>Venue/arbitration language reviewed.</LegalLi>
              <LegalLi>Refund policy matches checkout/provider.</LegalLi>
              <LegalLi>Tax handling matches checkout.</LegalLi>
              <LegalLi>Cancellation behavior matches subscription implementation.</LegalLi>
              <LegalLi>Current feature matrix matches the application.</LegalLi>
              <LegalLi>Privacy URL is live.</LegalLi>
              <LegalLi>Legal/support emails work.</LegalLi>
              <LegalLi>Financial disclaimer reviewed.</LegalLi>
              <LegalLi>Liability and indemnity language reviewed for applicable law.</LegalLi>
            </LegalUl>
          </LegalProse>
        </Section>

        <ClosingCTA
          headline="Build what pays back."
          body="Run the numbers before you commit the build."
        />
      </main>
    </MarketingShell>
  );
}
