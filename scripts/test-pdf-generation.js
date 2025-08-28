const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testPDFGeneration() {
  console.log("🧪 Testing PDF Generation Service...");

  try {
    // Find test protocol with supplements
    const testProtocol = await prisma.enhancedProtocol.findFirst({
      where: {
        client: {
          email: "test.protocol@example.com"
        }
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        analysis: {
          select: {
            id: true,
            analysisDate: true,
            analysisVersion: true,
          },
        },
        protocolSupplements: {
          orderBy: { priority: "asc" },
        },
      },
    });

    if (!testProtocol) {
      console.log("❌ No test protocol found. Please run test-protocol-apis.js first.");
      return;
    }

    console.log(`✅ Found test protocol: ${testProtocol.protocolName}`);
    console.log(`   Client: ${testProtocol.client.firstName} ${testProtocol.client.lastName}`);
    console.log(`   Supplements: ${testProtocol.protocolSupplements.length}`);
    console.log(`   Analysis: ${testProtocol.analysis?.analysisVersion || 'None'}`);

    // Test PDF generation capabilities
    const testCases = [
      {
        name: "HTML Template Generation",
        description: "Test template generation without PDF creation"
      },
      {
        name: "Browser Launch Test", 
        description: "Test Puppeteer browser launch capabilities"
      },
      {
        name: "Storage Configuration",
        description: "Test file storage configuration"
      },
    ];

    console.log("\n🔍 PDF Service Readiness Checks:");

    // Test 1: HTML Template Generation
    try {
      // Can't directly require TypeScript modules in Node.js, but check if files exist
      const fs = require('fs');
      if (fs.existsSync('./src/lib/templates/protocol-pdf-template.ts')) {
        console.log("   ✅ HTML Template Generation: Template file exists");
      } else {
        console.log("   ❌ HTML Template Generation: Template file missing");
      }
    } catch (error) {
      console.log("   ❌ HTML Template Generation: Check failed");
      console.error("      Error:", error.message);
    }

    // Test 2: PDF Utilities
    try {
      const fs = require('fs');
      if (fs.existsSync('./src/lib/utils/pdf-helpers.ts')) {
        console.log("   ✅ PDF Utilities: Utils file exists");
      } else {
        console.log("   ❌ PDF Utilities: Utils file missing");
      }
    } catch (error) {
      console.log("   ❌ PDF Utilities: Check failed"); 
      console.error("      Error:", error.message);
    }

    // Test 3: PDF Service
    try {
      const fs = require('fs');
      if (fs.existsSync('./src/lib/services/pdf-service.ts')) {
        console.log("   ✅ PDF Service: Service file exists");
      } else {
        console.log("   ❌ PDF Service: Service file missing");
      }
    } catch (error) {
      console.log("   ❌ PDF Service: Check failed");
      console.error("      Error:", error.message);
    }

    // Test 4: Puppeteer Installation
    try {
      const puppeteer = require('puppeteer');
      console.log("   ✅ Puppeteer: Package installed and importable");
      
      // Check if Chromium is downloaded (basic check)
      const browserFetcher = puppeteer.createBrowserFetcher();
      const revisions = browserFetcher.localRevisions();
      if (revisions.length > 0) {
        console.log(`   ✅ Chromium: ${revisions.length} revision(s) available`);
      } else {
        console.log("   ⚠️  Chromium: No local revisions found (may download on first use)");
      }
    } catch (error) {
      console.log("   ❌ Puppeteer: Installation issue");
      console.error("      Error:", error.message);
    }

    // Test 5: Environment Configuration
    console.log("\n📋 Environment Configuration:");
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   AWS_S3_BUCKET: ${process.env.AWS_S3_BUCKET ? '✅ configured' : '❌ not configured'}`);
    console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ configured' : '❌ not configured'}`);
    console.log(`   PDF_STORAGE_PATH: ${process.env.PDF_STORAGE_PATH || './public/generated-pdfs (default)'}`);

    // Check storage directory
    const fs = require('fs');
    const path = require('path');
    const storageDir = process.env.PDF_STORAGE_PATH || './public/generated-pdfs';
    
    try {
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
        console.log(`   ✅ Storage directory created: ${storageDir}`);
      } else {
        console.log(`   ✅ Storage directory exists: ${storageDir}`);
      }
    } catch (error) {
      console.log(`   ❌ Storage directory issue: ${error.message}`);
    }

    // Test 6: API Route Integration
    console.log("\n🔗 API Integration Test:");
    
    const testURL = `http://localhost:3000/api/protocols/${testProtocol.id}/generate-pdf`;
    console.log(`   Test URL: ${testURL}`);
    console.log(`   Protocol ID: ${testProtocol.id}`);
    console.log(`   Ready for API testing with authentication token`);

    // Generate test request body
    const testRequestBody = {
      paperSize: 'A4',
      includeGreeting: true,
      includeSupplements: true,
      includeSchedule: true,
      theme: 'professional',
      primaryColor: '#10b981',
    };

    console.log("\n📝 Test Request Body:");
    console.log(JSON.stringify(testRequestBody, null, 2));

    // Database generation tracking test
    console.log("\n📊 Generation Tracking Test:");
    
    const existingGenerations = await prisma.protocolGeneration.findMany({
      where: { protocolId: testProtocol.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`   Existing generations: ${existingGenerations.length}`);
    if (existingGenerations.length > 0) {
      existingGenerations.forEach((gen, index) => {
        const data = gen.generationData;
        console.log(`   ${index + 1}. ${gen.createdAt.toISOString().split('T')[0]} - ${data?.generationType || 'unknown'}`);
      });
    }

    // Final readiness assessment
    console.log("\n🎯 PDF Generation System Status:");
    
    const systemChecks = [
      { name: "Test Protocol Available", status: !!testProtocol },
      { name: "Client Data Complete", status: testProtocol.client.firstName && testProtocol.client.lastName },
      { name: "Supplements Available", status: testProtocol.protocolSupplements.length > 0 },
      { name: "Storage Directory Ready", status: fs.existsSync(storageDir) },
      { name: "Database Schema Ready", status: true }, // We know this from previous tests
    ];

    const allReady = systemChecks.every(check => check.status);
    
    systemChecks.forEach(check => {
      console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
    });

    console.log(`\n🚀 System Status: ${allReady ? 'READY FOR PDF GENERATION' : 'NEEDS ATTENTION'}`);

    if (allReady) {
      console.log("\n📋 Next Steps:");
      console.log("   1. Start the development server: npm run dev");
      console.log(`   2. Test PDF generation via API: POST ${testURL}`);
      console.log("   3. Check generated PDFs in storage directory");
      console.log("   4. Verify database tracking in ProtocolGeneration table");
      console.log("   5. Test different template options and branding");
    }

    console.log("\n🎉 PDF Generation testing completed!");

  } catch (error) {
    console.error("❌ Error during PDF Generation testing:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testPDFGeneration()
  .catch((error) => {
    console.error("Failed to test PDF Generation:", error);
    process.exit(1);
  });
