/**
 * /admin/events — Superadmin System Events view (Agent 2).
 *
 * First action: requireSuperAdmin(). Privacy boundary enforced by
 * src/lib/admin/operational-queries.ts — every select clause names
 * only operational fields, never Project.inputs/results, never AI
 * prompt/response content, never Share/ShareApproval content beyond
 * engagement counts.
 */
import { requireSuperAdmin } from '@/lib/auth';
import { getRecentSystemEvents } from '@/lib/admin/operational-queries';
import { AdminShell } from '@/app/admin/_components/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  await requireSuperAdmin();
  const events = await getRecentSystemEvents(500);
  return (
    <AdminShell title="System Events">
    {events.length === 0 ? (
      <p className="text-sm text-muted-foreground">No events recorded yet.</p>
    ) : (
      <div className="rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Event type</th>
              <th className="p-2 text-left">Severity</th>
              <th className="p-2 text-left">Org</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-2 font-mono">{e.eventType}</td>
                <td className="p-2 font-mono">{e.severity}</td>
                <td className="p-2 font-mono text-xs">{e.organizationId ?? '-'}</td>
                <td className="p-2 font-mono text-xs">{e.userId ?? '-'}</td>
                <td className="p-2 text-xs">{e.createdAt.toISOString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    </AdminShell>
  );
}
