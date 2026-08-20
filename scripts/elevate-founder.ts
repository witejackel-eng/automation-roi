/**
 * scripts/elevate-founder.ts
 *
 * Direct Prisma elevation of a user to SUPERADMIN + ensures they have an
 * Organization + owner Membership. This is a simpler alternative to the
 * full bootstrap-superadmin.ts script (which requires a bootstrap token).
 *
 * Usage:
 *   DATABASE_URL=<your-db-url> bun run scripts/elevate-founder.ts --email witejackel@gmail.com
 *
 * After running, the user's next sign-in will thread systemRole = 'SUPERADMIN'
 * through the JWT → session (per src/lib/auth.ts jwt/session callbacks).
 */
import { db } from '../src/lib/db';

async function main() {
  const email = process.argv
    .find((a) => a.startsWith('--email='))
    ?.split('=')[1]
    ?? process.argv.find((_, i, arr) => arr[i - 1] === '--email');

  if (!email) {
    console.error('Usage: bun run scripts/elevate-founder.ts --email <email>');
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User with email "${email}" not found. Sign in once first so NextAuth creates the User row.`);
    process.exit(3);
  }

  // 1. Elevate to SUPERADMIN
  await db.user.update({
    where: { email },
    data: { systemRole: 'SUPERADMIN' },
  });
  console.log(`✓ Elevated ${email} to SUPERADMIN`);

  // 2. Ensure Organization + owner Membership
  let membership = await db.membership.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });

  if (!membership) {
    // Create an org + owner membership
    const org = await db.organization.create({
      data: {
        name: `${user.name ?? email}'s Workspace`,
        contactEmail: email,
      },
    });
    membership = await db.membership.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: 'owner',
      },
      include: { organization: true },
    });
    console.log(`✓ Created organization "${org.name}" + owner membership`);
  } else {
    // Ensure the membership role is owner
    if (membership.role !== 'owner') {
      await db.membership.update({
        where: { id: membership.id },
        data: { role: 'owner' },
      });
      console.log(`✓ Updated membership role to owner`);
    }
    console.log(`✓ Organization "${membership.organization.name}" already exists`);
  }

  // 3. Ensure a License with agency_pro tier (for non-superadmin fallback paths)
  const existingLicense = await db.license.findFirst({
    where: { organizationId: membership.organizationId },
  });
  if (!existingLicense) {
    await db.license.create({
      data: {
        organizationId: membership.organizationId,
        tier: 'agency_pro',
      },
    });
    console.log(`✓ Created License with agency_pro tier`);
  } else if (existingLicense.tier !== 'agency_pro') {
    await db.license.update({
      where: { id: existingLicense.id },
      data: { tier: 'agency_pro' },
    });
    console.log(`✓ Updated License to agency_pro tier`);
  } else {
    console.log(`✓ License already at agency_pro`);
  }

  console.log('\nDone. The user will have SUPERADMIN + full product access on next sign-in.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
