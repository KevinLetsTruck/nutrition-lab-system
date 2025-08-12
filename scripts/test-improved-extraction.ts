import { prisma } from "../src/lib/db/prisma";
import { LabValueExtractor } from "../src/lib/medical/lab-extractor";

async function testImprovedExtraction() {
  console.log("🔄 Testing improved NAQ extraction...\n");

  const extractor = new LabValueExtractor();

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
  console.log(`Document ID: ${naqDoc.id}\n`);

  // Clear existing values for clean test
  await prisma.medicalLabValue.deleteMany({
    where: { documentId: naqDoc.id },
  });
  console.log("✅ Cleared existing values\n");

  // Extract with improved patterns
  console.log("🧪 Running improved extraction...");
  const result = await extractor.extractLabValues(naqDoc.id, naqDoc.ocrText);

  console.log(`\n✅ Extraction complete:`);
  console.log(`  Total values: ${result.totalFound}`);
  console.log(`  High confidence: ${result.highConfidenceCount}`);

  // Show sample values with responses
  const valuesWithResponses = await prisma.medicalLabValue.findMany({
    where: {
      documentId: naqDoc.id,
      value: { not: null },
    },
    take: 10,
    orderBy: { testName: "asc" },
  });

  if (valuesWithResponses.length > 0) {
    console.log("\n📋 Questions with captured responses:");
    valuesWithResponses.forEach((val) => {
      console.log(
        `  ${val.testName}: Response = ${val.value}, Symptom = "${val.valueText}"`
      );
    });
  }

  // Test the analysis
  console.log("\n\n🔍 Testing assessment analysis...");
  const response = await fetch(
    `http://localhost:3001/api/medical/documents/${naqDoc.id}/assessment-analysis`
  );

  if (response.ok) {
    const data = await response.json();
    if (data.analysis) {
      console.log("\n✅ Analysis Results:");
      console.log(`  Total Score: ${data.analysis.totalScore}`);
      console.log(`  Top Concerns: ${data.analysis.topConcerns.join(", ")}`);
      console.log("\n  Section Scores:");
      data.analysis.sections.slice(0, 5).forEach((section: any) => {
        console.log(
          `    - ${section.sectionName}: ${section.score}/${
            section.maxPossible
          } (${section.percentage.toFixed(1)}%) - ${section.severity}`
        );
      });
    }
  }
}

testImprovedExtraction()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
