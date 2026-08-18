/**
 * /admin/customers — Superadmin Customers view (Agent 2).
 *
 * First action: requireSuperAdmin(). Privacy boundary enforced by
 * src/lib/admin/operational-queries.ts — every select clause names
 * only operational fields, never Project.inputs/results, never AI
 * prompt/response content, never Share/ShareApproval content beyond
 * engagement counts.
 */
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { listOrganizationsForAdmin } from '@/lib/admin/operational-queries';
import { AdminShell } from '@/app/admin/_components/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
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
  const orgs = await listOrganizationsForAdmin();
  return (
    <AdminShell title="Customers">
    {orgs.length === 0 ? (
      <p className="text-sm text-muted-foreground">No organizations yet.</p>
    ) : (
      <div className="rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Tier (cached)</th>
              <th className="p-2 text-left">Sub status</th>
              <th className="p-2 text-left">Projects</th>
              <th className="p-2 text-left">Members</th>
              <th className="p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-2 font-medium">{o.name}</td>
                <td className="p-2 font-mono">{o.licenses[0]?.tier ?? 'free'}</td>
                <td className="p-2 font-mono">{o.subscriptions[0]?.status ?? '-'}</td>
                <td className="p-2 font-mono">{o._count.projects}</td>
                <td className="p-2 font-mono">{o._count.memberships}</td>
                <td className="p-2 text-xs">{o.createdAt.toISOString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    </AdminShell>
  );
}
