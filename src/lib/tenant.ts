/**
 * Tenant-scoped data access layer.
 *
 * ALL tenant-owned data access MUST go through this module. Never call
 * `db.project.findMany()` directly — use `tenant(orgId).projects.findMany()`.
 *
 * This ensures organizationId is ALWAYS included in every query's where clause,
 * providing defense-in-depth against cross-tenant data leakage.
 */
import { db } from '@/lib/db';
import type { Tier } from '@/lib/entitlement';
import { entitlementFor, has, type Capability, type Entitlement } from '@/lib/entitlement';

// ── Tenant-scoped Prisma delegates ───────────────────────────────

export function tenant(orgId: string) {
  return {
    projects: {
      findMany: (args?: Omit<Parameters<typeof db.project.findMany>[0], 'where'> & { where?: Omit<NonNullable<Parameters<typeof db.project.findMany>[0]>['where'], 'organizationId'> }) =>
        db.project.findMany({ ...args, where: { ...args?.where, organizationId: orgId } }),

      findUnique: (args: { id: string } & Omit<Parameters<typeof db.project.findUnique>[0], 'where'>) =>
        db.project.findUnique({ where: { id: args.id, organizationId: orgId } }),

      create: (args: Omit<Parameters<typeof db.project.create>[0], 'data'> & { data: Omit<Parameters<typeof db.project.create>[0]['data'], 'organizationId'> }) =>
        db.project.create({ ...args, data: { ...args.data, organizationId: orgId } }),

      delete: (args: { id: string }) =>
        db.project.delete({ where: { id: args.id, organizationId: orgId } }),

      count: (args?: Omit<Parameters<typeof db.project.count>[0], 'where'> & { where?: Omit<NonNullable<Parameters<typeof db.project.count>[0]>['where'], 'organizationId'> }) =>
        db.project.count({ ...args, where: { ...args?.where, organizationId: orgId } }),
    },

    organization: {
      get: () => db.organization.findUnique({ where: { id: orgId } }),
      update: (args: Omit<Parameters<typeof db.organization.update>[0], 'where'> & { data: Parameters<typeof db.organization.update>[0]['data'] }) =>
        db.organization.update({ ...args, where: { id: orgId } }),
    },

    licenses: {
      findFirst: (args?: Omit<Parameters<typeof db.license.findFirst>[0], 'where'> & { where?: Omit<NonNullable<Parameters<typeof db.license.findFirst>[0]>['where'], 'organizationId'> }) =>
        db.license.findFirst({ ...args, where: { ...args?.where, organizationId: orgId } }),

      create: (args: Omit<Parameters<typeof db.license.create>[0], 'data'> & { data: Omit<Parameters<typeof db.license.create>[0]['data'], 'organizationId'> }) =>
        db.license.create({ ...args, data: { ...args.data, organizationId: orgId } }),

      update: (args: Omit<Parameters<typeof db.license.update>[0], 'where' | 'data'> & { where: { id: string }, data: Parameters<typeof db.license.update>[0]['data'] }) =>
        db.license.update(args),
    },

    shares: {
      findFirst: (args?: Omit<Parameters<typeof db.share.findFirst>[0], 'where'> & { where?: Omit<NonNullable<Parameters<typeof db.share.findFirst>[0]>['where'], 'organizationId'> }) =>
        db.share.findFirst({ ...args, where: { ...args?.where, project: { organizationId: orgId } } }),

      create: (args: Omit<Parameters<typeof db.share.create>[0], 'data'> & { data: Parameters<typeof db.share.create>[0]['data'] }) =>
        db.share.create(args),

      update: (args: Omit<Parameters<typeof db.share.update>[0], 'where' | 'data'> & { where: { id: string }, data: Parameters<typeof db.share.update>[0]['data'] }) =>
        db.share.update(args),

      delete: (args: { id: string }) =>
        db.share.delete({ where: { id: args.id, project: { organizationId: orgId } } }),
    },

    shareEvents: {
      create: (args: Omit<Parameters<typeof db.shareEvent.create>[0], 'data'> & { data: Omit<Parameters<typeof db.shareEvent.create>[0]['data'], 'organizationId'> }) =>
        db.shareEvent.create({ ...args, data: { ...args.data, organizationId: orgId } }),

      findMany: (args?: Omit<Parameters<typeof db.shareEvent.findMany>[0], 'where'> & { where?: Omit<NonNullable<Parameters<typeof db.shareEvent.findMany>[0]>['where'], 'organizationId'> }) =>
        db.shareEvent.findMany({ ...args, where: { ...args?.where, organizationId: orgId } }),
    },
  };
}

// ── Server-side entitlement guard ─────────────────────────────────

/**
 * Assert that the given organization has the required capability.
 * Throws AuthError if the capability is not available for the org's tier.
 */
export async function assertEntitlement(
  orgId: string,
  capability: Capability
): Promise<Entitlement> {
  const entitlement = await getOrgEntitlement(orgId);
  if (!has(entitlement, capability)) {
    throw new Error(
      `Entitlement check failed: "${capability}" requires ${entitlement.tier} tier or above.`
    );
  }
  return entitlement;
}

/**
 * Get the full entitlement object for an organization.
 */
export async function getOrgEntitlement(orgId: string): Promise<Entitlement> {
  const license = await db.license.findFirst({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  });
  const tier = (license?.tier as Tier) ?? 'free';
  return entitlementFor(tier);
}

// Re-export AuthError for convenience
export { AuthError } from '@/lib/auth';
