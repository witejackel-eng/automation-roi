'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * Liquid Glass error page.
 *
 * Same visual language as the sign-in page: glass card on dark canvas
 * with floating orbs. Shows the auth error + a retry button.
 */
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(248, 113, 113, 0.06) 0%, transparent 70%)',
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

      {/* Glass card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'rgba(19, 19, 22, 0.6)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(244, 244, 245, 0.1)',
          boxShadow:
            '0 32px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(244, 244, 245, 0.05)',
        }}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Sign-in error
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {message} Please try again.
          </p>
        </div>

        <Link
          href="/auth/signin"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-canvas transition-all hover:bg-ink/90 active:scale-[0.98]"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
