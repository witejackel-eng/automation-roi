import type { Metadata } from 'next';
import { SkyddaHomepage } from '@/components/marketing/skydda-homepage';
import { COMPANY_NAME, PRODUCT_NAME } from '@/lib/brand';

/**
 * Viableo — the marketing homepage.
 *
 * Skydda frontend transplant: the homepage now mirrors the supplied Skydda
 * template structure (full-viewport hero with nav inside, trust strip,
 * problem, solution with real product UI, features grid, proof section,
 * pricing, FAQ, final CTA, footer). All content remains Automation ROI;
 * only the structural/visual implementation is transplanted.
 *
 * Server component — preserves the JSON-LD + canonical metadata for SEO.
 */
import { siteUrl } from '@/lib/site-url';

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SkyddaHomepage />
    </>
  );
}
