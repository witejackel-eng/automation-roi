import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log queries in dev when DEBUG_PRISMA is set — avoids verbose
    // SQL noise in normal development (Section 34).
    log: process.env.DEBUG_PRISMA === '1' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db