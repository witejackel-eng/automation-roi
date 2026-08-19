/**
 * Subscription model tests — the canonical source of truth for
 * pricing, tiers, capabilities, and entitlement logic.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  Tier,
  TIER_RANK,
  TIER_LABEL,
  CAPABILITY_REQUIRED_RANK,
  CASES_PER_MONTH,
  isEntitlingStatus,
  entitlementFor,
} from '@/lib/entitlement';
import { PRICING_TIERS } from '@/lib/brand';

describe('subscription model', () => {
  // 1. Canonical tier keys
  it('canonical tier keys are exactly free, pro, agency, agency_pro', () => {
    const canonical: Tier[] = ['free', 'pro', 'agency', 'agency_pro'];
    const actualKeys = Object.keys(TIER_RANK) as Tier[];
    expect(actualKeys).toEqual(canonical);
  });

  // 2. case_pack is not a valid Tier
  it('case_pack is not a valid Tier anywhere in TIER_RANK or TIER_LABEL', () => {
    expect('case_pack' in TIER_RANK).toBe(false);
    expect('case_pack' in TIER_LABEL).toBe(false);
  });

  // 3. TIER_RANK is strictly increasing
  it('TIER_RANK is strictly increasing free < pro < agency < agency_pro', () => {
    expect(TIER_RANK.free).toBeLessThan(TIER_RANK.pro);
    expect(TIER_RANK.pro).toBeLessThan(TIER_RANK.agency);
    expect(TIER_RANK.agency).toBeLessThan(TIER_RANK.agency_pro);
  });

  // 4. Free tier capabilities
  it('free tier retains calculate, stress_test, scenario_analysis, confidence_scoring', () => {
    const ent = entitlementFor('free');
    expect(ent.capabilities.calculate).toBe(true);
    expect(ent.capabilities.stress_test).toBe(true);
    expect(ent.capabilities.scenario_analysis).toBe(true);
    expect(ent.capabilities.confidence_scoring).toBe(true);
  });

  // 5. Free tier does NOT have paid capabilities
  it('free tier does not have client_report, proposal, share_links', () => {
    const ent = entitlementFor('free');
    expect(ent.capabilities.client_report).toBe(false);
    expect(ent.capabilities.proposal).toBe(false);
    expect(ent.capabilities.share_links).toBe(false);
  });

  // 6. Pro tier grants save_project, client_report, proposal, share_links, share_approval
  it('pro tier grants save_project, client_report, proposal, share_links, share_approval', () => {
    const ent = entitlementFor('pro');
    expect(ent.capabilities.save_project).toBe(true);
    expect(ent.capabilities.client_report).toBe(true);
    expect(ent.capabilities.proposal).toBe(true);
    expect(ent.capabilities.share_links).toBe(true);
    expect(ent.capabilities.share_approval).toBe(true);
  });

  // 7. Agency tier grants agency_branding and client_history
  it('agency tier grants agency_branding and client_history', () => {
    const ent = entitlementFor('agency');
    expect(ent.capabilities.agency_branding).toBe(true);
    expect(ent.capabilities.client_history).toBe(true);
  });

  // 8. Agency Pro tier grants multi_seat and api_access
  it('agency_pro tier grants multi_seat and api_access', () => {
    const ent = entitlementFor('agency_pro');
    expect(ent.capabilities.multi_seat).toBe(true);
    expect(ent.capabilities.api_access).toBe(true);
  });

  // 9. PRICING_TIERS prices are exactly $0, $29, $79, $790
  it('PRICING_TIERS prices are exactly $0, $29, $79, $790', () => {
    expect(PRICING_TIERS.map((t) => t.price)).toEqual(['$0', '$29', '$79', '$790']);
  });

  // 10. PRICING_TIERS cadences are forever, per month, per month, per year
  it('PRICING_TIERS cadences are forever, per month, per month, per year', () => {
    expect(PRICING_TIERS.map((t) => t.cadence)).toEqual(['forever', 'per month', 'per month', 'per year']);
  });

  // 11. PRICING_TIERS keys match the canonical Tier union exactly
  it('PRICING_TIERS keys match the canonical Tier union exactly', () => {
    const pricingKeys = PRICING_TIERS.map((t) => t.key);
    const canonicalKeys = Object.keys(TIER_RANK);
    expect(pricingKeys).toEqual(canonicalKeys);
  });

  // 12. PRICING_TIERS capability claims are consistent with CAPABILITY_REQUIRED_RANK
  it('PRICING_TIERS capability claims are consistent with CAPABILITY_REQUIRED_RANK (casesPerMonth + blurbs)', () => {
    // Verify casesPerMonth matches CASES_PER_MONTH
    for (const tier of PRICING_TIERS) {
      const expectedCases = CASES_PER_MONTH[tier.key as Tier];
      expect(tier.casesPerMonth).toBe(expectedCases);
    }

    // Verify blurbs mention features consistent with the tier rank
    // Free blurb should NOT mention "unwatermarked" (that's pro+)
    const freeTier = PRICING_TIERS.find((t) => t.key === 'free')!;
    expect(freeTier.blurb.toLowerCase()).not.toContain('unwatermarked');

    // Pro blurb should mention "unwatermarked" and "share links"
    const proTier = PRICING_TIERS.find((t) => t.key === 'pro')!;
    expect(proTier.blurb.toLowerCase()).toContain('unwatermarked');
    expect(proTier.blurb.toLowerCase()).toContain('share');

    // Agency blurb should mention "branding" and "client history"
    const agencyTier = PRICING_TIERS.find((t) => t.key === 'agency')!;
    expect(agencyTier.blurb.toLowerCase()).toContain('branding');
    expect(agencyTier.blurb.toLowerCase()).toContain('client history');

    // Agency Pro blurb should mention "team seats" and "api"
    const agencyProTier = PRICING_TIERS.find((t) => t.key === 'agency_pro')!;
    expect(agencyProTier.blurb.toLowerCase()).toContain('team');
    expect(agencyProTier.blurb.toLowerCase()).toContain('api');
  });

  // 13. CASES_PER_MONTH is 1 / 5 / Infinity / Infinity
  it('CASES_PER_MONTH is 1 / 5 / Infinity / Infinity', () => {
    expect(CASES_PER_MONTH.free).toBe(1);
    expect(CASES_PER_MONTH.pro).toBe(5);
    expect(CASES_PER_MONTH.agency).toBe(Infinity);
    expect(CASES_PER_MONTH.agency_pro).toBe(Infinity);
  });

  // 14. isEntitlingStatus returns true for active and trialing
  it('isEntitlingStatus returns true for active and trialing', () => {
    expect(isEntitlingStatus('active', false, null)).toBe(true);
    expect(isEntitlingStatus('trialing', false, null)).toBe(true);
  });

  // 15. isEntitlingStatus returns true for past_due (grace period)
  it('isEntitlingStatus returns true for past_due (grace period)', () => {
    expect(isEntitlingStatus('past_due', false, null)).toBe(true);
  });

  // 16. isEntitlingStatus returns true when cancelAtPeriodEnd is true and period end is in the future
  it('isEntitlingStatus returns true when cancelAtPeriodEnd is true and currentPeriodEnd is in the future', () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    expect(isEntitlingStatus('canceling', true, futureDate)).toBe(true);
  });

  // 17. isEntitlingStatus returns false when cancelAtPeriodEnd is true and period end has passed
  it('isEntitlingStatus returns false when cancelAtPeriodEnd is true and currentPeriodEnd has passed', () => {
    const pastDate = new Date(Date.now() - 1000); // 1 second ago
    expect(isEntitlingStatus('canceling', true, pastDate)).toBe(false);
  });

  // 18. isEntitlingStatus returns false for canceled, expired, refunded
  it('isEntitlingStatus returns false for canceled, expired, refunded', () => {
    expect(isEntitlingStatus('canceled', false, null)).toBe(false);
    expect(isEntitlingStatus('expired', false, null)).toBe(false);
    expect(isEntitlingStatus('refunded', false, null)).toBe(false);
  });

  // 19. Tier is never derived from a payment amount
  it('tier is never derived from a payment amount — no numeric amount → tier comparison in webhook route', () => {
    const routeSource = readFileSync(
      join(__dirname, '../../app/api/webhooks/whop/route.ts'),
      'utf-8',
    );

    // The route must NOT compare parsed.data.amount against any tier thresholds
    // Check for patterns like: amount > 790, amount === 29, amount >= 79, etc.
    // The route stores amount for billing/reporting only — it must NOT
    // derive tier from a numeric amount (e.g. amount === 29 → 'pro').
    // Allow 'amount' comparisons that are clearly NOT tier derivation:
    //   - amount > 0 (refund check)
    //   - amount ?? 0 (default)
    // Disallow any pattern that assigns/compares amount to a tier string.
    expect(routeSource).not.toMatch(/amount\s*===?\s*(29|79|790|39|249|499)/);
    expect(routeSource).not.toMatch(/tier\s*=\s*.*amount/);
    expect(routeSource).not.toMatch(/if.*amount.*pro|if.*amount.*agency/);

    // Also verify the route does NOT have a switch/if-else mapping amount to tier
    const switchOnAmount = /switch\s*\(.*amount/i;
    expect(routeSource, 'Found switch on amount').not.toMatch(switchOnAmount);
  });

  // 20. resolveTierByWhopPlanId returns null for unknown plan IDs (DB-dependent, mock the DB layer)
  it('an unknown whopPlanId does not resolve to any paid tier', async () => {
    // Read the source to verify the function uses findUnique and returns null
    // for missing/inactive mappings — this is a source-level assertion.
    const tenantSource = readFileSync(
      join(__dirname, '../tenant.ts'),
      'utf-8',
    );
    expect(tenantSource).toMatch(/findUnique.*whopPlanId/);
    expect(tenantSource).toMatch(/!mapping\.active.*return null/);
    // Verify the function exists and is exported
    const { resolveTierByWhopPlanId } = await import('@/lib/tenant');
    expect(typeof resolveTierByWhopPlanId).toBe('function');
  });

  // 21. No advertised capability lacks an implementation
  it('no advertised capability lacks an implementation — CAPABILITY_REQUIRED_RANK keys match IMPLEMENTED_CAPABILITIES exactly', () => {
    // This list must be maintained by hand — it represents capabilities
    // that have actual code paths gating on them.
    const IMPLEMENTED_CAPABILITIES: Array<keyof typeof CAPABILITY_REQUIRED_RANK> = [
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

    const advertisedCapabilities = Object.keys(CAPABILITY_REQUIRED_RANK) as Array<keyof typeof CAPABILITY_REQUIRED_RANK>;

    // Every advertised capability must have an implementation entry
    for (const cap of advertisedCapabilities) {
      expect(
        IMPLEMENTED_CAPABILITIES.includes(cap),
        `Advertised capability "${cap}" is missing from IMPLEMENTED_CAPABILITIES — add it or remove it from CAPABILITY_REQUIRED_RANK`,
      ).toBe(true);
    }

    // The list must match exactly (no extra implementations that aren't advertised)
    for (const cap of IMPLEMENTED_CAPABILITIES) {
      expect(
        advertisedCapabilities.includes(cap),
        `IMPLEMENTED_CAPABILITIES has "${cap}" which is not in CAPABILITY_REQUIRED_RANK`,
      ).toBe(true);
    }

    // Verify exact match
    expect(IMPLEMENTED_CAPABILITIES.sort()).toEqual(advertisedCapabilities.sort());
  });
});
