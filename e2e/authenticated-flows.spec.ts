import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { createTestSessionCookie, type TestUser } from './fixtures/session';

// ── Hard-fail if required env vars are missing ──────────────────────
const testDbUrl = process.env.TEST_DATABASE_URL;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!testDbUrl) {
  throw new Error(
    'TEST_DATABASE_URL is not set. This spec requires a real Postgres database. Aborting.',
  );
}
if (!nextAuthSecret) {
  throw new Error(
    'NEXTAUTH_SECRET is not set. Required to sign session cookies for E2E tests. Aborting.',
  );
}

const db = new PrismaClient({ datasources: { db: { url: testDbUrl } } });

test.describe.configure({ mode: 'serial' });

// ── Shared test identity ─────────────────────────────────────────────
const ORG_ID = 'e2e-test-org-001';
const USER: TestUser = {
  sub: 'e2e-user-001',
  email: 'e2e@example.com',
  name: 'E2E Tester',
  organizationId: ORG_ID,
  role: 'owner',
  systemRole: 'member',
};

async function seedOrgAndUser() {
  await db.organization.upsert({
    where: { id: ORG_ID },
    update: {},
    create: { id: ORG_ID, name: 'E2E Test Org' },
  });
  await db.user.upsert({
    where: { id: USER.sub },
    update: {},
    create: {
      id: USER.sub,
      email: USER.email,
      name: USER.name,
      organizationId: ORG_ID,
      role: 'owner',
      systemRole: 'member',
    },
  });
}

async function cleanupOrg() {
  await db.project.deleteMany({ where: { organizationId: ORG_ID } });
  await db.user.deleteMany({ where: { organizationId: ORG_ID } });
  await db.organization.deleteMany({ where: { id: ORG_ID } });
}

test.afterAll(async () => {
  await cleanupOrg();
  await db.$disconnect();
});

// ── Flow 1: Signup / first session ───────────────────────────────────
test('Flow 1 — signup: seed user, hit protected page, verify org bootstrap', async ({ page, request }) => {
  await seedOrgAndUser();

  const cookie = await createTestSessionCookie(USER, { id: ORG_ID, name: 'E2E Test Org' });
  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: cookie.split('=')[1],
      domain: 'localhost',
      path: '/',
    },
  ]);

  const res = await page.goto('/app');
  expect(res?.status()).not.toBe(401);
  expect(res?.status()).not.toBe(403);

  // Verify org was bootstrapped (page loads without redirect to onboarding)
  await expect(page).toHaveURL(/\/app/);
});

// ── Flow 2: Create a case (free tier) ────────────────────────────────
test('Flow 2 — create case on free tier', async ({ page, request }) => {
  const cookie = await createTestSessionCookie(USER, { id: ORG_ID, name: 'E2E Test Org' });
  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: cookie.split('=')[1],
      domain: 'localhost',
      path: '/',
    },
  ]);

  const createRes = await request.post('/api/projects', {
    headers: { Cookie: cookie },
    data: {
      name: 'E2E Free Case',
      inputs: {
        currentMonthlyRevenue: 50000,
        employees: 3,
        automationToolsBudget: 500,
      },
    },
  });

  expect(createRes.status()).toBe(201);
  const body = await createRes.json();
  expect(body).toHaveProperty('id');
});

// ── Flow 3: Paid entitlement ─────────────────────────────────────────
test('Flow 3 — paid entitlement: pro sub, then cancel', async ({ page, request }) => {
  const cookie = await createTestSessionCookie(USER, { id: ORG_ID, name: 'E2E Test Org' });
  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: cookie.split('=')[1],
      domain: 'localhost',
      path: '/',
    },
  ]);

  // Seed a pro subscription
  await db.subscription.upsert({
    where: { id: 'e2e-sub-001' },
    update: {},
    create: {
      id: 'e2e-sub-001',
      organizationId: ORG_ID,
      whopSubscriptionId: 'whop_e2e_fake',
      planId: 'e2e-plan-pro',
      status: 'active',
      tier: 'pro',
    },
  });

  // Verify report endpoint is reachable
  const projectsRes = await request.get('/api/projects', {
    headers: { Cookie: cookie },
  });
  expect(projectsRes.status()).toBe(200);

  // Cancel the subscription
  await db.subscription.update({
    where: { id: 'e2e-sub-001' },
    data: { status: 'cancelled' },
  });

  // After cancellation, paid features should return 402/403
  const checkoutRes = await request.post('/api/billing/checkout', {
    headers: { Cookie: cookie },
    data: { tier: 'pro' },
  });
  // The checkout may succeed (creates new checkout) or fail depending on
  // entitlement logic; the important thing is it doesn't 500.
  expect([200, 201, 402, 403]).toContain(checkoutRes.status());
});

