-- CreateEnum
CREATE TYPE "public"."NoteType" AS ENUM ('INTERVIEW', 'COACHING');

-- CreateEnum
CREATE TYPE "public"."StatusType" AS ENUM ('SIGNED_UP', 'INITIAL_INTERVIEW_COMPLETED', 'ASSESSMENT_COMPLETED', 'DOCS_UPLOADED', 'SCHEDULED', 'ONGOING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."AnalysisStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'REQUIRES_REVIEW', 'APPROVED');

-- CreateEnum
CREATE TYPE "public"."AnalysisType" AS ENUM ('FUNCTIONAL_MEDICINE', 'CONVENTIONAL_INTERPRETATION', 'TREND_ANALYSIS', 'COMPARATIVE_ANALYSIS', 'PATTERN_RECOGNITION', 'NUTRIENT_ANALYSIS', 'TOXICITY_ANALYSIS', 'HORMONE_ANALYSIS');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'UPLOAD', 'DOWNLOAD', 'PROCESS', 'ANALYZE', 'EXPORT', 'SHARE', 'LOGIN', 'LOGOUT', 'ACCESS_DENIED');

-- CreateEnum
CREATE TYPE "public"."AuditResource" AS ENUM ('USER', 'CLIENT', 'DOCUMENT', 'LAB_VALUE', 'ANALYSIS', 'ASSESSMENT', 'PROTOCOL', 'NOTE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('LAB_REPORT', 'IMAGING_REPORT', 'CLINICAL_NOTES', 'PATHOLOGY_REPORT', 'ASSESSMENT_FORM', 'PRESCRIPTION', 'UNKNOWN', 'INSURANCE_CARD', 'INTAKE_FORM');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'DELAYED', 'CANCELLED', 'STUCK');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('OCR_EXTRACTION', 'DATA_PARSING', 'VALUE_EXTRACTION', 'FUNCTIONAL_ANALYSIS', 'PATTERN_ANALYSIS', 'TREND_ANALYSIS', 'REPORT_GENERATION', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "public"."LabCategory" AS ENUM ('BASIC_METABOLIC', 'COMPREHENSIVE_METABOLIC', 'LIPID_PANEL', 'THYROID', 'HORMONE', 'VITAMIN_MINERAL', 'INFLAMMATORY_MARKERS', 'IMMUNE_FUNCTION', 'DIGESTIVE_HEALTH', 'DETOXIFICATION', 'CARDIOVASCULAR', 'NEUROLOGICAL', 'OTHER', 'GENETIC', 'MICRONUTRIENT', 'FOOD_SENSITIVITY', 'HEAVY_METALS', 'ORGANIC_ACIDS', 'AMINO_ACIDS', 'FATTY_ACIDS');

-- CreateEnum
CREATE TYPE "public"."LabType" AS ENUM ('NUTRIQ', 'LABCORP', 'QUEST', 'DUTCH', 'KBMO', 'GENOVA', 'DIAGNOSTIC_SOLUTIONS', 'GREAT_PLAINS', 'OTHER', 'VIBRANT_WELLNESS', 'PRECISION_POINT');

-- CreateEnum
CREATE TYPE "public"."ProcessingStatus" AS ENUM ('UPLOADED', 'QUEUED', 'PROCESSING', 'OCR_COMPLETE', 'EXTRACTION_COMPLETE', 'ANALYSIS_COMPLETE', 'COMPLETED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."Severity" AS ENUM ('CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'NORMAL');

-- CreateEnum
CREATE TYPE "public"."StorageProvider" AS ENUM ('LOCAL', 'S3', 'CLOUDINARY');

-- CreateEnum
CREATE TYPE "public"."MedicalDocStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REQUIRES_REVIEW');

-- CreateEnum
CREATE TYPE "public"."MedicalJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRY');

-- CreateEnum
CREATE TYPE "public"."AssessmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "rememberToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "isTruckDriver" BOOLEAN NOT NULL DEFAULT true,
    "dotNumber" TEXT,
    "cdlNumber" TEXT,
    "healthGoals" JSONB,
    "medications" JSONB,
    "conditions" JSONB,
    "allergies" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastVisit" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "assessmentCompleted" BOOLEAN NOT NULL DEFAULT false,
    "assessmentCompletedAt" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "password" TEXT,
    "rememberToken" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "processingError" TEXT,
    "extractedText" TEXT,
    "ocrConfidence" DOUBLE PRECISION,
    "aiAnalysis" JSONB,
    "analysisDate" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "structuredData" JSONB,
    "documentType" "public"."DocumentType" NOT NULL DEFAULT 'UNKNOWN',
    "labType" "public"."LabType",
    "analysisStatus" "public"."AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "containsPHI" BOOLEAN NOT NULL DEFAULT false,
    "encryptionKey" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
    "lastAccessedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "ocrProvider" TEXT,
    "originalFileName" TEXT,
    "phiTypes" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "storageKey" TEXT,
    "storageProvider" "public"."StorageProvider" NOT NULL DEFAULT 'LOCAL',
    "tags" TEXT[],
    "status" "public"."ProcessingStatus" NOT NULL DEFAULT 'UPLOADED',

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assessment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL DEFAULT 'comprehensive',
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "responses" JSONB NOT NULL,
    "symptomBurden" JSONB,
    "rootCauses" JSONB,
    "aiAnalysis" JSONB,
    "recommendations" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Protocol" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "protocolName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "supplements" JSONB NOT NULL,
    "dietary" JSONB NOT NULL,
    "lifestyle" JSONB NOT NULL,
    "timeline" JSONB NOT NULL,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Note" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "noteType" "public"."NoteType" NOT NULL,
    "title" TEXT,
    "chiefComplaints" TEXT,
    "healthHistory" TEXT,
    "currentMedications" TEXT,
    "goals" TEXT,
    "protocolAdjustments" TEXT,
    "complianceNotes" TEXT,
    "progressMetrics" TEXT,
    "nextSteps" TEXT,
    "generalNotes" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientStatus" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "public"."StatusType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "ClientStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "resourceId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endpoint" TEXT,
    "method" TEXT,
    "clientId" TEXT,
    "metadata" JSONB,
    "changes" JSONB,
    "dataAccessed" TEXT[],
    "details" JSONB,
    "duration" INTEGER,
    "errorMessage" TEXT,
    "hipaaRelevant" BOOLEAN NOT NULL DEFAULT true,
    "purpose" TEXT,
    "requestId" TEXT,
    "sessionId" TEXT,
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL,
    "userRole" TEXT,
    "action" "public"."AuditAction" NOT NULL,
    "resource" "public"."AuditResource" NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DocumentAnalysis" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "analysisType" "public"."AnalysisType" NOT NULL,
    "patterns" JSONB,
    "findings" JSONB,
    "criticalValues" JSONB,
    "trends" JSONB,
    "systemAssessment" JSONB,
    "rootCauses" JSONB,
    "recommendations" JSONB,
    "confidence" DOUBLE PRECISION,
    "modelVersion" TEXT,
    "processingTime" INTEGER,
    "status" "public"."AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "cost" DOUBLE PRECISION,
    "insights" JSONB,
    "interactions" JSONB,
    "limitations" TEXT[],
    "provider" TEXT NOT NULL DEFAULT 'CLAUDE',
    "reliability" TEXT,
    "reviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "tokens" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabValue" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "testCode" TEXT,
    "category" "public"."LabCategory" NOT NULL,
    "subcategory" TEXT,
    "value" TEXT NOT NULL,
    "numericValue" DOUBLE PRECISION,
    "unit" TEXT,
    "conventionalLow" DOUBLE PRECISION,
    "conventionalHigh" DOUBLE PRECISION,
    "functionalLow" DOUBLE PRECISION,
    "functionalHigh" DOUBLE PRECISION,
    "flag" TEXT,
    "isOutOfRange" BOOLEAN NOT NULL DEFAULT false,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "severity" "public"."Severity" NOT NULL DEFAULT 'NORMAL',
    "collectionDate" TIMESTAMP(3),
    "labName" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extractionMethod" TEXT,
    "labLocation" TEXT,
    "panel" TEXT,
    "referenceRange" JSONB,
    "reportDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LabValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProcessingJob" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "jobType" "public"."JobType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "config" JSONB,
    "queueName" TEXT NOT NULL DEFAULT 'default',
    "jobId" TEXT,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentStep" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "backoffDelay" INTEGER NOT NULL DEFAULT 5000,
    "result" JSONB,
    "error" JSONB,
    "logs" JSONB[],
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "processingNode" TEXT,
    "memoryUsage" INTEGER,
    "cpuTime" INTEGER,

    CONSTRAINT "ProcessingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemMetrics" (
    "id" TEXT NOT NULL,
    "cpuUsage" DOUBLE PRECISION,
    "memoryUsage" DOUBLE PRECISION,
    "diskUsage" DOUBLE PRECISION,
    "queueLength" INTEGER NOT NULL DEFAULT 0,
    "activeJobs" INTEGER NOT NULL DEFAULT 0,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "failedJobs" INTEGER NOT NULL DEFAULT 0,
    "averageProcessingTime" DOUBLE PRECISION,
    "throughputPerHour" INTEGER NOT NULL DEFAULT 0,
    "errorRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DOUBLE PRECISION,
    "documentsStored" INTEGER NOT NULL DEFAULT 0,
    "storageUsed" BIGINT NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intervalType" TEXT NOT NULL DEFAULT 'hourly',

    CONSTRAINT "SystemMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_documents" (
    "id" TEXT NOT NULL,
    "client_id" TEXT,
    "document_type" TEXT NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "s3_url" TEXT,
    "s3_key" TEXT,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."MedicalDocStatus" NOT NULL DEFAULT 'PENDING',
    "ocr_text" TEXT,
    "ocr_confidence" DOUBLE PRECISION,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "metadata" JSONB,

    CONSTRAINT "medical_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_lab_values" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "standard_name" TEXT,
    "value" DOUBLE PRECISION,
    "value_text" TEXT,
    "unit" TEXT,
    "reference_min" DOUBLE PRECISION,
    "reference_max" DOUBLE PRECISION,
    "functional_min" DOUBLE PRECISION,
    "functional_max" DOUBLE PRECISION,
    "optimal_min" DOUBLE PRECISION,
    "optimal_max" DOUBLE PRECISION,
    "flag" TEXT,
    "collection_date" TIMESTAMP(3),
    "lab_source" TEXT,
    "confidence" DOUBLE PRECISION DEFAULT 1.0,

    CONSTRAINT "medical_lab_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_document_analyses" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "patterns" JSONB NOT NULL,
    "root_causes" JSONB,
    "critical_values" JSONB,
    "functional_status" JSONB,
    "cross_references" JSONB,
    "trends" JSONB,
    "recommendations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_document_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_processing_queue" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."MedicalJobStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_processing_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Functional Medicine Assessment v1.0',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "questionBank" JSONB NOT NULL,
    "modules" JSONB NOT NULL,
    "scoringRules" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientAssessment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "currentModule" TEXT NOT NULL DEFAULT 'SCREENING',
    "questionsAsked" INTEGER NOT NULL DEFAULT 0,
    "questionsSaved" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiContext" JSONB,
    "symptomProfile" JSONB,
    "seedOilRisk" JSONB,
    "status" "public"."AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),

    CONSTRAINT "ClientAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientResponse" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionModule" TEXT NOT NULL,
    "responseType" TEXT NOT NULL,
    "responseValue" JSONB NOT NULL,
    "responseText" TEXT,
    "aiReasoning" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "clinicalFlags" JSONB,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClientResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentAnalysis" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "primaryPatterns" JSONB NOT NULL,
    "rootCauses" JSONB NOT NULL,
    "systemPriorities" JSONB NOT NULL,
    "keyFindings" JSONB NOT NULL,
    "labRecommendations" JSONB NOT NULL,
    "supplementProtocol" JSONB NOT NULL,
    "lifestyleModifications" JSONB NOT NULL,
    "treatmentPhases" JSONB NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "nodeScores" JSONB,
    "seedOilScore" JSONB,
    "aiSummary" TEXT,
    "primaryConcerns" JSONB,
    "suggestedLabs" JSONB,
    "labPredictions" JSONB,
    "protocolPriority" JSONB,
    "riskFactors" JSONB,
    "strengths" JSONB,
    "analysisVersion" TEXT NOT NULL DEFAULT '1.0',
    "analyzedBy" TEXT NOT NULL DEFAULT 'claude-3-opus',
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NutriQTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'NutriQ Assessment v1.0',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "categories" JSONB NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutriQTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NutriQAssessment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "currentCategory" TEXT,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL,
    "percentComplete" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "public"."AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "categoryScores" JSONB,
    "totalBurden" INTEGER,

    CONSTRAINT "NutriQAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NutriQResponse" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutriQResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NutriQAnalysis" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "totalSymptomBurden" INTEGER NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "potentialConditions" JSONB NOT NULL,
    "nutritionalDeficiencies" JSONB NOT NULL,
    "priorityAreas" JSONB NOT NULL,
    "rootCauseAnalysis" TEXT,
    "recommendations" JSONB NOT NULL,
    "labRecommendations" JSONB NOT NULL,
    "analysisVersion" TEXT NOT NULL DEFAULT '1.0',
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutriQAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "public"."Client"("email");

-- CreateIndex
CREATE INDEX "Document_clientId_idx" ON "public"."Document"("clientId");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "public"."Document"("status");

-- CreateIndex
CREATE INDEX "Document_documentType_idx" ON "public"."Document"("documentType");

-- CreateIndex
CREATE INDEX "Document_priority_idx" ON "public"."Document"("priority");

-- CreateIndex
CREATE INDEX "Document_uploadedAt_idx" ON "public"."Document"("uploadedAt");

-- CreateIndex
CREATE INDEX "Assessment_clientId_idx" ON "public"."Assessment"("clientId");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "public"."Assessment"("status");

-- CreateIndex
CREATE INDEX "Protocol_clientId_idx" ON "public"."Protocol"("clientId");

-- CreateIndex
CREATE INDEX "Protocol_status_idx" ON "public"."Protocol"("status");

-- CreateIndex
CREATE INDEX "Note_clientId_noteType_idx" ON "public"."Note"("clientId", "noteType");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "public"."Note"("createdAt");

-- CreateIndex
CREATE INDEX "ClientStatus_clientId_createdAt_idx" ON "public"."ClientStatus"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientStatus_status_idx" ON "public"."ClientStatus"("status");

-- CreateIndex
CREATE INDEX "AuditLog_action_resource_idx" ON "public"."AuditLog"("action", "resource");

-- CreateIndex
CREATE INDEX "AuditLog_clientId_timestamp_idx" ON "public"."AuditLog"("clientId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_hipaaRelevant_idx" ON "public"."AuditLog"("hipaaRelevant");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "public"."AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_userId_timestamp_idx" ON "public"."AuditLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_analysisType_idx" ON "public"."DocumentAnalysis"("analysisType");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_clientId_idx" ON "public"."DocumentAnalysis"("clientId");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_createdAt_idx" ON "public"."DocumentAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_documentId_idx" ON "public"."DocumentAnalysis"("documentId");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_status_idx" ON "public"."DocumentAnalysis"("status");

-- CreateIndex
CREATE INDEX "LabValue_category_idx" ON "public"."LabValue"("category");

-- CreateIndex
CREATE INDEX "LabValue_clientId_testName_idx" ON "public"."LabValue"("clientId", "testName");

-- CreateIndex
CREATE INDEX "LabValue_collectionDate_idx" ON "public"."LabValue"("collectionDate");

-- CreateIndex
CREATE INDEX "LabValue_documentId_idx" ON "public"."LabValue"("documentId");

-- CreateIndex
CREATE INDEX "LabValue_isCritical_idx" ON "public"."LabValue"("isCritical");

-- CreateIndex
CREATE INDEX "ProcessingJob_documentId_status_idx" ON "public"."ProcessingJob"("documentId", "status");

-- CreateIndex
CREATE INDEX "ProcessingJob_jobType_idx" ON "public"."ProcessingJob"("jobType");

-- CreateIndex
CREATE INDEX "ProcessingJob_scheduledAt_idx" ON "public"."ProcessingJob"("scheduledAt");

-- CreateIndex
CREATE INDEX "ProcessingJob_status_priority_idx" ON "public"."ProcessingJob"("status", "priority");

-- CreateIndex
CREATE INDEX "SystemMetrics_timestamp_intervalType_idx" ON "public"."SystemMetrics"("timestamp", "intervalType");

-- CreateIndex
CREATE INDEX "medical_documents_client_id_upload_date_idx" ON "public"."medical_documents"("client_id", "upload_date");

-- CreateIndex
CREATE INDEX "medical_documents_status_idx" ON "public"."medical_documents"("status");

-- CreateIndex
CREATE INDEX "medical_lab_values_document_id_idx" ON "public"."medical_lab_values"("document_id");

-- CreateIndex
CREATE INDEX "medical_lab_values_test_name_idx" ON "public"."medical_lab_values"("test_name");

-- CreateIndex
CREATE INDEX "medical_lab_values_standard_name_idx" ON "public"."medical_lab_values"("standard_name");

-- CreateIndex
CREATE UNIQUE INDEX "medical_document_analyses_document_id_key" ON "public"."medical_document_analyses"("document_id");

-- CreateIndex
CREATE INDEX "medical_processing_queue_status_priority_idx" ON "public"."medical_processing_queue"("status", "priority");

-- CreateIndex
CREATE INDEX "ClientAssessment_clientId_idx" ON "public"."ClientAssessment"("clientId");

-- CreateIndex
CREATE INDEX "ClientAssessment_status_idx" ON "public"."ClientAssessment"("status");

-- CreateIndex
CREATE INDEX "ClientResponse_assessmentId_idx" ON "public"."ClientResponse"("assessmentId");

-- CreateIndex
CREATE INDEX "ClientResponse_questionId_idx" ON "public"."ClientResponse"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAnalysis_assessmentId_key" ON "public"."AssessmentAnalysis"("assessmentId");

-- CreateIndex
CREATE INDEX "NutriQAssessment_clientId_idx" ON "public"."NutriQAssessment"("clientId");

-- CreateIndex
CREATE INDEX "NutriQAssessment_status_idx" ON "public"."NutriQAssessment"("status");

-- CreateIndex
CREATE INDEX "NutriQResponse_assessmentId_idx" ON "public"."NutriQResponse"("assessmentId");

-- CreateIndex
CREATE INDEX "NutriQResponse_category_idx" ON "public"."NutriQResponse"("category");

-- CreateIndex
CREATE UNIQUE INDEX "NutriQAnalysis_assessmentId_key" ON "public"."NutriQAnalysis"("assessmentId");

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Protocol" ADD CONSTRAINT "Protocol_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Protocol" ADD CONSTRAINT "Protocol_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Note" ADD CONSTRAINT "Note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientStatus" ADD CONSTRAINT "ClientStatus_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentAnalysis" ADD CONSTRAINT "DocumentAnalysis_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabValue" ADD CONSTRAINT "LabValue_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProcessingJob" ADD CONSTRAINT "ProcessingJob_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_documents" ADD CONSTRAINT "medical_documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_lab_values" ADD CONSTRAINT "medical_lab_values_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."medical_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_document_analyses" ADD CONSTRAINT "medical_document_analyses_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."medical_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientAssessment" ADD CONSTRAINT "ClientAssessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientAssessment" ADD CONSTRAINT "ClientAssessment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."AssessmentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientResponse" ADD CONSTRAINT "ClientResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."ClientAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAnalysis" ADD CONSTRAINT "AssessmentAnalysis_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."ClientAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutriQAssessment" ADD CONSTRAINT "NutriQAssessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutriQAssessment" ADD CONSTRAINT "NutriQAssessment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."NutriQTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutriQResponse" ADD CONSTRAINT "NutriQResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."NutriQAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutriQAnalysis" ADD CONSTRAINT "NutriQAnalysis_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."NutriQAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
