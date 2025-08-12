import { prisma } from "../src/lib/db/prisma";
import { LabValueExtractor } from "../src/lib/medical/lab-extractor";

async function testSymptomBurdenExtraction() {
  console.log("🧪 Testing Symptom Burden Report extraction...\n");

  const extractor = new LabValueExtractor();

  // Get a Symptom Burden document
  const symptomDoc = await prisma.medicalDocument.findFirst({
    where: {
      OR: [
        { documentType: "symptom_assessment" },
        { originalFileName: { contains: "Symptom-Burden" } },
      ],
      ocrText: { not: "" },
      NOT: { ocrText: null },
    },
  });

  if (!symptomDoc || !symptomDoc.ocrText) {
    console.log("No Symptom Burden document found");
    return;
  }

  console.log(`Testing with: ${symptomDoc.originalFileName}`);
  console.log(`Document ID: ${symptomDoc.id}\n`);

  // Check what type of content we have
  const hasDeficiencies = symptomDoc.ocrText.includes(
    "Potential Nutritional Deficiencies"
  );
  const hasConditions = symptomDoc.ocrText.includes("Potential Conditions");
  const hasBarGraph =
    symptomDoc.ocrText.includes("Priority") &&
    (symptomDoc.ocrText.includes("Upper GI") ||
      symptomDoc.ocrText.includes("Liver"));

  console.log(`Document type detection:`);
  console.log(`  - Has Deficiencies section: ${hasDeficiencies}`);
  console.log(`  - Has Conditions section: ${hasConditions}`);
  console.log(`  - Appears to be bar graph: ${hasBarGraph}\n`);

  // Clear existing values for clean test
  await prisma.medicalLabValue.deleteMany({
    where: { documentId: symptomDoc.id },
  });
  console.log("✅ Cleared existing values\n");

  // Extract with improved patterns
  console.log("🧪 Running extraction...");
  const result = await extractor.extractLabValues(
    symptomDoc.id,
    symptomDoc.ocrText
  );

  console.log(`\n✅ Extraction complete:`);
  console.log(`  Total values: ${result.totalFound}`);
  console.log(`  High confidence: ${result.highConfidenceCount}`);

  // Show extracted values by type
  const values = await prisma.medicalLabValue.findMany({
    where: { documentId: symptomDoc.id },
    orderBy: { value: "desc" },
  });

  // Group by type
  const totalBurden = values.find(
    (v) => v.standardName === "total_symptom_burden"
  );
  const deficiencies = values.filter(
    (v) => v.standardName === "nutritional_deficiency"
  );
  const conditions = values.filter(
    (v) => v.standardName === "symptom_condition"
  );
  const scores = values.filter(
    (v) => v.standardName === "symptom_burden_score"
  );

  if (totalBurden) {
    console.log(`\n📊 Total Symptom Burden: ${totalBurden.value}`);
  }

  if (deficiencies.length > 0) {
    console.log(`\n🥗 Nutritional Deficiencies (${deficiencies.length}):`);
    deficiencies.slice(0, 5).forEach((def) => {
      console.log(`  - ${def.testName}: ${def.valueText}`);
    });
  }

  if (conditions.length > 0) {
    console.log(`\n🏥 Potential Conditions (${conditions.length}):`);
    conditions.slice(0, 5).forEach((cond) => {
      console.log(`  - ${cond.testName}: ${cond.valueText}`);
    });
  }

  if (scores.length > 0) {
    console.log(`\n📈 Symptom Scores (${scores.length}):`);
    scores.slice(0, 5).forEach((score) => {
      console.log(`  - ${score.testName}: ${score.value}`);
    });
  }

  // Show sample of OCR text to debug if needed
  if (result.totalFound === 0) {
    console.log("\n⚠️ No values extracted. Sample of OCR text:");
    console.log(symptomDoc.ocrText.substring(0, 1000));
  }
}

testSymptomBurdenExtraction()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
