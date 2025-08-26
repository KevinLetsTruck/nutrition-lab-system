const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Simple test of the extraction logic
async function testExtraction() {
  console.log("🧪 Testing extraction directly...\n");

  // Get a NAQ document
  const naqDoc = await prisma.medicalDocument.findFirst({
    where: {
      originalFileName: { contains: "NAQ" },
      ocrText: { not: "" },
      NOT: { ocrText: null },
    },
  });

  if (!naqDoc) {
    console.log("No NAQ document found");
    return;
  }

  console.log(`Testing with: ${naqDoc.originalFileName}`);
  console.log(`OCR text length: ${naqDoc.ocrText.length}`);

  // Let's manually check the format
  const lines = naqDoc.ocrText.split("\n").slice(0, 50);
  console.log("\nFirst 50 lines:");
  lines.forEach((line, i) => {
    if (line.trim()) {
      console.log(`${i}: ${line}`);
    }
  });

  // Look for NAQ patterns
  console.log("\n\nChecking for patterns:");
  const text = naqDoc.ocrText;

  // Check for question patterns
  const questionPattern = /(\d+)\.\s*(.*?)$/gm;
  const questions = [...text.matchAll(questionPattern)].slice(0, 10);
  console.log("\nQuestions found:");
  questions.forEach((match) => {
    console.log(`  Q${match[1]}: ${match[2]?.substring(0, 50) || "no text"}`);
  });

  // Check for section totals
  const totalPattern = /([A-Za-z\s&]+?)(?:Total|Score):\s*(\d+)/gi;
  const totals = [...text.matchAll(totalPattern)];
  console.log("\nSection totals found:");
  totals.forEach((match) => {
    console.log(`  ${match[1].trim()}: ${match[2]}`);
  });

  // Test Symptom Burden document
  const symptomDoc = await prisma.medicalDocument.findFirst({
    where: {
      originalFileName: { contains: "Symptom-Burden" },
      ocrText: { not: "" },
      NOT: { ocrText: null },
    },
  });

  if (symptomDoc) {
    console.log(`\n\nTesting Symptom Burden: ${symptomDoc.originalFileName}`);
    console.log(`OCR text: ${symptomDoc.ocrText}`);
  }
}

testExtraction()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
