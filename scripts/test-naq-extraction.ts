import { prisma } from "../src/lib/db/prisma";
import { LabValueExtractor } from "../src/lib/medical/lab-extractor";

async function testNAQExtraction() {
  console.log("🧪 Testing NAQ extraction...\n");

  // Get a NAQ document with OCR text
  const naqDoc = await prisma.medicalDocument.findFirst({
    where: {
      originalFileName: { contains: "NAQ" },
      ocrText: { not: "" },
      NOT: { ocrText: null },
    },
  });

  if (!naqDoc) {
    console.log("❌ No NAQ document with OCR text found");
    return;
  }

  console.log(`📄 Testing with document: ${naqDoc.originalFileName}`);
  console.log(`  ID: ${naqDoc.id}`);
  console.log(`  OCR Text Length: ${naqDoc.ocrText?.length || 0}`);
  console.log(`  Current document type in DB: ${naqDoc.documentType}`);

  // Test document type detection
  console.log("\n🔍 Testing document type detection...");
  const firstPart = naqDoc.ocrText?.substring(0, 1000) || "";
  console.log("OCR text sample:", firstPart);

  // Initialize extractor
  const extractor = new LabValueExtractor();

  // Try to extract lab values in test mode
  console.log("\n🧪 Running lab extraction in test mode...");
  try {
    const result = await extractor.extractLabValues(
      naqDoc.id,
      naqDoc.ocrText || "",
      true
    );
    console.log("\n✅ Extraction Results:");
    console.log(`  Total found: ${result.totalFound}`);
    console.log(`  High confidence: ${result.highConfidenceCount}`);
    console.log(`  Processing time: ${result.processingTime}ms`);

    if (result.extractedValues.length > 0) {
      console.log("\n  Sample extracted values:");
      result.extractedValues.slice(0, 10).forEach((val) => {
        console.log(
          `    - ${val.testName}: ${val.valueText || val.value} (Doc Type: ${
            val.documentType
          })`
        );
      });
    } else {
      console.log("\n  ❌ No values extracted!");
    }
  } catch (error) {
    console.error("❌ Extraction error:", error);
  }
}

testNAQExtraction()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
