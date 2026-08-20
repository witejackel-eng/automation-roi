'use client';

/**
 * AppShellAuthIndicator — compact auth display for the /start left rail.
 *
 * Shows the signed-in user's initial/avatar + a sign-out button. If the
 * user is a SUPERADMIN, shows an "Admin" link.
 */
import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

interface SessionWithRole {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  systemRole?: string;
}

export function AppShellAuthIndicator() {
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = React.useState(false);

  const s = session as SessionWithRole | null;
  const isAuthenticated = status === 'authenticated' && !!s?.user;
  const isSuperadmin = s?.systemRole === 'SUPERADMIN';

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/signin"
        className="text-[10px] text-ink-muted hover:text-ink"
      >
        Sign in
      </Link>
    );
  }

  const email = s?.user?.email ?? '';
  const initials = (s?.user?.name ?? email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('') || '?';

  return (
    <>
      {/* Avatar */}
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-xs font-semibold text-ink"
        title={email}
      >
        {s?.user?.image ? (
           
          <img src={s.user.image} alt="" className="h-8 w-8 rounded-full" />
        ) : (
          initials
        )}
      </div>

      {/* Superadmin link */}
      {isSuperadmin && (
        <Link
          href="/admin"
          className="flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-500"
          title="Admin Control Center"
        >
          <Shield className="h-3 w-3" />
          Admin
        </Link>
      )}

      {/* Sign out */}
      <button
        type="button"
        disabled={signingOut}
        onClick={async () => {
          setSigningOut(true);
          await signOut({ callbackUrl: '/' });
        }}
        className="text-[10px] text-ink-muted hover:text-ink"
      >
        {signingOut ? '…' : 'Sign out'}
      </button>
    </>
  );
}
