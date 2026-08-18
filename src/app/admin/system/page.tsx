/**
 * /admin/system — operational health (Agent 2).
 *
 * First action: requireSuperAdmin().
 *
 * Shows: env-var presence (never values), DB connectivity, webhook
 * errors, latency aggregates from SystemEvent metadata. Operational
 * metadata only — no customer financial content.
 */
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  checkEnvConfig,
  checkDbConnectivity,
  getRecentWebhookErrors,
  getEventCountsByTypeAndDay,
} from '@/lib/admin/operational-queries';
import { AdminShell } from '@/app/admin/_components/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminSystemPage() {
  try {
    await requireSuperAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      // Defense-in-depth: the middleware should already have redirected
      // unauthenticated requests away from /admin/**. If we land here,
      // either the middleware was bypassed or the user is authenticated
      // but not a Superadmin — redirect to sign-in with an error flag.
      redirect(`/auth/signin?error=admin_required`);
    }
    throw e;
  }

  // Run health checks in parallel — each one catches its own errors
  // so a single failing check doesn't break the page render.
  const [envConfig, dbCheck, webhookErrors, eventCounts] = await Promise.all([
    Promise.resolve(checkEnvConfig()),
    checkDbConnectivity().then(() => ({ ok: true, error: null } as const)).catch((e) => ({ ok: false, error: e instanceof Error ? e.message : String(e) } as const)),
    getRecentWebhookErrors(10),
    getEventCountsByTypeAndDay(7),
  ]);

  return (
    <AdminShell title="System Health">
      <section>
        <h2 className="text-xl font-semibold mb-3">Environment configuration</h2>
        <p className="text-xs text-muted-foreground mb-2">
          Presence only — values are never surfaced.
        </p>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(envConfig).map(([k, v]) => (
            <div
              key={k}
              className={`flex justify-between rounded border p-2 ${v ? 'border-green-300' : 'border-red-300'}`}
            >
              <span className="font-mono text-sm">{k}</span>
              <span className={`font-mono text-xs ${v ? 'text-green-600' : 'text-red-600'}`}>
                {v ? 'set' : 'MISSING'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Database connectivity</h2>
        <div className={`rounded border p-4 ${dbCheck.ok ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
          <span className="font-mono">
            {dbCheck.ok ? 'OK — SELECT 1 returned' : `FAIL — ${dbCheck.error}`}
          </span>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Recent webhook errors</h2>
        {webhookErrors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No webhook errors in the recent window.</p>
        ) : (
          <div className="rounded border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 text-left">Event type</th>
                  <th className="p-2 text-left">Org</th>
                  <th className="p-2 text-left">Metadata</th>
                  <th className="p-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {webhookErrors.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="p-2 font-mono">{e.eventType}</td>
                    <td className="p-2 font-mono text-xs">{e.organizationId ?? '-'}</td>
                    <td className="p-2 font-mono text-xs">{e.metadata ?? '-'}</td>
                    <td className="p-2 text-xs">{e.createdAt.toISOString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Event counts (last 7 days)</h2>
        {eventCounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events in the last 7 days.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {eventCounts.map((e) => (
              <div key={e.eventType} className="flex justify-between rounded border p-2">
                <span className="font-mono text-sm">{e.eventType}</span>
                <span className="font-mono text-sm font-semibold">{e.count}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
