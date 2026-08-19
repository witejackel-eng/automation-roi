import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const MAPPINGS: { tier: string; envVar: string; billingPeriod: string }[] = [
  { tier: 'pro', envVar: 'WHOP_PLAN_ID_PRO', billingPeriod: 'monthly' },
  { tier: 'agency', envVar: 'WHOP_PLAN_ID_AGENCY', billingPeriod: 'monthly' },
  { tier: 'agency_pro', envVar: 'WHOP_PLAN_ID_AGENCY_PRO', billingPeriod: 'annual' },
];

async function main() {
  console.log('Seeding PlanMappings...');
  let upserted = 0;

  for (const m of MAPPINGS) {
    const planId = process.env[m.envVar];
    if (!planId || planId.startsWith('TODO_HUMAN_')) {
      console.log(`SKIPPED ${m.tier} — ${m.envVar} not provisioned (FOUNDER ACTION REQUIRED)`);
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

  console.log(`Done. ${upserted} mapping(s) upserted.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
