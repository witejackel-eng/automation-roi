/**
 * Seed the demo organization + a free license so the app has a working tenant.
 * Safe to re-run (idempotent by fixed demo id).
 *
 *   bun run scripts/seed.ts
 */
import { db } from '../src/lib/db';

const DEMO_ORG_ID = 'org_apex_demo';

async function main() {
  const org = await db.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: {
      name: 'Apex Automation Studio',
      website: 'https://apexautomation.studio',
      contactEmail: 'hello@apexautomation.studio',
      phone: '+1 (555) 240-1180',
    },
    create: {
      id: DEMO_ORG_ID,
      name: 'Apex Automation Studio',
      website: 'https://apexautomation.studio',
      contactEmail: 'hello@apexautomation.studio',
      phone: '+1 (555) 240-1180',
    },
  });

  const existing = await db.license.findFirst({
    where: { organizationId: org.id },
  });
  if (!existing) {
    await db.license.create({
      data: { organizationId: org.id, tier: 'free' },
    });
  }

  console.log('Seed complete. Organization:', org.id, org.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
