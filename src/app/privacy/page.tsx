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
  title: 'Privacy Policy | Viableo',
  description:
    'Learn how Viableo collects, uses, protects, and shares information when you use the service.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    type: 'website',
    title: 'Privacy Policy | Viableo',
    description:
      'Learn how Viableo collects, uses, protects, and shares information when you use the service.',
    url: '/privacy',
  },
  robots: { index: true, follow: true },
};

// TODO_HUMAN_PRIVACY_EMAIL: replace with a monitored address before production launch.
// TODO_HUMAN_DOMAIN: replace with the canonical production domain before publication.
const PRIVACY_EMAIL = 'privacy@TODO_HUMAN_DOMAIN';
const SUPPORT_EMAIL = 'support@TODO_HUMAN_DOMAIN';

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Privacy', path: '/privacy' },
        ]}
      />
      <main id="main-content" className="w-full">
        <PageHero eyebrow="Privacy" title="Viableo Privacy Policy">
          <p>
            Viableo (&ldquo;Viableo&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
            or &ldquo;our&rdquo;) provides software that helps automation
            agencies evaluate automation opportunities, analyze their economics,
            stress-test assumptions, produce business cases, generate proposals
            and reports, and share those materials with clients.
          </p>
          <p className="mt-4">
            This Privacy Policy explains what information we collect, why we use
            it, how we protect it, when we disclose it, and the choices available
            to you.
          </p>
          <LegalMeta className="mt-8">
            Effective Date: August 21, 2026 · Last Updated: August 21, 2026
          </LegalMeta>
        </PageHero>

        <Section>
          <LegalProse>
            <LegalBlockquote>
              <LegalStrong>Important:</LegalStrong> This policy is a
              production-ready baseline, not a guarantee of legal compliance in
              every jurisdiction. Before publication, the operator of Viableo
              should confirm the legal entity, jurisdictions served, actual
              subprocessors, retention periods, cookie/analytics configuration,
              and applicable regulatory obligations with qualified counsel.
            </LegalBlockquote>

            <LegalH2 id="who-this-applies-to">
              1. Who This Policy Applies To
            </LegalH2>
            <LegalP>
              This Policy applies to visitors to the Viableo website; users who
              create or access a Viableo account; organizations and teams using
              Viableo; clients or other people who access a Viableo
              client-facing share link; and people who contact Viableo for
              support or other business purposes.
            </LegalP>
            <LegalP>
              If your employer, agency, or another organization provides your
              Viableo account, that organization may be responsible for certain
              business-case information it submits to Viableo. In that
              situation, Viableo may process information on the
              organization&apos;s behalf under its instructions and applicable
              agreements.
            </LegalP>

            <LegalH2 id="information-we-collect">
              2. Information We Collect
            </LegalH2>

            <LegalH3 id="account-identity">2.1 Account and identity information</LegalH3>
            <LegalP>
              When you sign in, we may receive information from your
              authentication provider, such as your name, email address,
              profile identifier, profile image, authentication-provider account
              identifier, and provider-specific metadata needed to maintain your
              account. Viableo currently supports Google and GitHub
              authentication.
            </LegalP>

            <LegalH3 id="organization-team">2.2 Organization and team information</LegalH3>
            <LegalP>
              We may collect organization name, team membership, roles and
              permissions, organization settings, agency branding information,
              and account/subscription administration information.
            </LegalP>

            <LegalH3 id="business-case-info">2.3 Business-case information</LegalH3>
            <LegalP>
              When you use Viableo, you may provide automation descriptions,
              employee/workload information, labor costs, revenue assumptions,
              conversion assumptions, margins, implementation costs, ongoing
              software/API costs, scenario assumptions, client information you
              choose to enter, notes, and other information necessary to produce
              your requested analysis.
            </LegalP>
            <LegalP>
              This information may be commercially sensitive. You should only
              submit information you are authorized to provide.
            </LegalP>

            <LegalH3 id="reports-proposals-sharing">2.4 Reports, proposals, uploads, and sharing information</LegalH3>
            <LegalP>
              Depending on your plan and use of the Service, we may process
              generated reports, generated proposals, uploaded branding assets,
              share links, client review/approval events, change-request events,
              and engagement information associated with share links.
            </LegalP>

            <LegalH3 id="subscription-payment">2.5 Subscription and payment information</LegalH3>
            <LegalP>
              We may receive or process plan/subscription identifiers, billing
              status, subscription period, payment status, transaction/order
              identifiers, amount/currency, cancellation/refund state, and other
              billing metadata.
            </LegalP>
            <LegalP>
              Payment-card credentials are handled by the applicable payment
              provider and are not stored by Viableo unless expressly stated
              otherwise.
            </LegalP>

            <LegalH3 id="technical-usage">2.6 Technical and usage information</LegalH3>
            <LegalP>
              We may automatically receive IP address, browser/device
              information, operating system, pages/features accessed,
              timestamps, referring URLs, security/authentication events,
              error/diagnostic information, and abuse-prevention signals.
            </LegalP>

            <LegalH2 id="how-we-use-information">
              3. How We Use Information
            </LegalH2>
            <LegalP>
              We use information to provide and maintain Viableo; authenticate
              users; create organizations and memberships; run calculations and
              produce requested outputs; generate reports and proposals; create
              and operate share links; process approvals and change requests;
              manage subscriptions and entitlements; provide support;
              detect/prevent fraud and abuse; monitor system health; improve
              functionality; comply with law; and establish, exercise, or defend
              legal claims.
            </LegalP>
            <LegalP>
              We do not use your private business-case information as public
              marketing content without your permission.
            </LegalP>

            <LegalH2 id="business-case-ai-processing">
              4. Business-Case and AI Processing
            </LegalH2>
            <LegalP>
              Viableo may use automated software components, including AI
              services where enabled by the product, for requested tasks such as
              narrative generation, estimates, summaries, or risk descriptions.
            </LegalP>
            <LegalP>
              Deterministic financial calculations are intended to remain
              governed by Viableo&apos;s calculation logic rather than being
              silently replaced by an AI-generated number.
            </LegalP>
            <LegalP>
              You are responsible for reviewing business-case inputs and outputs
              before relying on them. Do not submit regulated, highly sensitive,
              or third-party confidential information unless you have the right
              to do so and the applicable use is appropriate for your account and
              agreement.
            </LegalP>

            <LegalH2 id="legal-bases">
              5. Legal Bases and Jurisdiction-Specific Rights
            </LegalH2>
            <LegalP>
              Depending on the jurisdiction, we may process personal information
              based on contract performance, pre-contractual steps, legitimate
              interests where permitted, consent where required, and legal
              obligations.
            </LegalP>
            <LegalP>
              Where laws such as the GDPR apply, required notices may include
              purposes, categories of data, legal bases, retention,
              recipients/transfers, and applicable rights. Where U.S. state
              privacy laws apply, available rights may include access/know,
              deletion, correction, opt-out of certain sales/sharing, and other
              rights provided by applicable law.
            </LegalP>
            <LegalP>
              We do not intend to sell personal information for money. If our
              practices change, we will update applicable notices and provide
              legally required opt-out mechanisms.
            </LegalP>

            <LegalH2 id="service-providers-disclosures">
              6. Service Providers and Disclosures
            </LegalH2>
            <LegalP>
              We may disclose information to service providers that process
              information on our behalf for hosting, database, authentication,
              object storage, payments/subscriptions, support,
              monitoring/security, analytics if enabled, and AI/model processing
              if enabled.
            </LegalP>
            <LegalP>
              Depending on the production configuration, Viableo may use
              services such as Vercel, Neon, Google, GitHub, Whop, and Vercel
              Blob. This list must be synchronized with the actual production
              environment before publication.
            </LegalP>
            <LegalP>
              We may also disclose information at your direction; to members of
              your organization with authorized access; through client-facing
              share links you intentionally create; to professional advisers
              under confidentiality obligations; in a merger/acquisition or
              similar transaction; or when required by law or reasonably
              necessary to protect rights, safety, security, or the Service.
            </LegalP>

            <LegalH2 id="client-facing-sharing">
              7. Client-Facing Sharing
            </LegalH2>
            <LegalP>
              If you create a Viableo share link, information from that case may
              become available to people who receive or access the link according
              to the sharing controls and status of that link.
            </LegalP>
            <LegalP>
              You are responsible for sharing only information that you are
              authorized to disclose. Revocation may prevent future access but
              does not necessarily erase copies previously downloaded, viewed,
              printed, or otherwise retained by recipients.
            </LegalP>

            <LegalH2 id="security">8. Security</LegalH2>
            <LegalP>
              We use reasonable technical and organizational safeguards
              appropriate to the Service, which may include HTTPS/TLS,
              authentication/session controls, server-side authorization, tenant
              isolation, role-based administrative authorization, webhook
              signature verification, rate limiting, input validation,
              restricted access to production systems, security logging/audit
              controls, and secure handling of application secrets.
            </LegalP>
            <LegalP>No service can guarantee absolute security.</LegalP>

            <LegalH2 id="data-retention">9. Data Retention</LegalH2>
            <LegalP>
              We retain information for as long as reasonably necessary to
              provide the Service, maintain account/business records, support
              requests, meet contractual/legal obligations, resolve disputes,
              maintain security, and enforce our agreements.
            </LegalP>
            <LegalP>
              Retention periods vary by data type. Specific periods should be
              published once the production retention schedule is finalized.
            </LegalP>
            <LegalP>
              When information is no longer required, we may delete, anonymize,
              or securely dispose of it subject to lawful retention
              requirements, backups, and legitimate business needs.
            </LegalP>

            <LegalH2 id="your-choices-rights">
              10. Your Choices and Rights
            </LegalH2>
            <LegalP>
              Depending on applicable law, you may have rights to access personal
              information, obtain copies, correct inaccuracies, request deletion,
              restrict or object to certain processing, withdraw consent where
              consent is the basis, request portability, and opt out of certain
              sales/sharing or targeted advertising where applicable.
            </LegalP>
            <LegalP>
              To submit a privacy request, use the privacy contact below. We may
              need to verify your identity before completing a request.
            </LegalP>

            <LegalH2 id="cookies">
              11. Cookies and Similar Technologies
            </LegalH2>
            <LegalP>
              Viableo may use strictly necessary cookies for authentication,
              session security, CSRF/security protections, load balancing, and
              basic functionality.
            </LegalP>
            <LegalP>
              If non-essential analytics, advertising, or tracking technologies
              are enabled, Viableo will provide notices or consent controls
              required by applicable law. Before publication, this section must
              match the actual production configuration.
            </LegalP>

            <LegalH2 id="international-transfers">
              12. International Transfers
            </LegalH2>
            <LegalP>
              Viableo and its service providers may process information in
              countries other than the country where you live. Where applicable
              law requires safeguards for international transfers, Viableo
              intends to use appropriate lawful transfer mechanisms.
            </LegalP>

            <LegalH2 id="childrens-privacy">
              13. Children&apos;s Privacy
            </LegalH2>
            <LegalP>
              Viableo is designed for businesses and professionals and is not
              directed to children. We do not knowingly collect children&apos;s
              personal information where prohibited by applicable law.
            </LegalP>

            <LegalH2 id="controller-processor">
              14. Controller / Processor Relationship
            </LegalH2>
            <LegalP>
              For information Viableo collects directly to operate an
              individual&apos;s account, Viableo may act as the relevant
              controller/business, depending on applicable law.
            </LegalP>
            <LegalP>
              Where an organization submits employee, client, or other
              third-party information and Viableo processes it only to provide
              the contracted service, the organization may act as
              controller/business and Viableo may act as processor/service
              provider, subject to applicable agreements and law.
            </LegalP>

            <LegalH2 id="security-incidents">
              15. Security Incidents
            </LegalH2>
            <LegalP>
              If we determine that a security incident requires notification
              under applicable law, we will provide notifications as required by
              law and take reasonable steps to investigate, contain, remediate,
              and prevent recurrence.
            </LegalP>

            <LegalH2 id="changes-to-policy">
              16. Changes to This Privacy Policy
            </LegalH2>
            <LegalP>
              We may update this Privacy Policy as the Service, laws, or data
              practices change. We will update the Last Updated date when changes
              are made and will provide additional notice where required.
            </LegalP>

            <LegalH2 id="contact">17. Contact</LegalH2>
            <LegalP>
              <LegalStrong>Privacy:</LegalStrong>{' '}
              <LegalLink href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</LegalLink>
              <br />
              <LegalStrong>Support:</LegalStrong>{' '}
              <LegalLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</LegalLink>
            </LegalP>
            <LegalP>
              Before publication, confirm that these addresses are active and
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
              Privacy Policy Publication Checklist
            </LegalH2>
            <LegalUl>
              <LegalLi>Legal entity name inserted.</LegalLi>
              <LegalLi>Legal/business address inserted if required.</LegalLi>
              <LegalLi>Privacy/support emails are active.</LegalLi>
              <LegalLi>Actual production subprocessors are listed accurately.</LegalLi>
              <LegalLi>Cookie/analytics configuration matches.</LegalLi>
              <LegalLi>Actual data-retention periods are documented.</LegalLi>
              <LegalLi>Actual AI provider/data-use terms are confirmed.</LegalLi>
              <LegalLi>International transfer mechanisms are confirmed where required.</LegalLi>
              <LegalLi>Any required DPA is available for business customers.</LegalLi>
              <LegalLi>Applicable jurisdiction-specific notices/opt-outs are implemented.</LegalLi>
              <LegalLi>Policy has been reviewed by qualified counsel.</LegalLi>
            </LegalUl>
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
