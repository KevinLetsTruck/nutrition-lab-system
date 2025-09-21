/*
  Warnings:

  - You are about to drop the column `aiAnalysis` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the `SimpleAssessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SimpleResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."TimelineType" AS ENUM ('COMPREHENSIVE', 'FOCUSED', 'SYMPTOMS', 'TREATMENTS', 'ASSESSMENTS', 'PROTOCOL_DEVELOPMENT');

-- CreateEnum
CREATE TYPE "public"."ProtocolPhaseStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SupplementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."SupplementStatus" AS ENUM ('RECOMMENDED', 'ACTIVE', 'COMPLETED', 'DISCONTINUED', 'ON_HOLD');

-- DropForeignKey
ALTER TABLE "public"."SimpleAssessment" DROP CONSTRAINT "SimpleAssessment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SimpleResponse" DROP CONSTRAINT "SimpleResponse_assessmentId_fkey";

-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "aiAnalysis";

-- DropTable
DROP TABLE "public"."SimpleAssessment";

-- DropTable
DROP TABLE "public"."SimpleResponse";

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
CREATE TABLE "public"."DailyScheduleTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scheduleTimes" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyScheduleTemplate_pkey" PRIMARY KEY ("id")
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
    "brandingConfig" JSONB,
    "clinicalFocus" TEXT,
    "currentStatus" TEXT,
    "dailySchedule" JSONB,
    "greeting" TEXT,
    "prioritySupplements" JSONB,
    "protocolNotes" TEXT,

    CONSTRAINT "EnhancedProtocol_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."FunctionalMedicineLabRange" (
    "id" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "testCode" TEXT,
    "category" TEXT NOT NULL,
    "standardRangeMin" DOUBLE PRECISION,
    "standardRangeMax" DOUBLE PRECISION,
    "fmOptimalMin" DOUBLE PRECISION NOT NULL,
    "fmOptimalMax" DOUBLE PRECISION NOT NULL,
    "criticalLow" DOUBLE PRECISION,
    "criticalHigh" DOUBLE PRECISION,
    "unit" TEXT NOT NULL,
    "genderSpecific" BOOLEAN NOT NULL DEFAULT false,
    "ageDependent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "clinicalSignificance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FunctionalMedicineLabRange_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "public"."ProtocolGeneration" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "emailRecipients" TEXT[],
    "generationData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProtocolGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProtocolProgress" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "energyLevel" SMALLINT,
    "sleepQuality" SMALLINT,
    "digestionHealth" SMALLINT,
    "overallWellbeing" SMALLINT,
    "supplementCompliance" SMALLINT,
    "dietaryCompliance" SMALLINT,
    "lifestyleCompliance" SMALLINT,
    "symptomsNotes" TEXT,
    "challengesFaced" TEXT,
    "positiveChanges" TEXT,
    "questionsConcerns" TEXT,
    "weekNumber" INTEGER NOT NULL,
    "trackingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtocolProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProtocolStatusChanges" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "reasonForChange" TEXT,
    "adjustmentNotes" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProtocolStatusChanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProtocolSupplement" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "timing" TEXT NOT NULL,
    "purpose" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProtocolSupplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProtocolTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "templateData" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtocolTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TimelineExport" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "exportType" "public"."TimelineType" NOT NULL DEFAULT 'COMPREHENSIVE',
    "status" "public"."ExportStatus" NOT NULL DEFAULT 'PENDING',
    "timelineData" JSONB,
    "criticalFindings" JSONB,
    "exportedAt" TIMESTAMP(3),
    "markdownContent" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "dateRange" JSONB,
    "dataPoints" INTEGER NOT NULL DEFAULT 0,
    "analysisVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "requestedBy" TEXT,
    "processingTime" INTEGER,
    "errorMessage" TEXT,
    "hipaaRelevant" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "labAnalysisData" JSONB,
    "assessmentAnalysisData" JSONB,

    CONSTRAINT "TimelineExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nutriqassessments" (
    "id" SERIAL NOT NULL,
    "fm_assessment_id" TEXT,
    "participant_id" INTEGER,
    "assessment_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "gender" VARCHAR(10),
    "age_range" VARCHAR(20),
    "total_score" DECIMAL(8,2),
    "category_scores" JSONB,
    "completion_status" VARCHAR(20) DEFAULT 'in_progress',
    "completion_percentage" INTEGER DEFAULT 0,
    "time_to_complete" INTEGER,
    "clinical_flags" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutriqassessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nutriqcategories" (
    "id" SERIAL NOT NULL,
    "category_code" VARCHAR(50) NOT NULL,
    "category_name" VARCHAR(200) NOT NULL,
    "display_order" INTEGER NOT NULL,
    "description" TEXT,
    "clinical_significance" TEXT,
    "scoring_weight" DECIMAL(3,2) DEFAULT 1.00,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutriqcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nutriqclinicalcorrelations" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER,
    "correlation_type" VARCHAR(50),
    "target_system" VARCHAR(100),
    "clinical_marker" VARCHAR(200),
    "correlation_strength" VARCHAR(20),
    "research_references" TEXT,
    "clinical_notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutriqclinicalcorrelations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nutriqquestions" (
    "id" SERIAL NOT NULL,
    "question_id" VARCHAR(10) NOT NULL,
    "category_id" INTEGER,
    "question_text" TEXT NOT NULL,
    "response_scale_type" VARCHAR(20) DEFAULT '0-3',
    "response_options" JSONB NOT NULL,
    "clinical_notes" TEXT,
    "is_gender_specific" BOOLEAN DEFAULT false,
    "applicable_genders" VARCHAR(20),
    "display_order" INTEGER NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutriqquestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nutriqrecommendations" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER,
    "score_range_min" INTEGER,
    "score_range_max" INTEGER,
    "recommendation_type" VARCHAR(50),
    "recommendation_text" TEXT NOT NULL,
    "priority_level" INTEGER DEFAULT 3,
    "estimated_duration" VARCHAR(50),
    "contraindications" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutriqrecommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nutriqresponses" (
    "id" SERIAL NOT NULL,
    "assessment_id" INTEGER,
    "question_id" INTEGER,
    "response_value" INTEGER NOT NULL,
    "response_text" VARCHAR(20),
    "points_contributed" DECIMAL(5,2),
    "is_flagged" BOOLEAN DEFAULT false,
    "notes" TEXT,
    "answered_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutriqresponses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nutriqscoringalgorithms" (
    "id" SERIAL NOT NULL,
    "algorithm_name" VARCHAR(100) NOT NULL,
    "category_id" INTEGER,
    "calculation_method" TEXT NOT NULL,
    "weight_factor" DECIMAL(3,2) DEFAULT 1.00,
    "threshold_low" INTEGER,
    "threshold_moderate" INTEGER,
    "threshold_high" INTEGER,
    "clinical_interpretation" JSONB,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutriqscoringalgorithms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analyses" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "analysisData" JSONB NOT NULL,
    "rootCauses" TEXT[],
    "riskFactors" TEXT[],
    "priorityAreas" TEXT[],
    "confidence" DOUBLE PRECISION NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."protocol_phases" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT NOT NULL,
    "supplements" JSONB[],
    "lifestyle" JSONB[],
    "dietary" JSONB[],
    "monitoring" JSONB[],
    "status" "public"."ProtocolPhaseStatus" NOT NULL DEFAULT 'PLANNED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supplements" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "analysisId" TEXT,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "timing" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "priority" "public"."SupplementPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT NOT NULL,
    "productUrl" TEXT,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rationale" TEXT,
    "phase" TEXT NOT NULL,
    "status" "public"."SupplementStatus" NOT NULL DEFAULT 'RECOMMENDED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "compliance" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."protocol_history" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "analysisId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "protocol_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientAnalysis_clientId_analysisDate_idx" ON "public"."ClientAnalysis"("clientId", "analysisDate");

-- CreateIndex
CREATE INDEX "ClientAnalysis_status_idx" ON "public"."ClientAnalysis"("status");

-- CreateIndex
CREATE INDEX "DailyScheduleTemplate_isDefault_idx" ON "public"."DailyScheduleTemplate"("isDefault");

-- CreateIndex
CREATE INDEX "EnhancedProtocol_analysisId_idx" ON "public"."EnhancedProtocol"("analysisId");

-- CreateIndex
CREATE INDEX "EnhancedProtocol_clientId_status_idx" ON "public"."EnhancedProtocol"("clientId", "status");

-- CreateIndex
CREATE INDEX "FmDigestiveQuestion_category_idx" ON "public"."FmDigestiveQuestion"("category");

-- CreateIndex
CREATE INDEX "FmDigestiveQuestion_displayOrder_idx" ON "public"."FmDigestiveQuestion"("displayOrder");

-- CreateIndex
CREATE INDEX "FmDigestiveQuestion_isActive_idx" ON "public"."FmDigestiveQuestion"("isActive");

-- CreateIndex
CREATE INDEX "FmDigestiveQuestion_subcategory_idx" ON "public"."FmDigestiveQuestion"("subcategory");

-- CreateIndex
CREATE INDEX "FmDigestiveResponse_assessmentId_idx" ON "public"."FmDigestiveResponse"("assessmentId");

-- CreateIndex
CREATE INDEX "FmDigestiveResponse_questionId_idx" ON "public"."FmDigestiveResponse"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "FmDigestiveResponse_assessmentId_questionId_key" ON "public"."FmDigestiveResponse"("assessmentId", "questionId");

-- CreateIndex
CREATE INDEX "FmScoringAlgorithm_isActive_idx" ON "public"."FmScoringAlgorithm"("isActive");

-- CreateIndex
CREATE INDEX "FmScoringAlgorithm_systemName_idx" ON "public"."FmScoringAlgorithm"("systemName");

-- CreateIndex
CREATE INDEX "FunctionalMedicineAssessment_assessmentType_idx" ON "public"."FunctionalMedicineAssessment"("assessmentType");

-- CreateIndex
CREATE INDEX "FunctionalMedicineAssessment_clientId_idx" ON "public"."FunctionalMedicineAssessment"("clientId");

-- CreateIndex
CREATE INDEX "FunctionalMedicineAssessment_completedAt_idx" ON "public"."FunctionalMedicineAssessment"("completedAt");

-- CreateIndex
CREATE INDEX "FunctionalMedicineAssessment_status_idx" ON "public"."FunctionalMedicineAssessment"("status");

-- CreateIndex
CREATE INDEX "FunctionalMedicineLabRange_category_idx" ON "public"."FunctionalMedicineLabRange"("category");

-- CreateIndex
CREATE INDEX "FunctionalMedicineLabRange_testName_idx" ON "public"."FunctionalMedicineLabRange"("testName");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionalMedicineLabRange_testName_testCode_key" ON "public"."FunctionalMedicineLabRange"("testName", "testCode");

-- CreateIndex
CREATE INDEX "NutriqComparisonData_clientId_idx" ON "public"."NutriqComparisonData"("clientId");

-- CreateIndex
CREATE INDEX "NutriqComparisonData_nutriqAssessmentDate_idx" ON "public"."NutriqComparisonData"("nutriqAssessmentDate");

-- CreateIndex
CREATE INDEX "ProtocolGeneration_clientId_idx" ON "public"."ProtocolGeneration"("clientId");

-- CreateIndex
CREATE INDEX "ProtocolGeneration_createdAt_idx" ON "public"."ProtocolGeneration"("createdAt");

-- CreateIndex
CREATE INDEX "ProtocolGeneration_protocolId_idx" ON "public"."ProtocolGeneration"("protocolId");

-- CreateIndex
CREATE INDEX "ProtocolProgress_clientId_idx" ON "public"."ProtocolProgress"("clientId");

-- CreateIndex
CREATE INDEX "ProtocolProgress_protocolId_idx" ON "public"."ProtocolProgress"("protocolId");

-- CreateIndex
CREATE INDEX "ProtocolProgress_trackingDate_idx" ON "public"."ProtocolProgress"("trackingDate");

-- CreateIndex
CREATE INDEX "ProtocolProgress_weekNumber_idx" ON "public"."ProtocolProgress"("weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProtocolProgress_protocolId_weekNumber_key" ON "public"."ProtocolProgress"("protocolId", "weekNumber");

-- CreateIndex
CREATE INDEX "ProtocolStatusChanges_changedAt_idx" ON "public"."ProtocolStatusChanges"("changedAt");

-- CreateIndex
CREATE INDEX "ProtocolStatusChanges_changedBy_idx" ON "public"."ProtocolStatusChanges"("changedBy");

-- CreateIndex
CREATE INDEX "ProtocolStatusChanges_protocolId_idx" ON "public"."ProtocolStatusChanges"("protocolId");

-- CreateIndex
CREATE INDEX "ProtocolSupplement_priority_isActive_idx" ON "public"."ProtocolSupplement"("priority", "isActive");

-- CreateIndex
CREATE INDEX "ProtocolSupplement_protocolId_idx" ON "public"."ProtocolSupplement"("protocolId");

-- CreateIndex
CREATE INDEX "ProtocolSupplement_startDate_endDate_idx" ON "public"."ProtocolSupplement"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "ProtocolTemplate_category_isActive_idx" ON "public"."ProtocolTemplate"("category", "isActive");

-- CreateIndex
CREATE INDEX "ProtocolTemplate_isActive_idx" ON "public"."ProtocolTemplate"("isActive");

-- CreateIndex
CREATE INDEX "TimelineExport_clientId_exportType_idx" ON "public"."TimelineExport"("clientId", "exportType");

-- CreateIndex
CREATE INDEX "TimelineExport_createdAt_idx" ON "public"."TimelineExport"("createdAt");

-- CreateIndex
CREATE INDEX "TimelineExport_requestedBy_idx" ON "public"."TimelineExport"("requestedBy");

-- CreateIndex
CREATE INDEX "TimelineExport_status_idx" ON "public"."TimelineExport"("status");

-- CreateIndex
CREATE INDEX "idx_nutriq_assessments_date" ON "public"."nutriqassessments"("assessment_date");

-- CreateIndex
CREATE INDEX "idx_nutriq_assessments_fm" ON "public"."nutriqassessments"("fm_assessment_id");

-- CreateIndex
CREATE INDEX "idx_nutriq_assessments_participant" ON "public"."nutriqassessments"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "nutriqcategories_category_code_key" ON "public"."nutriqcategories"("category_code");

-- CreateIndex
CREATE UNIQUE INDEX "nutriqquestions_question_id_key" ON "public"."nutriqquestions"("question_id");

-- CreateIndex
CREATE INDEX "idx_nutriq_questions_category" ON "public"."nutriqquestions"("category_id");

-- CreateIndex
CREATE INDEX "idx_nutriq_questions_display" ON "public"."nutriqquestions"("display_order");

-- CreateIndex
CREATE INDEX "idx_nutriq_responses_assessment" ON "public"."nutriqresponses"("assessment_id");

-- CreateIndex
CREATE INDEX "idx_nutriq_responses_question" ON "public"."nutriqresponses"("question_id");

-- AddForeignKey
ALTER TABLE "public"."ClientAnalysis" ADD CONSTRAINT "ClientAnalysis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnhancedProtocol" ADD CONSTRAINT "EnhancedProtocol_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "public"."ClientAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnhancedProtocol" ADD CONSTRAINT "EnhancedProtocol_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FmDigestiveResponse" ADD CONSTRAINT "FmDigestiveResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."FunctionalMedicineAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FmDigestiveResponse" ADD CONSTRAINT "FmDigestiveResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."FmDigestiveQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FunctionalMedicineAssessment" ADD CONSTRAINT "FunctionalMedicineAssessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutriqComparisonData" ADD CONSTRAINT "NutriqComparisonData_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtocolGeneration" ADD CONSTRAINT "ProtocolGeneration_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtocolGeneration" ADD CONSTRAINT "ProtocolGeneration_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "public"."EnhancedProtocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtocolProgress" ADD CONSTRAINT "ProtocolProgress_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtocolProgress" ADD CONSTRAINT "ProtocolProgress_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "public"."EnhancedProtocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtocolStatusChanges" ADD CONSTRAINT "ProtocolStatusChanges_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "public"."EnhancedProtocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtocolSupplement" ADD CONSTRAINT "ProtocolSupplement_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "public"."EnhancedProtocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimelineExport" ADD CONSTRAINT "TimelineExport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nutriqassessments" ADD CONSTRAINT "nutriqassessments_fm_assessment_id_fkey" FOREIGN KEY ("fm_assessment_id") REFERENCES "public"."FunctionalMedicineAssessment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nutriqclinicalcorrelations" ADD CONSTRAINT "nutriqclinicalcorrelations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."nutriqcategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nutriqquestions" ADD CONSTRAINT "nutriqquestions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."nutriqcategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nutriqrecommendations" ADD CONSTRAINT "nutriqrecommendations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."nutriqcategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nutriqresponses" ADD CONSTRAINT "nutriqresponses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."nutriqassessments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nutriqresponses" ADD CONSTRAINT "nutriqresponses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."nutriqquestions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."nutriqscoringalgorithms" ADD CONSTRAINT "nutriqscoringalgorithms_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."nutriqcategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."analyses" ADD CONSTRAINT "analyses_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."protocol_phases" ADD CONSTRAINT "protocol_phases_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "public"."analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."protocol_phases" ADD CONSTRAINT "protocol_phases_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supplements" ADD CONSTRAINT "supplements_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supplements" ADD CONSTRAINT "supplements_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "public"."analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."protocol_history" ADD CONSTRAINT "protocol_history_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."protocol_history" ADD CONSTRAINT "protocol_history_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "public"."analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
