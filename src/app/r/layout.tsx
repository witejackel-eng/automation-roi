import type { Metadata } from 'next';

/**
 * /r — private client report share routes. NEVER indexable.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
