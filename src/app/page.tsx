import type { Metadata } from 'next';
import { ComputeHomepage } from '@/components/marketing/compute/compute-homepage';
import { ComputeMarketingShell } from '@/components/marketing/compute/shell';
import { COMPANY_NAME, PRODUCT_NAME } from '@/lib/brand';
import { siteUrl } from '@/lib/site-url';

/**
 * Viableo — the marketing homepage.
 *
 * COMPUTE template transplant: the homepage is rebuilt from scratch using
 * the COMPUTE visual system (near-black canvas, oversized serif display,
 * monospace metadata, 12-col asymmetric grids, numbered sections, real Apex
 * engine numbers). All content remains Automation ROI.
 *
 * Server component — preserves the JSON-LD + canonical metadata for SEO.
 */
const SITE_URL = siteUrl();

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
    <ComputeMarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComputeHomepage />
    </ComputeMarketingShell>
  );
}
