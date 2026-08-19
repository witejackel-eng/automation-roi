/**
 * Auth configuration tests.
 *
 * Verifies provider registration, session strategy, and session callback behavior.
 * Uses vi.mock to control process.env and vi.resetModules for clean imports.
 */
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

// Mock Prisma to avoid DB connection at import time
vi.mock('@/lib/db', () => ({
  db: {
    user: { findUnique: vi.fn(), findFirst: vi.fn() },
    membership: { findFirst: vi.fn() },
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    $transaction: vi.fn(),
  },
}));
vi.mock('@/lib/observability/system-event', () => ({
  logSystemEvent: vi.fn(() => Promise.resolve()),
}));
vi.mock('@/lib/org-bootstrap', () => ({
  ensureUserHasOrganization: vi.fn(() => Promise.resolve()),
}));
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({})),
}));
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

describe('authOptions', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('registers GitHub, Google, and Credentials providers when all OAuth vars are set and not production', async () => {
    process.env.GITHUB_ID = 'test-gh-id';
    process.env.GITHUB_SECRET = 'test-gh-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-google-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
    process.env.NODE_ENV = 'development';

    const { authOptions } = await import('@/lib/auth');
    // GitHub + Google + Credentials (dev) = 3
    expect(authOptions.providers).toHaveLength(3);
  });

  it('GitHub remains registered when only GitHub credentials are set', async () => {
    process.env.GITHUB_ID = 'test-gh-id';
    process.env.GITHUB_SECRET = 'test-gh-secret';
    // Deliberately omit GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
    process.env.NODE_ENV = 'development';

    const { authOptions } = await import('@/lib/auth');
    // Only GitHub + Credentials (dev) = 2
    expect(authOptions.providers).toHaveLength(2);

    // Verify one of them is GitHub
    const providerIds = authOptions.providers.map(
      (p: { id?: string; name: string }) => p.id ?? p.name
    );
    expect(providerIds).toContain('github');
    expect(providerIds).not.toContain('google');
  });

  it('session strategy is jwt', async () => {
    process.env.NODE_ENV = 'development';
    const { authOptions } = await import('@/lib/auth');
    expect(authOptions.session.strategy).toBe('jwt');
  });

  it('session callback copies systemRole from the token', async () => {
    process.env.NODE_ENV = 'development';
    const { authOptions } = await import('@/lib/auth');

    // The session callback is authOptions.callbacks.session
    const sessionCallback = authOptions.callbacks.session;

    // Build a fake session and token
    const fakeSession = {
      user: { id: undefined, name: 'Test', email: 'test@test.com', image: null },
      expires: '2099-01-01',
    } as any;

    const fakeToken = {
      sub: 'user-123',
      organizationId: 'org-456',
      role: 'owner',
      systemRole: 'SUPERADMIN',
    } as any;

    const result = await sessionCallback({ session: fakeSession, token: fakeToken } as any);

    expect(result.user.id).toBe('user-123');
    expect((result as any).organizationId).toBe('org-456');
    expect((result as any).role).toBe('owner');
    expect((result as any).systemRole).toBe('SUPERADMIN');
  });

  it('session callback does NOT read plan, tier, or entitlement from provider-related fields', async () => {
    process.env.NODE_ENV = 'development';
    const { authOptions } = await import('@/lib/auth');
    const sessionCallback = authOptions.callbacks.session;

    const fakeSession = {
      user: { id: undefined, name: 'Test', email: 'test@test.com', image: null },
      expires: '2099-01-01',
    } as any;

    // The token has a `account` field from the provider — the callback
    // must NOT read plan/tier/entitlement from it.
    const fakeToken = {
      sub: 'user-123',
      account: { provider: 'github', access_token: 'xxx', plan: 'pro', tier: 'agency' },
    } as any;

    const result = await sessionCallback({ session: fakeSession, token: fakeToken } as any);

    // The session must NOT have plan, tier, or entitlement properties
    expect((result as any).plan).toBeUndefined();
    expect((result as any).tier).toBeUndefined();
    expect((result as any).entitlement).toBeUndefined();
  });
});
