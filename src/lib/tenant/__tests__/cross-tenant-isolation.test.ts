const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
if (!TEST_DATABASE_URL) {
  throw new Error(
    'cross-tenant-isolation requires TEST_DATABASE_URL. This test must not be skipped — ' +
    'it verifies tenant data access isolation. FOUNDER/CI ACTION: provide TEST_DATABASE_URL.'
  );
}

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { tenant, getOrgEntitlement } from '@/lib/tenant';

let orgA: { id: string };
let orgB: { id: string };
let projectA: { id: string };
let projectB: { id: string };
let licenseA: { id: string };
let cleanupIds: { orgs: string[]; users: string[] } = { orgs: [], users: [] };

describe('cross-tenant isolation (Org A must never read/write Org B data)', () => {
  beforeAll(async () => {
    // Create two separate organizations
    orgA = await db.organization.create({ data: { name: 'Test Org A (isolation)' } });
    orgB = await db.organization.create({ data: { name: 'Test Org B (isolation)' } });
    cleanupIds.orgs.push(orgA.id, orgB.id);

    // Create a project in each org
    projectA = await db.project.create({
      data: {
        organizationId: orgA.id,
        clientName: 'Org A Client',
        inputs: JSON.stringify({ clientName: 'Org A' }),
        results: JSON.stringify({}),
        recommendation: 'consider',
      },
    });
    projectB = await db.project.create({
      data: {
        organizationId: orgB.id,
        clientName: 'Org B Client',
        inputs: JSON.stringify({ clientName: 'Org B' }),
        results: JSON.stringify({}),
        recommendation: 'build',
      },
    });

    // Create a license for Org A
    licenseA = await db.license.create({
      data: { organizationId: orgA.id, tier: 'pro' },
    });
  });

  afterAll(async () => {
    // Best-effort cleanup
    for (const orgId of cleanupIds.orgs) {
      try {
        await db.share.deleteMany({ where: { project: { organizationId: orgId } } });
        await db.shareEvent.deleteMany({ where: { organizationId: orgId } });
        await db.report.deleteMany({ where: { project: { organizationId: orgId } } });
        await db.license.deleteMany({ where: { organizationId: orgId } });
        await db.project.deleteMany({ where: { organizationId: orgId } });
        await db.membership.deleteMany({ where: { organizationId: orgId } });
        await db.organization.delete({ where: { id: orgId } });
      } catch {
        // Cleanup errors should not fail the test
      }
    }
  });

  // ── Projects ──────────────────────────────────────────────────

  it('Org A cannot read Org B project via tenant-scoped findUnique', async () => {
    const result = await tenant(orgA.id).projects.findUnique({ id: projectB.id });
    expect(result).toBeNull();
  });

  it('Org B cannot read Org A project via tenant-scoped findUnique', async () => {
    const result = await tenant(orgB.id).projects.findUnique({ id: projectA.id });
    expect(result).toBeNull();
  });

  it('Org A cannot delete Org B project via tenant-scoped delete', async () => {
    await expect(tenant(orgA.id).projects.delete({ id: projectB.id })).rejects.toThrow();
    const stillExists = await db.project.findUnique({ where: { id: projectB.id } });
    expect(stillExists).not.toBeNull();
  });

  it('Org A findMany never includes Org B projects', async () => {
    const orgAProjects = await tenant(orgA.id).projects.findMany();
    expect(orgAProjects.length).toBeGreaterThanOrEqual(1);
    expect(orgAProjects.every((p) => p.organizationId === orgA.id)).toBe(true);
    expect(orgAProjects.find((p) => p.id === projectB.id)).toBeUndefined();
  });

  it('Org B findMany never includes Org A projects', async () => {
    const orgBProjects = await tenant(orgB.id).projects.findMany();
    expect(orgBProjects.length).toBeGreaterThanOrEqual(1);
    expect(orgBProjects.every((p) => p.organizationId === orgB.id)).toBe(true);
    expect(orgBProjects.find((p) => p.id === projectA.id)).toBeUndefined();
  });

  it('Org A count only counts Org A projects', async () => {
    const countA = await tenant(orgA.id).projects.count();
    expect(countA).toBeGreaterThanOrEqual(1);
    // At minimum, Org A should have exactly its own project (no Org B leak)
    const allProjects = await tenant(orgA.id).projects.findMany();
    expect(countA).toBe(allProjects.length);
  });

  // ── Licenses ──────────────────────────────────────────────────

  it('Org A can read its own license via tenant-scoped findFirst', async () => {
    const license = await tenant(orgA.id).licenses.findFirst();
    expect(license).not.toBeNull();
    expect(license!.organizationId).toBe(orgA.id);
  });

  it('Org B cannot read Org A license via tenant-scoped findFirst', async () => {
    // Org B has no license, so findFirst should return null
    const license = await tenant(orgB.id).licenses.findFirst();
    expect(license).toBeNull();
  });

  it('Org A cannot update Org B license (orgId enforced in WHERE)', async () => {
    // Try to update Org A's license via Org B's tenant
    await expect(
      tenant(orgB.id).licenses.update({
        where: { id: licenseA.id },
        data: { tier: 'agency_pro' },
      }),
    ).rejects.toThrow();

    // Verify the license tier did NOT change
    const unchanged = await db.license.findUnique({ where: { id: licenseA.id } });
    expect(unchanged!.tier).toBe('pro');
  });

  // ── Entitlement lookup ──────────────────────────────────────────

  it('Org A entitlement lookup returns pro (from its own license)', async () => {
    const entitlement = await getOrgEntitlement(orgA.id);
    expect(entitlement.tier).toBe('pro');
  });

  it('Org B entitlement lookup returns free (no license)', async () => {
    const entitlement = await getOrgEntitlement(orgB.id);
    expect(entitlement.tier).toBe('free');
  });

  // ── Organization ───────────────────────────────────────────────

  it('Org A can read its own organization', async () => {
    const org = await tenant(orgA.id).organization.get();
    expect(org).not.toBeNull();
    expect(org!.id).toBe(orgA.id);
  });

  it('Org A tenant get returns only Org A, never Org B', async () => {
    const org = await tenant(orgA.id).organization.get();
    expect(org!.id).toBe(orgA.id);
    expect(org!.id).not.toBe(orgB.id);
  });

  // ── Reports (via project) ──────────────────────────────────────

  it('Org A reports.findMany returns empty (no reports created)', async () => {
    const reports = await tenant(orgA.id).reports.findMany();
    expect(reports).toEqual([]);
  });

  it('Org B reports.findMany returns empty (no reports created)', async () => {
    const reports = await tenant(orgB.id).reports.findMany();
    expect(reports).toEqual([]);
  });
});
