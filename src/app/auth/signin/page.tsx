'use client';

/**
 * Sign-in page — supports GitHub OAuth + dev credentials.
 */
import * as React from 'react';
import { signIn } from 'next-auth/react';
import { Github } from 'lucide-react';
import { COMPANY_NAME, PRODUCT_NAME } from '@/lib/brand';

export default function SignInPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink">
            {COMPANY_NAME}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Sign in to {PRODUCT_NAME}
          </p>
        </div>

        {/* GitHub OAuth */}
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            signIn('github', { callbackUrl: '/' });
          }}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-raised disabled:opacity-50"
        >
          <Github className="size-5" />
          Continue with GitHub
        </button>

        {/* Dev credentials fallback */}
        {isDev && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-canvas px-2 text-ink-muted">dev only</span>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                setLoading(true);
                signIn('credentials', { email, callbackUrl: '/' });
              }}
              className="space-y-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@viableo.app"
                className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-lg bg-ink px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-ink/90 disabled:opacity-50"
              >
                Sign in with email (dev)
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
