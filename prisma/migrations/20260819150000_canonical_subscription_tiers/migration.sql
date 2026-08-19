-- Reconcile the legacy one-time 'case_pack' tier to the canonical 'pro' subscription tier.
-- Idempotent: safe to run multiple times.
UPDATE "License"      SET "tier"    = 'pro' WHERE "tier"    = 'case_pack';
UPDATE "Subscription" SET "tier"    = 'pro' WHERE "tier"    = 'case_pack';
UPDATE "Subscription" SET "planKey" = 'pro' WHERE "planKey" = 'case_pack';
UPDATE "PlanMapping"  SET "tier"    = 'pro' WHERE "tier"    = 'case_pack';
