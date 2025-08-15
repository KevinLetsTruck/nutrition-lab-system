#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

async function checkDocumentStatus() {
  const prisma = new PrismaClient();

  try {
    // Get the most recent documents
    const docs = await prisma.medicalDocument.findMany({
      orderBy: { uploadDate: "desc" },
      take: 5,
      include: {
        labValues: {
          select: {
            testName: true,
            value: true,
            unit: true,
          },
          take: 5,
        },
      },
    });

    console.log("\n📄 Recent Documents:");
    docs.forEach((doc, i) => {
      console.log(`\n${i + 1}. ${doc.originalFileName}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Status: ${doc.status}`);
      console.log(`   Lab Values: ${doc.labValues.length}`);

      if (doc.metadata) {
        const metadata = doc.metadata;
        console.log(
          `   Has Structure Analysis: ${!!metadata.structureAnalysis}`
        );
        console.log(`   Has AI Extraction: ${!!metadata.aiExtraction}`);
        console.log(
          `   Has Functional Analysis: ${!!metadata.functionalAnalysis}`
        );
      }

      if (doc.labValues.length > 0) {
        console.log("   Sample values:");
        doc.labValues.forEach((lab) => {
          console.log(`     - ${lab.testName}: ${lab.value} ${lab.unit}`);
        });
      }
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocumentStatus();
