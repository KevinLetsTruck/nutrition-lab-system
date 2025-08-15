#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

async function triggerReprocess() {
  const prisma = new PrismaClient();

  try {
    // Get the latest document
    const latestDoc = await prisma.medicalDocument.findFirst({
      orderBy: { uploadDate: "desc" },
      select: {
        id: true,
        originalFileName: true,
        status: true,
        metadata: true,
      },
    });

    if (!latestDoc) {
      console.log("❌ No documents found");
      return;
    }

    console.log(`\n📄 Reprocessing: ${latestDoc.originalFileName}`);
    console.log(`   ID: ${latestDoc.id}`);
    console.log(`   Current Status: ${latestDoc.status}`);

    // Reset the document to trigger reprocessing
    await prisma.medicalDocument.update({
      where: { id: latestDoc.id },
      data: {
        status: "PENDING",
        metadata: {
          ...latestDoc.metadata,
          structureAnalysis: null,
          aiExtraction: null,
          functionalAnalysis: null,
          narrativeReport: null,
          processingPipeline: {
            reprocessedAt: new Date().toISOString(),
            reason: "Manual reprocess to complete pipeline",
          },
        },
      },
    });

    // Add to processing queue
    await prisma.medicalProcessingQueue.create({
      data: {
        id: `queue_${latestDoc.id}_${Date.now()}`,
        documentId: latestDoc.id,
        priority: 10,
        jobType: "ocr",
      },
    });

    console.log(`✅ Document queued for reprocessing`);
    console.log(`\n📋 To monitor progress, use ID: ${latestDoc.id}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

triggerReprocess();
