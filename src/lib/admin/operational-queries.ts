// Privacy-boundary read layer for the Founder Control Plane.
//
// Every exported helper uses an explicit Prisma `select` that structurally
// EXCLUDES customer proprietary business-case content (no inputs/results JSON,
// no client revenue, no proposal text, no AI prompts/outputs). The dashboard
// only ever sees operational metadata: identity, billing, entitlement, counts,
// timestamps, and system events.
//
// On port to the repo, this file is appended to (not replaced).
import { db } from '@/lib/db'
import type { Tier, Capability } from '@/lib/brand'
import { entitlementFor, isEntitlingStatus } from '@/lib/entitlement'

const PAGE_SIZE = 25

export type ListParams = {
  page?: number
  pageSize?: number
  search?: string
}

// ---------------------------------------------------------------------------
// OVERVIEW
// ---------------------------------------------------------------------------

export async function getOverviewMetrics() {
  const [
    activeOrgs,
    activeSubs,
    payments30d,
    failedPayments30d,
    newCustomers7d,
    cancellations30d,
    reports24h,
    reportFailures24h,
    webhookErrors24h,
    authFailures24h,
    systemErrors24h,
    pastDueSubs,
    cancelingSubs,
  ] = await Promise.all([
    db.organization.count(),
    db.subscription.count({ where: { status: 'active' } }),
    db.payment.findMany({
      where: { status: 'succeeded', createdAt: { gte: daysAgo(30) } },
      select: { amount: true, currency: true },
    }),
    db.payment.count({ where: { status: 'failed', createdAt: { gte: daysAgo(30) } } }),
    db.user.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    db.subscription.count({ where: { status: 'canceled', canceledAt: { gte: daysAgo(30) } } }),
    db.report.count({ where: { createdAt: { gte: daysAgo(1) } } }),
    db.systemEvent.count({ where: { eventType: 'REPORT_FAILED', createdAt: { gte: daysAgo(1) } } }),
    db.systemEvent.count({ where: { eventType: 'WEBHOOK_ERROR', createdAt: { gte: daysAgo(1) } } }),
    db.systemEvent.count({ where: { eventType: 'AUTH_FAILED', createdAt: { gte: daysAgo(1) } } }),
    db.systemEvent.count({ where: { severity: 'error', createdAt: { gte: daysAgo(1) } } }),
    db.subscription.count({ where: { status: 'past_due' } }),
    db.subscription.count({ where: { status: 'canceling' } }),
  ])

  // MRR: sum of monthly-equivalent recurring revenue from active subscriptions.
  // Pro = $49/mo, agency = $79/mo (historical), agency_pro = $790/yr → ~$65.8/mo.
  // We derive from the canonical PRO price ($49) for active pro subs; CUSTOM tiers
  // require manual verification so they are reported separately.
  const activeSubDetails = await db.subscription.findMany({
    where: { status: 'active' },
    select: { tier: true, planKey: true },
  })
  let proMrr = 0
  let customActive = 0
  for (const s of activeSubDetails) {
    if (s.tier === 'pro') proMrr += 49
    else if (s.tier === 'agency' || s.tier === 'agency_pro') customActive += 1
  }

  return {
    activeOrganizations: activeOrgs,
    activeSubscriptions: activeSubs,
    proMrr,
    customActiveCount: customActive,
    newCustomers7d,
    cancellations30d,
    pastDueSubs,
    cancelingSubs,
    failedPayments30d,
    reportsGenerated24h: reports24h,
    payments30dCount: payments30d.length,
    operationalSignals: {
      webhookFailures24h: webhookErrors24h,
      reportFailures24h,
      authFailures24h,
      systemErrors24h,
    },
  }
}

