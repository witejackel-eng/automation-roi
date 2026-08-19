import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { ViableoHomepage } from '@/components/marketing/homepage';
import { COMPANY_NAME, PRODUCT_NAME } from '@/lib/brand';

/**
 * Viableo — the marketing homepage.
 *
 * SERVER COMPONENT. Renders the full 12-section narrative (E1–E13) as static
 * HTML. No 'use client', no useSearchParams, no Suspense bailout — the entire
 * argument is present in the server-rendered body for crawlers and for visitors
 * with JavaScript disabled.
 *
 * The application (calculator / results / projects / settings / pricing views)
 * lives at /start, reached via `<Link href="/start?start=1">` from every CTA.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://automation-roi-delta.vercel.app';

export const metadata: Metadata = {
  title: `${COMPANY_NAME} — ${PRODUCT_NAME}`,
  description:
    'Viableo takes an automation scope and returns a verdict — build it or don\u2019t — the fee where that verdict flips, and a document your client can check line by line.',
  alternates: { canonical: '/' },
  openGraph: {
    title: `${COMPANY_NAME} — ${PRODUCT_NAME}`,
    description:
      'Viableo takes an automation scope and returns a verdict — build it or don\u2019t — the fee where that verdict flips, and a document your client can check line by line.',
    url: SITE_URL,
    siteName: COMPANY_NAME,
    type: 'website',
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: COMPANY_NAME,
    url: SITE_URL,
    description:
      'The decision system that tells an automation agency whether a build is worth doing, where the answer breaks, and hands them the artifact they can defend to the client.',
  };
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViableoHomepage />
    </MarketingShell>
  );
}
