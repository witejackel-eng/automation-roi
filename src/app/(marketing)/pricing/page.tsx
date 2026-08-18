/**
 * /pricing — the real, indexable pricing page (Master Spec §7, §8, §9).
 *
 * Server component so the tier names, prices, and feature lists are crawlable.
 * The interactive PricingView (tier selection + Whop activation) is a client
 * component rendered inside.
 *
 * Pricing (Master Spec §55 — launch pricing, one-time):
 *   Free $0 · Pro $149 · Agency $249 (recommended) · Agency Pro $499
 */
import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { PricingView } from '@/components/views/pricing-view';
import { COMPANY_NAME, PRODUCT_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'One price. Yours forever. Start free, pay once when you\u2019re ready to save, export, or brand a report. Free $0, Pro $149, Agency $249, Agency Pro $499 — one-time.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Viableo',
    description:
      'One price. Yours forever. Start free, pay once. Free $0, Pro $149, Agency $249, Agency Pro $499.',
    url: '/pricing',
  },
  twitter: {
    card: 'summary',
    title: 'Pricing | Viableo',
    description: 'One price. Yours forever. Free $0, Pro $149, Agency $249, Agency Pro $499.',
  },
};

export default function PricingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Pricing', item: '/pricing' },
    ],
  };
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingView />
    </MarketingShell>
  );
}
