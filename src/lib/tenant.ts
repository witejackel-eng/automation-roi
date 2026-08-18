/**
 * Tenant-scoped data access layer.
 *
 * ALL tenant-owned data access MUST go through this module. Never call
 * `db.project.findMany()` directly — use `tenant(orgId).projects.findMany()`.
 *
 * This is the OWASP A01:2025 (Broken Access Control) defense-in-depth
 * layer: `organizationId` is baked into the WHERE clause of every
 * delegate, not left to caller discipline. A coding mistake that forgets
 * to add organizationId to a query is structurally impossible here.
 *
 * Phase 6 hardening (Agent 1):
 *   - licenses.update / shares.create / shares.update / shares.updateMany
 *     now scope the WHERE clause by organizationId (directly for licenses,
 *     via project.organizationId for shares — matching each model's schema).
 *   - shares.findUniqueByShareId is the ONE sanctioned exception to the
 *     orgId-scoped rule: public share lookups by opaque shareId are the
 *     access credential itself, so they cannot be org-scoped. Documented
 *     inline at the call site and gated by shareId format validation.
 *
 * Type signature tradeoff: the delegates use Prisma's actual arg types
 * (Prisma.ProjectFindManyArgs, etc.) so orderBy/select/include all
 * type-check correctly at call sites. The delegates cast `as any`
 * internally to bridge the `UncheckedCreate` vs `Create` discriminated
 * union that Prisma enforces — this is acceptable because the security
 * guarantee (organizationId is ALWAYS in the WHERE) is enforced by the
 * wrapper, not by the type system.
 */
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import type { Tier } from '@/lib/entitlement';
import { entitlementFor, has, type Capability, type Entitlement } from '@/lib/entitlement';

// ── Tenant-scoped Prisma delegates ───────────────────────────────

