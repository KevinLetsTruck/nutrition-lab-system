#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

async function resetProcessing() {
  const prisma = new PrismaClient();

  try {
    console.log("🔄 Resetting stuck processing queue...");

    // Reset all documents stuck in PROCESSING status back to PENDING
    const updatedDocs = await prisma.medicalDocument.updateMany({
      where: {
        status: "PROCESSING",
      },
      data: {
        status: "PENDING",
        processedAt: null,
        errorMessage: null,
      },
    });

    console.log(`✅ Reset ${updatedDocs.count} documents back to PENDING`);

    // Reset processing queue entries
    const updatedQueue = await prisma.medicalProcessingQueue.updateMany({
      where: {
        status: "PROCESSING",
      },
      data: {
        status: "QUEUED",
        startedAt: null,
        completedAt: null,
        attempts: 0,
        errorMessage: null,
      },
    });

    console.log(`✅ Reset ${updatedQueue.count} queue entries back to PENDING`);

    // List all pending documents
    const pendingDocs = await prisma.medicalDocument.findMany({
      where: {
        status: "PENDING",
      },
      select: {
        id: true,
        originalFileName: true,
        documentType: true,
        uploadDate: true,
      },
    });

    console.log("\n📋 Pending documents:");
    pendingDocs.forEach((doc) => {
      console.log(
        `  - ${doc.originalFileName} (${doc.documentType}) - ID: ${doc.id}`
      );
    });
  } catch (error) {
    console.error("❌ Error resetting processing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetProcessing();
