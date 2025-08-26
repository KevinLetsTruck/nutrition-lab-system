#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

async function triggerOCR() {
  console.log("🚀 Manually triggering OCR processing...");

  try {
    // Trigger OCR for the image document by calling the internal processing
    const response = await fetch("http://localhost:3000/api/medical/upload", {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ S3 status check passed:", data.message);

      // Now check if there are any pending documents to process
      const prisma = new PrismaClient();

      const pendingDocs = await prisma.medicalDocument.findMany({
        where: {
          status: "PENDING",
        },
      });

      console.log(`📋 Found ${pendingDocs.length} pending documents`);

      for (const doc of pendingDocs) {
        console.log(`📄 ${doc.originalFileName}`);

        // For image files, let's try to process them
        if (
          doc.documentType === "scan" &&
          doc.originalFileName.includes(".jpg")
        ) {
          console.log(`🖼️ Processing image: ${doc.originalFileName}`);

          try {
            // Update document to PROCESSING
            await prisma.medicalDocument.update({
              where: { id: doc.id },
              data: { status: "PROCESSING" },
            });

            // Update queue entry
            await prisma.medicalProcessingQueue.updateMany({
              where: { documentId: doc.id },
              data: {
                status: "PROCESSING",
                startedAt: new Date(),
                attempts: 1,
              },
            });

            console.log(
              `✅ Updated ${doc.originalFileName} to PROCESSING status`
            );
          } catch (updateError) {
            console.error(
              `❌ Failed to update ${doc.originalFileName}:`,
              updateError.message
            );
          }
        }
      }

      await prisma.$disconnect();
    } else {
      console.error("❌ S3 connection failed");
    }
  } catch (error) {
    console.error("❌ Error triggering OCR:", error);
  }
}

triggerOCR();
