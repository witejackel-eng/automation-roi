import type { Metadata } from 'next';

/**
 * /auth — authentication screens. NEVER indexable.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
