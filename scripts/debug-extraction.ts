import { prisma } from "../src/lib/db/prisma";
import { LabValueExtractor } from "../src/lib/medical/lab-extractor";
import { assessmentExtractor } from "../src/lib/medical/assessment-extractor";

async function debugExtraction() {
  console.log("🔍 Debugging extraction process...\n");

  // Get a NAQ document
  const naqDoc = await prisma.medicalDocument.findFirst({
    where: {
      documentType: "nutriq_assessment",
      ocrText: { not: "" },
      NOT: { ocrText: null },
    },
  });

  if (!naqDoc || !naqDoc.ocrText) {
    console.log("No NAQ document found");
    return;
  }

  console.log(`Testing with: ${naqDoc.originalFileName}`);
  console.log(`Document ID: ${naqDoc.id}`);
  console.log(`OCR Text Length: ${naqDoc.ocrText.length}\n`);

  // Test direct assessment extraction
  console.log("1️⃣ Testing direct assessment extraction:");
  const assessmentValues = assessmentExtractor.extractNAQValues(naqDoc.ocrText);
  console.log(`   ✅ Extracted ${assessmentValues.length} values directly`);
  if (assessmentValues.length > 0) {
    console.log("   Sample:", assessmentValues[0]);
  }

  // Test lab extractor
  console.log("\n2️⃣ Testing lab extractor:");
  const extractor = new LabValueExtractor();

  // First, let's check what the preprocessText does
  const preprocessedText = (extractor as any).preprocessText(naqDoc.ocrText);
  console.log(`   Preprocessed text length: ${preprocessedText.length}`);

  // Check document type detection
  const detectedType = (extractor as any).detectDocumentType(preprocessedText);
  console.log(`   Detected type: ${detectedType}`);

  // Try extracting functional medicine values
  const functionalValues = (extractor as any).extractFunctionalMedicineValues(
    preprocessedText,
    detectedType
  );
  console.log(`   Functional values extracted: ${functionalValues.length}`);
  if (functionalValues.length > 0) {
    console.log("   Sample:", functionalValues[0]);
  }

  // Check validation
  if (functionalValues.length > 0) {
    const isValid = (extractor as any).isValidLabValue(
      functionalValues[0],
      detectedType
    );
    console.log(`   First value is valid: ${isValid}`);
  }

  // Full extraction test
  console.log("\n3️⃣ Testing full lab extraction:");
  const result = await extractor.extractLabValues(
    naqDoc.id,
    naqDoc.ocrText,
    true
  );
  console.log(`   Total found: ${result.totalFound}`);
  console.log(`   High confidence: ${result.highConfidenceCount}`);

  if (result.extractedValues.length > 0) {
    console.log("\n   Extracted values:");
    result.extractedValues.slice(0, 5).forEach((val) => {
      console.log(`     - ${val.testName}: ${val.valueText || val.value}`);
    });
  }

  // Check what's in extractedValues before validation
  console.log("\n4️⃣ Debugging extraction flow:");
  const cleanedText = (extractor as any).preprocessText(naqDoc.ocrText);
  const docType = (extractor as any).detectDocumentType(cleanedText);
  const allExtracted = [];

  // Get functional values
  const funcVals = (extractor as any).extractFunctionalMedicineValues(
    cleanedText,
    docType
  );
  allExtracted.push(...funcVals);
  console.log(`   Functional values: ${funcVals.length}`);

  // Check merging
  const merged = (extractor as any).removeDuplicatesAndMerge(allExtracted);
  console.log(`   After merging: ${merged.length}`);

  // Check validation
  const validated = (extractor as any).validateAndFlagValues(merged, docType);
  console.log(`   After validation: ${validated.length}`);
}

debugExtraction()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
