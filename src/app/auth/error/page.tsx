'use client';

/**
 * Auth error page.
 */
import * as React from 'react';
import { signIn } from 'next-auth/react';
import { COMPANY_NAME } from '@/lib/brand';

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-ink">{COMPANY_NAME}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Something went wrong with authentication.
        </p>
        <button
          type="button"
          onClick={() => signIn()}
          className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-ink/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