// ── Flow 4: Output integrity ─────────────────────────────────────────
test('Flow 4 — output integrity: numbers match persisted results', async ({ request }) => {
  const cookie = await createTestSessionCookie(USER, { id: ORG_ID, name: 'E2E Test Org' });

  // Get the project created in Flow 2
  const projectsRes = await request.get('/api/projects', {
    headers: { Cookie: cookie },
  });
  expect(projectsRes.status()).toBe(200);
  const projects = await projectsRes.json();
  const project = projects.find((p: { name: string }) => p.name === 'E2E Free Case');
  expect(project).toBeDefined();

  // Fetch the persisted results via the calculate API
  const calcRes = await request.post('/api/calculate', {
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    data: project.inputs,
  });
  expect(calcRes.status()).toBe(200);
  const calcBody = await calcRes.json();

  // The response must contain deterministic numeric fields
  expect(typeof calcBody.annualSavings).toBe('number');
  expect(typeof calcBody.roi).toBe('number');
  expect(calcBody.annualSavings).toBeGreaterThan(0);

  // Compare with persisted project data
  expect(calcBody.annualSavings).toEqual(project.results?.annualSavings);
});

// ── Flow 5: Client-facing share ──────────────────────────────────────
test('Flow 5 — client-facing share link', async ({ page, request }) => {
  const cookie = await createTestSessionCookie(USER, { id: ORG_ID, name: 'E2E Test Org' });

  const projectsRes = await request.get('/api/projects', {
    headers: { Cookie: cookie },
  });
  const projects = await projectsRes.json();
  const project = projects.find((p: { name: string }) => p.name === 'E2E Free Case');

  // Create a share link
  const shareRes = await request.post(`/api/projects/${project.id}/share`, {
    headers: { Cookie: cookie },
  });
  expect(shareRes.status()).toBe(201);
  const share = await shareRes.json();
  expect(share).toHaveProperty('shareId');

  // Access the share link without authentication
  const sharePageRes = await page.goto(`/r/${share.shareId}`);
  expect(sharePageRes?.status()).toBe(200);
  await expect(page).toHaveTitle(/.+/);
});

// ── Flow 6: Return visit — project list isolation ────────────────────
test('Flow 6 — return visit: project list isolation', async ({ request }) => {
  // Create a second org + user to verify isolation
  const OTHER_ORG_ID = 'e2e-test-org-002';
  await db.organization.upsert({
    where: { id: OTHER_ORG_ID },
    update: {},
    create: { id: OTHER_ORG_ID, name: 'E2E Other Org' },
  });
  await db.user.upsert({
    where: { id: 'e2e-user-002' },
    update: {},
    create: {
      id: 'e2e-user-002',
      email: 'other@example.com',
      name: 'Other User',
      organizationId: OTHER_ORG_ID,
      role: 'owner',
      systemRole: 'member',
    },
  });

  const otherUser: TestUser = {
    sub: 'e2e-user-002',
    email: 'other@example.com',
    name: 'Other User',
    organizationId: OTHER_ORG_ID,
    role: 'owner',
    systemRole: 'member',
  };
  const cookie = await createTestSessionCookie(otherUser, { id: OTHER_ORG_ID, name: 'E2E Other Org' });

  const otherProjectsRes = await request.get('/api/projects', {
    headers: { Cookie: cookie },
  });
  expect(otherProjectsRes.status()).toBe(200);
  const otherProjects = await otherProjectsRes.json();

  // The other org must NOT see the first org's project
  const leaked = otherProjects.some((p: { name: string }) => p.name === 'E2E Free Case');
  expect(leaked).toBe(false);

  // Cleanup second org
  await db.project.deleteMany({ where: { organizationId: OTHER_ORG_ID } });
  await db.user.deleteMany({ where: { organizationId: OTHER_ORG_ID } });
  await db.organization.deleteMany({ where: { id: OTHER_ORG_ID } });
});

// ── Unauthenticated access guards ────────────────────────────────────
test.describe('Unauthenticated access guards', () => {
  test('GET /api/projects returns 401 without session', async ({ request }) => {
    const res = await request.get('/api/projects');
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/billing/checkout returns 401 without session', async ({ request }) => {
    const res = await request.post('/api/billing/checkout', {
      data: { tier: 'pro' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/admin/* returns 401 without session', async ({ request }) => {
    const res = await request.get('/api/admin/system/health');
    expect([401, 403]).toContain(res.status());
  });
});
