import { prisma } from "../src/lib/db/prisma";

async function analyzeOCRPatterns() {
  console.log("🔍 Analyzing OCR patterns for response detection...\n");

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

  console.log(`Document: ${naqDoc.originalFileName}\n`);

  // Look for various patterns that might indicate selected responses
  const text = naqDoc.ocrText;

  // Pattern 1: Numbers with parentheses (0) 1 2 3
  const parenthesesPattern =
    /(\d+)\.\s*\(([0-3])\)\s*(?:[0-3]\s*){0,3}([A-Za-z].+?)(?=\d+\.|\n|$)/gm;
  const parenthesesMatches = [...text.matchAll(parenthesesPattern)].slice(0, 5);

  if (parenthesesMatches.length > 0) {
    console.log("✅ Found responses with parentheses:");
    parenthesesMatches.forEach((match) => {
      console.log(
        `  Q${match[1]}: Selected=${match[2]}, Text="${match[3]
          .trim()
          .substring(0, 50)}..."`
      );
    });
  }

  // Pattern 2: Numbers with circles or special formatting
  // Look for patterns where one number might be bold/different
  const lines = text.split("\n");
  console.log("\n📄 Sample lines with question patterns:");

  for (let i = 0; i < lines.length && i < 100; i++) {
    const line = lines[i];
    if (/^\d+\.\s*[0-3]/.test(line)) {
      console.log(`Line ${i}: "${line.substring(0, 80)}..."`);

      // Check next few lines for symptom text
      for (let j = 1; j <= 3 && i + j < lines.length; j++) {
        const nextLine = lines[i + j].trim();
        if (
          nextLine &&
          !/^[0-3\s()]+$/.test(nextLine) &&
          !/^\d+\./.test(nextLine)
        ) {
          console.log(`  +${j}: "${nextLine.substring(0, 60)}..."`);
          break;
        }
      }
    }
  }

  // Look for any special characters that might indicate selection
  const specialChars = text.match(/[●○◉◯◆◇□■]/g);
  if (specialChars) {
    console.log(
      "\n🔤 Special characters found:",
      [...new Set(specialChars)].join(" ")
    );
  }

  // Check if there are any consistent patterns for marking selections
  console.log("\n🔍 Checking for consistent selection patterns...");

  // Look for lines with both numbers and parentheses
  const selectionLines = lines
    .filter((line) => /[0-3]\s*\([0-3]\)|[()\[\]{}].*[0-3]/.test(line))
    .slice(0, 10);

  if (selectionLines.length > 0) {
    console.log("\nLines with potential selection markers:");
    selectionLines.forEach((line) => {
      console.log(`  "${line}"`);
    });
  }
}

analyzeOCRPatterns()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
