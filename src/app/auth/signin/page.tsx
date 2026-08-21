'use client';

import { signIn } from 'next-auth/react';
import { useState, useCallback } from 'react';
import Link from 'next/link';

/**
 * /auth/signin — liquid-glass sign-in surface.
 *
 * OAuth-only (Google + GitHub). No email/password, no magic links.
 * On success the user lands in the authenticated workspace (/start).
 *
 * Visual language: soft pastel gradient background (lavender / rose / soft
 * blue), frosted glass card with high backdrop blur, amber accent for the
 * "Continue with" treatment, large hit-target provider buttons. Distinct
 * from both the cream marketing site and the dark product shell.
 */
export default function SignInPage() {
  const [loading, setLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(provider);
    try {
      // signIn redirects to the provider; the callbackUrl brings the user
      // back into the authenticated workspace after successful auth.
      const result = await signIn(provider, { callbackUrl: '/start' });
      // signIn returns null only on error (it otherwise redirects away).
      if (result === null) {
        setError('Sign-in was cancelled or failed. Please try again.');
        setLoading(null);
      }
      // If result is undefined or a redirect object, the browser is navigating
      // away — leave the loading state on so the button stays disabled.
    } catch (err) {
      console.error('[signin] provider error', provider, err);
      setError('Unable to reach the sign-in provider. Check your connection and try again.');
      setLoading(null);
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        // Soft pastel multi-stop gradient — lavender → rose → soft blue.
        // No image dependency (the old /images/watercolor-background.jpg
        // could 404 in fresh deployments).
        background:
          'linear-gradient(135deg, #E0E7FF 0%, #FCE7F3 35%, #DBEAFE 70%, #EDE9FE 100%)',
      }}
    >
      {/* Floating glass orbs — subtle depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute top-[18%] left-[20%] w-40 h-40 rounded-full opacity-50"
          style={{
            background: 'rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(255, 255, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        />
        <div
          className="absolute top-[68%] right-[22%] w-28 h-28 rounded-full opacity-40"
          style={{
            background: 'rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(255, 255, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        />
        <div
          className="absolute top-[45%] right-[35%] w-20 h-20 rounded-full opacity-35"
          style={{
            background: 'rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        />
      </div>

      {/* Glass card */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-[28px] p-8 sm:p-10"
        style={{
          background: 'rgba(255, 255, 255, 0.30)',
          backdropFilter: 'blur(40px) saturate(220%)',
          WebkitBackdropFilter: 'blur(40px) saturate(220%)',
          border: '1px solid rgba(255, 255, 255, 0.45)',
          boxShadow:
            '0 32px 80px rgba(31, 38, 135, 0.18), 0 16px 48px rgba(255, 255, 255, 0.20), inset 0 2px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Viableo mark */}
        <div className="flex justify-center mb-7">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl"
            style={{
              background: 'linear-gradient(135deg, #FF164B 0%, #E00E3E 100%)',
              boxShadow: '0 8px 24px rgba(255, 22, 75, 0.35)',
            }}
            aria-hidden
          >
            V
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2 mb-7">
          <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: 'rgba(20, 17, 14, 0.92)' }}>
            Sign in to Viableo
          </h1>
          <p className="text-[14px]" style={{ color: 'rgba(20, 17, 14, 0.62)' }}>
            Continue to your automation decision workspace
          </p>
        </div>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full" style={{ borderTop: '1px solid rgba(20, 17, 14, 0.12)' }} />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.55)',
                color: 'rgba(20, 17, 14, 0.5)',
              }}
            >
              Or continue with
            </span>
          </div>
        </div>

        {/* Provider buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSignIn('google')}
            disabled={loading !== null}
            aria-label="Continue with Google"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.5)',
              background: 'rgba(255, 255, 255, 0.55)',
              color: 'rgba(20, 17, 14, 0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 2.43-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading === 'google' ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />
                Connecting…
              </span>
            ) : (
              'Continue with Google'
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSignIn('github')}
            disabled={loading !== null}
            aria-label="Continue with GitHub"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              border: '1px solid rgba(20, 17, 14, 0.12)',
              background: 'rgba(20, 17, 14, 0.92)',
              color: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {loading === 'github' ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />
                Connecting…
              </span>
            ) : (
              'Continue with GitHub'
            )}
          </button>
        </div>

        {/* Error message — calm, actionable */}
        {error ? (
          <div
            role="alert"
            className="mt-5 px-4 py-3 rounded-xl text-[13px] text-center"
            style={{
              background: 'rgba(255, 22, 75, 0.08)',
              border: '1px solid rgba(255, 22, 75, 0.25)',
              color: 'rgba(127, 29, 29, 0.9)',
            }}
          >
            {error}
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-7 text-center space-y-2">
          <p className="text-[12px]" style={{ color: 'rgba(20, 17, 14, 0.55)' }}>
            Free to start. Full analytical rigor on the free tier.
          </p>
          <p className="text-[12px]" style={{ color: 'rgba(20, 17, 14, 0.45)' }}>
            <Link
              href="/start?start=1"
              className="underline underline-offset-2 hover:text-[rgba(20,17,14,0.75)] transition-colors"
            >
              Start your first case
            </Link>
            {' · '}
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-[rgba(20,17,14,0.75)] transition-colors"
            >
              Terms
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
