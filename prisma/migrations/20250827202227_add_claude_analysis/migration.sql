/*
  Safe migration: Adding Claude Analysis tables without dropping any existing data
*/

-- CreateTable
CREATE TABLE "public"."ClientAnalysis" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analysisVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "executiveSummary" TEXT,
    "systemAnalysis" JSONB,
    "rootCauseAnalysis" TEXT,
    "protocolRecommendations" JSONB,
    "monitoringPlan" TEXT,
    "patientEducation" TEXT,
    "fullAnalysis" TEXT NOT NULL,
    "practitionerNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EnhancedProtocol" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "analysisId" TEXT,
    "protocolName" TEXT NOT NULL,
    "protocolPhase" TEXT,
    "supplements" JSONB,
    "dietaryGuidelines" JSONB,
    "lifestyleModifications" JSONB,
    "monitoringRequirements" JSONB,
    "startDate" TIMESTAMP(3),
    "durationWeeks" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "complianceNotes" TEXT,
    "effectivenessRating" INTEGER,
    "sideEffects" TEXT,
    "modificationsMade" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnhancedProtocol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientAnalysis_clientId_analysisDate_idx" ON "public"."ClientAnalysis"("clientId", "analysisDate");

-- CreateIndex
CREATE INDEX "ClientAnalysis_status_idx" ON "public"."ClientAnalysis"("status");

-- CreateIndex
CREATE INDEX "EnhancedProtocol_clientId_status_idx" ON "public"."EnhancedProtocol"("clientId", "status");

-- CreateIndex
CREATE INDEX "EnhancedProtocol_analysisId_idx" ON "public"."EnhancedProtocol"("analysisId");

-- AddForeignKey
ALTER TABLE "public"."ClientAnalysis" ADD CONSTRAINT "ClientAnalysis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnhancedProtocol" ADD CONSTRAINT "EnhancedProtocol_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnhancedProtocol" ADD CONSTRAINT "EnhancedProtocol_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "public"."ClientAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
