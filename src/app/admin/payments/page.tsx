/**
 * /admin/payments — Superadmin Payments view (Agent 2).
 *
 * First action: requireSuperAdmin(). Privacy boundary enforced by
 * src/lib/admin/operational-queries.ts — every select clause names
 * only operational fields, never Project.inputs/results, never AI
 * prompt/response content, never Share/ShareApproval content beyond
 * engagement counts.
 */
import { requireSuperAdmin } from '@/lib/auth';
import { listPaymentsForAdmin } from '@/lib/admin/operational-queries';
import { AdminShell } from '@/app/admin/_components/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  await requireSuperAdmin();
  const payments = await listPaymentsForAdmin();
  return (
    <AdminShell title="Payments">
    {payments.length === 0 ? (
      <p className="text-sm text-muted-foreground">No payments yet.</p>
    ) : (
      <div className="rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Org</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Currency</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Refunded</th>
              <th className="p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2 font-medium">{p.organization.name}</td>
                <td className="p-2 font-mono">{p.amount.toString()}</td>
                <td className="p-2 font-mono">{p.currency}</td>
                <td className="p-2 font-mono">{p.status}</td>
                <td className="p-2 font-mono">{p.refundedAt ? p.refundedAmount?.toString() : '-'}</td>
                <td className="p-2 text-xs">{p.createdAt.toISOString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    </AdminShell>
  );
}
