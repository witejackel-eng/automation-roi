import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import AccountLinksClient from './account-links-client';

export const dynamic = 'force-dynamic';

export default async function SettingsAccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const accounts = await db.account.findMany({
    where: { userId: session.user.id },
    select: { provider: true, providerAccountId: true },
  });

  const linkedProviders = new Set(accounts.map((a) => a.provider));

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-ink">Account</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Manage your sign-in providers.
      </p>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-ink">Google</p>
            <p className="text-xs text-ink-muted">
              {linkedProviders.has('google') ? 'Linked' : 'Not linked'}
            </p>
          </div>
          {!linkedProviders.has('google') && (
            <AccountLinksClient provider="google" label="Link Google" />
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-ink">GitHub</p>
            <p className="text-xs text-ink-muted">
              {linkedProviders.has('github') ? 'Linked' : 'Not linked'}
            </p>
          </div>
          {!linkedProviders.has('github') && (
            <AccountLinksClient provider="github" label="Link GitHub" />
          )}
        </div>
      </div>
    </div>
  );
}
