-- CreateTable
CREATE TABLE "public"."FunctionalMedicineAssessment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL DEFAULT 'digestive_system',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalTimeMinutes" INTEGER,
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "overallDigestiveScore" DOUBLE PRECISION,
    "subsystemScores" JSONB,
    "rootCauseIndicators" JSONB,
    "treatmentPriorities" JSONB,
    "environmentalFactors" JSONB,
    "lifestyleFactors" JSONB,
    "rootCauseAnalysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FunctionalMedicineAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FmDigestiveQuestion" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "questionText" TEXT NOT NULL,
    "questionContext" TEXT,
    "clinicalSignificance" TEXT,
    "scaleType" TEXT NOT NULL DEFAULT 'frequency',
    "reverseScoring" BOOLEAN NOT NULL DEFAULT false,
    "diagnosticWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "symptomType" TEXT,
    "conditionAssociations" TEXT[],
    "isTraditional" BOOLEAN NOT NULL DEFAULT true,
    "isModernInsight" BOOLEAN NOT NULL DEFAULT false,
    "environmentalFactor" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "requiredLevel" TEXT NOT NULL DEFAULT 'standard',
    "skipLogic" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FmDigestiveQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FmDigestiveResponse" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "responseValue" INTEGER NOT NULL,
    "confidenceLevel" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "timeSpentSeconds" INTEGER,
    "answerChangedCount" INTEGER NOT NULL DEFAULT 0,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FmDigestiveResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FmScoringAlgorithm" (
    "id" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "algorithmVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "scoringRules" JSONB NOT NULL,
    "thresholds" JSONB NOT NULL,
    "treatmentAlgorithms" JSONB,
    "clinicalValidationData" JSONB,
    "comparisonMetrics" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FmScoringAlgorithm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NutriqComparisonData" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "nutriqRawResponses" JSONB,
    "nutriqScores" JSONB,
    "nutriqAssessmentDate" TIMESTAMP(3),
    "fmAssessmentId" TEXT,
    "fmScores" JSONB,
    "scoreCorrelations" JSONB,
    "diagnosticAgreement" JSONB,
    "improvementTracking" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutriqComparisonData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FunctionalMedicineAssessment_clientId_idx" ON "public"."FunctionalMedicineAssessment"("clientId");

-- CreateIndex
CREATE INDEX "FunctionalMedicineAssessment_status_idx" ON "public"."FunctionalMedicineAssessment"("status");

-- CreateIndex
CREATE INDEX "FunctionalMedicineAssessment_assessmentType_idx" ON "public"."FunctionalMedicineAssessment"("assessmentType");

-- CreateIndex
CREATE INDEX "FunctionalMedicineAssessment_completedAt_idx" ON "public"."FunctionalMedicineAssessment"("completedAt");

-- CreateIndex
CREATE INDEX "FmDigestiveQuestion_category_idx" ON "public"."FmDigestiveQuestion"("category");

-- CreateIndex
CREATE INDEX "FmDigestiveQuestion_subcategory_idx" ON "public"."FmDigestiveQuestion"("subcategory");

-- CreateIndex
CREATE INDEX "FmDigestiveQuestion_displayOrder_idx" ON "public"."FmDigestiveQuestion"("displayOrder");

-- CreateIndex
CREATE INDEX "FmDigestiveQuestion_isActive_idx" ON "public"."FmDigestiveQuestion"("isActive");

-- CreateIndex
CREATE INDEX "FmDigestiveResponse_assessmentId_idx" ON "public"."FmDigestiveResponse"("assessmentId");

-- CreateIndex
CREATE INDEX "FmDigestiveResponse_questionId_idx" ON "public"."FmDigestiveResponse"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "FmDigestiveResponse_assessmentId_questionId_key" ON "public"."FmDigestiveResponse"("assessmentId", "questionId");

-- CreateIndex
CREATE INDEX "FmScoringAlgorithm_systemName_idx" ON "public"."FmScoringAlgorithm"("systemName");

-- CreateIndex
CREATE INDEX "FmScoringAlgorithm_isActive_idx" ON "public"."FmScoringAlgorithm"("isActive");

-- CreateIndex
CREATE INDEX "NutriqComparisonData_clientId_idx" ON "public"."NutriqComparisonData"("clientId");

-- CreateIndex
CREATE INDEX "NutriqComparisonData_nutriqAssessmentDate_idx" ON "public"."NutriqComparisonData"("nutriqAssessmentDate");

-- AddForeignKey
ALTER TABLE "public"."FunctionalMedicineAssessment" ADD CONSTRAINT "FunctionalMedicineAssessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FmDigestiveResponse" ADD CONSTRAINT "FmDigestiveResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."FunctionalMedicineAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FmDigestiveResponse" ADD CONSTRAINT "FmDigestiveResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."FmDigestiveQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutriqComparisonData" ADD CONSTRAINT "NutriqComparisonData_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
