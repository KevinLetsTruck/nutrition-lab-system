/**
 * Fix NAQ and Symptom Burden Processing
 * This script addresses the issue where assessment forms are not extracting values properly
 */

import { prisma } from "../src/lib/db/prisma";

async function fixAssessmentProcessing() {
  console.log("🔧 Fixing Assessment Form Processing...\n");

  // 1. First, let's update the document types for NAQ documents
  console.log("📝 Step 1: Updating NAQ document types...");

  const naqUpdateResult = await prisma.medicalDocument.updateMany({
    where: {
      originalFileName: { contains: "NAQ" },
      documentType: "lab_report",
    },
    data: {
      documentType: "nutriq_assessment",
    },
  });

  console.log(
    `✅ Updated ${naqUpdateResult.count} NAQ documents to 'nutriq_assessment' type`
  );

  // 2. Update Symptom Burden documents
  console.log("\n📊 Step 2: Updating Symptom Burden document types...");

  const symptomUpdateResult = await prisma.medicalDocument.updateMany({
    where: {
      originalFileName: { contains: "Symptom-Burden" },
      documentType: "lab_report",
    },
    data: {
      documentType: "symptom_assessment",
    },
  });

  console.log(
    `✅ Updated ${symptomUpdateResult.count} Symptom Burden documents to 'symptom_assessment' type`
  );

  // 3. Get all assessment documents that need reprocessing
  console.log("\n🔄 Step 3: Finding documents to reprocess...");

  const documentsToReprocess = await prisma.medicalDocument.findMany({
    where: {
      OR: [
        { documentType: "nutriq_assessment" },
        { documentType: "symptom_assessment" },
        { originalFileName: { contains: "NAQ" } },
        { originalFileName: { contains: "Symptom" } },
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
      status: true,
      ocrText: true,
    },
  });

  console.log(
    `\n📋 Found ${documentsToReprocess.length} documents that need lab value extraction:`
  );

  // 4. Show what we found
  const naqDocs = documentsToReprocess.filter((d) =>
    d.originalFileName.includes("NAQ")
  );
  const symptomDocs = documentsToReprocess.filter((d) =>
    d.originalFileName.includes("Symptom")
  );

  console.log(`  - ${naqDocs.length} NAQ documents`);
  console.log(`  - ${symptomDocs.length} Symptom Burden documents`);

  // 5. Create a report of what needs to be done
  console.log("\n📊 Action Plan:");
  console.log("1. NAQ documents need improved extraction patterns to handle:");
  console.log('   - Questions with format: "52. 0 1 2 3 Symptom text"');
  console.log('   - Section totals: "Upper GI Total: 15"');
  console.log("   - Client responses (which numbers were circled)");

  console.log("\n2. Symptom Burden graphs need special handling:");
  console.log("   - These are visual bar graphs showing symptom scores");
  console.log("   - May need OCR improvement or manual data entry");

  console.log("\n3. Next steps:");
  console.log("   - Update lab extractor patterns for NAQ format");
  console.log("   - Add special processing for symptom burden graphs");
  console.log("   - Trigger reprocessing through API endpoints");

  // 6. Sample OCR text to understand the format
  if (naqDocs.length > 0) {
    console.log("\n📄 Sample NAQ OCR text:");
    const sampleText = naqDocs[0].ocrText?.substring(0, 1500) || "";
    console.log(sampleText);
  }

  if (symptomDocs.length > 0) {
    console.log("\n📊 Sample Symptom Burden OCR text:");
    const sampleText = symptomDocs[0].ocrText?.substring(0, 500) || "";
    console.log(sampleText);
  }

  // 7. Generate URLs for manual reprocessing via API
  console.log("\n🔗 API Endpoints for reprocessing:");
  if (documentsToReprocess.length > 0) {
    console.log("\nTo reprocess these documents, you can use:");
    documentsToReprocess.slice(0, 3).forEach((doc) => {
      console.log(
        `\ncurl -X POST http://localhost:3001/api/medical/process \\`
      );
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -H "Authorization: Bearer YOUR_TOKEN" \\`);
      console.log(`  -d '{"documentId": "${doc.id}", "forceReprocess": true}'`);
      console.log(`  # ${doc.originalFileName}`);
    });
  }

  await prisma.$disconnect();
}

fixAssessmentProcessing().catch(console.error);
