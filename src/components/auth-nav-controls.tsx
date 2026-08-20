'use client';

/**
 * AuthNavControls — shared auth-state display for the navigation.
 *
 * Used by both the marketing ComputeNavigation and the /start AppShell.
 * Shows:
 *   - If authenticated: avatar/initials + email + Sign out button
 *     (+ Admin link if systemRole === 'SUPERADMIN')
 *   - If unauthenticated: Sign in link
 *
 * Uses useSession() from next-auth/react so the UI reacts to auth state
 * changes in real time (sign-in, sign-out, session expiry).
 */
import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SessionWithRole {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  systemRole?: string;
}

export function AuthNavControls({
  className,
  variant = 'dark',
}: {
  className?: string;
  variant?: 'dark' | 'light';
}) {
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = React.useState(false);

  const s = session as SessionWithRole | null;
  const isAuthenticated = status === 'authenticated' && !!s?.user;
  const isSuperadmin = s?.systemRole === 'SUPERADMIN';

  const textColor = variant === 'dark'
    ? 'text-white'
    : 'text-ink';
  const mutedColor = variant === 'dark'
    ? 'text-white/60 hover:text-white'
    : 'text-ink-muted hover:text-ink';
  const buttonBg = variant === 'dark'
    ? 'bg-white text-black hover:bg-white/90'
    : 'bg-ink text-canvas hover:bg-ink/90';

  if (!isAuthenticated) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Link
          href="/auth/signin"
          className={cn('text-sm transition-colors', mutedColor)}
        >
          Sign in
        </Link>
        <Link
          href="/start?start=1"
          className={cn(
            'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all',
            buttonBg,
          )}
        >
          Run your first case
        </Link>
      </div>
    );
  }

  // Authenticated — show avatar + email + sign out
  const email = s?.user?.email ?? '';
  const initials = (s?.user?.name ?? email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('') || '?';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Superadmin badge */}
      {isSuperadmin && (
        <Link
          href="/admin"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
            variant === 'dark'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Admin
        </Link>
      )}

      {/* User avatar + email */}
      <div className={cn('flex items-center gap-2', textColor)}>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
            variant === 'dark'
              ? 'bg-white/10 text-white'
              : 'bg-ink/10 text-ink',
          )}
          title={email}
        >
          {s?.user?.image ? (
             
            <img src={s.user.image} alt="" className="h-8 w-8 rounded-full" />
          ) : (
            initials
          )}
        </div>
        <span className={cn('hidden text-sm lg:inline', mutedColor)}>
          {s?.user?.name ?? email}
        </span>
      </div>

      {/* Sign out */}
      <button
        type="button"
        disabled={signingOut}
        onClick={async () => {
          setSigningOut(true);
          await signOut({ callbackUrl: '/' });
        }}
        className={cn(
          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
          variant === 'dark'
            ? 'text-white/60 hover:bg-white/10 hover:text-white'
            : 'text-ink-muted hover:bg-ink/5 hover:text-ink',
        )}
      >
        {signingOut ? '…' : 'Sign out'}
      </button>
    </div>
  );
}
