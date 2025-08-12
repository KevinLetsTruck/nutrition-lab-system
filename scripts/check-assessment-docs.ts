import { prisma } from "../src/lib/db/prisma";

async function checkAssessmentDocuments() {
  console.log("🔍 Checking assessment documents...\n");

  // Check NAQ documents
  const naqDocs = await prisma.medicalDocument.findMany({
    where: {
      OR: [
        { fileName: { contains: "NAQ" } },
        { fileName: { contains: "naq" } },
      ],
    },
    include: {
      labValues: {
        select: {
          id: true,
          testName: true,
          value: true,
          valueText: true,
          documentType: true,
          confidence: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Check Symptom Burden documents
  const symptomDocs = await prisma.medicalDocument.findMany({
    where: {
      OR: [
        { fileName: { contains: "Symptom-Burden" } },
        { fileName: { contains: "symptom-burden" } },
      ],
    },
    include: {
      labValues: {
        select: {
          id: true,
          testName: true,
          value: true,
          valueText: true,
          documentType: true,
          confidence: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("📄 NAQ Documents:", naqDocs.length);
  naqDocs.forEach((doc) => {
    console.log(`\n- ${doc.fileName}`);
    console.log(
      `  Status: OCR=${doc.ocrStatus}, Extraction=${doc.extractionStatus}`
    );
    console.log(`  Lab Values: ${doc.labValues.length}`);
    console.log(`  Document Type: ${doc.documentType}`);
    console.log(`  OCR Text Length: ${doc.ocrText?.length || 0}`);
    if (doc.labValues.length > 0) {
      console.log("  Sample values:");
      doc.labValues.slice(0, 3).forEach((lv) => {
        console.log(`    - ${lv.testName}: ${lv.valueText || lv.value}`);
      });
    }
  });

  console.log("\n\n📊 Symptom Burden Documents:", symptomDocs.length);
  symptomDocs.forEach((doc) => {
    console.log(`\n- ${doc.fileName}`);
    console.log(
      `  Status: OCR=${doc.ocrStatus}, Extraction=${doc.extractionStatus}`
    );
    console.log(`  Lab Values: ${doc.labValues.length}`);
    console.log(`  Document Type: ${doc.documentType}`);
    console.log(`  OCR Text Length: ${doc.ocrText?.length || 0}`);
  });

  // Check if OCR text contains NAQ patterns
  if (naqDocs.length > 0 && naqDocs[0].ocrText) {
    console.log("\n\n🔍 Checking OCR text for NAQ patterns...");
    const text = naqDocs[0].ocrText.toLowerCase();
    console.log('Contains "naq":', text.includes("naq"));
    console.log(
      'Contains "questions/answers":',
      text.includes("questions/answers")
    );
    console.log(
      "Contains question pattern:",
      /\d+\.\s+0\s+1\s+2\s+3/i.test(naqDocs[0].ocrText)
    );
    console.log(
      'Contains "upper gastrointestinal":',
      text.includes("upper gastrointestinal")
    );

    // Show first 500 chars of OCR text
    console.log("\nFirst 500 chars of OCR text:");
    console.log(naqDocs[0].ocrText.substring(0, 500));
  }

  await prisma.$disconnect();
}

checkAssessmentDocuments().catch(console.error);
