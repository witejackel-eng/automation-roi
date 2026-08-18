/**
 * /admin/entitlements — Superadmin Entitlements view (Agent 2).
 *
 * First action: requireSuperAdmin(). Privacy boundary enforced by
 * src/lib/admin/operational-queries.ts — every select clause names
 * only operational fields, never Project.inputs/results, never AI
 * prompt/response content, never Share/ShareApproval content beyond
 * engagement counts.
 */
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { listEntitlementsForAdmin } from '@/lib/admin/operational-queries';
import { AdminShell } from '@/app/admin/_components/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminEntitlementsPage() {
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
  const ents = await listEntitlementsForAdmin();
  return (
    <AdminShell title="Entitlements">
    {ents.length === 0 ? (
      <p className="text-sm text-muted-foreground">No organizations yet.</p>
    ) : (
      <div className="rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Organization</th>
              <th className="p-2 text-left">Cached tier (License)</th>
              <th className="p-2 text-left">Sub tier (source)</th>
              <th className="p-2 text-left">Sub status</th>
              <th className="p-2 text-left">Plan key</th>
              <th className="p-2 text-left">Period end</th>
            </tr>
          </thead>
          <tbody>
            {ents.map((e) => (
              <tr key={e.organizationId} className="border-t">
                <td className="p-2 font-medium">{e.organizationName}</td>
                <td className="p-2 font-mono">{e.cachedTier}</td>
                <td className="p-2 font-mono">{e.subscriptionTier ?? '-'}</td>
                <td className="p-2 font-mono">{e.subscriptionStatus ?? '-'}</td>
                <td className="p-2 font-mono text-xs">{e.planKey ?? '-'}</td>
                <td className="p-2 text-xs">{e.currentPeriodEnd?.toISOString() ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    </AdminShell>
  );
}
