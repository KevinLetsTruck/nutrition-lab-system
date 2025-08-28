-- CreateEnum
CREATE TYPE "public"."TimelineType" AS ENUM ('COMPREHENSIVE', 'FOCUSED', 'SYMPTOMS', 'TREATMENTS', 'ASSESSMENTS');

-- CreateEnum
CREATE TYPE "public"."ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED');

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

    CONSTRAINT "TimelineExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimelineExport_clientId_exportType_idx" ON "public"."TimelineExport"("clientId", "exportType");

-- CreateIndex
CREATE INDEX "TimelineExport_status_idx" ON "public"."TimelineExport"("status");

-- CreateIndex
CREATE INDEX "TimelineExport_createdAt_idx" ON "public"."TimelineExport"("createdAt");

-- CreateIndex
CREATE INDEX "TimelineExport_requestedBy_idx" ON "public"."TimelineExport"("requestedBy");

-- AddForeignKey
ALTER TABLE "public"."TimelineExport" ADD CONSTRAINT "TimelineExport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
