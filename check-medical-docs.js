#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

async function checkMedicalDocs() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Checking MedicalDocument table...");

    const docs = await prisma.medicalDocument.findMany({
      select: {
        id: true,
        originalFileName: true,
        status: true,
        uploadDate: true,
        clientId: true,
        documentType: true,
      },
      orderBy: { uploadDate: "desc" },
      take: 5,
    });

    console.log(`📄 Found ${docs.length} documents in MedicalDocument table:`);
    docs.forEach((doc, i) => {
      console.log(`  ${i + 1}. ID: ${doc.id}`);
      console.log(`     File: ${doc.originalFileName}`);
      console.log(`     Status: ${doc.status}`);
      console.log(`     Type: ${doc.documentType}`);
      console.log(`     Client: ${doc.clientId || "None"}`);
      console.log(`     Date: ${doc.uploadDate}`);
      console.log("");
    });

    // Also check if there are any processing jobs
    console.log("🔄 Checking ProcessingJob table...");
    const jobs = await prisma.processingJob.findMany({
      take: 5,
      orderBy: { scheduledAt: "desc" },
    });

    console.log(`⚙️ Found ${jobs.length} processing jobs:`);
    jobs.forEach((job, i) => {
      console.log(`  ${i + 1}. Doc ID: ${job.documentId}`);
      console.log(`     Status: ${job.status}`);
      console.log(`     Attempts: ${job.attempts}`);
      console.log(`     Error: ${job.errorMessage || "None"}`);
      console.log("");
    });

    if (docs.length > 0) {
      console.log(`✅ Use this Document ID for testing: ${docs[0].id}`);
    } else {
      console.log("❌ No documents found. Try uploading a new document.");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMedicalDocs();
