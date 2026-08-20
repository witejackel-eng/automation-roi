import type { Metadata } from 'next';

/**
 * /start — private application route. NEVER indexable.
 * The calculator/results/projects/settings views are app surfaces, not
 * public marketing pages. Per the master directive, private routes must
 * emit robots noindex at the route level (not just robots.txt).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
