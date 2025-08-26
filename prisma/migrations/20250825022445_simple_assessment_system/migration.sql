/*
  Warnings:

  - You are about to drop the column `assessmentId` on the `Protocol` table. All the data in the column will be lost.
  - You are about to drop the `Assessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssessmentAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssessmentTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientAssessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NutriQAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NutriQAssessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NutriQResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NutriQTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Assessment" DROP CONSTRAINT "Assessment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AssessmentAnalysis" DROP CONSTRAINT "AssessmentAnalysis_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClientAssessment" DROP CONSTRAINT "ClientAssessment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClientAssessment" DROP CONSTRAINT "ClientAssessment_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClientResponse" DROP CONSTRAINT "ClientResponse_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NutriQAnalysis" DROP CONSTRAINT "NutriQAnalysis_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NutriQAssessment" DROP CONSTRAINT "NutriQAssessment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NutriQAssessment" DROP CONSTRAINT "NutriQAssessment_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NutriQResponse" DROP CONSTRAINT "NutriQResponse_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Protocol" DROP CONSTRAINT "Protocol_assessmentId_fkey";

-- AlterTable
ALTER TABLE "public"."Protocol" DROP COLUMN "assessmentId";

-- DropTable
DROP TABLE "public"."Assessment";

-- DropTable
DROP TABLE "public"."AssessmentAnalysis";

-- DropTable
DROP TABLE "public"."AssessmentTemplate";

-- DropTable
DROP TABLE "public"."ClientAssessment";

-- DropTable
DROP TABLE "public"."ClientResponse";

-- DropTable
DROP TABLE "public"."NutriQAnalysis";

-- DropTable
DROP TABLE "public"."NutriQAssessment";

-- DropTable
DROP TABLE "public"."NutriQResponse";

-- DropTable
DROP TABLE "public"."NutriQTemplate";

-- DropEnum
DROP TYPE "public"."AssessmentStatus";

-- CreateTable
CREATE TABLE "public"."SimpleAssessment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SimpleAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SimpleResponse" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimpleResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SimpleAssessment_clientId_idx" ON "public"."SimpleAssessment"("clientId");

-- CreateIndex
CREATE INDEX "SimpleResponse_assessmentId_idx" ON "public"."SimpleResponse"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "SimpleResponse_assessmentId_questionId_key" ON "public"."SimpleResponse"("assessmentId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."SimpleAssessment" ADD CONSTRAINT "SimpleAssessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SimpleResponse" ADD CONSTRAINT "SimpleResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."SimpleAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
