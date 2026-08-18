/**
 * PlanMapping resolution tests (Phase 5).
 *
 * Per master prompt §7: a known whopPlanId resolves to the correct tier;
 * an unknown one is handled explicitly (not silently defaulted to a
 * paid tier). Inactive mappings return null.
 *
 * These tests mock the db so they run anywhere.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

function makeMockDb() {
  const planMappingFindUnique = vi.fn();
  const planMappingFindFirst = vi.fn();
  return {
    planMapping: { findUnique: planMappingFindUnique, findFirst: planMappingFindFirst },
  };
}

vi.mock('@/lib/db', () => ({
  get db() {
    return (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb;
  },
}));

vi.mock('@/lib/entitlement', () => ({
  entitlementFor: () => ({ tier: 'free', tierRank: 0, capabilities: {} }),
  has: () => true,
}));

vi.mock('@/lib/auth', () => ({
  AuthError: class AuthError extends Error {
    status: number;
    constructor(m: string, s: number = 401) { super(m); this.status = s; }
  },
}));

import { resolveTierByWhopPlanId } from '../tenant';

beforeEach(() => {
  (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb = makeMockDb();
});

describe('resolveTierByWhopPlanId — PlanMapping data-table lookup', () => {
  it('resolves a known whopPlanId to the correct tier', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.planMapping.findUnique.mockResolvedValue({
      whopPlanId: 'plan_pro_monthly',
      tier: 'pro',
      active: true,
    });
    const tier = await resolveTierByWhopPlanId('plan_pro_monthly');
    expect(tier).toBe('pro');
    expect(mock.planMapping.findUnique).toHaveBeenCalledWith({
      where: { whopPlanId: 'plan_pro_monthly' },
    });
  });

  it('returns null for an unknown whopPlanId (does NOT default to a paid tier)', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.planMapping.findUnique.mockResolvedValue(null);
    const tier = await resolveTierByWhopPlanId('plan_unknown_999');
    expect(tier).toBeNull();
  });

  it('returns null for an inactive PlanMapping (grandfathered but no longer sold)', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.planMapping.findUnique.mockResolvedValue({
      whopPlanId: 'plan_legacy_annual',
      tier: 'agency_pro',
      active: false,
    });
    const tier = await resolveTierByWhopPlanId('plan_legacy_annual');
    expect(tier).toBeNull();
  });

  it('does not silently default an unknown plan to free (could downgrade a paying customer)', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.planMapping.findUnique.mockResolvedValue(null);
    const tier = await resolveTierByWhopPlanId('plan_not_yet_mapped');
    expect(tier).toBeNull();
    expect(tier).not.toBe('free');
    expect(tier).not.toBe('pro');
    expect(tier).not.toBe('agency');
    expect(tier).not.toBe('agency_pro');
  });
});
