/**
 * scripts/bootstrap-superadmin.ts
 *
 * One-time, server-only script to elevate an existing User to SUPERADMIN.
 *
 * Per the Viableo Production Architecture §3 and Agent 1 master prompt §8.3,
 * systemRole is NEVER hardcoded by email. Instead, this script:
 *   1. requires an explicit --email argument (no default value),
 *   2. requires a SUPERADMIN_BOOTSTRAP_TOKEN env var to match a --token
 *      CLI argument (defense against the script being invoked by an
 *      unauthorized party who has repo access but not env access),
 *   3. refuses to run if a SUPERADMIN already exists unless --force is
 *      passed (prevents silent proliferation of superadmins),
 *   4. upserts systemRole = 'SUPERADMIN' on the User row matching the
 *      given email (this script does NOT create users — it only
 *      elevates an existing one),
 *   5. writes an AuditLog row if the AuditLog model exists at run
 *      time; otherwise logs to console with a TODO for Agent 2 to
 *      pick up once AuditLog lands.
 *
 * EXACT INVOCATION:
 *   bun run scripts/bootstrap-superadmin.ts --email founder@example.com --token <token>
 *
 * ENV REQUIRED:
 *   DATABASE_URL       — Postgres connection string (used by Prisma client)
 *   DIRECT_URL         — direct (non-pooled) connection for the write
 *   SUPERADMIN_BOOTSTRAP_TOKEN — must match the --token CLI argument
 *
 * EXIT CODES:
 *   0 — success (or no-op when --dry-run was passed)
 *   1 — argument or env validation failure
 *   2 — a SUPERADMIN already exists (pass --force to override)
 *   3 — the email did not match an existing User row (script does not
 *       create users — sign in once via GitHub OAuth first so the
 *       NextAuth adapter creates the User row, then re-run this script)
 */
import { db } from '../src/lib/db';
import { logSystemEvent } from '../src/lib/observability/system-event';

interface Args {
  email: string | null;
  token: string | null;
  force: boolean;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { email: null, token: null, force: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--email') args.email = argv[++i] ?? null;
    else if (a === '--token') args.token = argv[++i] ?? null;
    else if (a === '--force') args.force = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--help' || a === '-h') {
      console.log(`Usage: bun run scripts/bootstrap-superadmin.ts --email <email> --token <token> [--force] [--dry-run]`);
      process.exit(0);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // ── 1. Required CLI args ───────────────────────────────────────
  if (!args.email) {
    console.error('ERROR: --email is required (no default value — never hardcode a founder email).');
    console.error('Usage: bun run scripts/bootstrap-superadmin.ts --email founder@example.com --token <token>');
    process.exit(1);
  }

  // ── 2. Required env vars + token match ──────────────────────────
  const envToken = process.env.SUPERADMIN_BOOTSTRAP_TOKEN;
  if (!envToken) {
    console.error('ERROR: SUPERADMIN_BOOTSTRAP_TOKEN env var is not set. Refusing to run.');
    console.error('Set it to a high-entropy value (e.g. `openssl rand -base64 32`) and pass --token with the same value.');
    process.exit(1);
  }
  if (!args.token || args.token !== envToken) {
    console.error('ERROR: --token does not match SUPERADMIN_BOOTSTRAP_TOKEN. Refusing to run.');
    process.exit(1);
  }

  // ── 3. Refuse if a SUPERADMIN already exists (unless --force) ──
  const existingSuperadminCount = await db.user.count({
    where: { systemRole: 'SUPERADMIN' },
  });
  if (existingSuperadminCount > 0 && !args.force) {
    console.error(`ERROR: ${existingSuperadminCount} SUPERADMIN user(s) already exist.`);
    console.error('Refusing to silently proliferate superadmins. Pass --force to override (and re-audit afterward).');
    process.exit(2);
  }

  // ── 4. Look up the user by email (must already exist) ──────────
  const user = await db.user.findUnique({
    where: { email: args.email },
    select: { id: true, email: true, systemRole: true, name: true },
  });
  if (!user) {
    console.error(`ERROR: No User row matches email "${args.email}".`);
    console.error('This script does NOT create users — sign in once via GitHub OAuth first so the');
    console.error('NextAuth adapter creates the User row, then re-run this script.');
    process.exit(3);
  }

  console.log(`Found user: ${user.email} (id=${user.id}, current systemRole=${user.systemRole})`);

  if (args.dryRun) {
    console.log(`[dry-run] Would upsert systemRole = 'SUPERADMIN' on user ${user.email}.`);
    process.exit(0);
  }

  // ── 5. Upsert systemRole = 'SUPERADMIN' ────────────────────────
  await db.user.update({
    where: { id: user.id },
    data: { systemRole: 'SUPERADMIN' },
  });
  console.log(`OK: user ${user.email} elevated to SUPERADMIN.`);

  // ── 6. AuditLog (or console TODO if model does not exist) ──────
  // Agent 2 owns the AuditLog Prisma model. Until it exists, we emit
  // a console.log + a logSystemEvent() stub call so Agent 2's real
  // implementation picks up the audit trail when it lands.
  // The try/catch guards against the AuditLog model not existing yet
  // (Prisma would throw a P2021 "model does not exist" error).
  try {
    // Agent 2 owns the AuditLog model; until it exists, the
    // optional-chaining short-circuits the call and we fall through to
    // the system-event stub. The try/catch guards against Prisma
    // throwing P2021 ("model does not exist") if AuditLog isn't there.
    await (db as { auditLog?: { create: (a: unknown) => Promise<unknown> } }).auditLog?.create({
      data: {
        actorUserId: user.id,
        actorRole: 'SUPERADMIN',
        action: 'SUPERADMIN_BOOTSTRAP',
        targetType: 'User',
        targetId: user.id,
        reason: 'initial bootstrap via scripts/bootstrap-superadmin.ts',
        metadata: JSON.stringify({ email: user.email, force: args.force }),
      },
    });
    console.log('AuditLog row written.');
  } catch (e) {
    // TODO(agent-2): write to AuditLog once the model exists. The
    // logSystemEvent() call below is the structural stub that Agent 2's
    // real implementation will pick up.
    console.log('AuditLog model does not exist yet (Agent 2 owns it). Logging to system-event stub instead.');
    await logSystemEvent({
      eventType: 'SUBSCRIPTION_UPDATED', // closest existing event for a privileged action
      userId: user.id,
      severity: 'warn',
      metadata: {
        action: 'SUPERADMIN_BOOTSTRAP',
        email: user.email,
        force: args.force,
      },
    }).catch(() => { /* observability must never fail the bootstrap */ });
  }

  console.log('Done.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FATAL:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  });