export async function getCustomerGrowthTrend(days = 30) {
  const users = await db.user.findMany({
    where: { createdAt: { gte: daysAgo(days) } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  const buckets = bucketByDay(days)
  for (const u of users) {
    const key = dayKey(u.createdAt)
    const b = buckets.find((x) => x.key === key)
    if (b) b.value += 1
  }
  return buckets
}

export async function getRevenueTrend(days = 30) {
  const payments = await db.payment.findMany({
    where: { status: 'succeeded', createdAt: { gte: daysAgo(days) } },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  const buckets = bucketByDay(days)
  for (const p of payments) {
    const key = dayKey(p.createdAt)
    const b = buckets.find((x) => x.key === key)
    if (b) b.value += p.amount
  }
  return buckets
}

export async function getSubscriptionMix() {
  const subs = await db.subscription.findMany({ select: { tier: true, status: true } })
  const mix: Record<string, number> = { free: 0, pro: 0, agency: 0, agency_pro: 0 }
  // orgs without subs count as free
  const orgCount = await db.organization.count()
  const orgsWithSub = new Set(
    (await db.subscription.findMany({ select: { organizationId: true } })).map((s) => s.organizationId),
  )
  mix.free = Math.max(0, orgCount - orgsWithSub.size)
  for (const s of subs) {
    if ((s.tier as Tier) in mix) mix[s.tier as Tier] += 1
  }
  return mix
}

export async function getProductActivity24h() {
  const [projects, reports, shares, proposals] = await Promise.all([
    db.project.count({ where: { createdAt: { gte: daysAgo(1) } } }),
    db.report.count({ where: { createdAt: { gte: daysAgo(1) }, reportType: 'client_report' } }),
    db.share.count({ where: { createdAt: { gte: daysAgo(1) } } }),
    db.report.count({ where: { createdAt: { gte: daysAgo(1) }, reportType: 'proposal' } }),
  ])
  return { projects, reports, shares, proposals }
}

export async function getRecentCriticalEvents(limit = 8) {
  return db.systemEvent.findMany({
    where: { severity: { in: ['warn', 'error'] } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      eventType: true,
      severity: true,
      organizationId: true,
      createdAt: true,
      requestId: true,
    },
  })
}

export async function getRecentSystemEvents(limit = 12) {
  return db.systemEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      eventType: true,
      severity: true,
      organizationId: true,
      userId: true,
      createdAt: true,
      requestId: true,
    },
  })
}

// ---------------------------------------------------------------------------
// CUSTOMERS (Users)
// ---------------------------------------------------------------------------

export type CustomerRow = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  systemRole: string
  createdAt: Date
  organization: { id: string; name: string } | null
  membershipRole: string | null
  plan: string
  subscriptionStatus: string | null
  lastActivity: Date | null
  projectCount: number
  reportCount: number
  needsAttention: boolean
  attentionReasons: string[]
}

export async function listCustomersForAdmin(params: ListParams & {
  plan?: string
  subscriptionStatus?: string
  attentionOnly?: boolean
} = {}) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? PAGE_SIZE)
  const where: Record<string, unknown> = {}

  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { email: { contains: params.search } },
    ]
  }

  // We filter by org name / plan post-fetch for plan/subscription filters because
  // those live on related models. For the preview dataset this is acceptable;
  // production uses a join. Pagination is enforced on the user set.
  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      systemRole: true,
      createdAt: true,
      memberships: {
        take: 1,
        select: {
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
              subscriptions: { take: 1, orderBy: { createdAt: 'desc' }, select: { status: true, tier: true, currentPeriodEnd: true, cancelAtPeriodEnd: true } },
              licenses: { take: 1, orderBy: { createdAt: 'desc' }, select: { tier: true } },
            },
          },
        },
      },
    },
  })

  // Enrich with usage counts + last activity
  const enriched = await Promise.all(
    users.map(async (u) => {
      const org = u.memberships[0]?.organization ?? null
      const sub = org?.subscriptions[0] ?? null
      const license = org?.licenses[0] ?? null
      const plan = sub?.tier ?? license?.tier ?? 'free'

      const [projectCount, reportCount, lastEvent] = await Promise.all([
        org ? db.project.count({ where: { organizationId: org.id } }) : Promise.resolve(0),
        org ? db.report.count({ where: { project: { organizationId: org.id } } }) : Promise.resolve(0),
        db.systemEvent.findFirst({
          where: { userId: u.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ])

      const attentionReasons: string[] = []
      if (sub && sub.status === 'past_due') attentionReasons.push('Past due')
      if (sub && sub.status === 'canceled') attentionReasons.push('Canceled')
      if (!org) attentionReasons.push('No organization')
      if (sub?.status === 'active' && sub.tier === 'free') attentionReasons.push('Active but free')

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        systemRole: u.systemRole,
        createdAt: u.createdAt,
        organization: org ? { id: org.id, name: org.name } : null,
        membershipRole: u.memberships[0]?.role ?? null,
        plan,
        subscriptionStatus: sub?.status ?? null,
        lastActivity: lastEvent?.createdAt ?? u.createdAt,
        projectCount,
        reportCount,
        needsAttention: attentionReasons.length > 0,
        attentionReasons,
      } satisfies CustomerRow
    }),
  )

  let filtered = enriched
  if (params.plan && params.plan !== 'all') filtered = filtered.filter((c) => c.plan === params.plan)
  if (params.subscriptionStatus && params.subscriptionStatus !== 'all')
    filtered = filtered.filter((c) => (c.subscriptionStatus ?? 'none') === params.subscriptionStatus)
  if (params.attentionOnly) filtered = filtered.filter((c) => c.needsAttention)

  const total = filtered.length
  const start = (page - 1) * pageSize
  const rows = filtered.slice(start, start + pageSize)

  return { rows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export async function getCustomerForAdmin(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      systemRole: true,
      createdAt: true,
      updatedAt: true,
      memberships: {
        select: {
          role: true,
          createdAt: true,
          organization: {
            select: {
              id: true,
              name: true,
              website: true,
              contactEmail: true,
              createdAt: true,
              subscriptions: { take: 1, orderBy: { createdAt: 'desc' }, select: { id: true, status: true, tier: true, planKey: true, currentPeriodStart: true, currentPeriodEnd: true, cancelAtPeriodEnd: true, canceledAt: true, createdAt: true, whopMembershipId: true } },
              licenses: { take: 1, orderBy: { createdAt: 'desc' }, select: { tier: true, purchasedAt: true, whopOrderId: true } },
            },
          },
        },
      },
    },
  })
  if (!user) return null

  const org = user.memberships[0]?.organization ?? null
  const sub = org?.subscriptions[0] ?? null
  const license = org?.licenses[0] ?? null
  const tier = (sub?.tier ?? license?.tier ?? 'free') as Tier
  const entitlement = entitlementFor(tier)
  const entitling = sub ? isEntitlingStatus(sub.status, sub.cancelAtPeriodEnd, sub.currentPeriodEnd) : false

  const [projectCount, reportCount, shareCount, recentEvents, recentAudit, recentPayments, recentShares] = await Promise.all([
    org ? db.project.count({ where: { organizationId: org.id } }) : Promise.resolve(0),
    org ? db.report.count({ where: { project: { organizationId: org.id } } }) : Promise.resolve(0),
    org ? db.share.count({ where: { project: { organizationId: org.id } } }) : Promise.resolve(0),
    db.systemEvent.findMany({
      where: { OR: [{ userId }, org ? { organizationId: org.id } : {}] },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, eventType: true, severity: true, createdAt: true, requestId: true },
    }),
    db.auditLog.findMany({
      where: { OR: [{ actorUserId: userId }, org ? { targetType: 'Organization', targetId: org.id } : {}] },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, action: true, actorRole: true, reason: true, createdAt: true },
    }),
    org ? db.payment.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, amount: true, currency: true, status: true, createdAt: true, whopPaymentId: true },
    }) : Promise.resolve([]),
    org ? db.share.findMany({
      where: { project: { organizationId: org.id } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        shareId: true,
        decisionState: true,
        createdAt: true,
        updatedAt: true,
        project: { select: { clientName: true } },
      },
    }) : Promise.resolve([]),
  ])

  return {
    identity: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      systemRole: user.systemRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    organization: org
      ? {
          id: org.id,
          name: org.name,
          website: org.website,
          contactEmail: org.contactEmail,
          createdAt: org.createdAt,
          membershipRole: user.memberships[0]?.role ?? null,
        }
      : null,
    subscription: sub
      ? {
          id: sub.id,
          status: sub.status,
          tier: sub.tier as Tier,
          planKey: sub.planKey,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          canceledAt: sub.canceledAt,
          createdAt: sub.createdAt,
          whopMembershipId: sub.whopMembershipId,
        }
      : null,
    entitlement: {
      tier,
      capabilities: entitlement.capabilities as Capability[],
      source: sub ? 'subscription' : license ? 'license' : 'default',
      active: entitling,
    },
    usage: { projectCount, reportCount, shareCount },
    recentEvents,
    recentAudit,
    recentPayments,
    recentShares,
  }
}

