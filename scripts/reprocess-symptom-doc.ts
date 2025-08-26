import { prisma } from "../src/lib/db/prisma";
import { medicalOCRService } from "../src/lib/medical/ocr-service";

async function reprocessSymptomDoc() {
  // Find a Symptom Burden document
  const doc = await prisma.medicalDocument.findFirst({
    where: {
      originalFileName: { contains: "Symptom-Burden-Report" },
    },
    orderBy: {
      uploadDate: "desc",
    },
  });

  if (!doc) {
    console.log("No Symptom Burden Report found");
    return;
  }

  console.log(`\n📄 Found document: ${doc.originalFileName}`);
  console.log(`   ID: ${doc.id}`);
  console.log(`   Current type: ${doc.documentType}`);
  console.log(`   Status: ${doc.status}`);

  // Clear existing lab values
  await prisma.medicalLabValue.deleteMany({
    where: { documentId: doc.id },
  });
  console.log("✅ Cleared existing lab values");

  // Reset document for reprocessing
  await prisma.medicalDocument.update({
    where: { id: doc.id },
    data: {
      status: "PENDING",
      ocrText: null,
      ocrConfidence: null,
      processedAt: null,
      errorMessage: null,
    },
  });

  console.log("\n🔄 Reprocessing document...");

  try {
    const result = await medicalOCRService.processDocument(doc.id);

    console.log("\n✅ Processing complete!");
    console.log(`   Detected type: ${result.documentType}`);
    console.log(
      `   OCR confidence: ${(result.ocrResult.confidence * 100).toFixed(1)}%`
    );
    console.log(`   Words extracted: ${result.ocrResult.wordCount}`);

    // Check if values were extracted
    const labValues = await prisma.medicalLabValue.count({
      where: { documentId: doc.id },
    });

    console.log(`   Lab values extracted: ${labValues}`);

    if (labValues > 0) {
      // Show sample values
      const sampleValues = await prisma.medicalLabValue.findMany({
        where: { documentId: doc.id },
        take: 5,
        orderBy: { value: "desc" },
      });

      console.log("\n📊 Sample extracted values:");
      sampleValues.forEach((v) => {
        console.log(`   - ${v.testName}: ${v.valueText || v.value}`);
      });
    }
  } catch (error) {
    console.error("❌ Processing failed:", error);
  }
}

reprocessSymptomDoc()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

