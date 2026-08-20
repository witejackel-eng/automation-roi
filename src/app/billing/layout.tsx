import type { Metadata } from 'next';

/**
 * /billing — billing/checkout surfaces. NEVER indexable.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
