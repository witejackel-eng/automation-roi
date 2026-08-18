/**
 * POST /api/entitlement/set — set the organization's tier.
 *
 * Requires authenticated session with owner role. In production, entitlement
 * changes should go through the Whop payment flow; this route is primarily
 * for development/testing or admin overrides.
 *
 * SECURITY:
 *  - Requires authenticated session + owner role.
 *  - In production: completely disabled — 403.
 *  - In development: requires either:
 *      a) DEV_ENTITLEMENT_SECRET env var set and x-dev-secret header matching it, OR
 *      b) No DEV_ENTITLEMENT_SECRET set (legacy behavior — allowed with warning).
 *    This prevents accidental exposure if the dev server is network-accessible.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, requireAuth, AuthError } from '@/lib/session';
import { tenant } from '@/lib/tenant';
import { db } from '@/lib/db';
import type { Tier } from '@/lib/entitlement';

export const runtime = 'nodejs';

const ALLOWED: Tier[] = ['free', 'pro', 'agency', 'agency_pro'];

export async function POST(req: NextRequest) {
  try {
    // ── Auth: require authenticated session with owner role ──────────
    const auth = await requireAuth();
    if (auth.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only organization owners can change the tier.' },
        { status: 403 }
      );
    }

    const org = await requireOrg();

    // ── Production guard ──────────────────────────────────────────
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Entitlement changes must go through Whop payment flow.' },
        { status: 403 }
      );
    }

    // ── Dev guard: optional bearer token ─────────────────────────
    const devSecret = process.env.DEV_ENTITLEMENT_SECRET;
    if (devSecret) {
      const provided = req.headers.get('x-dev-secret');
      if (provided !== devSecret) {
        return NextResponse.json(
          { error: 'Invalid dev secret. Set x-dev-secret header.' },
          { status: 403 }
        );
      }
    } else {
      console.warn(
        '[entitlement/set] ⚠️  No DEV_ENTITLEMENT_SECRET set. Anyone with network access can set any tier. Set DEV_ENTITLEMENT_SECRET for defense-in-depth.'
      );
    }

    console.warn(
      '[entitlement/set] ⚠️  Development backdoor: setting tier directly. This is disabled in production.'
    );

    let body: { tier?: string };
    try {
      body = (await req.json()) as { tier?: string };
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 422 });
    }
    const tier = body.tier as Tier;
    if (!ALLOWED.includes(tier)) {
      return NextResponse.json({ error: 'Unknown tier.' }, { status: 422 });
    }

    // ── Upsert license for the org ────────────────────────────────
    const existing = await tenant(org.id).licenses.findFirst();
    if (existing) {
      await db.license.update({
        where: { id: existing.id },
        data: { tier, purchasedAt: new Date() },
      });
    } else {
      await tenant(org.id).licenses.create({
        data: { tier, purchasedAt: new Date() },
      });
    }

    return NextResponse.json({ ok: true, tier });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
