const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testProtocolAPIs() {
  console.log("🧪 Testing Protocol API Database Integration...");

  try {
    // Create a test client if one doesn't exist
    console.log("📋 Setting up test data...");
    
    const testClient = await prisma.client.upsert({
      where: { email: "test.protocol@example.com" },
      update: {},
      create: {
        firstName: "Protocol",
        lastName: "Test",
        email: "test.protocol@example.com",
        status: "active",
      },
    });

    // Create a test analysis
    const testAnalysis = await prisma.clientAnalysis.upsert({
      where: { id: "test_analysis_protocol" },
      update: {},
      create: {
        id: "test_analysis_protocol",
        clientId: testClient.id,
        fullAnalysis: `
Executive Summary:
The client presents with digestive concerns and low energy levels that suggest underlying gut dysfunction and nutrient malabsorption.

Protocol Recommendations:
1. Digestive Enzymes: 2 capsules with meals to support digestion
2. Probiotics: 50 billion CFU morning on empty stomach for microbiome support
3. L-Glutamine: 5g morning on empty stomach for gut lining repair
4. Magnesium Glycinate: 400mg evening for muscle relaxation and sleep
5. Vitamin D3: 2000 IU daily for immune support

Dietary Guidelines:
- Eliminate gluten, dairy, and processed foods
- Emphasize bone broth, fermented foods, and anti-inflammatory herbs
- Include prebiotic fibers to support beneficial bacteria

Lifestyle Modifications:
- Stress reduction techniques
- Adequate sleep (7-9 hours)
- Mindful eating practices
- Regular gentle exercise
        `,
        executiveSummary: "Client presents with digestive concerns and low energy levels.",
        protocolRecommendations: {
          supplements: ["Digestive Enzymes", "Probiotics", "L-Glutamine", "Magnesium", "Vitamin D3"],
          dietary: ["eliminate gluten/dairy", "bone broth", "fermented foods"],
          lifestyle: ["stress reduction", "adequate sleep", "mindful eating"]
        },
        status: "active",
      },
    });

    console.log(`✅ Test client created: ${testClient.firstName} ${testClient.lastName}`);
    console.log(`✅ Test analysis created: ${testAnalysis.id}`);

    // Test creating a protocol from analysis data
    console.log("🔧 Testing protocol extraction logic...");
    
    // Simulate the supplement extraction logic
    const analysisText = testAnalysis.fullAnalysis;
    const supplementPatterns = [
      /([A-Za-z0-9\s\-]+):\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg|g|mcg|IU|capsules?|tablets?|drops?|ml))\s*([^.\n]*)/gi,
    ];

    const extractedSupplements = [];
    let priority = 1;
    
    for (const pattern of supplementPatterns) {
      let match;
      while ((match = pattern.exec(analysisText)) !== null) {
        const [_, name, dosage, timing] = match;
        const cleanName = name.trim().replace(/[:\-()]/g, '');
        const cleanDosage = dosage.trim();
        const cleanTiming = timing.trim().replace(/[.\n]/g, '').substring(0, 100);
        
        if (cleanName.length >= 3 && cleanName.split(' ').length <= 5) {
          extractedSupplements.push({
            name: cleanName,
            dosage: cleanDosage,
            timing: cleanTiming || 'as directed',
            priority: priority++,
          });
        }
      }
    }

    console.log(`✅ Extracted ${extractedSupplements.length} supplements from analysis`);
    extractedSupplements.forEach((supp, index) => {
      console.log(`   ${index + 1}. ${supp.name} - ${supp.dosage} ${supp.timing}`);
    });

    // Test creating a protocol directly
    console.log("📝 Testing protocol creation...");
    
    const testProtocol = await prisma.enhancedProtocol.create({
      data: {
        clientId: testClient.id,
        analysisId: testAnalysis.id,
        protocolName: "Digestive Health Protocol",
        protocolPhase: "Phase 1",
        supplements: {
          total: extractedSupplements.length,
          categories: ['Digestive Support', 'Immune Support'],
          extractedFrom: 'analysis'
        },
        dietaryGuidelines: {
          eliminate: ["gluten", "dairy", "processed foods"],
          emphasize: ["bone broth", "fermented foods", "anti-inflammatory herbs"],
          extractedFrom: 'analysis'
        },
        startDate: new Date(),
        durationWeeks: 12,
        status: "planned",
        greeting: `Dear ${testClient.firstName},\n\nBased on your comprehensive assessment, I've created this personalized protocol.`,
        clinicalFocus: "Digestive concerns and low energy levels suggesting gut dysfunction",
        currentStatus: "Protocol ready for review",
        prioritySupplements: extractedSupplements.slice(0, 3),
        dailySchedule: {
          morning: "8:00 AM",
          evening: "6:00 PM",
          description: "Standard morning and evening routine"
        },
        protocolNotes: "Auto-generated from analysis for testing purposes",
      },
    });

    console.log(`✅ Protocol created: ${testProtocol.protocolName} (ID: ${testProtocol.id})`);

    // Test creating protocol supplements
    console.log("💊 Testing protocol supplements creation...");
    
    const supplementsData = extractedSupplements.map((supplement) => ({
      protocolId: testProtocol.id,
      productName: supplement.name,
      dosage: supplement.dosage,
      timing: supplement.timing,
      purpose: 'As recommended in analysis',
      priority: supplement.priority,
      isActive: true,
      startDate: new Date(),
    }));

    if (supplementsData.length > 0) {
      await prisma.protocolSupplement.createMany({
        data: supplementsData,
      });
    }

    console.log(`✅ Created ${supplementsData.length} protocol supplements`);

    // Test fetching protocol with related data
    console.log("🔍 Testing protocol data retrieval...");
    
    const protocolWithData = await prisma.enhancedProtocol.findUnique({
      where: { id: testProtocol.id },
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
        protocolGenerations: true,
      },
    });

    console.log(`✅ Retrieved protocol with ${protocolWithData.protocolSupplements.length} supplements`);
    console.log(`   Client: ${protocolWithData.client.firstName} ${protocolWithData.client.lastName}`);
    console.log(`   Analysis: ${protocolWithData.analysis?.id || 'None'}`);

    // Test protocol generation record
    console.log("📄 Testing protocol generation tracking...");
    
    const mockGeneration = await prisma.protocolGeneration.create({
      data: {
        protocolId: testProtocol.id,
        clientId: testClient.id,
        pdfUrl: `/generated-pdfs/test_${Date.now()}.pdf`,
        generationData: {
          type: 'test',
          clientName: `${testClient.firstName} ${testClient.lastName}`,
          protocolName: testProtocol.protocolName,
          generatedAt: new Date().toISOString(),
          supplementCount: supplementsData.length,
        },
      },
    });

    console.log(`✅ Protocol generation record created: ${mockGeneration.id}`);

    // Test filtering and pagination queries
    console.log("🔍 Testing query filtering...");
    
    const filteredProtocols = await prisma.enhancedProtocol.findMany({
      where: {
        clientId: testClient.id,
        status: "planned",
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        protocolSupplements: {
          where: { isActive: true },
          orderBy: { priority: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log(`✅ Found ${filteredProtocols.length} protocols for client`);

    // Test template queries
    console.log("📋 Testing template queries...");
    
    const templates = await prisma.protocolTemplate.findMany({
      where: { isActive: true },
      orderBy: { category: "asc" },
    });

    console.log(`✅ Found ${templates.length} active protocol templates`);

    const scheduleTemplates = await prisma.dailyScheduleTemplate.findMany({
      orderBy: { isDefault: "desc" },
    });

    console.log(`✅ Found ${scheduleTemplates.length} daily schedule templates`);

    console.log("🎉 All Protocol API database tests completed successfully!");
    console.log("\n📊 Test Summary:");
    console.log(`   ✅ Client created/verified`);
    console.log(`   ✅ Analysis created/verified`);
    console.log(`   ✅ Supplement extraction: ${extractedSupplements.length} items`);
    console.log(`   ✅ Protocol creation with full metadata`);
    console.log(`   ✅ Protocol supplements: ${supplementsData.length} items`);
    console.log(`   ✅ Data retrieval with relations`);
    console.log(`   ✅ Generation tracking`);
    console.log(`   ✅ Filtering and pagination queries`);
    console.log(`   ✅ Template system verification`);

  } catch (error) {
    console.error("❌ Error during Protocol API testing:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testProtocolAPIs()
  .catch((error) => {
    console.error("Failed to test Protocol APIs:", error);
    process.exit(1);
  });