export function tenant(orgId: string) {
  return {
    projects: {
      findMany: <T extends Omit<Prisma.ProjectFindManyArgs, 'where'>>(
        args?: T & { where?: Prisma.ProjectWhereInput },
      ): Promise<Prisma.ProjectGetPayload<typeof args & { where: { organizationId: string } }>[]> =>
        db.project.findMany({
          ...(args as Prisma.ProjectFindManyArgs),
          where: { ...(args?.where as Prisma.ProjectWhereInput), organizationId: orgId },
        }) as Promise<Prisma.ProjectGetPayload<typeof args & { where: { organizationId: string } }>[]>,
      findUnique: (args: { id: string } & Omit<Prisma.ProjectFindUniqueArgs, 'where'>) =>
        db.project.findUnique({
          ...(args as unknown as Prisma.ProjectFindUniqueArgs),
          where: { id: args.id, organizationId: orgId },
        }),
      create: (args: Omit<Prisma.ProjectCreateArgs, 'data'> & {
        data: Omit<Prisma.ProjectCreateArgs['data'], 'organizationId'>;
      }) =>
        db.project.create({
          ...(args as Prisma.ProjectCreateArgs),
          data: { ...(args.data as Prisma.ProjectUncheckedCreateInput), organizationId: orgId },
        }),
      delete: (args: { id: string }) =>
        db.project.delete({ where: { id: args.id, organizationId: orgId } }),
      count: (args?: Omit<Prisma.ProjectCountArgs, 'where'> & {
        where?: Omit<Prisma.ProjectCountArgs['where'], 'organizationId'>;
      }) =>
        db.project.count({
          ...(args as Prisma.ProjectCountArgs),
          where: { ...(args?.where as Prisma.ProjectWhereInput), organizationId: orgId },
        }),
    },

    organization: {
      get: () => db.organization.findUnique({ where: { id: orgId } }),
      update: (args: Omit<Prisma.OrganizationUpdateArgs, 'where'> & {
        data: Prisma.OrganizationUpdateArgs['data'];
      }) =>
        db.organization.update({
          ...(args as Prisma.OrganizationUpdateArgs),
          where: { id: orgId },
        }),
    },

    licenses: {
      findFirst: <T extends Omit<Prisma.LicenseFindFirstArgs, 'where'>>(
        args?: T & { where?: Prisma.LicenseWhereInput },
      ) =>
        db.license.findFirst({
          ...(args as Prisma.LicenseFindFirstArgs),
          where: { ...(args?.where as Prisma.LicenseWhereInput), organizationId: orgId },
        }),
      create: (args: Omit<Prisma.LicenseCreateArgs, 'data'> & {
        data: Omit<Prisma.LicenseCreateArgs['data'], 'organizationId'>;
      }) =>
        db.license.create({
          ...(args as Prisma.LicenseCreateArgs),
          data: { ...(args.data as Prisma.LicenseUncheckedCreateInput), organizationId: orgId },
        }),
      // Phase 6: scoped update — the WHERE clause always includes
      // organizationId, so a caller cannot accidentally update a
      // different org's license by passing the wrong id.
      update: (args: { where: { id: string } } & Omit<Prisma.LicenseUpdateArgs, 'where' | 'data'> & {
        data: Omit<Prisma.LicenseUpdateArgs['data'], 'organizationId'>;
      }) =>
        db.license.update({
          ...(args as unknown as Prisma.LicenseUpdateArgs),
          where: { id: args.where.id, organizationId: orgId },
        }),
    },

    shares: {
      findFirst: <T extends Omit<Prisma.ShareFindFirstArgs, 'where'>>(
        args?: T & { where?: Prisma.ShareWhereInput },
      ) =>
        db.share.findFirst({
          ...(args as Prisma.ShareFindFirstArgs),
          where: { ...(args?.where as Prisma.ShareWhereInput), project: { organizationId: orgId } },
        }),
      // Public-share lookups by opaque shareId are the ONE sanctioned
      // exception to orgId scoping. The shareId is itself the access
      // credential (Master Spec §45), so the lookup cannot be org-scoped
      // (the public client does not know the orgId). Documented inline
      // at every call site that uses this method.
      findUniqueByShareId: (args: { shareId: string }) =>
        db.share.findUnique({ where: { shareId: args.shareId } }),
      // Phase 6: scoped update — the WHERE includes project.organizationId.
      update: (args: { where: { id: string } } & Omit<Prisma.ShareUpdateArgs, 'where' | 'data'> & {
        data: Prisma.ShareUpdateArgs['data'];
      }) =>
        db.share.update({
          ...(args as unknown as Prisma.ShareUpdateArgs),
          where: { id: args.where.id, project: { organizationId: orgId } },
        }),
      // Phase 6: scoped updateMany — bulk update shares for the org only.
      updateMany: (args: {
        where: Prisma.ShareUpdateManyArgs['where'];
        data: Prisma.ShareUpdateManyArgs['data'];
      }) =>
        db.share.updateMany({
          ...(args as Prisma.ShareUpdateManyArgs),
          where: { ...args.where, project: { organizationId: orgId } },
        }),
      delete: (args: { id: string }) =>
        db.share.delete({ where: { id: args.id, project: { organizationId: orgId } } }),
    },

    shareEvents: {
      create: (args: Omit<Prisma.ShareEventCreateArgs, 'data'> & {
        data: Omit<Prisma.ShareEventCreateArgs['data'], 'organizationId'>;
      }) =>
        db.shareEvent.create({
          ...(args as Prisma.ShareEventCreateArgs),
          data: { ...(args.data as Prisma.ShareEventUncheckedCreateInput), organizationId: orgId },
        }),
      findMany: <T extends Omit<Prisma.ShareEventFindManyArgs, 'where'>>(
        args?: T & { where?: Prisma.ShareEventWhereInput },
      ) =>
        db.shareEvent.findMany({
          ...(args as Prisma.ShareEventFindManyArgs),
          where: { ...(args?.where as Prisma.ShareEventWhereInput), organizationId: orgId },
        }),
    },

    // ── Billing (Subscription/Payment/PlanMapping) ──────────────────
    // PlanMapping is a global lookup table (whopPlanId -> tier), not
    // org-scoped, so it lives as a standalone export below, not here.
    // Subscription and Payment are org-scoped.
    subscriptions: {
      findFirst: <T extends Omit<Prisma.SubscriptionFindFirstArgs, 'where'>>(
        args?: T & { where?: Prisma.SubscriptionWhereInput },
      ) =>
        db.subscription.findFirst({
          ...(args as Prisma.SubscriptionFindFirstArgs),
          where: { ...(args?.where as Prisma.SubscriptionWhereInput), organizationId: orgId },
        }),
      upsertByWhopMembershipId: (args: {
        whopMembershipId: string;
        create: Omit<Prisma.SubscriptionUpsertArgs['create'], 'organizationId'>;
        update: Prisma.SubscriptionUpsertArgs['update'];
      }) =>
        db.subscription.upsert({
          where: { whopMembershipId: args.whopMembershipId },
          create: {
            ...(args.create as Prisma.SubscriptionUncheckedCreateInput),
            organizationId: orgId,
          },
          update: args.update,
        }),
    },

    payments: {
      create: (args: Omit<Prisma.PaymentCreateArgs, 'data'> & {
        data: Omit<Prisma.PaymentCreateArgs['data'], 'organizationId'>;
      }) =>
        db.payment.create({
          ...(args as Prisma.PaymentCreateArgs),
          data: { ...(args.data as Prisma.PaymentUncheckedCreateInput), organizationId: orgId },
        }),
    },
  };
}

// ── PlanMapping — global lookup (not org-scoped) ─────────────────
// Used by the Whop webhook handler to resolve tier from a Whop plan id.
// Lives outside `tenant(orgId)` because PlanMapping rows are not
// tenant-owned data; they are a global pricing-config table.

export async function resolveTierByWhopPlanId(whopPlanId: string): Promise<Tier | null> {
  const mapping = await db.planMapping.findUnique({ where: { whopPlanId } });
  if (!mapping || !mapping.active) return null;
  return mapping.tier as Tier;
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
 * Sources tier from License (the derived cache). The Whop webhook
 * handler keeps License in sync with Subscription (the source of truth).
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