// ---------------------------------------------------------------------------
// ORGANIZATIONS
// ---------------------------------------------------------------------------

export async function listOrganizationsForAdmin(params: ListParams = {}) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? PAGE_SIZE)
  const where: Record<string, unknown> = {}
  if (params.search) where.name = { contains: params.search }

  const [total, orgs] = await Promise.all([
    db.organization.count({ where }),
    db.organization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        contactEmail: true,
        createdAt: true,
        _count: { select: { memberships: true, projects: true, shareEvents: true } },
        memberships: { where: { role: 'owner' }, take: 1, select: { user: { select: { name: true, email: true } } } },
        subscriptions: { take: 1, orderBy: { createdAt: 'desc' }, select: { status: true, tier: true, currentPeriodEnd: true } },
        licenses: { take: 1, orderBy: { createdAt: 'desc' }, select: { tier: true } },
      },
    }),
  ])

  const rows = orgs.map((o) => {
    const sub = o.subscriptions[0] ?? null
    const license = o.licenses[0] ?? null
    const plan = sub?.tier ?? license?.tier ?? 'free'
    return {
      id: o.id,
      name: o.name,
      contactEmail: o.contactEmail,
      owner: o.memberships[0]?.user ?? null,
      memberCount: o._count.memberships,
      projectCount: o._count.projects,
      plan,
      subscriptionStatus: sub?.status ?? null,
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      createdAt: o.createdAt,
      shareEventCount: o._count.shareEvents,
    }
  })

  return { rows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export async function getOrganizationForAdmin(organizationId: string) {
  const org = await db.organization.findUnique({
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
      memberships: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, role: true, createdAt: true, user: { select: { id: true, name: true, email: true, systemRole: true } } },
      },
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, status: true, tier: true, planKey: true, currentPeriodStart: true, currentPeriodEnd: true, cancelAtPeriodEnd: true, canceledAt: true, createdAt: true, whopMembershipId: true } },
      licenses: { orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, tier: true, purchasedAt: true, whopOrderId: true } },
      _count: { select: { projects: true, memberships: true, payments: true, shareEvents: true } },
    },
  })
  if (!org) return null

  const sub = org.subscriptions[0] ?? null
  const tier = (sub?.tier ?? org.licenses[0]?.tier ?? 'free') as Tier
  const entitlement = entitlementFor(tier)

  const [recentEvents, recentPayments] = await Promise.all([
    db.systemEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, eventType: true, severity: true, createdAt: true, requestId: true },
    }),
    db.payment.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, amount: true, currency: true, status: true, createdAt: true, whopPaymentId: true },
    }),
  ])

  return {
    ...org,
    tier,
    entitlement,
    recentEvents,
    recentPayments,
    counts: org._count,
  }
}

