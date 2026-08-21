import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { PricingView } from '@/components/views/pricing-view';
import { COMPANY_NAME, PRODUCT_NAME, PRICING_TIERS } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free, Pro, and Custom plans. Start free — experience the full analytical decision process.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    type: 'website',
    title: 'Pricing | Viableo',
    description: 'Free, Pro, and Custom plans. Start free — experience the full analytical decision process.',
    url: '/pricing',
  },
  twitter: { card: 'summary', title: 'Pricing | Viableo', description: 'Free, Pro, and Custom plans.' },
};

export default function PricingPage() {
  const offersJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${COMPANY_NAME} — ${PRODUCT_NAME}`,
    description: 'Free, Pro, and Custom plans.',
    brand: { '@type': 'Brand', name: COMPANY_NAME },
    offers: PRICING_TIERS.map((t) => ({
      '@type': 'Offer',
      name: t.name,
      price: t.key === 'custom' ? '' : t.price.replace(/[^0-9.]/g, ''),
      priceCurrency: 'USD',
    })),
  };

  return (
    <MarketingShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offersJsonLd) }} />
      <PricingView />
    </MarketingShell>
  );
}
