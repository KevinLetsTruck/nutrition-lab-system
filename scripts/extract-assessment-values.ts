import { prisma } from "../src/lib/db/prisma";
import { LabValueExtractor } from "../src/lib/medical/lab-extractor";

async function extractAssessmentValues() {
  console.log("🔄 Extracting values from assessment documents...\n");

  const extractor = new LabValueExtractor();

  // Get all assessment documents with OCR text but no lab values
  const documents = await prisma.medicalDocument.findMany({
    where: {
      OR: [
        { documentType: "nutriq_assessment" },
        { documentType: "symptom_assessment" },
      ],
      status: "COMPLETED",
      ocrText: { not: "" },
      NOT: { ocrText: null },
      labValues: {
        none: {},
      },
    },
    select: {
      id: true,
      originalFileName: true,
      documentType: true,
      ocrText: true,
    },
  });

  console.log(`Found ${documents.length} assessment documents to process\n`);

  for (const doc of documents) {
    console.log(`\n📄 Processing: ${doc.originalFileName}`);
    console.log(`  Type: ${doc.documentType}`);
    console.log(`  OCR Text Length: ${doc.ocrText?.length || 0}`);

    try {
      // Extract lab values
      const result = await extractor.extractLabValues(
        doc.id,
        doc.ocrText || ""
      );

      console.log(`  ✅ Extraction complete:`);
      console.log(`     Total values: ${result.totalFound}`);
      console.log(`     High confidence: ${result.highConfidenceCount}`);
      console.log(`     Processing time: ${result.processingTime}ms`);

      // Update document metadata
      await prisma.medicalDocument.update({
        where: { id: doc.id },
        data: {
          metadata: {
            ...(doc as any).metadata,
            labExtractionComplete: true,
            labValuesFound: result.totalFound,
            highConfidenceLabValues: result.highConfidenceCount,
            labExtractionTime: result.processingTime,
            lastExtractedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }

  console.log("\n\n✅ Extraction complete!");

  // Show summary
  const summary = await prisma.medicalLabValue.groupBy({
    by: ["documentType"],
    _count: {
      id: true,
    },
  });

  console.log("\n📊 Summary of extracted values by document type:");
  summary.forEach((item) => {
    console.log(
      `  ${item.documentType || "Unknown"}: ${item._count.id} values`
    );
  });
}

extractAssessmentValues()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
