/**
 * /admin — Superadmin overview dashboard (Agent 2).
 *
 * First action: requireSuperAdmin(). Per Agent 2 master prompt §6.1,
 * this is the actual authorization decision (the proxy.ts edge layer
 * is a UX/defense-in-depth layer, NOT the security decision itself).
 *
 * Shows: counts of organizations, projects, payments, recent webhook
 * errors, recent system events. Operational metadata only — no
 * customer financial content (Project.inputs/results are structurally
 * absent from the operational-queries module's select clauses).
 */
import { requireSuperAdmin } from '@/lib/auth';
import {
  getEventCountsByTypeAndDay,
  getRecentWebhookErrors,
  getRecentSystemEvents,
  listOrganizationsForAdmin,
  listPaymentsForAdmin,
} from '@/lib/admin/operational-queries';
import { AdminShell } from '@/app/admin/_components/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  await requireSuperAdmin();

  const [orgs, payments, eventCounts, recentEvents, webhookErrors] = await Promise.all([
    listOrganizationsForAdmin(),
    listPaymentsForAdmin(),
    getEventCountsByTypeAndDay(30),
    getRecentSystemEvents(20),
    getRecentWebhookErrors(10),
  ]);

  return (
    <AdminShell title="Overview">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Organizations" value={orgs.length} />
        <MetricCard
          label="Active subscriptions"
          value={orgs.filter((o) => o.subscriptions[0]?.status === 'active').length}
        />
        <MetricCard label="Payments (all-time)" value={payments.length} />
        <MetricCard
          label="Webhook errors (last 10)"
          value={webhookErrors.length}
          tone={webhookErrors.length > 0 ? 'warn' : 'ok'}
        />
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Event counts (last 30 days)</h2>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {eventCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events recorded yet.</p>
          ) : (
            eventCounts.map((e) => (
              <div key={e.eventType} className="flex justify-between rounded border p-3">
                <span className="font-mono text-sm">{e.eventType}</span>
                <span className="font-mono text-sm font-semibold">{e.count}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Recent system events</h2>
        <div className="rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-left">Event type</th>
                <th className="p-2 text-left">Severity</th>
                <th className="p-2 text-left">Org</th>
                <th className="p-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No events.</td></tr>
              ) : (
                recentEvents.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="p-2 font-mono">{e.eventType}</td>
                    <td className="p-2 font-mono">{e.severity}</td>
                    <td className="p-2 font-mono text-xs">{e.organizationId ?? '-'}</td>
                    <td className="p-2 text-xs">{e.createdAt.toISOString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

function MetricCard({ label, value, tone = 'ok' }: { label: string; value: number; tone?: 'ok' | 'warn' | 'error' }) {
  const toneClass = tone === 'warn' ? 'border-yellow-400' : tone === 'error' ? 'border-red-500' : '';
  return (
    <div className={`rounded border bg-card p-4 ${toneClass}`}>
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
