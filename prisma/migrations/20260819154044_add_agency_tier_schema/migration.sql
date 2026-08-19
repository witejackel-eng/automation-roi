-- CreateTable
CREATE TABLE "CaseVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputHash" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "verdict" TEXT NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'wizard',
    "parentVersionId" TEXT,

    CONSTRAINT "CaseVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "parentVersionId" TEXT NOT NULL,
    "challengedVersionId" TEXT NOT NULL,
    "challengedField" TEXT NOT NULL,
    "previousValue" DOUBLE PRECISION NOT NULL,
    "newValue" DOUBLE PRECISION NOT NULL,
    "challengedBy" TEXT,
    "challengedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "responseNote" TEXT,
    "note" TEXT,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "defaultAssumptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- AlterTable: add clientId to Project
ALTER TABLE "Project" ADD COLUMN "clientId" TEXT;

-- CreateIndex
CREATE INDEX "CaseVersion_projectId_idx" ON "CaseVersion"("projectId");

-- CreateIndex
CREATE INDEX "CaseVersion_inputHash_idx" ON "CaseVersion"("inputHash");

-- CreateIndex
CREATE INDEX "Challenge_projectId_idx" ON "Challenge"("projectId");

-- CreateIndex
CREATE INDEX "Challenge_status_idx" ON "Challenge"("status");

-- CreateIndex
CREATE INDEX "Client_organizationId_idx" ON "Client"("organizationId");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- AddForeignKey
ALTER TABLE "CaseVersion" ADD CONSTRAINT "CaseVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
