#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const { storageService } = require("./src/lib/storage");

const prisma = new PrismaClient();

async function testSignedUrl() {
  try {
    console.log("🔍 Testing signed URL generation...");

    const document = await prisma.medicalDocument.findUnique({
      where: { id: "cme7uyi7l0001v28qpxg6y1w8" },
    });

    if (!document) {
      console.log("❌ Document not found");
      return;
    }

    console.log("📄 Document:", document.originalFileName);
    console.log("🗂️ S3 Key:", document.s3Key);
    console.log("🌐 S3 URL:", document.s3Url);

    if (!document.s3Key) {
      console.log("❌ No S3 key found");
      return;
    }

    // Generate signed URL
    console.log("🔐 Generating signed URL...");
    const signedUrl = await storageService.generateSignedUrl(document.s3Key, {
      expiresAt: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
    });

    console.log("✅ Signed URL generated:");
    console.log(signedUrl);

    // Test if the signed URL is accessible
    console.log("🧪 Testing signed URL accessibility...");
    const fetch = (await import("node-fetch")).default;

    try {
      const response = await fetch(signedUrl, { method: "HEAD" });
      console.log("📊 Response Status:", response.status);
      console.log(
        "📊 Response Headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        console.log("✅ Signed URL is accessible!");
      } else {
        console.log("❌ Signed URL is not accessible");
      }
    } catch (fetchError) {
      console.log("❌ Fetch error:", fetchError.message);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSignedUrl();
