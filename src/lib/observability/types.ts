/**
 * Observability type contract.
 *
 * This file is the SEAM between Agent 1 (this agent — emits events from
 * billing/auth/AI/calculation code paths it owns) and Agent 2 (replaces
 * the stub in system-event.ts with a real Prisma-backed writer + builds
 * the admin dashboard that consumes the events).
 *
 * STABILITY RULES (per Agent 1 master prompt §7):
 *   - Do NOT rename fields in `LogSystemEventInput`.
 *   - Do NOT change the casing of any value in `SystemEventType`.
 *   - To add a new event, append to the union — never reorder or rename.
 *
 * Why a string union and not a Prisma enum: string unions are portable
 * across DB providers, do not require a migration to add a new value,
 * and let Agent 1 emit events before Agent 2's SystemEvent Prisma model
 * exists. The literal strings in this file are the authoritative source
 * of truth for what event names exist in the system.
 */

/**
 * The complete set of system-event types recognized by Viableo.
 *
 * Organized by family for readability; the union is flat. See
 * `Viableo Production Architecture` §9.2 for the family breakdown.
 *
 * AUTH:            USER_SIGNED_IN, AUTH_FAILED
 * PRODUCT:         CALCULATION_STARTED/COMPLETED/FAILED, PROJECT_CREATED/SAVED/REOPENED
 * DELIVERABLE:     REPORT_STARTED/GENERATED/FAILED, PROPOSAL_GENERATED/FAILED
 * CLIENT-DELIVERY: SHARE_CREATED/VIEWED/APPROVED/CHANGES_REQUESTED
 * AI:              AI_ESTIMATE_STARTED/COMPLETED/FAILED, AI_NARRATIVE_COMPLETED, AI_RISK_ANALYSIS_COMPLETED
 * BILLING:         WHOP_PAYMENT_RECEIVED, SUBSCRIPTION_CREATED/UPDATED/CANCELLED/REFUNDED
 * SYSTEM:          DATABASE_ERROR, STORAGE_ERROR, WEBHOOK_ERROR
 */
export type SystemEventType =
  | 'USER_SIGNED_IN' | 'AUTH_FAILED'
  | 'CALCULATION_STARTED' | 'CALCULATION_COMPLETED' | 'CALCULATION_FAILED'
  | 'PROJECT_CREATED' | 'PROJECT_SAVED' | 'PROJECT_REOPENED'
  | 'REPORT_STARTED' | 'REPORT_GENERATED' | 'REPORT_FAILED'
  | 'PROPOSAL_GENERATED' | 'PROPOSAL_FAILED'
  | 'SHARE_CREATED' | 'SHARE_VIEWED' | 'SHARE_APPROVED' | 'SHARE_CHANGES_REQUESTED'
  | 'AI_ESTIMATE_STARTED' | 'AI_ESTIMATE_COMPLETED' | 'AI_ESTIMATE_FAILED'
  | 'AI_NARRATIVE_COMPLETED' | 'AI_RISK_ANALYSIS_COMPLETED'
  | 'WHOP_PAYMENT_RECEIVED' | 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_UPDATED'
  | 'SUBSCRIPTION_CANCELLED' | 'SUBSCRIPTION_REFUNDED'
  | 'DATABASE_ERROR' | 'STORAGE_ERROR' | 'WEBHOOK_ERROR'
  | 'WEBHOOK_STALE_EVENT_IGNORED';

/**
 * Severity level — mirrors the SystemEvent.severity column Agent 2 will add.
 * Defaults to 'info' when omitted.
 */
export type SystemEventSeverity = 'info' | 'warn' | 'error';

/**
 * The input shape every event-emission call site must pass.
 *
 * METADATA DISCIPLINE (per Viableo Production Architecture §9.2):
 *   `metadata` must contain ONLY sanitized operational facts — IDs,
 *   counts, durations, statuses. Never pass:
 *     - raw calculator inputs / scenario results
 *     - AI prompts or completion text
 *     - raw webhook payloads (beyond billing-visibility facts)
 *     - PII (emails, names beyond what's strictly needed)
 *   Enforced by code review, not by the type system — TypeScript can
 *   only structurally check the shape, not the content.
 */
export interface LogSystemEventInput {
  eventType: SystemEventType;
  organizationId?: string;
  userId?: string;
  severity?: SystemEventSeverity;
  metadata?: Record<string, unknown>;
  /** Correlate to a single API request — typically from a request-id header. */
  requestId?: string;
}
