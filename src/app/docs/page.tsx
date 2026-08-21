import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { PageHero, BreadcrumbJsonLd } from '@/components/marketing/marketing-primitives';

export const metadata: Metadata = {
  title: 'Documentation — Viableo',
  description:
    'Help center for Viableo. Getting started, business cases, client workflow, account management, and security.',
  alternates: { canonical: '/docs' },
  openGraph: {
    type: 'website',
    title: 'Documentation | Viableo',
    description:
      'Help center for Viableo. Getting started, business cases, client workflow, account management, and security.',
    url: '/docs',
  },
  robots: { index: true, follow: true },
};

const SECTIONS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: 'Getting Started',
    links: [
      { label: 'What is Viableo?', href: '/docs' },
      { label: 'Run your first case', href: '/start?start=1' },
      { label: 'Understanding the verdict', href: '/methodology' },
    ],
  },
  {
    title: 'Business Cases',
    links: [
      { label: 'Scenarios', href: '/resources/automation-roi' },
      { label: 'Confidence', href: '/methodology' },
      { label: 'Stress testing', href: '/methodology' },
      { label: 'Sensitivity', href: '/methodology' },
      { label: 'ROI', href: '/resources/automation-roi' },
      { label: 'Payback', href: '/resources/automation-payback' },
    ],
  },
  {
    title: 'Client Workflow',
    links: [
      { label: 'Reports', href: '/docs#reports' },
      { label: 'Proposals', href: '/docs#proposals' },
      { label: 'Share links', href: '/docs#share-links' },
      { label: 'Approval / requested changes', href: '/docs#approval' },
      { label: 'Branding', href: '/docs#branding' },
    ],
  },
  {
    title: 'Account & Billing',
    links: [
      { label: 'Plans', href: '/pricing' },
      { label: 'Upgrading', href: '/pricing' },
      {
        label: 'Subscription management',
        href: '/docs#subscription-management',
      },
    ],
  },
  {
    title: 'Security & Privacy',
    links: [
      { label: 'Data handling', href: '/privacy' },
      { label: 'Sharing', href: '/privacy' },
      { label: 'Account security', href: '/privacy' },
    ],
  },
  {
    title: 'FAQ',
    links: [
      {
        label: 'What is a case?',
        href: '/resources/automation-business-case',
      },
      { label: 'How is ROI calculated?', href: '/resources/automation-roi' },
      { label: 'What do the verdicts mean?', href: '/methodology' },
      { label: 'How much does it cost?', href: '/pricing' },
    ],
  },
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
      <PageHero
        eyebrow="Documentation"
        title="Documentation."
      >
        <p>
          Everything you need to use Viableo effectively.
        </p>
      </PageHero>

      <div className="mx-auto max-w-[800px] px-6 md:px-12">
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="py-12 md:py-16 border-b border-[#111]/[0.06] first:pt-8"
          >
            <h2 className="text-[11px] tracking-widest text-[#111]/40 uppercase mb-6">
              {section.title}
            </h2>
            <ul className="space-y-0">
              {section.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center justify-between min-h-[44px] text-[15px] text-[#111] hover:text-[#111]/60 transition-colors"
                  >
                    <span>{link.label}</span>
                    <span className="text-[#111]/20">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </MarketingShell>
  );
}
