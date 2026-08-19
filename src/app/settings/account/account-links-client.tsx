'use client';

import { signIn } from 'next-auth/react';

export default function AccountLinksClient({
  provider,
  label,
}: {
  provider: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signIn(provider)}
      className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-raised"
    >
      {label}
    </button>
  );
}
