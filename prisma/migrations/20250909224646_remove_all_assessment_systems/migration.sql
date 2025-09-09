/*
  Warnings:

  - You are about to drop the `AssessmentCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssessmentQuestionCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SimpleAssessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SimpleResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AssessmentQuestionCategory" DROP CONSTRAINT "AssessmentQuestionCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SimpleAssessment" DROP CONSTRAINT "SimpleAssessment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SimpleResponse" DROP CONSTRAINT "SimpleResponse_assessmentId_fkey";

-- DropTable
DROP TABLE "public"."AssessmentCategory";

-- DropTable
DROP TABLE "public"."AssessmentQuestionCategory";

-- DropTable
DROP TABLE "public"."SimpleAssessment";

-- DropTable
DROP TABLE "public"."SimpleResponse";
