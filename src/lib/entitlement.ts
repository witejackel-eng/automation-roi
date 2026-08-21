/**
 * Entitlement engine — canonical two-tier commercial model.
 *
 *   Starter  = $0  — 10 cases/month, watermarked PDFs, full analytical engine.
 *   Pro      = $49/month — unlimited cases, clean PDFs, every feature.
 *
 * Legacy 'agency' and 'agency_pro' tiers (retired 2026-08) are normalized to
 * Pro at read time so existing subscriptions / licenses keep working without a
 * destructive migration. The canonical Tier union therefore keeps them as
 * legacy aliases; new checkouts only ever produce 'free' or 'pro'.
 *
 * Phase 6 — Subscription-first entitlement:
 *   Reads Subscription first (source of truth). Falls back to License (derived
 *   cache). Falls back to 'free' if neither exists.
 */
import { tenant } from '@/lib/tenant';

export type Tier = 'free' | 'pro' | 'agency' | 'agency_pro';

/** Legacy tiers are normalized to Pro. New code only ever produces free/pro. */
export function normalizeTier(tier: string | null | undefined): Tier {
  if (tier === 'pro' || tier === 'agency' || tier === 'agency_pro') return 'pro';
  return 'free';
}

export const TIER_RANK: Record<Tier, number> = {
  free: 0,
  pro: 1,
  // Legacy aliases — both normalize to Pro (rank 1).
  agency: 1,
  agency_pro: 1,
};

export const TIER_LABEL: Record<Tier, string> = {
  free: 'Starter',
  pro: 'Pro',
  // Legacy labels still readable in admin/history views.
  agency: 'Pro',
  agency_pro: 'Pro',
};

/** Canonical display name for the free tier (was 'Free', now 'Starter'). */
export const TIER_CANONICAL_LABEL: Record<Tier, string> = {
  free: 'Starter',
  pro: 'Pro',
  agency: 'Pro (legacy Agency)',
  agency_pro: 'Pro (legacy Agency Pro)',
};

export type Capability =
  | 'calculate'          // Starter — the core analysis engine stays free
  | 'stress_test'        // Starter — analytical rigor stays free
  | 'scenario_analysis'  // Starter — three scenarios stay free
  | 'confidence_scoring' // Starter — confidence model stays free
  | 'save_project'       // Pro — persist & reopen analyses (Starter can run live but not persist beyond the 10-case window)
  | 'client_report'     // Pro — unwatermarked PDF (Starter gets watermarked)
  | 'proposal'           // Pro — proposal document (Starter gets watermarked)
  | 'share_links'        // Pro — share link creation
  | 'share_approval'     // Pro — share-link approval tracking
  | 'agency_branding'    // Pro — white-label PDFs
  | 'client_history'     // Pro — reuse prior client data
  | 'multi_seat'         // Pro — team seats (legacy agency_pro; now Pro)
  | 'api_access';        // Pro — API/webhook (legacy agency_pro; now Pro)

export const CAPABILITY_REQUIRED_RANK: Record<Capability, number> = {
  calculate: 0,
  stress_test: 0,
  scenario_analysis: 0,
  confidence_scoring: 0,
  // Everything that was 'pro+' stays rank 1. Legacy 'agency+' (2) and
  // 'agency_pro+' (3) capabilities are now included in Pro, so they collapse
  // to rank 1.
  save_project: 1,
  client_report: 1,
  proposal: 1,
  share_links: 1,
  share_approval: 1,
  agency_branding: 1,
  client_history: 1,
  multi_seat: 1,
  api_access: 1,
};

export interface Entitlement {
  tier: Tier;
  tierRank: number;
  capabilities: Record<Capability, boolean>;
}

const ALL_CAPABILITIES: Capability[] = [
  'calculate',
  'stress_test',
  'scenario_analysis',
  'confidence_scoring',
  'save_project',
  'client_report',
  'proposal',
  'share_links',
  'share_approval',
  'agency_branding',
  'client_history',
  'multi_seat',
  'api_access',
];

export function entitlementFor(tier: Tier): Entitlement {
  // Normalize legacy tiers so capabilities are computed against the canonical
  // two-rank model (Starter=0, Pro=1).
  const rank = TIER_RANK[normalizeTier(tier)];
  const capabilities = ALL_CAPABILITIES.reduce(
    (acc, cap) => {
      acc[cap] = rank >= CAPABILITY_REQUIRED_RANK[cap];
      return acc;
    },
    {} as Record<Capability, boolean>
  );
  return { tier: normalizeTier(tier), tierRank: rank, capabilities };
}

export function has(entitlement: Entitlement, capability: Capability): boolean {
  return entitlement.capabilities[capability];
}

// ── Case limits per tier (canonical two-tier model) ───────────
// Starter = 10 cases per calendar month (watermarked PDFs).
// Pro = unlimited. Legacy tiers normalize to Pro.
export const CASES_PER_MONTH: Record<Tier, number> = {
  free: 10,
  pro: Infinity,
  agency: Infinity,
  agency_pro: Infinity,
};

/**
 * Check whether a subscription's status means the org is entitled.
 * Active, trialing, or past_due always count. Canceling counts if the
 * current period has not yet ended.
 */
export function isEntitlingStatus(
  status: string,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: Date | null,
  now: Date = new Date(),
): boolean {
  const s = status.toLowerCase();
  if (s === 'active' || s === 'trialing' || s === 'past_due') return true;
  if ((s === 'canceling' || cancelAtPeriodEnd) && currentPeriodEnd) {
    return currentPeriodEnd.getTime() > now.getTime();
  }
  return false;
}

/**
 * Get active entitlement for an organization.
 *
 * Resolution order:
 * 1. Most recent Subscription — if isEntitlingStatus is true, use its tier.
 * 2. Most recent License (derived cache) — fall back if no subscription.
 * 3. 'free' if neither exists or the tier is unrecognized.
 */
export async function getActiveEntitlement(
  organizationId: string
): Promise<Entitlement> {
  const sub = await tenant(organizationId).subscriptions.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  let tier: Tier = 'free';

  if (sub) {
    const entitling = isEntitlingStatus(
      sub.status,
      sub.cancelAtPeriodEnd,
      sub.currentPeriodEnd,
    );
    if (entitling) {
      // Normalize legacy tiers to the canonical two-tier model.
      tier = normalizeTier(sub.tier);
    }
    // If subscription exists but is not entitling → stay 'free'
  } else {
    // No subscription — fall back to License.tier (normalized).
    const license = await tenant(organizationId).licenses.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    tier = normalizeTier(license?.tier);
  }

  return entitlementFor(tier);
}

/**
 * Check case limit for the current billing period.
 * Returns { allowed, remaining, limit }.
 * Uses CASES_PER_MONTH for per-tier limits.
 */
export async function checkCaseLimit(
  organizationId: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const entitlement = await getActiveEntitlement(organizationId);

  const limit = CASES_PER_MONTH[entitlement.tier];
  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  // Count active projects this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const caseCount = await tenant(organizationId).projects.count({
    where: {
      createdAt: { gte: startOfMonth },
    },
  });

  const remaining = Math.max(0, limit - caseCount);

  return { allowed: caseCount < limit, remaining, limit };
}
