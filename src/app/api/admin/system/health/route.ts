/**
 * GET /api/admin/system/health — operational health check (Agent 2).
 *
 * First action: requireSuperAdmin().
 *
 * Returns: env-var presence (never values), DB connectivity,
 * counts of recent webhook errors + recent system events.
 *
 * Used by the /admin/system page AND available as a JSON endpoint
 * for external monitoring.
 */
import { NextResponse } from 'next/server';
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import {
  checkEnvConfig,
  checkDbConnectivity,
  getRecentWebhookErrors,
} from '@/lib/admin/operational-queries';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const env = checkEnvConfig();
  let dbOk = true;
  let dbError: string | null = null;
  try {
    await checkDbConnectivity();
  } catch (e) {
    dbOk = false;
    dbError = e instanceof Error ? e.message : String(e);
  }

  const webhookErrors = await getRecentWebhookErrors(10);

  return NextResponse.json({
    env,
    database: { ok: dbOk, error: dbError },
    webhookErrors: webhookErrors.length,
    webhookErrorSamples: webhookErrors.slice(0, 5).map((e) => ({
      eventType: e.eventType,
      severity: e.severity,
      metadata: e.metadata,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
