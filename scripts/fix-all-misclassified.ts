import { prisma } from "../src/lib/db/prisma";

async function fixAllMisclassified() {
  console.log("🔍 Finding potentially misclassified documents...\n");

  // Get all completed documents
  const documents = await prisma.medicalDocument.findMany({
    where: {
      status: "COMPLETED",
      ocrText: { not: null },
    },
    select: {
      id: true,
      originalFileName: true,
      documentType: true,
      ocrText: true,
      _count: {
        select: { labValues: true },
      },
    },
  });

  console.log(`Found ${documents.length} completed documents to check\n`);

  const misclassified = [];

  for (const doc of documents) {
    const lowerText = doc.ocrText!.toLowerCase();
    let expectedType = doc.documentType;

    // Check what type it should be
    if (
      lowerText.includes("symptom burden report") ||
      (lowerText.includes("potential nutritional deficiencies") &&
        lowerText.includes("potential conditions"))
    ) {
      expectedType = "symptom_assessment";
    } else if (
      lowerText.includes("naq questions") ||
      lowerText.includes("nutritional assessment questionnaire") ||
      lowerText.includes("nutri-q")
    ) {
      expectedType = "nutriq_assessment";
    } else if (
      lowerText.includes("food sensitivity") ||
      lowerText.includes("kbmo") ||
      lowerText.includes("fit 176")
    ) {
      expectedType = "food_sensitivity";
    }

    if (expectedType !== doc.documentType) {
      misclassified.push({
        id: doc.id,
        fileName: doc.originalFileName,
        currentType: doc.documentType,
        shouldBe: expectedType,
        hasValues: doc._count.labValues,
      });
    }
  }

  if (misclassified.length === 0) {
    console.log("✅ No misclassified documents found!");
    return;
  }

  console.log(`❌ Found ${misclassified.length} misclassified documents:\n`);

  misclassified.forEach((doc) => {
    console.log(`📄 ${doc.fileName}`);
    console.log(`   Current: ${doc.currentType} → Should be: ${doc.shouldBe}`);
    console.log(`   Lab values: ${doc.hasValues}`);
    console.log(`   ID: ${doc.id}\n`);
  });

  // Ask to fix them
  console.log("🔧 Fixing misclassified documents...\n");

  for (const doc of misclassified) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/medical/documents/${doc.id}/reclassify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Fixed: ${doc.fileName}`);
        if (result.extraction) {
          console.log(
            `   Extracted ${result.extraction.totalExtracted} values`
          );
        }
      } else {
        console.log(`❌ Failed to fix: ${doc.fileName}`);
      }
    } catch (error) {
      console.log(`❌ Error fixing ${doc.fileName}:`, error.message);
    }
  }

  console.log("\n✅ Reclassification complete!");
}

fixAllMisclassified()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

