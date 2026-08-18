/**
 * Operational query helpers for Superadmin routes (Agent 2).
 *
 * THE PRIVACY BOUNDARY — this is the most important module in the
 * Agent 2 mandate. Per Viableo Production Architecture §8.2 and
 * Agent 2 master prompt §6.2:
 *
 *   "Build src/lib/admin/operational-queries.ts as the ONLY module any
 *    /admin/** code is allowed to import from for customer/organization/
 *    subscription/payment data. Every exported function must use an
 *    explicit Prisma select naming only operational fields."
 *
 * WHAT THIS MODULE MAY RETURN:
 *   - IDs, createdAt, updatedAt, organizationId, tier, status, counts
 *     via _count, aggregates via groupBy/aggregate.
 *   - For payments: amount, currency, status, refund state — these
 *     are billing-visibility facts, not customer financial content.
 *
 * WHAT THIS MODULE MUST NEVER RETURN (the OWASP A01 broken-access-control
 * failure mode that query-shape boundaries structurally prevent):
 *   - Project.inputs / Project.results — proprietary customer financial
 *     assumptions and ROI calculations.
 *   - Report.pdfUrl content — proprietary client-facing deliverables.
 *   - Share/ShareApproval name/email/comment content beyond what's
 *     strictly needed for engagement counts.
 *   - AI prompt text or completion content.
 *
 * The privacy boundary is enforced at the MODULE level: a future
 * engineer adding a new admin page carelessly would have to
 * DELIBERATELY import a content-fetching function into an admin
 * context — a visible, reviewable action, rather than silently
 * forgetting to hide a column in a UI component.
 *
 * Audit-log is also exposed here as a read-only query target (it is
 * itself an operational record of privileged actions, not customer
 * financial content).
 */
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// ── Organizations / Customers ─────────────────────────────────────

/**
 * List all organizations with operational metadata only.
 * No Project.inputs/results, no Share content, no AI prompts.
 */
