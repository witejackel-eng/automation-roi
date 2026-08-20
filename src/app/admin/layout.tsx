import type { Metadata } from 'next';

/**
 * /admin — protected superadmin control center. NEVER indexable.
 * Server-side requireSuperAdmin() remains authoritative for authorization;
 * this metadata only prevents crawling/indexing.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
