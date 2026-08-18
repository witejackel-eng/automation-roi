-- CreateTable: SystemEvent (Agent 2 — operational telemetry)
-- Per Viableo Production Architecture §9.1, kept separate from AuditLog:
--   - SystemEvent = software behavior telemetry (auto-generated, dashboarded,
--     may be pruned/aggregated over time).
--   - AuditLog = privileged human/admin accountability trail (manually
--     generated, append-only, stronger retention).
-- String IDs (NOT Prisma relations) so high-volume operational logging
-- is never blocked by a missing/cascading FK on Agent 1's tables.

CREATE TABLE IF NOT EXISTS "SystemEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "metadata" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SystemEvent_eventType_idx" ON "SystemEvent"("eventType");
CREATE INDEX IF NOT EXISTS "SystemEvent_organizationId_idx" ON "SystemEvent"("organizationId");
CREATE INDEX IF NOT EXISTS "SystemEvent_createdAt_idx" ON "SystemEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "SystemEvent_severity_idx" ON "SystemEvent"("severity");

-- CreateTable: AuditLog (Agent 2 — privileged-action accountability)
-- Append-only. Prisma cannot enforce immutability at the schema level
-- (would need a database trigger, out of scope for the minimum-viable
-- architecture). Enforced by CODE REVIEW: never write db.auditLog.update
-- or db.auditLog.delete anywhere in the codebase.

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "reason" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
