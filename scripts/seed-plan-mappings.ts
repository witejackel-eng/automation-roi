import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

/**
 * Seed PlanMappings — canonical two-tier model.
 *
 * Only Pro is a paid Whop plan. Starter is free (no Whop plan needed).
 * Legacy Agency / Agency Pro plan mappings, if still present in the DB,
 * are left intact (so historical subscriptions still resolve) but are NOT
 * re-seeded — their tiers are normalized to Pro at read time.
 */
const MAPPINGS: { tier: string; envVar: string; billingPeriod: string }[] = [
  { tier: 'pro', envVar: 'WHOP_PLAN_ID_PRO', billingPeriod: 'monthly' },
];

async function main() {
  console.log('Seeding PlanMappings (canonical two-tier model: Starter free + Pro $49/mo)...');
  let upserted = 0;

  for (const m of MAPPINGS) {
    const planId = process.env[m.envVar];
    if (!planId || planId.startsWith('TODO_HUMAN_')) {
      console.log(`SKIPPED ${m.tier} — ${m.envVar} not provisioned (FOUNDER ACTION REQUIRED: create the Whop plan and set the env var)`);
      continue;
    }
    await db.planMapping.upsert({
      where: { whopPlanId: planId },
      update: { tier: m.tier, billingPeriod: m.billingPeriod, active: true },
      create: {
        whopPlanId: planId,
        tier: m.tier,
        billingPeriod: m.billingPeriod,
        active: true,
      },
    });
    upserted++;
    console.log(`OK ${m.tier} -> ${planId}`);
  }

  // Deactivate legacy Agency / Agency Pro mappings (keep the rows for historical
  // subscription resolution, but mark them inactive so checkout never offers them).
  const legacy = await db.planMapping.updateMany({
    where: { tier: { in: ['agency', 'agency_pro'] } },
    data: { active: false },
  });
  if (legacy.count > 0) {
    console.log(`Deactivated ${legacy.count} legacy Agency/Agency Pro plan mapping(s) (kept for historical resolution).`);
  }

  console.log(`Done. ${upserted} Pro mapping(s) upserted.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
