// Viableo Founder Control Plane — preview seed (DEMO data, clearly labelled).
// Creates realistic-shaped operational records so the dashboard renders with
// real data patterns. Production uses real customer/billing/event records.
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const SUPERADMIN_ID = 'cl Founder0superadmin0000000000a'
const SUPERADMIN_EMAIL = 'founder@viableo.dev'

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
function hoursAgo(n: number): Date {
  const d = new Date()
  d.setHours(d.getHours() - n)
  return d
}

async function main() {
  console.log('Seeding Viableo Founder Control Plane demo data…')

  // QA test organization (isolated from real customer data)
  const QA_ORG_ID = 'org_qa_founder_test'
  await db.organization.upsert({
    where: { id: QA_ORG_ID },
    update: {},
    create: {
      id: QA_ORG_ID,
      name: 'Founder QA Test Org',
      contactEmail: 'qa@viableo.test',
      website: 'https://qa.viableo.test',
      createdAt: daysAgo(1),
    },
  })
  await db.user.upsert({
    where: { id: 'usr_qa_owner' },
    update: {},
    create: { id: 'usr_qa_owner', name: 'QA Owner', email: 'qa@viableo.test', systemRole: 'USER', createdAt: daysAgo(1) },
  })
  await db.membership.upsert({
    where: { userId_organizationId: { userId: 'usr_qa_owner', organizationId: QA_ORG_ID } },
    update: {},
    create: { userId: 'usr_qa_owner', organizationId: QA_ORG_ID, role: 'owner' },
  })
  await db.license.upsert({
    where: { id: 'lic_qa' },
    update: {},
    create: { id: 'lic_qa', organizationId: QA_ORG_ID, tier: 'free', createdAt: daysAgo(1) },
  })

  // Superadmin
  await db.user.upsert({
    where: { id: SUPERADMIN_ID },
    update: {},
    create: {
      id: SUPERADMIN_ID,
      name: 'Viableo Founder',
      email: SUPERADMIN_EMAIL,
      systemRole: 'SUPERADMIN',
      createdAt: daysAgo(120),
    },
  })

  // Plan mappings (canonical: FREE / PRO / CUSTOM)
  const plans = [
    { whopPlanId: 'plan_free_v1', tier: 'free', billingPeriod: null, active: true },
    { whopPlanId: 'plan_pro_monthly_v1', tier: 'pro', billingPeriod: 'monthly', active: true },
    { whopPlanId: 'plan_pro_annual_v1', tier: 'pro', billingPeriod: 'annual', active: true },
    { whopPlanId: 'plan_agency_monthly_v1', tier: 'agency', billingPeriod: 'monthly', active: true },
    { whopPlanId: 'plan_agency_pro_annual_v1', tier: 'agency_pro', billingPeriod: 'annual', active: true },
    { whopPlanId: 'plan_legacy_29', tier: 'pro', billingPeriod: 'monthly', active: false },
  ]
  for (const p of plans) {
    await db.planMapping.upsert({
      where: { whopPlanId: p.whopPlanId },
      update: {},
      create: p,
    })
  }

  // Organizations + owners
  const orgSeed = [
    { name: 'Northwind Automation', email: 'caleb@northwind.io', plan: 'pro', status: 'active', age: 92 },
    { name: 'Brightflow Labs', email: 'sasha@brightflow.co', plan: 'agency_pro', status: 'active', age: 64 },
    { name: 'Kepler Consulting', email: 'marcus@kepler.consulting', plan: 'pro', status: 'past_due', age: 47 },
    { name: 'Tessera Digital', email: 'imogen@tessera.digital', plan: 'free', status: null, age: 38 },
    { name: 'Halden & Co', email: 'yuki@halden.co', plan: 'agency', status: 'active', age: 55 },
    { name: 'Verdant Systems', email: 'noah@verdant.systems', plan: 'pro', status: 'canceled', age: 81 },
    { name: 'Polaris Automation', email: 'elena@polaris.auto', plan: 'agency_pro', status: 'active', age: 30 },
    { name: 'Cinder Studio', email: 'theo@cinder.studio', plan: 'free', status: null, age: 12 },
    { name: 'Marwick Group', email: 'priya@marwick.group', plan: 'pro', status: 'active', age: 73 },
    { name: 'Orbital Works', email: 'liam@orbital.works', plan: 'agency', status: 'trialing', age: 7 },
    { name: 'Sable Advisory', email: 'dana@sable.advisory', plan: 'free', status: null, age: 19 },
    { name: 'Ridgepath AI', email: 'owen@ridgepath.ai', plan: 'pro', status: 'active', age: 41 },
  ]

  const eventTypes = [
    'USER_SIGNED_IN', 'AUTH_FAILED', 'PROJECT_CREATED', 'CALCULATION_COMPLETED',
    'REPORT_GENERATED', 'REPORT_FAILED', 'PROPOSAL_GENERATED', 'SHARE_CREATED',
    'SHARE_VIEWED', 'SHARE_APPROVED', 'SHARE_CHANGES_REQUESTED',
    'WHOP_PAYMENT_RECEIVED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_UPDATED',
    'SUBSCRIPTION_CANCELLED', 'WEBHOOK_ERROR', 'AI_ESTIMATE_COMPLETED',
    'AI_NARRATIVE_COMPLETED', 'STORAGE_ERROR', 'CALCULATION_FAILED',
  ]
  const severities = { info: 0.78, warn: 0.16, error: 0.06 } as const

  let userCounter = 0
  let payCounter = 1000
  let subCounter = 5000
  let evtCounter = 0

  for (const s of orgSeed) {
    const orgId = `org_${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    const ownerId = `usr_${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_owner`

    const user = await db.user.upsert({
      where: { id: ownerId },
      update: {},
      create: {
        id: ownerId,
        name: s.email.split('@')[0].replace(/^\w/, (c) => c.toUpperCase()),
        email: s.email,
        systemRole: 'USER',
        createdAt: daysAgo(s.age),
      },
    })

    await db.organization.upsert({
      where: { id: orgId },
      update: {},
      create: {
        id: orgId,
        name: s.name,
        contactEmail: s.email,
        website: `https://${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        createdAt: daysAgo(s.age),
      },
    })

    await db.membership.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
      update: {},
      create: { userId: user.id, organizationId: orgId, role: 'owner' },
    })

    // members for some orgs
    const memberCount = s.plan === 'agency' || s.plan === 'agency_pro' ? 3 : 1
    for (let m = 1; m < memberCount; m++) {
      const mid = `${ownerId}_m${m}`
      await db.user.upsert({
        where: { id: mid },
        update: {},
        create: {
          id: mid,
          name: `${s.name.split(' ')[0]} Member ${m}`,
          email: `member${m}@${s.email.split('@')[1]}`,
          systemRole: 'USER',
          createdAt: daysAgo(s.age - m * 2),
        },
      })
      await db.membership.upsert({
        where: { userId_organizationId: { userId: mid, organizationId: orgId } },
        update: {},
        create: { userId: mid, organizationId: orgId, role: 'member' },
      })
    }

    // Subscription
    const planKey = s.plan === 'free' ? 'free' : `plan_${s.plan}_${s.status === 'canceled' ? 'monthly' : (s.age % 2 === 0 ? 'annual' : 'monthly')}_v1`
    let tier = s.plan
    let status = s.status ?? 'active'
    let cancelAtEnd = false
    let canceledAt: Date | null = null
    let periodEnd = daysAgo(-18)
    if (status === 'canceled') { canceledAt = daysAgo(3); periodEnd = daysAgo(3); cancelAtEnd = true }
    if (status === 'past_due') { periodEnd = daysAgo(2) }
    if (status === 'trialing') { periodEnd = daysAgo(-7) }

    if (s.status) {
      const subId = `sub_${subCounter++}`
      await db.subscription.create({
        data: {
          id: subId,
          organizationId: orgId,
          whopMembershipId: `whop_mem_${subCounter}`,
          planKey,
          tier,
          status,
          currentPeriodStart: daysAgo(s.age > 30 ? 30 : s.age),
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: cancelAtEnd,
          canceledAt,
          lastWebhookEventAt: hoursAgo(Math.floor(Math.random() * 48)),
          createdAt: daysAgo(s.age),
        },
      })
      await db.license.create({
        data: {
          organizationId: orgId,
          tier,
          whopOrderId: `whop_order_${payCounter}`,
          whopEventId: `whop_evt_${payCounter++}`,
          purchasedAt: daysAgo(s.age),
        },
      })

      // Payments
      const payCount = status === 'trialing' ? 0 : Math.min(4, Math.floor(s.age / 30) + 1)
      for (let p = 0; p < payCount; p++) {
        const succeeded = !(status === 'past_due' && p === payCount - 1)
        const amount = tier === 'pro' ? 49 : tier === 'agency' ? 79 : tier === 'agency_pro' ? 790 : 0
        await db.payment.create({
          data: {
            organizationId: orgId,
            subscriptionId: `sub_${subCounter - 1}`,
            whopPaymentId: `whop_pay_${payCounter}`,
            whopEventId: `whop_evt_${payCounter++}`,
            amount,
            currency: 'USD',
            status: succeeded ? 'succeeded' : 'failed',
            whopPlanId: planKey,
            createdAt: daysAgo(p * 30 + 1),
            refundedAmount: p === 0 && status === 'canceled' ? amount : 0,
            refundedAt: p === 0 && status === 'canceled' ? daysAgo(3) : null,
          },
        })
      }
    }

    // Clients + projects + reports + shares
    const clientCount = s.plan === 'free' ? 1 : Math.min(4, memberCount + 1)
    for (let c = 0; c < clientCount; c++) {
      const clientId = `cli_${orgId}_${c}`
      await db.client.upsert({
        where: { id: clientId },
        update: {},
        create: { id: clientId, organizationId: orgId, name: `Client ${c + 1} — ${s.name}`, industry: ['Logistics', 'Finance', 'Healthcare', 'Retail'][c % 4], createdAt: daysAgo(s.age - c * 5) },
      })
      const projCount = c === 0 ? 2 : 1
      for (let pr = 0; pr < projCount; pr++) {
        const projId = `prj_${orgId}_${c}_${pr}`
        const verdict = ['build', 'consider', 'dont_build'][pr % 3]
        await db.project.create({
          data: {
            id: projId,
            organizationId: orgId,
            clientId,
            clientName: `Client ${c + 1}`,
            recommendation: verdict,
            inputs: '{}',
            results: '[]',
            createdAt: daysAgo(Math.max(1, s.age - c * 5 - pr * 2)),
          },
        })
        // reports
        if (s.plan !== 'free') {
          await db.report.create({ data: { projectId: projId, reportType: 'client_report', pdfUrl: `https://blob.viableo.app/r/${projId}.pdf`, createdAt: daysAgo(Math.max(1, s.age - c * 5 - pr * 2 - 1)) } })
          await db.report.create({ data: { projectId: projId, reportType: 'proposal', pdfUrl: '', createdAt: daysAgo(Math.max(1, s.age - c * 5 - pr * 2 - 1)) } })
        }
        // share
        if (s.plan !== 'free' && pr === 0) {
          const shareId = `shr_${projId}`
          const states = ['sent', 'viewed', 'approved', 'changes_requested']
          await db.share.create({
            data: {
              shareId,
              projectId: projId,
              decisionState: states[c % 4],
              createdAt: daysAgo(Math.max(1, s.age - c * 5 - 3)),
            },
          })
          // share events
          for (let se = 0; se < 3; se++) {
            await db.shareEvent.create({
              data: {
                shareId,
                organizationId: orgId,
                eventType: ['view', 'section_scroll', 'time_on_page'][se],
                section: se === 1 ? 'executive-verdict' : null,
                value: se === 1 ? 0.6 : se === 2 ? 42 : null,
                createdAt: daysAgo(Math.max(0, se - 2)),
              },
            })
          }
        }
      }
    }

    // System events per org
    const evCount = 8 + Math.floor(Math.random() * 14)
    for (let e = 0; e < evCount; e++) {
      const et = eventTypes[e % eventTypes.length]
      const r = Math.random()
      const severity = r < severities.error ? 'error' : r < severities.error + severities.warn ? 'warn' : 'info'
      await db.systemEvent.create({
        data: {
          eventType: et,
          organizationId: orgId,
          userId: user.id,
          severity,
          metadata: JSON.stringify({ note: 'demo', idx: evtCounter++ }),
          requestId: `req_${orgId}_${e}`,
          createdAt: hoursAgo(Math.floor(Math.random() * 72)),
        },
      })
    }
  }

  // Global auth events (no org)
  for (let i = 0; i < 6; i++) {
    await db.systemEvent.create({
      data: {
        eventType: 'AUTH_FAILED',
        severity: 'warn',
        metadata: JSON.stringify({ reason: 'demo', provider: i % 2 === 0 ? 'github' : 'google' }),
        createdAt: hoursAgo(i * 3),
      },
    })
  }

  // Audit logs — privileged admin actions
  const auditActions = [
    { action: 'SUPERADMIN_BOOTSTRAP', target: 'User', reason: 'Initial founder provisioning' },
    { action: 'ADMIN_PAGE_VIEWED', target: 'Organization', reason: 'Overview review' },
    { action: 'ENTITLEMENT_OVERRIDE', target: 'Organization', reason: 'Support: temporary Pro access for triage' },
    { action: 'IMPERSONATION_START', target: 'Organization', reason: 'Support ticket #4821 — billing mismatch' },
    { action: 'IMPERSONATION_END', target: 'Organization', reason: 'Support complete' },
    { action: 'QA_TIER_SWITCH', target: 'Organization', reason: 'Founder QA: simulate Pro' },
    { action: 'QA_WEBHOOK_REPLAY', target: 'Organization', reason: 'Founder QA: replay payment.succeeded' },
    { action: 'ADMIN_SEARCH', target: 'User', reason: 'Locate customer by email' },
    { action: 'PLANMAPPING_UPDATE', target: 'PlanMapping', reason: 'Activate agency_pro annual plan' },
  ]
  for (let i = 0; i < auditActions.length; i++) {
    const a = auditActions[i]
    await db.auditLog.create({
      data: {
        actorUserId: SUPERADMIN_ID,
        actorRole: 'SUPERADMIN',
        action: a.action,
        targetType: a.target,
        targetId: i < 2 ? null : `org_${orgSeed[i % orgSeed.length].name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        reason: a.reason,
        metadata: JSON.stringify({ source: 'demo-seed' }),
        createdAt: hoursAgo(i * 6 + 2),
      },
    })
  }

  // Some errors in last 24h for the operational signals
  for (let i = 0; i < 3; i++) {
    await db.systemEvent.create({
      data: {
        eventType: 'WEBHOOK_ERROR',
        organizationId: `org_${orgSeed[i + 2].name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        severity: 'error',
        metadata: JSON.stringify({ reason: 'signature_verification_failed', demo: true }),
        createdAt: hoursAgo(i + 1),
      },
    })
  }
  await db.systemEvent.create({
    data: { eventType: 'REPORT_FAILED', severity: 'error', organizationId: `org_${orgSeed[3].name.toLowerCase().replace(/[^a-z0-9]/g, '')}`, createdAt: hoursAgo(5), metadata: JSON.stringify({ reason: 'pdf_render_timeout', demo: true }) },
  })
  await db.systemEvent.create({
    data: { eventType: 'DATABASE_ERROR', severity: 'error', createdAt: hoursAgo(9), metadata: JSON.stringify({ demo: true }) },
  })

  console.log('Seed complete.')
  console.log(`  Organizations: ${await db.organization.count()}`)
  console.log(`  Users: ${await db.user.count()}`)
  console.log(`  Subscriptions: ${await db.subscription.count()}`)
  console.log(`  Payments: ${await db.payment.count()}`)
  console.log(`  System events: ${await db.systemEvent.count()}`)
  console.log(`  Audit logs: ${await db.auditLog.count()}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
