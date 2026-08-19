/**
 * Prisma seed script — creates the demo user, organization, and membership.
 *
 * Run with: bun run db:seed
 *
 * This is safe to run multiple times — it uses upsert to avoid duplicates.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TODO_HUMAN_SEED_EMAIL: replace with a real email for seed data.
const SEED_USER_EMAIL = 'demo@TODO_HUMAN_DOMAIN';
const SEED_ORG_NAME = 'Apex Automation Studio';

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert the demo user
  const user = await prisma.user.upsert({
    where: { email: SEED_USER_EMAIL },
    update: {},
    create: {
      email: SEED_USER_EMAIL,
      name: 'Apex Demo User',
    },
  });
  console.log(`  ✓ User: ${user.name} (${user.email})`);

  // Upsert the demo organization
  const org = await prisma.organization.upsert({
    where: { id: 'org_apex_demo' },
    update: {},
    create: {
      id: 'org_apex_demo',
      name: SEED_ORG_NAME,
      website: 'https://apexautomation.example.com',
      contactEmail: 'hello@apexautomation.example.com',
    },
  });
  console.log(`  ✓ Organization: ${org.name} (${org.id})`);

  // Upsert the membership (user → org, role: owner)
  const membership = await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: org.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: 'owner',
    },
  });
  console.log(`  ✓ Membership: ${membership.role}`);

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
