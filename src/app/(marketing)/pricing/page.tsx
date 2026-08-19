/**
 * /pricing — the real, indexable pricing page (Master Spec §7, §8, §9).
 *
 * Server component so the tier names, prices, and feature lists are crawlable.
 * The PricingView (tier cards + CTAs) is rendered inside.
 *
 * Pricing (one-time, sourced from `PRICING_TIERS` in brand.ts):
 *   Free $0 · Case pack $39 per case · Agency $249 · Agency Pro $499
 *
 * The metadata description, JSON-LD offers, and rendered cards all read from
 * the SAME `PRICING_TIERS` source of truth, so this page can never drift from
 * brand.ts again (P0-7 guard).
 */
import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { PricingView } from '@/components/views/pricing-view';
import { COMPANY_NAME, PRODUCT_NAME, PRICING_TIERS } from '@/lib/brand';

const PRICING_DESCRIPTION =
  '$0 / $39 per case / $249 / $499 \u2014 one-time. Pay once per case, or once for unlimited cases.';

export const metadata: Metadata = {
  title: 'Pricing',
  description: PRICING_DESCRIPTION,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Viableo',
    description: PRICING_DESCRIPTION,
    url: '/pricing',
  },
  twitter: {
    card: 'summary',
    title: 'Pricing | Viableo',
    description: PRICING_DESCRIPTION,
  },
};

export default function PricingPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Pricing', item: '/pricing' },
    ],
  };

  // JSON-LD offers — sourced from PRICING_TIERS so the structured data cannot
  // diverge from the cards on the same page. Matches the layout.tsx
  // SoftwareApplication.offers schema (prices 0/39/249/499, USD).
  const offersJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${COMPANY_NAME} \u2014 ${PRODUCT_NAME}`,
    description: PRICING_DESCRIPTION,
    brand: { '@type': 'Brand', name: COMPANY_NAME },
    offers: PRICING_TIERS.map((t) => ({
      '@type': 'Offer',
      name: t.name,
      // t.price is the display string ("$0", "$39", "$249", "$499"); schema.org
      // wants a numeric string. Strip everything that is not a digit or dot.
      price: t.price.replace(/[^0-9.]/g, ''),
      priceCurrency: 'USD',
    })),
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offersJsonLd) }}
      />
      <PricingView />
    </MarketingShell>
  );
}
