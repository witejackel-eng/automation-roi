/**
 * POST /api/admin/organizations/[id]/impersonate — start "view as customer" (Agent 2).
 *
 * First action: requireSuperAdmin().
 *
 * Per Viableo Production Architecture §8.3:
 *   1. Requires a non-empty `reason` field in the request body — refuse
 *      to start impersonation without one.
 *   2. Issues a short-lived, signed, SEPARATE token/cookie (not a
 *      mutation of the Superadmin's JWT organizationId) containing
 *      { superadminUserId, targetOrganizationId, reason, startedAt },
 *      expiring no more than 30 minutes from issuance.
 *   3. Writes an AuditLog row with action: 'IMPERSONATION_START',
 *      targetType: 'Organization', targetId, and the supplied reason,
 *      inside the same transaction as issuing the token if feasible.
 *   4. Read-only by default — write operations remain blocked unless
 *      a separate, explicitly logged elevation step is added (treat
 *      this as out of scope to build; read-only is the safe default).
 *   5. Render a persistent, non-dismissible banner in every impersonated
 *      view (handled by the layout, not this route).
 *   6. On exit (manual or automatic expiry), write action: 'IMPERSONATION_END'.
 *
 * This is the ONLY sanctioned path for a Superadmin to see an
 * organization's actual project/report/proposal content. The privacy
 * boundary in src/lib/admin/operational-queries.ts structurally
 * prevents casual content access; impersonation is the audited,
 * time-boxed, reasoned exception.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAuditAction } from '@/lib/observability/audit-log';
import { createHmac, randomBytes } from 'crypto';

export const runtime = 'nodejs';

const MAX_IMPERSONATION_MINUTES = 30;

interface ImpersonationToken {
  superadminUserId: string;
  targetOrganizationId: string;
  reason: string;
  startedAt: number; // epoch ms
  expiresAt: number; // epoch ms
  nonce: string;
}

function signToken(token: ImpersonationToken, secret: string): string {
  const payload = Buffer.from(JSON.stringify(token)).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let auth;
  try {
    auth = await requireSuperAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id: organizationId } = await params;
  let body: { reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 422 });
  }

  // REQUIRE a non-empty reason — per §8.3, an un-reasoned privileged
  // action is not acceptable even for founder convenience.
  if (!body.reason || typeof body.reason !== 'string' || body.reason.trim().length === 0) {
    return NextResponse.json(
      { error: 'A non-empty reason is required to start impersonation.' },
      { status: 422 },
    );
  }

  // Verify the target organization exists.
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true },
  });
  if (!org) {
    return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
  }

  const signingSecret = process.env.NEXTAUTH_SECRET;
  if (!signingSecret) {
    return NextResponse.json(
      { error: 'NEXTAUTH_SECRET is not set — cannot sign impersonation token.' },
      { status: 500 },
    );
  }

  const startedAt = Date.now();
  const expiresAt = startedAt + MAX_IMPERSONATION_MINUTES * 60 * 1000;
  const token: ImpersonationToken = {
    superadminUserId: auth.userId,
    targetOrganizationId: organizationId,
    reason: body.reason.trim(),
    startedAt,
    expiresAt,
    nonce: randomBytes(8).toString('hex'),
  };

  // Audit-log the impersonation start. Per §6.4: privileged actions
  // should wrap the mutation + audit in a transaction — but here the
  // "mutation" is issuing a signed cookie (not a DB write), so the
  // audit row stands alone.
  await logAuditAction({
    actorUserId: auth.userId,
    actorRole: 'SUPERADMIN',
    action: 'IMPERSONATION_START',
    targetType: 'Organization',
    targetId: organizationId,
    reason: body.reason.trim(),
    metadata: { expiresAt, nonce: token.nonce },
  });

  const signed = signToken(token, signingSecret);
  const response = NextResponse.json({
    ok: true,
    organizationId,
    organizationName: org.name,
    expiresAt: new Date(expiresAt).toISOString(),
    maxDurationMinutes: MAX_IMPERSONATION_MINUTES,
  });
  // Set the impersonation token as an HttpOnly cookie (NOT as a mutation
  // of the Superadmin's own JWT organizationId — that path would silently
  // re-scope all their subsequent queries without an auditable exit).
  response.cookies.set({
    name: 'viableo_impersonation',
    value: signed,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
  return response;
}

/**
 * DELETE /api/admin/organizations/[id]/impersonate — end impersonation early.
 * Writes IMPERSONATION_END to AuditLog with reason='manual' (vs 'expired').
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let auth;
  try {
    auth = await requireSuperAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
  const { id: organizationId } = await params;
  await logAuditAction({
    actorUserId: auth.userId,
    actorRole: 'SUPERADMIN',
    action: 'IMPERSONATION_END',
    targetType: 'Organization',
    targetId: organizationId,
    reason: 'manual',
  }).catch(() => { /* observability must not block exit */ });
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('viableo_impersonation');
  return response;
}
