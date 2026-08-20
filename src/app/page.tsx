/**
 * Viableo marketing homepage — agentic template structure with Viableo copy.
 *
 * Per the ZAI_MASTER_FRONTEND_REBUILD_PROMPT Phase 4:
 * - Structural pattern from agentic-build-and-orchestrate-ai-agents-while-you-sleep.zip
 * - All copy from copy/SITE_COPY.md
 * - All financial numbers from the live golden-case engine
 * - Dark editorial palette (near-black canvas, amber accent)
 * - CTAs wired to real Viableo routes
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ComputeMarketingShell } from '@/components/marketing/compute/shell';
import { COMPANY_NAME, PRODUCT_NAME } from '@/lib/brand';
import { siteUrl } from '@/lib/site-url';
import { AgenticHomepage } from '@/components/marketing/agentic/agentic-homepage';

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
      <AgenticHomepage />
    </ComputeMarketingShell>
  );
}
