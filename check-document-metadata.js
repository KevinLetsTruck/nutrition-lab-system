#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

async function checkDocumentMetadata() {
  const prisma = new PrismaClient();

  try {
    const documentId = "cmea0g75p0045v20ep8acagwa";
    console.log(`🔍 Checking metadata for document: ${documentId}`);

    const doc = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        originalFileName: true,
        status: true,
        metadata: true,
        ocrText: true,
      },
    });

    if (!doc) {
      console.log("❌ Document not found");
      return;
    }

    console.log(`📄 Document: ${doc.originalFileName}`);
    console.log(`📊 Status: ${doc.status}`);
    console.log(`📝 Has OCR Text: ${doc.ocrText ? "Yes" : "No"}`);
    console.log(`📏 OCR Text Length: ${doc.ocrText?.length || 0}`);

    if (doc.metadata) {
      console.log("\n🔍 Metadata structure:");
      console.log(JSON.stringify(doc.metadata, null, 2));

      const metadata = doc.metadata;
      if (metadata.functionalAnalysis) {
        console.log("\n✅ Has functionalAnalysis");
      }
      if (metadata.structureAnalysis) {
        console.log("✅ Has structureAnalysis");
      }
      if (metadata.aiExtraction) {
        console.log("✅ Has aiExtraction");
      }
      if (metadata.narrativeReport) {
        console.log("✅ Has narrativeReport");
      }
    } else {
      console.log("❌ No metadata found");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocumentMetadata();
