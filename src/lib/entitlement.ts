/**
 * Entitlement engine (Section 18). A single ranked lookup against the license
 * tier — a capability requires tier_rank >= required_rank. No per-feature flags.
 */
import { db } from '@/lib/db';

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
  | 'calculate' // free
  | 'save_project' // pro+
  | 'client_report' // pro+
  | 'proposal' // pro+
  | 'agency_branding' // agency+
  | 'templates' // agency+
  | 'client_history' // agency+
  | 'multi_seat' // agency_pro+
  | 'share_links'; // agency_pro+

export const CAPABILITY_REQUIRED_RANK: Record<Capability, number> = {
  calculate: 0,
  save_project: 1,
  client_report: 1,
  proposal: 1,
  agency_branding: 2,
  templates: 2,
  client_history: 2,
  multi_seat: 3,
  share_links: 3,
};

export interface Entitlement {
  tier: Tier;
  tierRank: number;
  capabilities: Record<Capability, boolean>;
}

const ALL_CAPABILITIES: Capability[] = [
  'calculate',
  'save_project',
  'client_report',
  'proposal',
  'agency_branding',
  'templates',
  'client_history',
  'multi_seat',
  'share_links',
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
 * The demo organization. In this single-tenant demo there is one organization
 * (created by the seed script) that owns all projects and the active license.
 * Entitlement is read by organization id.
 */
export async function getActiveEntitlement(
  organizationId: string
): Promise<Entitlement> {
  const license = await db.license.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
  const tier = (license?.tier as Tier) ?? 'free';
  return entitlementFor(tier);
}
