/**
 * /admin/qa — Founder QA console (Agent 2).
 *
 * First action: requireSuperAdmin().
 *
 * Lets the founder switch which synthetic tier is active on the
 * seeded QA Organization so they can exercise the tier-gating logic
 * without touching real customer entitlements.
 *
 * The QA org is a real Organization row that participates in the
 * real tenant model — no special-cased code paths. The tier-mutation
 * route handler asserts organizationId === QA_ORG_ID before allowing
 * any change, so this code path is structurally incapable of being
 * pointed at a real customer organization even by mistake.
 *
 * The QA_ORG_ID is a well-known seeded constant (see
 * scripts/seed-qa-org.ts). Set it via env var QA_ORG_ID so the same
 * code runs in dev / staging / prod without hardcoding the id.
 */
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { AdminShell } from '@/app/admin/_components/admin-shell';
import { Tier } from '@/lib/entitlement';

export const dynamic = 'force-dynamic';

const QA_ORG_ID = process.env.QA_ORG_ID;

const ALLOWED_TIERS: Tier[] = ['free', 'pro', 'agency', 'agency_pro'];

export default async function AdminQaPage() {
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

  if (!QA_ORG_ID) {
    return (
      <AdminShell title="Founder QA Console">
        <div className="rounded border border-yellow-300 bg-yellow-50 p-4">
          <p className="font-semibold">QA_ORG_ID env var is not set.</p>
          <p className="mt-2 text-sm">
            Run the seed script to create the QA organization, then set QA_ORG_ID
            on Vercel (or in .env locally) to the seeded organization id.
          </p>
          <pre className="mt-3 rounded bg-muted p-2 text-xs">
            bun run scripts/seed-qa-org.ts
          </pre>
        </div>
      </AdminShell>
    );
  }

  const qaOrg = await db.organization.findUnique({
    where: { id: QA_ORG_ID },
    select: {
      id: true, name: true, createdAt: true,
      licenses: { select: { id: true, tier: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      subscriptions: { select: { id: true, tier: true, status: true, currentPeriodEnd: true }, orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!qaOrg) {
    return (
      <AdminShell title="Founder QA Console">
        <div className="rounded border border-red-300 bg-red-50 p-4">
          <p className="font-semibold">QA_ORG_ID is set but the organization does not exist.</p>
          <p className="mt-2 text-sm">Run: bun run scripts/seed-qa-org.ts</p>
        </div>
      </AdminShell>
    );
  }

  const currentTier = (qaOrg.licenses[0]?.tier as Tier) ?? 'free';

  return (
    <AdminShell title="Founder QA Console">
      <div className="rounded border bg-card p-4">
        <h3 className="font-semibold">QA Organization</h3>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">ID</dt>
          <dd className="font-mono text-xs">{qaOrg.id}</dd>
          <dt className="text-muted-foreground">Name</dt>
          <dd>{qaOrg.name}</dd>
          <dt className="text-muted-foreground">Current tier (License cache)</dt>
          <dd className="font-mono">{currentTier}</dd>
          <dt className="text-muted-foreground">Subscription tier</dt>
          <dd className="font-mono">{qaOrg.subscriptions[0]?.tier ?? '-'}</dd>
          <dt className="text-muted-foreground">Subscription status</dt>
          <dd className="font-mono">{qaOrg.subscriptions[0]?.status ?? '-'}</dd>
        </dl>
      </div>

      <section className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Switch tier (QA org only)</h3>
        <p className="text-sm text-muted-foreground mb-3">
          The route handler asserts <code>organizationId === QA_ORG_ID</code> before
          allowing any mutation. Real customer orgs cannot be targeted via this path.
        </p>
        <form action={`/api/admin/qa/tier?XTransformPort=3000`} method="POST" className="flex gap-2">
          <select name="tier" defaultValue={currentTier} className="rounded border px-3 py-1 text-sm">
            {ALLOWED_TIERS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input type="hidden" name="organizationId" value={QA_ORG_ID} />
          <button
            type="submit"
            className="rounded bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
          >
            Switch tier
          </button>
        </form>
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Replay a synthetic Whop webhook</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Sends a synthetic <code>payment.succeeded</code> event with the QA org id
          in metadata to the real <code>/api/webhooks/whop</code> handler — exercises
          the production webhook code path (signature verification, idempotency,
          PlanMapping resolution) without touching real billing.
        </p>
        <form action="/api/admin/qa/replay-webhook" method="POST" className="flex gap-2">
          <input type="hidden" name="organizationId" value={QA_ORG_ID} />
          <select name="tier" className="rounded border px-3 py-1 text-sm">
            {ALLOWED_TIERS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded border px-3 py-1 text-sm font-medium"
          >
            Replay synthetic webhook
          </button>
        </form>
      </section>
    </AdminShell>
  );
}
