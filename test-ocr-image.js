#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

async function testImageOCR() {
  const prisma = new PrismaClient();

  try {
    console.log("🧪 Testing image OCR processing...");

    // Find the Tandem image document
    const imageDoc = await prisma.medicalDocument.findFirst({
      where: {
        originalFileName: {
          contains: "Screenshot_20250624_141221_Tandem",
        },
        status: "PENDING",
      },
    });

    if (!imageDoc) {
      console.log("❌ No pending Tandem image document found");
      return;
    }

    console.log(
      `📄 Found document: ${imageDoc.originalFileName} (ID: ${imageDoc.id})`
    );
    console.log(`📍 S3 URL: ${imageDoc.s3Url}`);

    // Manually trigger OCR processing by calling the API
    const response = await fetch(
      `http://localhost:3000/api/medical/documents/${imageDoc.id}/status`
    );
    const status = await response.json();

    console.log("📊 Current status:", JSON.stringify(status, null, 2));
  } catch (error) {
    console.error("❌ Error testing OCR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testImageOCR();
