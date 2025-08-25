-- Add new functional medicine fields to AssessmentAnalysis table
ALTER TABLE "AssessmentAnalysis"
ADD COLUMN IF NOT EXISTS "primaryPatterns" JSONB,
ADD COLUMN IF NOT EXISTS "rootCauses" JSONB,
ADD COLUMN IF NOT EXISTS "systemPriorities" JSONB,
ADD COLUMN IF NOT EXISTS "labRecommendations" JSONB,
ADD COLUMN IF NOT EXISTS "supplementProtocol" JSONB,
ADD COLUMN IF NOT EXISTS "lifestyleModifications" JSONB,
ADD COLUMN IF NOT EXISTS "treatmentPhases" JSONB,
ADD COLUMN IF NOT EXISTS "analysisVersion" TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS "analyzedBy" TEXT DEFAULT 'claude-3-opus',
ADD COLUMN IF NOT EXISTS "confidence" DOUBLE PRECISION;

-- Make legacy fields nullable if they aren't already
ALTER TABLE "AssessmentAnalysis"
ALTER COLUMN "overallScore" DROP NOT NULL,
ALTER COLUMN "aiSummary" DROP NOT NULL;
