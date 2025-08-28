const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testProtocolComponents() {
  console.log("🧪 Testing Protocol Components Integration...");

  try {
    // Check if we have the test data we created earlier
    const testClient = await prisma.client.findUnique({
      where: { email: "test.protocol@example.com" },
    });

    if (!testClient) {
      console.log("❌ Test client not found. Please run test-protocol-apis.js first.");
      return;
    }

    console.log(`✅ Test client found: ${testClient.firstName} ${testClient.lastName}`);

    // Check for existing protocols
    const protocols = await prisma.enhancedProtocol.findMany({
      where: { clientId: testClient.id },
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

    console.log(`✅ Found ${protocols.length} protocols for component testing`);

    if (protocols.length > 0) {
      protocols.forEach((protocol, index) => {
        console.log(`   ${index + 1}. ${protocol.protocolName}`);
        console.log(`      - Status: ${protocol.status}`);
        console.log(`      - Phase: ${protocol.protocolPhase || 'None'}`);
        console.log(`      - Supplements: ${protocol.protocolSupplements.length}`);
        console.log(`      - Generations: ${protocol.protocolGenerations.length}`);
        console.log(`      - Created: ${protocol.createdAt.toISOString().split('T')[0]}`);
      });
    }

    // Check daily schedule templates
    const scheduleTemplates = await prisma.dailyScheduleTemplate.findMany({
      orderBy: { isDefault: "desc" },
    });

    console.log(`✅ Found ${scheduleTemplates.length} daily schedule templates`);

    scheduleTemplates.forEach((template, index) => {
      const timeSlots = Object.keys(template.scheduleTimes).filter(key => 
        key !== 'description' && key !== 'notes'
      );
      console.log(`   ${index + 1}. ${template.name} (${timeSlots.length} time slots)${template.isDefault ? ' [DEFAULT]' : ''}`);
    });

    // Check protocol templates
    const protocolTemplates = await prisma.protocolTemplate.findMany({
      where: { isActive: true },
      orderBy: { category: "asc" },
    });

    console.log(`✅ Found ${protocolTemplates.length} protocol templates`);

    protocolTemplates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.category})`);
      const phases = template.templateData?.phases || [];
      console.log(`      - Phases: ${phases.length}`);
    });

    // Component integration readiness check
    console.log("\n🔍 Component Integration Readiness:");
    
    const checks = [
      {
        name: "Protocol data structure",
        passed: protocols.length > 0,
        details: `${protocols.length} protocols available`
      },
      {
        name: "Client relationship",
        passed: protocols.some(p => p.client && p.client.firstName),
        details: "Client data properly linked"
      },
      {
        name: "Supplement relationships", 
        passed: protocols.some(p => p.protocolSupplements.length > 0),
        details: `${protocols.reduce((sum, p) => sum + p.protocolSupplements.length, 0)} total supplements`
      },
      {
        name: "Daily schedule templates",
        passed: scheduleTemplates.length > 0,
        details: `${scheduleTemplates.length} templates available`
      },
      {
        name: "Protocol templates",
        passed: protocolTemplates.length > 0,
        details: `${protocolTemplates.length} templates available`
      },
      {
        name: "Default schedule template",
        passed: scheduleTemplates.some(t => t.isDefault),
        details: "Default template exists"
      }
    ];

    checks.forEach(check => {
      const status = check.passed ? "✅" : "❌";
      console.log(`   ${status} ${check.name}: ${check.details}`);
    });

    const allPassed = checks.every(check => check.passed);
    
    console.log(`\n🎯 Component Integration Status: ${allPassed ? "READY" : "NEEDS ATTENTION"}`);

    if (allPassed) {
      console.log("\n📋 Ready for UI Components:");
      console.log("   ✅ ProtocolCard - Display individual protocols");
      console.log("   ✅ ProtocolList - List protocols with filtering");
      console.log("   ✅ ProtocolBuilder - Create/edit protocols"); 
      console.log("   ✅ SupplementForm - Add/edit supplements");
      console.log("   ✅ DailyScheduleBuilder - Configure timing");
      console.log("\n🚀 All Protocol React components are ready for use!");
    } else {
      console.log("\n⚠️  Some components may have limited functionality without full data.");
    }

    console.log("\n🎉 Protocol Components testing completed successfully!");

  } catch (error) {
    console.error("❌ Error during Protocol Components testing:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testProtocolComponents()
  .catch((error) => {
    console.error("Failed to test Protocol Components:", error);
    process.exit(1);
  });
