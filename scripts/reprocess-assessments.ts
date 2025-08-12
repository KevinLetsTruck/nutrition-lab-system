import { prisma } from "../src/lib/db/prisma";
import { medicalOCRService } from "../src/lib/medical/ocr-service";

async function reprocessAssessments() {
  console.log("🔄 Reprocessing assessment documents...\n");

  // Get all assessment documents that need reprocessing
  const documents = await prisma.medicalDocument.findMany({
    where: {
      OR: [
        { documentType: "nutriq_assessment" },
        { documentType: "symptom_assessment" },
      ],
      status: "COMPLETED",
      ocrText: { not: "" },
      NOT: { ocrText: null },
    },
    select: {
      id: true,
      originalFileName: true,
      documentType: true,
      s3Key: true,
    },
  });

  console.log(`Found ${documents.length} assessment documents to reprocess\n`);

  for (const doc of documents.slice(0, 3)) {
    // Process first 3 for testing
    console.log(`\n📄 Processing: ${doc.originalFileName}`);
    console.log(`  Type: ${doc.documentType}`);

    try {
      // Trigger reprocessing
      await medicalOCRService.processDocument(doc.id);
      console.log("  ✅ Reprocessing triggered successfully");

      // Wait a moment for processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check results
      const labValues = await prisma.medicalLabValue.count({
        where: { documentId: doc.id },
      });

      console.log(`  📊 Lab values extracted: ${labValues}`);
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
}

reprocessAssessments()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
