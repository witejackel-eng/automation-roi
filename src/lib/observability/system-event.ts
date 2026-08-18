/**
 * System-event logger — TEMPORARY STUB (per Agent 1 master prompt §7).
 *
 * Agent 1 (this agent) needs to emit events from billing/webhook/auth/AI
 * code paths it owns, but the actual `SystemEvent` Prisma model does
 * not exist yet — it is Agent 2's responsibility (added in migration 4,
 * after Agent 1's three migrations are merged).
 *
 * Until Agent 2 ships the real implementation, this stub:
 *   - matches the EXACT signature Agent 2's implementation must expose
 *   - logs to console.debug in non-production (no-op in production)
 *   - NEVER throws — observability must not become an availability risk
 *
 * Agent 2's replacement is a drop-in: change the function body, keep
 * the signature, and every Agent 1 emission site keeps working.
 *
 * DO NOT call logSystemEvent directly from a hot path — wrap every call
 * in a try/catch at the call site too, so that even a thrown error from
 * a future real Prisma-backed implementation cannot fail the surrounding
 * business operation. (See Phase 5 of the master prompt for the
 * rationale: "observability must never become a new source of request
 * failures".)
 */
import type { LogSystemEventInput } from './types';

export async function logSystemEvent(input: LogSystemEventInput): Promise<void> {
  // Temporary stub — Agent 2 replaces this body with a real SystemEvent
  // Prisma write once that model exists. Signature must not change.
  if (process.env.NODE_ENV !== 'production') {
    console.debug(
      '[system-event:stub]',
      input.eventType,
      input.organizationId ?? '-',
      input.userId ?? '-',
      input.severity ?? 'info',
      input.metadata ?? {},
    );
  }
}
