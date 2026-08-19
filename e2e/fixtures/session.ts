import { SignJWT } from 'jose';

export interface TestUser {
  sub: string;
  email: string;
  name: string;
  organizationId: string;
  role: string;
  systemRole: string;
}

export interface TestOrg {
  id: string;
  name: string;
}

export async function createTestSessionCookie(
  testUser: TestUser,
  testOrg: TestOrg,
): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      'NEXTAUTH_SECRET is not set. Set it before calling createTestSessionCookie.',
    );
  }

  const secretKey = new TextEncoder().encode(secret);

  const token = await new SignJWT({
    sub: testUser.sub,
    email: testUser.email,
    name: testUser.name,
    organizationId: testUser.organizationId,
    role: testUser.role,
    systemRole: testUser.systemRole,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretKey);

  return `next-auth.session-token=${token}`;
}