// ---------------------------------------------------------------------------
// SUBSCRIPTIONS
// ---------------------------------------------------------------------------

export async function listSubscriptionsForAdmin(params: ListParams & { status?: string } = {}) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? PAGE_SIZE)
  const where: Record<string, unknown> = {}
  if (params.status && params.status !== 'all') where.status = params.status
  if (params.search) {
    where.OR = [
      { organization: { name: { contains: params.search } } },
      { whopMembershipId: { contains: params.search } },
      { planKey: { contains: params.search } },
    ]
  }

  const [total, subs] = await Promise.all([
    db.subscription.count({ where }),
    db.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
        organization: { select: { id: true, name: true } },
      },
    }),
  ])

  return { rows: subs, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

// ---------------------------------------------------------------------------
// PAYMENTS
// ---------------------------------------------------------------------------

export async function listPaymentsForAdmin(params: ListParams & { status?: string } = {}) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? PAGE_SIZE)
  const where: Record<string, unknown> = {}
  if (params.status && params.status !== 'all') where.status = params.status
  if (params.search) {
    where.OR = [
      { organization: { name: { contains: params.search } } },
      { whopPaymentId: { contains: params.search } },
      { whopEventId: { contains: params.search } },
    ]
  }

  const [total, payments] = await Promise.all([
    db.payment.count({ where }),
    db.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        organizationId: true,
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
    }),
  ])

  return { rows: payments, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

// ---------------------------------------------------------------------------
// ENTITLEMENTS
// ---------------------------------------------------------------------------

export async function listEntitlementsForAdmin(params: ListParams = {}) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? PAGE_SIZE)
  const where: Record<string, unknown> = {}
  if (params.search) where.name = { contains: params.search }

  const [total, orgs] = await Promise.all([
    db.organization.count({ where }),
    db.organization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        createdAt: true,
        subscriptions: { take: 1, orderBy: { createdAt: 'desc' }, select: { tier: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true, createdAt: true } },
        licenses: { take: 1, orderBy: { createdAt: 'desc' }, select: { tier: true, updatedAt: true, purchasedAt: true } },
      },
    }),
  ])

  const rows = orgs.map((o) => {
    const sub = o.subscriptions[0] ?? null
    const license = o.licenses[0] ?? null
    const tier = (sub?.tier ?? license?.tier ?? 'free') as Tier
    const ent = entitlementFor(tier)
    const active = sub ? isEntitlingStatus(sub.status, sub.cancelAtPeriodEnd, sub.currentPeriodEnd) : false
    return {
      id: o.id,
      organizationId: o.id,
      organizationName: o.name,
      plan: tier,
      subscriptionStatus: sub?.status ?? null,
      subscriptionTier: sub?.tier ?? null,
      cachedTier: license?.tier ?? null,
      capabilities: ent.capabilities as Capability[],
      capabilityCount: ent.capabilities.length,
      source: sub ? 'subscription' : license ? 'license' : 'default',
      active,
      updatedAt: license?.updatedAt ?? sub?.createdAt ?? o.createdAt,
    }
  })

  return { rows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

// ---------------------------------------------------------------------------
// SYSTEM EVENTS
// ---------------------------------------------------------------------------

export async function listSystemEventsForAdmin(params: ListParams & {
  eventType?: string
  severity?: string
  organizationId?: string
} = {}) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(200, params.pageSize ?? 50)
  const where: Record<string, unknown> = {}
  if (params.eventType && params.eventType !== 'all') where.eventType = params.eventType
  if (params.severity && params.severity !== 'all') where.severity = params.severity
  if (params.organizationId) where.organizationId = params.organizationId
  if (params.search) where.eventType = { contains: params.search.toUpperCase() }

  const [total, events] = await Promise.all([
    db.systemEvent.count({ where }),
    db.systemEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        eventType: true,
        organizationId: true,
        userId: true,
        severity: true,
        requestId: true,
        createdAt: true,
      },
    }),
  ])

  return { rows: events, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export async function getEventCountsByTypeAndDay(daysBack = 30) {
  const events = await db.systemEvent.findMany({
    where: { createdAt: { gte: daysAgo(daysBack) } },
    select: { eventType: true, severity: true, createdAt: true },
  })
  return events
}

export async function getEventTypeSummary() {
  const grouped = await db.systemEvent.groupBy({
    by: ['eventType'],
    _count: true,
    orderBy: { _count: { eventType: 'desc' } },
    take: 30,
  })
  return grouped
}

// Heatmap data: 7 days × 24 hours grid of event counts.
// Returns a 2D array [day][hour] of counts, plus the max count for color scaling.
export async function getEventHeatmap(daysBack = 7): Promise<{
  grid: number[][] // [7][24] — day 0 = oldest, day 6 = today
  dayLabels: string[]
  maxCount: number
  total: number
}> {
  const events = await db.systemEvent.findMany({
    where: { createdAt: { gte: daysAgo(daysBack) } },
    select: { createdAt: true, severity: true },
  })

  // Build a 7×24 grid. Day 0 = oldest day, day 6 = today.
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000

  let maxCount = 0
  let total = 0
  for (const e of events) {
    const dayDiff = Math.floor((now.getTime() - e.createdAt.getTime()) / dayMs)
    if (dayDiff < 0 || dayDiff >= 7) continue
    const dayIndex = 6 - dayDiff // 0 = oldest, 6 = today
    const hour = e.createdAt.getHours()
    grid[dayIndex][hour]++
    maxCount = Math.max(maxCount, grid[dayIndex][hour])
    total++
  }

  const dayLabels: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * dayMs)
    dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }))
  }

  return { grid, dayLabels, maxCount, total }
}

