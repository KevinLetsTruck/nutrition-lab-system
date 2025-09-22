-- CreateTable
CREATE TABLE "analyses" (
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
    "analysisType" TEXT NOT NULL DEFAULT 'INITIAL',
    "triggerEvent" TEXT,
    "parentAnalysisId" TEXT,
    "relatedDocuments" TEXT[],
    "changesFromPrev" JSONB,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analyses_clientId_analysisDate_idx" ON "analyses"("clientId", "analysisDate");

-- CreateIndex
CREATE INDEX "analyses_analysisType_idx" ON "analyses"("analysisType");

-- CreateIndex
CREATE INDEX "analyses_parentAnalysisId_idx" ON "analyses"("parentAnalysisId");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_parentAnalysisId_fkey" FOREIGN KEY ("parentAnalysisId") REFERENCES "analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
