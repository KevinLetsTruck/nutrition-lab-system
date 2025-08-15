#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

async function checkLatestUpload() {
  const prisma = new PrismaClient();

  try {
    // Get the most recent upload
    const latestDoc = await prisma.medicalDocument.findFirst({
      orderBy: { uploadDate: "desc" },
      select: {
        id: true,
        originalFileName: true,
        status: true,
        uploadDate: true,
        metadata: true,
        ocrText: true,
        labValues: {
          select: {
            id: true,
            testName: true,
            value: true,
            confidence: true,
          },
          take: 5,
        },
      },
    });

    if (!latestDoc) {
      console.log("❌ No documents found");
      return;
    }

    console.log("\n📄 Latest Upload:");
    console.log(`   ID: ${latestDoc.id}`);
    console.log(`   File: ${latestDoc.originalFileName}`);
    console.log(`   Status: ${latestDoc.status}`);
    console.log(`   Uploaded: ${latestDoc.uploadDate.toLocaleString()}`);

    if (latestDoc.ocrText) {
      console.log(
        `   OCR Text: ${latestDoc.ocrText.length} characters extracted`
      );
    }

    if (latestDoc.labValues && latestDoc.labValues.length > 0) {
      console.log(
        `\n🧪 Lab Values Found: ${latestDoc.labValues.length} (showing first 5)`
      );
      latestDoc.labValues.forEach((lab, i) => {
        console.log(
          `   ${i + 1}. ${lab.testName}: ${lab.value} (confidence: ${
            lab.confidence
          })`
        );
      });
    }

    if (latestDoc.metadata) {
      const metadata = latestDoc.metadata;
      console.log("\n🔍 AI Analysis Status:");
      console.log(
        `   Structure Analysis: ${metadata.structureAnalysis ? "✅" : "❌"}`
      );
      console.log(`   AI Extraction: ${metadata.aiExtraction ? "✅" : "❌"}`);
      console.log(
        `   Functional Analysis: ${metadata.functionalAnalysis ? "✅" : "❌"}`
      );
      console.log(
        `   Narrative Report: ${metadata.narrativeReport ? "✅" : "❌"}`
      );
    }

    console.log(`\n✅ Copy this ID to monitor: ${latestDoc.id}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestUpload();