// ---------------------------------------------------------------------------
// AUDIT LOG
// ---------------------------------------------------------------------------

export async function listAuditLogForAdmin(params: ListParams & { action?: string; actionPrefix?: string; role?: string } = {}) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(200, params.pageSize ?? 50)
  const where: Record<string, unknown> = {}
  if (params.action && params.action !== 'all') where.action = params.action
  if (params.actionPrefix) where.action = { startsWith: params.actionPrefix }
  if (params.role && params.role !== 'all') where.actorRole = params.role
  if (params.search) {
    where.OR = [
      { action: { contains: params.search } },
      { reason: { contains: params.search } },
    ]
  }

  const [total, logs] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        actorUserId: true,
        actorRole: true,
        action: true,
        targetType: true,
        targetId: true,
        reason: true,
        createdAt: true,
      },
    }),
  ])

  return { rows: logs, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

// ---------------------------------------------------------------------------
// SYSTEM HEALTH
// ---------------------------------------------------------------------------

export async function checkDbConnectivity(): Promise<{ ok: boolean; latencyMs: number | null }> {
  const start = Date.now()
  try {
    await db.$queryRaw`SELECT 1`
    return { ok: true, latencyMs: Date.now() - start }
  } catch {
    return { ok: false, latencyMs: null }
  }
}

// Take N quick DB latency measurements for a sparkline.
// Each is a SELECT 1 round-trip. Returns ms per probe.
export async function getDbLatencyHistory(probes = 8): Promise<number[]> {
  const results: number[] = []
  for (let i = 0; i < probes; i++) {
    const start = Date.now()
    try {
      await db.$queryRaw`SELECT 1`
      results.push(Date.now() - start)
    } catch {
      results.push(0) // error → 0 so the sparkline still renders
    }
  }
  return results
}

export function checkEnvConfig() {
  // Booleans only — never values.
  const envKeys = [
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'WHOP_API_KEY',
    'WHOP_COMPANY_ID',
    'WHOP_WEBHOOK_SECRET',
    'GITHUB_ID',
    'GITHUB_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'BLOB_READ_WRITE_TOKEN',
    'ZAI_API_KEY',
  ]
  return envKeys.map((k) => ({ key: k, present: Boolean(process.env[k]) }))
}

// ---------------------------------------------------------------------------
// SEARCH
// ---------------------------------------------------------------------------

export type SearchResult =
  | { kind: 'customer'; id: string; label: string; sublabel: string }
  | { kind: 'organization'; id: string; label: string; sublabel: string }
  | { kind: 'subscription'; id: string; label: string; sublabel: string }
  | { kind: 'payment'; id: string; label: string; sublabel: string }
  | { kind: 'event'; id: string; label: string; sublabel: string }

export async function adminSearch(query: string, limit = 12): Promise<SearchResult[]> {
  const q = query.trim()
  if (!q) return []
  const results: SearchResult[] = []

  const [users, orgs, subs, payments, events] = await Promise.all([
    db.user.findMany({
      where: { OR: [{ name: { contains: q } }, { email: { contains: q } }] },
      take: limit,
      select: { id: true, name: true, email: true },
    }),
    db.organization.findMany({
      where: { name: { contains: q } },
      take: limit,
      select: { id: true, name: true, contactEmail: true },
    }),
    db.subscription.findMany({
      where: { OR: [{ whopMembershipId: { contains: q } }, { planKey: { contains: q } }] },
      take: limit,
      select: { id: true, whopMembershipId: true, planKey: true, tier: true, organization: { select: { name: true } } },
    }),
    db.payment.findMany({
      where: { OR: [{ whopPaymentId: { contains: q } }, { whopEventId: { contains: q } }] },
      take: limit,
      select: { id: true, whopPaymentId: true, amount: true, currency: true, organization: { select: { name: true } } },
    }),
    db.systemEvent.findMany({
      where: { OR: [{ eventType: { contains: q.toUpperCase() } }, { requestId: { contains: q } }] },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, eventType: true, createdAt: true, severity: true },
    }),
  ])

  for (const u of users) results.push({ kind: 'customer', id: u.id, label: u.name ?? u.email ?? 'Customer', sublabel: u.email ?? '' })
  for (const o of orgs) results.push({ kind: 'organization', id: o.id, label: o.name, sublabel: o.contactEmail ?? 'Organization' })
  for (const s of subs) results.push({ kind: 'subscription', id: s.id, label: `${s.tier} · ${s.organization.name}`, sublabel: s.whopMembershipId ?? s.planKey })
  for (const p of payments) results.push({ kind: 'payment', id: p.id, label: `${p.amount} ${p.currency} · ${p.organization.name}`, sublabel: p.whopPaymentId })
  for (const e of events) results.push({ kind: 'event', id: e.id, label: e.eventType, sublabel: e.createdAt.toISOString() })

  return results.slice(0, limit)
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function bucketByDay(days: number): { key: string; label: string; value: number }[] {
  const out: { key: string; label: string; value: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    out.push({ key: dayKey(d), label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: 0 })
  }
  return out
}
