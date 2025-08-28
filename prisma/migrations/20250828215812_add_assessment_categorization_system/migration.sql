-- AlterTable
ALTER TABLE "public"."TimelineExport" ADD COLUMN     "assessmentAnalysisData" JSONB;

-- CreateTable
CREATE TABLE "public"."AssessmentCategory" (
    "id" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryDescription" TEXT,
    "systemFocus" TEXT NOT NULL,
    "diagnosticWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "interventionPriority" INTEGER NOT NULL DEFAULT 3,
    "symptomPatterns" JSONB,
    "rootCauseIndicators" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentQuestionCategory" (
    "id" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "diagnosticWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "severityMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "primaryIndicator" BOOLEAN NOT NULL DEFAULT false,
    "secondaryIndicator" BOOLEAN NOT NULL DEFAULT false,
    "rootCauseMarker" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentQuestionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentCategory_categoryName_key" ON "public"."AssessmentCategory"("categoryName");

-- CreateIndex
CREATE INDEX "AssessmentCategory_systemFocus_idx" ON "public"."AssessmentCategory"("systemFocus");

-- CreateIndex
CREATE INDEX "AssessmentCategory_interventionPriority_idx" ON "public"."AssessmentCategory"("interventionPriority");

-- CreateIndex
CREATE INDEX "AssessmentQuestionCategory_questionId_idx" ON "public"."AssessmentQuestionCategory"("questionId");

-- CreateIndex
CREATE INDEX "AssessmentQuestionCategory_categoryId_idx" ON "public"."AssessmentQuestionCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestionCategory_questionId_categoryId_key" ON "public"."AssessmentQuestionCategory"("questionId", "categoryId");

-- AddForeignKey
ALTER TABLE "public"."AssessmentQuestionCategory" ADD CONSTRAINT "AssessmentQuestionCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."AssessmentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
