/**
 * /admin/audit — Superadmin Audit Log view (Agent 2).
 *
 * First action: requireSuperAdmin(). Privacy boundary enforced by
 * src/lib/admin/operational-queries.ts — every select clause names
 * only operational fields, never Project.inputs/results, never AI
 * prompt/response content, never Share/ShareApproval content beyond
 * engagement counts.
 */
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { listAuditLogForAdmin } from '@/lib/admin/operational-queries';
import { AdminShell } from '@/app/admin/_components/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
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
  const audit = await listAuditLogForAdmin({});
  return (
    <AdminShell title="Audit Log">
    {audit.length === 0 ? (
      <p className="text-sm text-muted-foreground">No audit entries yet.</p>
    ) : (
      <div className="rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Actor role</th>
              <th className="p-2 text-left">Target</th>
              <th className="p-2 text-left">Reason</th>
              <th className="p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2 font-mono">{a.action}</td>
                <td className="p-2 font-mono">{a.actorRole}</td>
                <td className="p-2 font-mono text-xs">{a.targetType ?? '-'} {a.targetId ?? ''}</td>
                <td className="p-2 text-xs">{a.reason ?? '-'}</td>
                <td className="p-2 text-xs">{a.createdAt.toISOString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    </AdminShell>
  );
}
