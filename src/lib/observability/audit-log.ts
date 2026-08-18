/**
 * Audit-log helper — privileged-action accountability trail (Agent 2).
 *
 * Per Viableo Production Architecture §9.1 + Agent 2 master prompt §5:
 *   - AuditLog is APPEND-ONLY. Never write db.auditLog.update(...) or
 *     db.auditLog.delete(...) anywhere in the codebase. Treat every
 *     audit action as a new row, always. This is what makes it
 *     trustworthy as an accountability record.
 *   - Unlike logSystemEvent, errors here MUST NOT be silently
 *     swallowed for privileged actions (entitlement overrides,
 *     impersonation, bootstrap). If the audit write fails, the
 *     privileged action it was supposed to record should also fail /
 *     roll back, since an unaudited privileged action is worse than a
 *     blocked one. Use a db.$transaction wrapping the privileged
 *     mutation and its AuditLog write together (§6.4).
 *
 * USAGE:
 *   - For fire-and-forget audit (non-privileged): just `await logAuditAction(...)`.
 *   - For privileged actions: wrap the privileged mutation + the audit
 *     write in db.$transaction so the audit row commits only if the
 *     mutation does.
 */
import { db } from '@/lib/db';

export interface LogAuditActionInput {
  actorUserId: string;
  actorRole: 'SUPERADMIN' | 'OWNER' | 'MEMBER';
  action: string;
  // e.g. 'ENTITLEMENT_OVERRIDE' | 'IMPERSONATION_START' | 'IMPERSONATION_END'
  //       | 'BOOTSTRAP_SUPERADMIN' | 'QA_TIER_SWITCH' | 'PLANMAPPING_UPDATE'
  targetType?: string;
  // 'Organization' | 'User' | 'Subscription' | 'Payment' | 'PlanMapping' | ...
  targetId?: string;
  reason?: string; // required for privileged actions
  metadata?: Record<string, unknown>;
}

/**
 * Append a row to AuditLog. Throws on DB error so the caller's
 * db.$transaction (if used) rolls back the privileged mutation too.
 *
 * When called OUTSIDE a transaction for a non-privileged action, the
 * throw will propagate — wrap in try/catch if you want fire-and-forget
 * behavior for non-privileged audit rows.
 */
export async function logAuditAction(input: LogAuditActionInput): Promise<void> {
  await db.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    },
  });
}