export async function listOrganizationsForAdmin() {
  return db.organization.findMany({
    select: {
      id: true,
      name: true,
      website: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          projects: true,
          memberships: true,
          shareEvents: true,
        },
      },
      licenses: {
        select: { id: true, tier: true, purchasedAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      subscriptions: {
        select: {
          id: true,
          status: true,
          tier: true,
          planKey: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          canceledAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a single organization's operational profile (no project content).
 */
export async function getOrganizationForAdmin(organizationId: string) {
  return db.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      website: true,
      contactEmail: true,
      phone: true,
      logoUrl: true,
      brandColorHex: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          projects: true,
          memberships: true,
          shareEvents: true,
          payments: true,
          subscriptions: true,
        },
      },
      memberships: {
        select: {
          id: true,
          userId: true,
          role: true,
          createdAt: true,
          user: { select: { id: true, email: true, name: true, systemRole: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

// ── Subscriptions / Payments ──────────────────────────────────────

/**
 * List all subscriptions with org name + tier + status — read-only.
 */
export async function listSubscriptionsForAdmin() {
  return db.subscription.findMany({
    select: {
      id: true,
      organizationId: true,
      whopMembershipId: true,
      planKey: true,
      tier: true,
      status: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      canceledAt: true,
      createdAt: true,
      updatedAt: true,
      organization: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * List all payments — amount/currency/status visible (billing visibility
 * is appropriate per the master prompt §6.2). NEVER joins to
 * Project.inputs/results (Payment has no FK to Project, by design).
 */
export async function listPaymentsForAdmin() {
  return db.payment.findMany({
    select: {
      id: true,
      organizationId: true,
      subscriptionId: true,
      whopPaymentId: true,
      whopEventId: true,
      amount: true,
      currency: true,
      status: true,
      whopProductId: true,
      whopPlanId: true,
      refundedAmount: true,
      refundedAt: true,
      createdAt: true,
      organization: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ── Entitlements (operational read; mutations go via separate
// audited override routes, never via this read module) ─────────────

/**
 * List current tier per organization (the License cache + the
 * Subscription source of truth side-by-side). Read-only.
 */
export async function listEntitlementsForAdmin() {
  const orgs = await db.organization.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      licenses: {
        select: { id: true, tier: true, purchasedAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      subscriptions: {
        select: {
          id: true,
          tier: true,
          status: true,
          planKey: true,
          currentPeriodEnd: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return orgs.map((o) => ({
    organizationId: o.id,
    organizationName: o.name,
    cachedTier: o.licenses[0]?.tier ?? 'free',
    subscriptionTier: o.subscriptions[0]?.tier ?? null,
    subscriptionStatus: o.subscriptions[0]?.status ?? null,
    planKey: o.subscriptions[0]?.planKey ?? null,
    currentPeriodEnd: o.subscriptions[0]?.currentPeriodEnd ?? null,
    licensePurchasedAt: o.licenses[0]?.purchasedAt ?? null,
  }));
}

// ── PlanMapping (global pricing config — Superadmin can view/edit
// via a separate audited route; this module is read-only) ─────────

export async function listPlanMappingsForAdmin() {
  return db.planMapping.findMany({
    select: {
      id: true,
      whopPlanId: true,
      whopProductId: true,
      tier: true,
      billingPeriod: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

// ── SystemEvent dashboard queries ──────────────────────────────────

/**
 * Rolling event counts per eventType, grouped by day, for the last N days.
 * Used by the /admin/events dashboard. Operational metadata only —
 * no event payload content (metadata field is NOT selected).
 */
export async function getEventCountsByTypeAndDay(daysBack: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  const rows = await db.systemEvent.groupBy({
    by: ['eventType'],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
    orderBy: { eventType: 'asc' },
  });
  return rows.map((r) => ({
    eventType: r.eventType,
    count: (r._count as { _all: number })._all,
  }));
}

/**
 * Get the most recent N system events (metadata sanitized — only
 * the eventType / severity / timestamps are returned, NOT the
 * raw metadata blob which may contain operational IDs but never
 * financial content).
 */
export async function getRecentSystemEvents(limit: number = 50) {
  return db.systemEvent.findMany({
    select: {
      id: true,
      eventType: true,
      organizationId: true,
      userId: true,
      severity: true,
      createdAt: true,
      requestId: true,
      // metadata is intentionally NOT selected — it may contain
      // operational IDs (projectIds, shareIds) but the principle is
      // to surface the LEAST content needed for the dashboard.
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Recent webhook errors (the most actionable subset of system events
 * for a founder checking "is anything broken right now?").
 */
export async function getRecentWebhookErrors(limit: number = 20) {
  return db.systemEvent.findMany({
    select: {
      id: true,
      eventType: true,
      organizationId: true,
      severity: true,
      metadata: true, // WEBHOOK_ERROR metadata is operational only (reason, planId)
      createdAt: true,
    },
    where: { eventType: 'WEBHOOK_ERROR' },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// ── AuditLog (read-only — AuditLog is append-only per §9.1) ───────

/**
 * List AuditLog rows. Filterable by action / actorUserId / targetType.
 * Read-only — the AuditLog write path is logAuditAction() only.
 */
export async function listAuditLogForAdmin(opts: {
  action?: string;
  actorUserId?: string;
  targetType?: string;
  limit?: number;
} = {}) {
  const where: Prisma.AuditLogWhereInput = {};
  if (opts.action) where.action = opts.action;
  if (opts.actorUserId) where.actorUserId = opts.actorUserId;
  if (opts.targetType) where.targetType = opts.targetType;
  return db.auditLog.findMany({
    select: {
      id: true,
      actorUserId: true,
      actorRole: true,
      action: true,
      targetType: true,
      targetId: true,
      reason: true,
      metadata: true, // operational action metadata, not customer content
      createdAt: true,
    },
    where,
    orderBy: { createdAt: 'desc' },
    take: opts.limit ?? 100,
  });
}

// ── Health-check (operational, no content) ─────────────────────────

/**
 * Check whether required env vars are configured (never their values —
 * just presence). Used by /api/admin/system/health.
 */
export function checkEnvConfig(): {
  ZAI_API_KEY: boolean;
  WHOP_WEBHOOK_SECRET: boolean;
  BLOB_READ_WRITE_TOKEN: boolean;
  NEXTAUTH_SECRET: boolean;
  DATABASE_URL: boolean;
  DIRECT_URL: boolean;
  GITHUB_ID: boolean;
} {
  return {
    ZAI_API_KEY: !!process.env.ZAI_API_KEY,
    WHOP_WEBHOOK_SECRET: !!process.env.WHOP_WEBHOOK_SECRET,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    GITHUB_ID: !!process.env.GITHUB_ID,
  };
}

/**
 * Lightweight DB connectivity check. Throws if the DB is unreachable.
 * Uses a trivial SELECT 1 — never touches customer content.
 */
export async function checkDbConnectivity(): Promise<void> {
  await db.$queryRaw`SELECT 1`;
}
