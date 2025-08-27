-- AlterTable
ALTER TABLE "public"."EnhancedProtocol" ADD COLUMN     "brandingConfig" JSONB,
ADD COLUMN     "clinicalFocus" TEXT,
ADD COLUMN     "currentStatus" TEXT,
ADD COLUMN     "dailySchedule" JSONB,
ADD COLUMN     "greeting" TEXT,
ADD COLUMN     "prioritySupplements" JSONB,
ADD COLUMN     "protocolNotes" TEXT;

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
CREATE TABLE "public"."DailyScheduleTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scheduleTimes" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyScheduleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProtocolTemplate_category_isActive_idx" ON "public"."ProtocolTemplate"("category", "isActive");

-- CreateIndex
CREATE INDEX "ProtocolTemplate_isActive_idx" ON "public"."ProtocolTemplate"("isActive");

-- CreateIndex
CREATE INDEX "ProtocolSupplement_protocolId_idx" ON "public"."ProtocolSupplement"("protocolId");

-- CreateIndex
CREATE INDEX "ProtocolSupplement_priority_isActive_idx" ON "public"."ProtocolSupplement"("priority", "isActive");

-- CreateIndex
CREATE INDEX "ProtocolSupplement_startDate_endDate_idx" ON "public"."ProtocolSupplement"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "ProtocolGeneration_protocolId_idx" ON "public"."ProtocolGeneration"("protocolId");

-- CreateIndex
CREATE INDEX "ProtocolGeneration_clientId_idx" ON "public"."ProtocolGeneration"("clientId");

-- CreateIndex
CREATE INDEX "ProtocolGeneration_createdAt_idx" ON "public"."ProtocolGeneration"("createdAt");

-- CreateIndex
CREATE INDEX "DailyScheduleTemplate_isDefault_idx" ON "public"."DailyScheduleTemplate"("isDefault");

-- AddForeignKey
ALTER TABLE "public"."ProtocolSupplement" ADD CONSTRAINT "ProtocolSupplement_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "public"."EnhancedProtocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtocolGeneration" ADD CONSTRAINT "ProtocolGeneration_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "public"."EnhancedProtocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtocolGeneration" ADD CONSTRAINT "ProtocolGeneration_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
