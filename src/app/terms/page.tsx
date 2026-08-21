import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { PageHero, BreadcrumbJsonLd, InlineLink } from '@/components/marketing/marketing-primitives';

export const metadata: Metadata = {
  title: 'Terms of Service — Viableo',
  description: 'The terms under which Viableo is licensed.',
  alternates: { canonical: '/terms' },
  openGraph: {
    type: 'website',
    title: 'Terms of Service | Viableo',
    description: 'The terms under which Viableo is licensed.',
    url: '/terms',
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Terms of Service', path: '/terms' },
        ]}
      />
      <PageHero eyebrow="Terms of Service" title="Terms of Service" />

      <section className="py-12 md:py-20">
        <article className="mx-auto max-w-[760px] px-6 md:px-12">
          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            1. Using Viableo
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            Viableo is a software-as-a-service decision instrument for automation
            professionals. You enter operational inputs for a prospective
            automation project — hours saved, hourly cost, lead volume,
            conversion lift, average customer value, gross margin,
            implementation fee, recurring costs, and other annual costs. Viableo
            runs the math against multiple scenarios, scores the confidence of
            your inputs, and returns a verdict with a client-ready report.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            By accessing or using Viableo, you agree to be bound by these Terms
            of Service. If you do not agree, do not use the service. These terms
            apply to all users, including free-tier users.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            2. Accounts
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            You must create an account to use Viableo. You are responsible for
            maintaining the security of your account credentials and for all
            activity that occurs under your account. If you believe your account
            has been compromised, you must notify us immediately.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            You must provide accurate information when creating your account. You
            may not impersonate another person or entity, or create accounts under
            false pretenses. We reserve the right to suspend accounts that
            violate these requirements.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            3. Organizations and Teams
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            You may create or join an organization to collaborate with team
            members. The organization owner is responsible for managing members
            and permissions. All members of an organization are bound by these
            terms individually.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            Business cases created within an organization are owned by the
            organization. If your membership is revoked, your personal cases
            remain yours. Organization-level cases and data may be retained by
            the organization after your departure.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            4. Subscriptions
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            Viableo offers the following subscription tiers. Paid subscriptions
            are recurring monthly charges that renew automatically until you
            cancel. You may cancel at any time; cancellation takes effect at the
            end of your current billing period.
          </p>
          <div className="mt-6 overflow-hidden rounded-lg border border-[#111]/[0.06] bg-white">
            <table className="w-full text-left">
              <thead className="bg-[#111]/[0.03]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-widest text-[#111]/40">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-widest text-[#111]/40">
                    Billing
                  </th>
                  <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-widest text-[#111]/40">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#111]">
                <tr className="border-t border-[#111]/[0.04]">
                  <td className="px-4 py-3">Free</td>
                  <td className="px-4 py-3">Forever</td>
                  <td className="px-4 py-3">$0</td>
                </tr>
                <tr className="border-t border-[#111]/[0.04]">
                  <td className="px-4 py-3">Pro</td>
                  <td className="px-4 py-3">Monthly</td>
                  <td className="px-4 py-3">$49/month</td>
                </tr>
                <tr className="border-t border-[#111]/[0.04]">
                  <td className="px-4 py-3">Custom</td>
                  <td className="px-4 py-3">Custom</td>
                  <td className="px-4 py-3">Contact us</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-[15px] leading-[1.7] text-[#111]/50">
            The Pro tier at $49/month is a recurring monthly charge billed
            automatically each month until you cancel. The Free tier is available
            indefinitely with no billing required. Custom plans are arranged
            separately — contact us for details.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            5. Business-Case Outputs
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            Viableo&apos;s outputs — verdicts, scenario tables, confidence scores,
            sensitivity analyses, and narrative summaries — are estimates produced
            from the inputs you supplied. They are intended for decision support
            and are not financial advice, investment advice, or guarantees of
            future performance.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            You are responsible for the accuracy of the inputs you provide.
            Viableo does not verify your assumptions. The quality of the output
            depends entirely on the quality of the input.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            6. Client Sharing
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            You may share business-case reports with your clients using the share
            link feature. The share link grants read-only access to the report.
            You may revoke a share link at any time. Shared reports may display
            your branding if you are on a plan that includes that feature.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            You are responsible for how you present shared reports to your
            clients. You may not alter the underlying numbers in a way that
            misrepresents the analysis. If a number does not support the case,
            that is information, not an error to correct.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            7. Acceptable Use
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            You may not resell individual cases or access to the service. You may
            not scrape, crawl, or extract Viableo&apos;s computed results, logic, or
            benchmark data through automated means. You may not use the service
            for any unlawful purpose or in any way that could damage, disable, or
            impair the service.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            You may not attempt to gain unauthorized access to our systems or
            other users&apos; accounts. You may not use the service to generate
            misleading financial projections for fraudulent purposes.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            8. Intellectual Property
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            Viableo and its original content, features, and functionality are
            owned by Viableo and are protected by copyright, trademark, and other
            intellectual property laws. Your business-case inputs and the
            resulting outputs remain your data.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            You are granted a limited, non-exclusive, non-transferable license to
            use Viableo for its intended purpose. This license terminates when
            your subscription ends or your account is closed.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            9. Disclaimers
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            Viableo is provided as-is. We make no warranties, express or implied,
            regarding the service, including but not limited to warranties of
            merchantability, fitness for a particular purpose, or non-infringement.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            We do not warrant that the service will be uninterrupted, timely,
            secure, or error-free. The analytical outputs are estimates and should
            not be treated as financial advice, accounting advice, or legal advice.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            10. Liability
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            To the maximum extent permitted by applicable law, Viableo shall not
            be liable for any indirect, incidental, special, consequential, or
            punitive damages arising from your use of the service. Our total
            liability for any claim shall not exceed the amount you paid us in
            the twelve months preceding the claim.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            You remain solely responsible for decisions made on the basis of
            Viableo reports, including decisions to share those reports with
            clients and the commercial outcomes of any project you undertake.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            11. Termination
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            You may stop using the service at any time. You may cancel your
            subscription at any time; cancellation takes effect at the end of
            your current billing period. We reserve the right to suspend or
            terminate your account if you violate these terms, with reasonable
            notice where possible.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            Upon termination, your right to use the service ends. Provisions
            that by their nature should survive — including intellectual property,
            liability limitations, and disclaimers — will continue to apply.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            12. Changes
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            We may update these terms from time to time. When we do, we will
            revise the date at the top of this page. For material changes — such
            as pricing, acceptable use, or liability — we will notify active
            account holders by email at least seven days before the change takes
            effect.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            Continued use of the service after the effective date of a change
            constitutes acceptance of the updated terms. If you do not agree
            with a change, you should cancel your subscription before the change
            takes effect.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            13. Governing Law
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            These terms are governed by and construed in accordance with the
            laws of the jurisdiction in which Viableo operates, without regard
            to its conflict-of-law provisions. Any disputes arising under these
            terms shall be resolved in the courts of that jurisdiction.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#111]/50">
            If any provision of these terms is found to be unenforceable, the
            remaining provisions will continue in full force and effect.
          </p>

          <h2 className="mt-8 pt-8 border-t border-[#111]/[0.06] text-[18px] font-medium text-[#111]">
            14. Contact
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#111]/50">
            Questions about these terms should be sent to{' '}
            <a href="mailto:terms@viableo.com" className="text-[#111] underline underline-offset-2 decoration-[#111]/20 hover:decoration-[#111]/60 hover:text-[#111]/70">
              terms@viableo.com
            </a>. For how we handle your data, see the{' '}
            <InlineLink href="/privacy">Privacy Policy</InlineLink>.
          </p>
        </article>
      </section>

      <section className="border-t border-[#111]/[0.06] py-10">
        <div className="mx-auto max-w-[760px] px-6 md:px-12">
          <p className="text-[13px] leading-[1.6] text-[#111]/30">
            © 2026 Viableo. All rights reserved.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
