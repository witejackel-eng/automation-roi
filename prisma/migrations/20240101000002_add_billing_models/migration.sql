-- CreateTable: Subscription (source of truth for org billing lifecycle).
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "whopMembershipId" TEXT,
    "planKey" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Subscription_organizationId_idx" ON "Subscription"("organizationId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_whopMembershipId_key" ON "Subscription"("whopMembershipId");

-- CreateTable: Payment (append-only ledger of charges/refunds).
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "whopPaymentId" TEXT NOT NULL,
    "whopEventId" TEXT NOT NULL,
    "amount" DECIMAL(65,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "whopProductId" TEXT,
    "whopPlanId" TEXT,
    "refundedAmount" DECIMAL(65,2) DEFAULT 0,
    "refundedAt" TIMESTAMP(3),
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Payment_organizationId_idx" ON "Payment"("organizationId");
CREATE INDEX IF NOT EXISTS "Payment_whopEventId_idx" ON "Payment"("whopEventId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_whopPaymentId_key" ON "Payment"("whopPaymentId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_whopEventId_key" ON "Payment"("whopEventId");

-- CreateTable: PlanMapping (Whop plan_id -> Viableo tier).
CREATE TABLE IF NOT EXISTS "PlanMapping" (
    "id" TEXT NOT NULL,
    "whopPlanId" TEXT NOT NULL,
    "whopProductId" TEXT,
    "tier" TEXT NOT NULL,
    "billingPeriod" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanMapping_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PlanMapping_whopPlanId_key" ON "PlanMapping"("whopPlanId");

-- AddForeignKey: Subscription.organizationId -> Organization.id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_organizationId_fkey') THEN
    ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey: Payment.organizationId -> Organization.id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_organizationId_fkey') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey: Payment.subscriptionId -> Subscription.id (nullable, no cascade)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_subscriptionId_fkey') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
