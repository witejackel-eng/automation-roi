'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get('error');

  const errorMessages: Record<string, string> = {
    OAuthSignin: 'OAuth sign-in failed.',
    OAuthCallback: 'OAuth callback failed.',
    OAuthCreateAccount: 'Could not create an account.',
    EmailCreateAccount: 'Could not create an account.',
    Callback: 'Authentication callback failed.',
    AccessDenied: 'Access was denied.',
    Configuration: 'Authentication is not configured correctly.',
    Verification: 'The sign-in link expired or was already used.',
    default: 'Something went wrong with authentication.',
  };

  const message = errorMessages[error ?? 'default'] ?? errorMessages.default;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('/images/templates/gradient-background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.15)' }} />

      {/* Floating glass orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-24 h-24 rounded-full opacity-40 animate-pulse delay-500" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px) saturate(180%)', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.4)' }} />
      </div>

      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(40px) saturate(250%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.3), 0 16px 64px rgba(255, 255, 255, 0.2), inset 0 3px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.3)',
        }}
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.15)' }}>
            <svg className="h-6 w-6" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>Sign-in error</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{message} Please try again.</p>
        </div>

        <Link
          href="/auth/signin"
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]"
          style={{ background: 'rgba(255,255,255,0.9)', color: '#111' }}
        >
          Try again
        </Link>
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all mt-2 hover:bg-white/10"
          style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }}
        >
          Return to Viableo
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return <Suspense><ErrorContent /></Suspense>;
}
