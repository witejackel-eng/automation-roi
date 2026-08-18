/**
 * System-event logger — REAL Prisma-backed implementation (Agent 2).
 *
 * Agent 1 originally created a temporary stub here (console.debug in
 * dev, no-op in production, never throws). Agent 2's job is to
 * replace the stub body with a real SystemEvent Prisma write WITHOUT
 * changing the exported signature — Agent 1's call sites in the
 * billing/webhook/auth/AI/calculation code paths depend on it
 * exactly as defined in src/lib/observability/types.ts.
 *
 * FAILURE-ISOLATION RULE (per master prompt §7):
 *   Observability must NEVER become a source of request failures.
 *   The Prisma write is wrapped in try/catch — on failure, log to
 *   console.error and return. The original business operation's
 *   response is unaffected.
 *
 * GUARDED AGAINST INFINITE RECURSION:
 *   If the Prisma write itself fails with a DATABASE_ERROR, we DO NOT
 *   call logSystemEvent({ eventType: 'DATABASE_ERROR', ... }) again
 *   (which could recurse). We just log to console.error and stop.
 */
import { db } from '@/lib/db';
import type { LogSystemEventInput } from './types';

export async function logSystemEvent(input: LogSystemEventInput): Promise<void> {
  try {
    await db.systemEvent.create({
      data: {
        eventType: input.eventType,
        organizationId: input.organizationId,
        userId: input.userId,
        severity: input.severity ?? 'info',
        metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
        requestId: input.requestId,
      },
    });
  } catch (err) {
    // Never let observability failures break the calling request.
    // Per Viableo Production Architecture §9.2: wrap the Prisma write
    // in try/catch that logs to console.error — but DO NOT emit a
    // DATABASE_ERROR event recursively (could infinite-loop).
    console.error(
      '[system-event] failed to persist',
      input.eventType,
      err instanceof Error ? err.message : String(err),
    );
  }
}
