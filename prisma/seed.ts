/**
 * Prisma seed script — creates the demo organization + free-tier license.
 *
 * Run with: bun run db:seed
 *
 * This is safe to run multiple times — it uses upsert to avoid duplicates.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_ORG_ID = 'org_apex_demo';

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert the demo organization
  const org = await prisma.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: {},
    create: {
      id: DEMO_ORG_ID,
      name: 'Apex Automation Studio',
      website: 'https://apexautomation.example.com',
      contactEmail: 'hello@apexautomation.example.com',
    },
  });
  console.log(`  ✓ Organization: ${org.name} (${org.id})`);

  // Upsert a free-tier license for the demo org
  const existingLicense = await prisma.license.findFirst({
    where: { organizationId: org.id },
  });

  if (!existingLicense) {
    const license = await prisma.license.create({
      data: {
        organizationId: org.id,
        tier: 'free',
        purchasedAt: null,
      },
    });
    console.log(`  ✓ License: ${license.tier} (${license.id})`);
  } else {
    console.log(`  ✓ License already exists: ${existingLicense.tier} (${existingLicense.id})`);
  }

  console.log('🌱 Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
