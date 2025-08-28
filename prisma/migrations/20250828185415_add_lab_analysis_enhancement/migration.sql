-- AlterTable
ALTER TABLE "public"."TimelineExport" ADD COLUMN     "labAnalysisData" JSONB;

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

-- CreateIndex
CREATE INDEX "FunctionalMedicineLabRange_category_idx" ON "public"."FunctionalMedicineLabRange"("category");

-- CreateIndex
CREATE INDEX "FunctionalMedicineLabRange_testName_idx" ON "public"."FunctionalMedicineLabRange"("testName");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionalMedicineLabRange_testName_testCode_key" ON "public"."FunctionalMedicineLabRange"("testName", "testCode");
