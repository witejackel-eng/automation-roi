'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

/**
 * Liquid Glass sign-in page.
 *
 * Visual structure from liquid-glass-login-page.zip: full-screen glass
 * card with floating glass orbs, backdrop-blur, white-on-glass text.
 * Adapted to Viableo's dark editorial palette (near-black canvas,
 * amber accent, off-white text).
 *
 * Buttons wired to existing NextAuth Google + GitHub providers.
 * No fake email/password form (per SITE_COPY.md).
 */
export default function SignInPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = (provider: 'google' | 'github') => {
    setLoading(provider);
    signIn(provider, { callbackUrl: '/start' });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4">
      {/* Atmospheric background — amber radial glow + subtle grid */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(245, 181, 68, 0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(244, 244, 245, 1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating glass orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/4 top-1/4 h-32 w-32 animate-pulse rounded-full opacity-30"
          style={{
            background: 'rgba(245, 181, 68, 0.15)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '2px solid rgba(245, 181, 68, 0.2)',
            boxShadow: '0 8px 32px rgba(245, 181, 68, 0.1)',
          }}
        />
        <div
          className="absolute right-1/4 top-3/4 h-24 w-24 animate-pulse rounded-full opacity-20 delay-1000"
          style={{
            background: 'rgba(244, 244, 245, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '2px solid rgba(244, 244, 245, 0.15)',
          }}
        />
        <div
          className="absolute right-1/3 top-1/2 h-16 w-16 animate-pulse rounded-full opacity-25 delay-500"
          style={{
            background: 'rgba(245, 181, 68, 0.12)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '2px solid rgba(245, 181, 68, 0.15)',
          }}
        />
      </div>

      {/* Glass card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'rgba(19, 19, 22, 0.6)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(244, 244, 245, 0.1)',
          boxShadow:
            '0 32px 80px rgba(0, 0, 0, 0.4), 0 16px 64px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(244, 244, 245, 0.05)',
        }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-ink">
            Sign in to Viableo
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Continue with your work account
          </p>
        </div>

        {/* Provider buttons */}
        <div className="space-y-3">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleSignIn('google')}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-ink/10 bg-ink/5 px-4 py-3 text-sm font-medium text-ink transition-all hover:bg-ink/10 active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading === 'google' ? 'Connecting…' : 'Continue with Google'}
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleSignIn('github')}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-ink/10 bg-ink/5 px-4 py-3 text-sm font-medium text-ink transition-all hover:bg-ink/10 active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {loading === 'github' ? 'Connecting…' : 'Continue with GitHub'}
          </button>
        </div>

        {/* Helper text */}
        <p className="mt-6 text-center text-xs text-ink-faint">
          Free to start. Full analytical rigor on the free tier.
        </p>
      </div>
    </div>
  );
}
