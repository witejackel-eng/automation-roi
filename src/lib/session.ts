/**
 * Demo-session helpers (Section 6 + 24).
 *
 * The product spec models users/organizations/licenses, but V1 ships as a
 * single-tenant demo with one organization ("Apex Automation Studio",
 * seeded by scripts/seed.ts). Entitlement is read from the licenses table
 * for that organization.
 *
 * This module exposes the active organization id and a helper to set the
 * demo license tier (used by the pricing page / entitlement mock so a user
 * can "purchase" Pro/Agency without a live Whop checkout).
 */
import { db } from '@/lib/db';
import type { Tier } from '@/lib/entitlement';

export const DEMO_ORG_ID = 'org_apex_demo';

export async function getDemoOrganization() {
  let org = await db.organization.findUnique({ where: { id: DEMO_ORG_ID } });
  if (!org) {
    org = await db.organization.create({
      data: {
        id: DEMO_ORG_ID,
        name: 'Apex Automation Studio',
      },
    });
  }
  return org;
}

/**
 * Idempotently set the demo organization's license tier. Used by the pricing
 * page CTA in this single-tenant demo (no live Whop checkout).
 */
export async function setDemoTier(tier: Tier): Promise<void> {
  const existing = await db.license.findFirst({
    where: { organizationId: DEMO_ORG_ID },
  });
  if (existing) {
    await db.license.update({
      where: { id: existing.id },
      data: { tier, purchasedAt: new Date() },
    });
  } else {
    await db.license.create({
      data: { organizationId: DEMO_ORG_ID, tier, purchasedAt: new Date() },
    });
  }
}
