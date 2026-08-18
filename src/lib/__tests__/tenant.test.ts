/**
 * Tenant-scoping invariant tests (Phase 5 of the master prompt).
 *
 * Verifies the OWASP A01 defense-in-depth guarantee: a tenant(orgId)
 * delegate can never return another organization's rows, even when
 * the caller passes a foreign id or a where clause without
 * organizationId. The wrapper forces organizationId into every
 * WHERE clause.
 *
 * These tests use a mock Prisma client (no real database needed) so
 * they run in any environment — Vercel build, local dev, CI.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Prisma client ─────────────────────────────────────────────
// Each test gets a fresh mock so assertions are isolated.
function makeMockDb() {
  const findMany = vi.fn();
  const findFirst = vi.fn();
  const findUnique = vi.fn();
  const create = vi.fn();
  const update = vi.fn();
  const updateMany = vi.fn();
  const deleteFn = vi.fn();
  const count = vi.fn();
  const upsert = vi.fn();
  return {
    project: { findMany, findFirst, findUnique, create, update, delete: deleteFn, count },
    license: { findFirst, findUnique, create, update, count },
    share: { findFirst, findUnique, create, update, updateMany, delete: deleteFn, count },
    shareEvent: { findMany, findFirst, create, count },
    subscription: { findFirst, findUnique, upsert, count },
    payment: { findFirst, create, count },
    planMapping: { findFirst, findUnique },
    organization: { findUnique, update },
    user: { findUnique, count },
  };
}

// ── Load tenant() with the mock db injected ───────────────────────
// We use vi.mock to replace @/lib/db with our mock. Each test sets up
// the mock behavior and asserts that the tenant() delegate forced
// organizationId into the WHERE clause.
vi.mock('@/lib/db', () => ({
  get db() {
    return (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb;
  },
  Prisma: {
    ProjectFindManyArgs: {},
    ProjectFindUniqueArgs: {},
    ProjectCreateArgs: {},
    ProjectUpdateArgs: {},
    ProjectDeleteArgs: {},
    ProjectCountArgs: {},
    LicenseFindFirstArgs: {},
    LicenseCreateArgs: {},
    LicenseUpdateArgs: {},
    ShareFindFirstArgs: {},
    ShareUpdateArgs: {},
    ShareUpdateManyArgs: {},
    ShareDeleteArgs: {},
    ShareEventCreateArgs: {},
    ShareEventFindManyArgs: {},
    SubscriptionFindFirstArgs: {},
    SubscriptionUpsertArgs: {},
    PaymentCreateArgs: {},
    ProjectWhereInput: {},
    LicenseWhereInput: {},
    ShareWhereInput: {},
    ShareEventWhereInput: {},
    SubscriptionWhereInput: {},
    ProjectUncheckedCreateInput: {},
    LicenseUncheckedCreateInput: {},
    ShareEventUncheckedCreateInput: {},
    SubscriptionUncheckedCreateInput: {},
    PaymentUncheckedCreateInput: {},
  },
}));

// Entitlement stub — tenant.ts imports entitlementFor/has/Capability/Entitlement
// but the scoping tests don't actually exercise them. Provide a no-op.
vi.mock('@/lib/entitlement', () => ({
  entitlementFor: () => ({ tier: 'free', tierRank: 0, capabilities: {} }),
  has: () => true,
}));

// AuthError stub — tenant.ts re-exports it from @/lib/auth.
vi.mock('@/lib/auth', () => ({
  AuthError: class AuthError extends Error {
    status: number;
    constructor(m: string, s: number = 401) {
      super(m);
      this.status = s;
    }
  },
}));

import { tenant } from '../tenant';

beforeEach(() => {
  (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb = makeMockDb();
});

describe('tenant(orgId) — OWASP A01 scoping guarantees', () => {
  it('projects.findMany forces organizationId into the WHERE clause', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.project.findMany.mockResolvedValue([]);
    await tenant('org_A').projects.findMany({ orderBy: { createdAt: 'desc' } });
    const args = mock.project.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ organizationId: 'org_A' });
    expect(args.orderBy).toEqual({ createdAt: 'desc' });
  });

  it('projects.findUnique rejects a foreign id (scopes by organizationId)', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.project.findUnique.mockResolvedValue(null);
    await tenant('org_A').projects.findUnique({ id: 'proj_B' });
    const args = mock.project.findUnique.mock.calls[0][0];
    // The WHERE clause must include BOTH the id AND organizationId —
    // so a foreign org's project id cannot be queried.
    expect(args.where).toEqual({ id: 'proj_B', organizationId: 'org_A' });
  });

  it('projects.create forces organizationId into the data', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.project.create.mockResolvedValue({ id: 'new_id' });
    await tenant('org_A').projects.create({
      data: { clientName: 'Test', inputs: '{}', results: '{}', recommendation: 'build' } as never,
    });
    const args = mock.project.create.mock.calls[0][0];
    expect(args.data.organizationId).toBe('org_A');
  });

  it('projects.count forces organizationId into the WHERE clause', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.project.count.mockResolvedValue(0);
    await tenant('org_A').projects.count();
    const args = mock.project.count.mock.calls[0][0];
    expect(args.where).toEqual({ organizationId: 'org_A' });
  });

  it('licenses.update forces organizationId into the WHERE clause', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.license.update.mockResolvedValue({ id: 'lic_1' });
    await tenant('org_A').licenses.update({
      where: { id: 'lic_B' },
      data: { tier: 'pro' } as never,
    });
    const args = mock.license.update.mock.calls[0][0];
    // A caller passing another org's license id cannot update it —
    // the WHERE includes organizationId from this org's tenant context.
    expect(args.where).toEqual({ id: 'lic_B', organizationId: 'org_A' });
  });

  it('shares.updateMany forces project.organizationId into the WHERE clause', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.share.updateMany.mockResolvedValue({ count: 0 });
    await tenant('org_A').shares.updateMany({
      where: { projectId: 'proj_B', revokedAt: null } as never,
      data: { revokedAt: new Date() } as never,
    });
    const args = mock.share.updateMany.mock.calls[0][0];
    // The original where clause is preserved, but project.organizationId
    // is added — so only shares belonging to this org's projects are touched.
    expect(args.where.project).toEqual({ organizationId: 'org_A' });
    expect(args.where.projectId).toBe('proj_B');
    expect(args.where.revokedAt).toBeNull();
  });

  it('shareEvents.create forces organizationId into the data', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.shareEvent.create.mockResolvedValue({ id: 'evt_1' });
    await tenant('org_A').shareEvents.create({
      data: { shareId: 'share_1', eventType: 'view' } as never,
    });
    const args = mock.shareEvent.create.mock.calls[0][0];
    expect(args.data.organizationId).toBe('org_A');
  });

  it('findUniqueByShareId is the sanctioned exception — does NOT add organizationId', async () => {
    // Per master prompt §8.1: public share lookups by opaque shareId
    // are the access credential itself, so they cannot be org-scoped.
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.share.findUnique.mockResolvedValue(null);
    await tenant('org_A').shares.findUniqueByShareId({ shareId: 'abc123' });
    const args = mock.share.findUnique.mock.calls[0][0];
    expect(args.where).toEqual({ shareId: 'abc123' });
    // No organizationId added — the shareId is unguessable (12 random
    // bytes = 24 hex chars) and is itself the access credential.
  });
});
