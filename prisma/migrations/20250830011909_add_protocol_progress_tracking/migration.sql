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

-- CreateIndex
CREATE INDEX "ProtocolProgress_protocolId_idx" ON "public"."ProtocolProgress"("protocolId");

-- CreateIndex
CREATE INDEX "ProtocolProgress_clientId_idx" ON "public"."ProtocolProgress"("clientId");

-- CreateIndex
CREATE INDEX "ProtocolProgress_weekNumber_idx" ON "public"."ProtocolProgress"("weekNumber");

-- CreateIndex
CREATE INDEX "ProtocolProgress_trackingDate_idx" ON "public"."ProtocolProgress"("trackingDate");

-- CreateIndex
CREATE UNIQUE INDEX "ProtocolProgress_protocolId_weekNumber_key" ON "public"."ProtocolProgress"("protocolId", "weekNumber");

-- CreateIndex
CREATE INDEX "ProtocolStatusChanges_protocolId_idx" ON "public"."ProtocolStatusChanges"("protocolId");

-- CreateIndex
CREATE INDEX "ProtocolStatusChanges_changedAt_idx" ON "public"."ProtocolStatusChanges"("changedAt");

-- CreateIndex
CREATE INDEX "ProtocolStatusChanges_changedBy_idx" ON "public"."ProtocolStatusChanges"("changedBy");

-- AddForeignKey
ALTER TABLE "public"."ProtocolProgress" ADD CONSTRAINT "ProtocolProgress_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "public"."EnhancedProtocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtocolProgress" ADD CONSTRAINT "ProtocolProgress_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtocolStatusChanges" ADD CONSTRAINT "ProtocolStatusChanges_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "public"."EnhancedProtocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
