/**
 * scripts/seed-qa-org.ts
 *
 * Seeds the well-known QA Organization used by the founder QA console
 * (/admin/qa). Per Viableo Production Architecture §13 and Agent 2
 * master prompt §7:
 *
 *   - A real Organization row owned by the founder's own User via a
 *     normal Membership { role: 'owner' }.
 *   - Participates in the real tenant model — no special-cased code
 *     paths in the calculation/report/share engine. The QA org gets
 *     its privileges through the SAME Subscription/License mechanism
 *     as a real customer, just seeded with synthetic data.
 *
 * After running this script, set QA_ORG_ID on Vercel (or in .env) to
 * the printed organization id. The /admin/qa route asserts
 * organizationId === QA_ORG_ID before any tier mutation, so real
 * customer orgs cannot be targeted via that path.
 *
 * Invocation:
 *   bun run scripts/seed-qa-org.ts --email founder@example.com
 *
 * Env required:
 *   DATABASE_URL, DIRECT_URL
 */
import { db } from '../src/lib/db';

async function main() {
  const emailArg = process.argv.find((a) => a.startsWith('--email='));
  if (!emailArg) {
    console.error('Usage: bun run scripts/seed-qa-org.ts --email=founder@example.com');
    process.exit(1);
  }
  const email = emailArg.split('=')[1];

  // Look up the founder's user row (must already exist via GitHub OAuth sign-in).
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, systemRole: true },
  });
  if (!user) {
    console.error(`No User row matches email "${email}". Sign in via GitHub OAuth first.`);
    process.exit(1);
  }
  console.log(`Found user: ${user.email} (id=${user.id}, systemRole=${user.systemRole})`);

  // Idempotent: if a QA org already exists for this user, return its id.
  const existing = await db.organization.findFirst({
    where: { name: 'Viableo QA (founder)' },
    select: { id: true, name: true },
  });
  if (existing) {
    console.log(`QA org already exists: id=${existing.id}`);
    console.log('Set QA_ORG_ID env var to this id.');
    return;
  }

  // Create the QA org + a normal owner Membership for the founder.
  const org = await db.organization.create({
    data: {
      name: 'Viableo QA (founder)',
      contactEmail: user.email,
      memberships: {
        create: { userId: user.id, role: 'owner' },
      },
      // Seed a FREE-tier License so the founder can exercise the
      // tier-gating logic from a known starting state. The QA console
      // (/api/admin/qa/tier) will upsert this License to other tiers.
      licenses: {
        create: { tier: 'free' },
      },
    },
    select: { id: true, name: true },
  });

  console.log(`QA org created: id=${org.id} name="${org.name}"`);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Set QA_ORG_ID=${org.id} on Vercel (or in .env locally).`);
  console.log(`  2. Set WHOP_WEBHOOK_SECRET on Vercel if you want to exercise the`);
  console.log(`     synthetic webhook replay path (/api/admin/qa/replay-webhook).`);
  console.log(`  3. Visit /admin/qa to switch tiers and replay synthetic webhooks.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FATAL:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  });
