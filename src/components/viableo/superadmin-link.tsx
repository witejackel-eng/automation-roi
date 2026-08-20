'use client';

/**
 * SuperadminLink — conditionally renders an Admin entry for SUPERADMIN users.
 *
 * Per the master directive: "When the authenticated user has systemRole ===
 * SUPERADMIN show an Admin/Control Center entry in the authenticated product
 * navigation/profile menu. Normal users MUST NOT see this."
 *
 * This is a UX affordance ONLY. The backend `/admin/*` routes are protected
 * by `requireSuperAdmin()` server-side (src/lib/auth.ts) — frontend hiding is
 * not a security boundary. A non-superadmin who manually visits /admin gets a
 * 403 from the server.
 *
 * Fetches the NextAuth session client-side (`/api/auth/session` returns the
 * session JSON including `systemRole`). Renders nothing while loading or if
 * the user is not a superadmin.
 */
import * as React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionShape {
  systemRole?: string;
}

export function SuperadminLink({ className }: { className?: string }) {
  const [isSuperadmin, setIsSuperadmin] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((session: SessionShape | null) => {
        if (active && session?.systemRole === 'SUPERADMIN') {
          setIsSuperadmin(true);
        }
      })
      .catch(() => {
        // Not authenticated or session endpoint unavailable — render nothing.
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Don't render until we've confirmed the role (prevents flash for non-admins).
  if (!loaded || !isSuperadmin) return null;

  return (
    <Link
      href="/admin"
      className={cn(
        'group relative flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-md py-2 text-[10px] font-medium transition-colors duration-hover',
        'text-ink-muted hover:bg-surface-raised hover:text-ink',
        className,
      )}
      title="Admin Control Center"
      aria-label="Admin Control Center (superadmin only)"
    >
      <Shield className="size-5 text-amber-500" strokeWidth={1.75} aria-hidden="true" />
      <span>Admin</span>
    </Link>
  );
}
