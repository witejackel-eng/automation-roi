/**
 * Entitlement engine (Section 18, Phase 6 revision).
 *
 * A single ranked lookup against the license tier — a capability requires
 * tier_rank >= required_rank. No per-feature flags.
 *
 * Phase 6 — Case-based pricing:
 *   Free tier keeps ANALYTICAL RIGOR (calculate, stress_test, scenario_analysis).
 *   Gates CLIENT-FACING OUTPUTS: PDF (watermarked), proposal, share-link approval,
 *   white-labeling. This differentiates Viableo from generic calculators that
 *   would gate the analysis itself.
 */
import { db } from '@/lib/db';
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
  | 'templates'          // agency+ — saved templates
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
  templates: 2,
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
  'templates',
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

/**
 * Get active entitlement for an organization.
 * Falls back to 'free' tier if no license exists.
 */
export async function getActiveEntitlement(
  organizationId: string
): Promise<Entitlement> {
  // Phase 6 (F-6 fix): route through tenant() so organizationId is
  // baked into the WHERE clause by the wrapper. License.tier is the
  // derived cache; the Whop webhook handler keeps it in sync with
  // Subscription.tier (the source of truth) — see src/app/api/webhooks/whop/route.ts.
  // If a future pass moves the source of truth fully to Subscription,
  // this read path becomes a Subscription.findFirst instead — but the
  // tier value is the same string either way, so the entitlement logic
  // is unchanged.
  const license = await tenant(organizationId).licenses.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  const tier = (license?.tier as Tier) ?? 'free';
  return entitlementFor(tier);
}

/**
 * Check case limit for the current billing period.
 * Returns { allowed, remaining, limit }.
 * Free = 1 active case, Pro = 5/month, Agency+ = unlimited.
 */
export async function checkCaseLimit(
  organizationId: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const entitlement = await getActiveEntitlement(organizationId);

  if (entitlement.tier === 'agency' || entitlement.tier === 'agency_pro') {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  // Count active projects this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Phase 6 (F-6 fix): route through tenant() — defense-in-depth
  // even though the where.organizationId was already correct here.
  const caseCount = await tenant(organizationId).projects.count({
    where: {
      createdAt: { gte: startOfMonth },
    },
  });

  const limit = entitlement.tier === 'free' ? 1 : 5;
  const remaining = Math.max(0, limit - caseCount);

  return { allowed: caseCount < limit, remaining, limit };
}
