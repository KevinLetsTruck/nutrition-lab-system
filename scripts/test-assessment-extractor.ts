import { assessmentExtractor } from "../src/lib/medical/assessment-extractor";
import { prisma } from "../src/lib/db/prisma";

async function testAssessmentExtractor() {
  console.log("🧪 Testing Assessment Extractor directly...\n");

  // Get a NAQ document
  const naqDoc = await prisma.medicalDocument.findFirst({
    where: {
      originalFileName: { contains: "NAQ" },
      ocrText: { not: "" },
      NOT: { ocrText: null },
    },
  });

  if (!naqDoc || !naqDoc.ocrText) {
    console.log("No NAQ document found");
    return;
  }

  console.log(`Testing NAQ extraction on: ${naqDoc.originalFileName}`);
  console.log(`OCR text length: ${naqDoc.ocrText.length}\n`);

  // Test NAQ extraction
  const naqValues = assessmentExtractor.extractNAQValues(naqDoc.ocrText);

  console.log(`✅ NAQ Extraction Results:`);
  console.log(`  Total values extracted: ${naqValues.length}`);

  if (naqValues.length > 0) {
    console.log("\n  Sample values:");
    naqValues.slice(0, 10).forEach((val) => {
      console.log(
        `    Q${val.questionNumber}: ${val.symptomText?.substring(0, 60)}...`
      );
    });
  }

  // Test Symptom Burden extraction
  const symptomDoc = await prisma.medicalDocument.findFirst({
    where: {
      originalFileName: { contains: "Symptom-Burden" },
      ocrText: { not: "" },
      NOT: { ocrText: null },
    },
  });

  if (symptomDoc && symptomDoc.ocrText) {
    console.log(
      `\n\nTesting Symptom Burden extraction on: ${symptomDoc.originalFileName}`
    );
    console.log(`OCR text length: ${symptomDoc.ocrText.length}\n`);

    const symptomValues = assessmentExtractor.extractSymptomBurdenValues(
      symptomDoc.ocrText
    );

    console.log(`✅ Symptom Burden Extraction Results:`);
    console.log(`  Total values extracted: ${symptomValues.length}`);

    if (symptomValues.length > 0) {
      console.log("\n  Sample values:");
      symptomValues.forEach((val) => {
        console.log(`    ${val.testName}: ${val.valueText}`);
      });
    }
  }
}

testAssessmentExtractor()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
