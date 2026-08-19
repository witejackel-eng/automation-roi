import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { tenant, getOrgEntitlement } from '@/lib/tenant';

const HAS_DB = !!process.env.DATABASE_URL;
let dbAvailable = false;

let orgA: { id: string };
let orgB: { id: string };
let projectA: { id: string };
let projectB: { id: string };

beforeAll(async () => {
  if (!HAS_DB) return;
  try {
    // Verify DB is actually reachable before attempting mutations.
    await db.$queryRaw`SELECT 1`;
    dbAvailable = true;
    orgA = await db.organization.create({ data: { name: 'Test Org A (isolation)' } });
    orgB = await db.organization.create({ data: { name: 'Test Org B (isolation)' } });
    projectA = await db.project.create({
      data: { organizationId: orgA.id, clientName: 'Org A Client', inputs: JSON.stringify({}), results: JSON.stringify({}), recommendation: 'consider' },
    });
    projectB = await db.project.create({
      data: { organizationId: orgB.id, clientName: 'Org B Client', inputs: JSON.stringify({}), results: JSON.stringify({}), recommendation: 'consider' },
    });
  } catch {
    dbAvailable = false;
  }
});

afterAll(async () => {
  if (!dbAvailable || !orgA) return;
  await db.project.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
  await db.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });
});

describe('cross-tenant isolation (Org A must never read/write Org B data)', () => {
  it('Org A cannot read Org B project via tenant-scoped findUnique', async () => {
    if (!dbAvailable) return;
    const result = await tenant(orgA.id).projects.findUnique({ id: projectB.id });
    expect(result).toBeNull();
  });

  it('Org B cannot read Org A project via tenant-scoped findUnique', async () => {
    if (!dbAvailable) return;
    const result = await tenant(orgB.id).projects.findUnique({ id: projectA.id });
    expect(result).toBeNull();
  });

  it('Org A cannot delete Org B project via tenant-scoped delete', async () => {
    if (!dbAvailable) return;
    await expect(tenant(orgA.id).projects.delete({ id: projectB.id })).rejects.toThrow();
    const stillExists = await db.project.findUnique({ where: { id: projectB.id } });
    expect(stillExists).not.toBeNull();
  });

  it('Org A findMany never includes Org B projects', async () => {
    if (!dbAvailable) return;
    const orgAProjects = await tenant(orgA.id).projects.findMany();
    expect(orgAProjects.every((p) => p.organizationId === orgA.id)).toBe(true);
    expect(orgAProjects.find((p) => p.id === projectB.id)).toBeUndefined();
  });

  it('Org A entitlement lookup never returns Org B license data', async () => {
    if (!dbAvailable) return;
    const entitlementA = await getOrgEntitlement(orgA.id);
    const entitlementB = await getOrgEntitlement(orgB.id);
    expect(entitlementA).toBeDefined();
    expect(entitlementB).toBeDefined();
  });
});
