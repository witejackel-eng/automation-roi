-- AlterTable: add User.systemRole column.
-- Default 'USER' so all existing users remain ordinary users.
-- 'SUPERADMIN' is upserted only by scripts/bootstrap-superadmin.ts.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "systemRole" TEXT NOT NULL DEFAULT 'USER';

-- Idempotency guard: create the partial index only once.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'User_systemRole_idx'
  ) THEN
    CREATE INDEX "User_systemRole_idx" ON "User"("systemRole");
  END IF;
END $$;
