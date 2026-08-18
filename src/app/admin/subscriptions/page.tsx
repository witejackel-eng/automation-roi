/**
 * /admin/subscriptions — Superadmin Subscriptions view (Agent 2).
 *
 * First action: requireSuperAdmin(). Privacy boundary enforced by
 * src/lib/admin/operational-queries.ts — every select clause names
 * only operational fields, never Project.inputs/results, never AI
 * prompt/response content, never Share/ShareApproval content beyond
 * engagement counts.
 */
import { requireSuperAdmin } from '@/lib/auth';
import { listSubscriptionsForAdmin } from '@/lib/admin/operational-queries';
import { AdminShell } from '@/app/admin/_components/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  await requireSuperAdmin();
  const subs = await listSubscriptionsForAdmin();
  return (
    <AdminShell title="Subscriptions">
    {subs.length === 0 ? (
      <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
    ) : (
      <div className="rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Org</th>
              <th className="p-2 text-left">Tier</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Plan key</th>
              <th className="p-2 text-left">Period end</th>
              <th className="p-2 text-left">Cancel at EOP</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2 font-medium">{s.organization.name}</td>
                <td className="p-2 font-mono">{s.tier}</td>
                <td className="p-2 font-mono">{s.status}</td>
                <td className="p-2 font-mono text-xs">{s.planKey}</td>
                <td className="p-2 text-xs">{s.currentPeriodEnd?.toISOString() ?? '-'}</td>
                <td className="p-2 font-mono">{s.cancelAtPeriodEnd ? 'yes' : 'no'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    </AdminShell>
  );
}
