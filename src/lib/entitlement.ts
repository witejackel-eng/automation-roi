/**
 * Entitlement engine (Section 18, Phase 6 revision).
 *
 * A single ranked lookup against the license tier — a capability requires
 * tier_rank >= required_rank. No per-feature flags.
 *
 * Phase 6 — Subscription-first entitlement:
 *   Reads Subscription first (source of truth). Falls back to License (derived
 *   cache). Falls back to 'free' if neither exists.
 */
import { tenant } from '@/lib/tenant';

export type Tier = 'free' | 'pro' | 'agency' | 'agency_pro';

export const TIER_RANK: Record<Tier, number> = {
  free: 0,
  pro: 1,
  agency: 2,
  agency_pro: 3,
};

export const TIER_LABEL: Record<Tier, string> = {
  free: 'Free',
  pro: 'Pro',
  agency: 'Agency',
  agency_pro: 'Agency Pro',
};

export type Capability =
  | 'calculate'          // free — the core analysis engine
  | 'stress_test'        // free — analytical rigor stays free
  | 'scenario_analysis'  // free — three scenarios stay free
  | 'confidence_scoring' // free — confidence model stays free
  | 'save_project'       // pro+ — persist & reopen analyses
  | 'client_report'      // pro+ — unwatermarked PDF
  | 'proposal'           // pro+ — proposal document
  | 'share_links'        // pro+ — share link creation
  | 'share_approval'     // pro+ — share-link approval tracking
  | 'agency_branding'    // agency+ — white-label PDFs
  | 'client_history'     // agency+ — reuse prior client data
  | 'multi_seat'         // agency_pro+ — team seats
  | 'api_access';        // agency_pro+ — API/webhook

export const CAPABILITY_REQUIRED_RANK: Record<Capability, number> = {
  calculate: 0,
  stress_test: 0,
  scenario_analysis: 0,
  confidence_scoring: 0,
  save_project: 1,
  client_report: 1,
  proposal: 1,
  share_links: 1,
  share_approval: 1,
  agency_branding: 2,
  client_history: 2,
  multi_seat: 3,
  api_access: 3,
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
  const rank = TIER_RANK[tier];
  const capabilities = ALL_CAPABILITIES.reduce(
    (acc, cap) => {
      acc[cap] = rank >= CAPABILITY_REQUIRED_RANK[cap];
      return acc;
    },
    {} as Record<Capability, boolean>
  );
  return { tier, tierRank: rank, capabilities };
}

export function has(entitlement: Entitlement, capability: Capability): boolean {
  return entitlement.capabilities[capability];
}

// ── Case limits per tier (Task 3b) ──────────────────────────────

export const CASES_PER_MONTH: Record<Tier, number> = {
  free: 1,
  pro: 5,
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
      const candidate = sub.tier as Tier;
      if (TIER_RANK[candidate] !== undefined) {
        tier = candidate;
      } else {
        // Unrecognized tier from subscription — emit error, fall back to free
        const { logSystemEvent } = await import('@/lib/observability/system-event');
        await logSystemEvent({
          eventType: 'WEBHOOK_ERROR',
          organizationId,
          severity: 'error',
          metadata: { reason: 'unrecognized_tier_from_subscription', tier: sub.tier },
        }).catch(() => {});
      }
    }
    // If subscription exists but is not entitling → stay 'free'
  } else {
    // No subscription — fall back to License.tier
    const license = await tenant(organizationId).licenses.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const candidate = (license?.tier as Tier) ?? 'free';
    if (TIER_RANK[candidate] !== undefined) {
      tier = candidate;
    }
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
