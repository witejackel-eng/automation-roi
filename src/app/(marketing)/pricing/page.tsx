import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { PricingView } from '@/components/views/pricing-view';
import { COMPANY_NAME, PRODUCT_NAME, PRICING_TIERS } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Pricing',
  description: `Starter and Pro plans. Start free with 10 cases a month — upgrade to Pro for unlimited cases and clean client documents.`,
  alternates: { canonical: '/pricing' },
  openGraph: {
    type: 'website',
    title: 'Pricing | Viableo',
    description: `Starter and Pro plans. Start free with 10 cases a month — upgrade to Pro for unlimited cases and clean client documents.`,
    url: '/pricing',
  },
  twitter: {
    card: 'summary',
    title: 'Pricing | Viableo',
    description: `Starter and Pro plans. Start free with 10 cases a month — upgrade to Pro for unlimited cases and clean client documents.`,
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

  const offersJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${COMPANY_NAME} — ${PRODUCT_NAME}`,
    description: `Starter and Pro plans. Start free with 10 cases a month — upgrade to Pro for unlimited cases and clean client documents.`,
    brand: { '@type': 'Brand', name: COMPANY_NAME },
    offers: PRICING_TIERS.map((t) => ({
      '@type': 'Offer',
      name: t.name,
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
