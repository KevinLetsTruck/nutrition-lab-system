const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

async function debugSimpleDatabase() {
  console.log(
    `${colors.cyan}🔍 Simple Assessment Database Debug${colors.reset}`
  );
  console.log("=".repeat(60));

  try {
    // Test 1: Database Connection
    console.log(
      `\n${colors.blue}1. Testing Database Connection...${colors.reset}`
    );
    await prisma.$connect();
    console.log(
      `${colors.green}✅ Database connection successful${colors.reset}`
    );

    // Test 2: Count SimpleAssessment records
    console.log(
      `\n${colors.blue}2. Counting SimpleAssessment records...${colors.reset}`
    );
    const assessmentCount = await prisma.simpleAssessment.count();
    console.log(
      `${colors.green}✅ SimpleAssessment count: ${assessmentCount}${colors.reset}`
    );

    // Test 3: Count SimpleResponse records
    console.log(
      `\n${colors.blue}3. Counting SimpleResponse records...${colors.reset}`
    );
    const responseCount = await prisma.simpleResponse.count();
    console.log(
      `${colors.green}✅ SimpleResponse count: ${responseCount}${colors.reset}`
    );

    // Test 4: List recent assessments
    console.log(
      `\n${colors.blue}4. Recent SimpleAssessments (last 5)...${colors.reset}`
    );
    const recentAssessments = await prisma.simpleAssessment.findMany({
      take: 5,
      orderBy: { startedAt: "desc" },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    if (recentAssessments.length > 0) {
      recentAssessments.forEach((assessment, index) => {
        console.log(`\n  ${index + 1}. Assessment ID: ${assessment.id}`);
        console.log(
          `     Client: ${assessment.client.firstName} ${assessment.client.lastName} (${assessment.client.email})`
        );
        console.log(`     Status: ${assessment.status}`);
        console.log(`     Started: ${assessment.startedAt.toISOString()}`);
        console.log(`     Responses: ${assessment._count.responses}`);
        if (assessment.completedAt) {
          console.log(
            `     Completed: ${assessment.completedAt.toISOString()}`
          );
        }
      });
    } else {
      console.log(`${colors.yellow}   No assessments found${colors.reset}`);
    }

    // Test 5: Create a test record
    console.log(`\n${colors.blue}5. Testing record creation...${colors.reset}`);

    // Find a test client first
    const testClient = await prisma.client.findFirst({
      where: {
        OR: [
          { email: { contains: "test" } },
          { firstName: { contains: "Test" } },
        ],
      },
    });

    if (testClient) {
      console.log(
        `   Using test client: ${testClient.firstName} ${testClient.lastName}`
      );

      // Create a test assessment
      const testAssessment = await prisma.simpleAssessment.create({
        data: {
          clientId: testClient.id,
          status: "in_progress",
        },
      });

      console.log(
        `${colors.green}✅ Created test assessment: ${testAssessment.id}${colors.reset}`
      );

      // Create a test response
      const testResponse = await prisma.simpleResponse.create({
        data: {
          assessmentId: testAssessment.id,
          questionId: 1,
          questionText: "Test question",
          category: "test",
          score: 3,
        },
      });

      console.log(
        `${colors.green}✅ Created test response: ${testResponse.id}${colors.reset}`
      );

      // Clean up test data
      console.log(`\n${colors.blue}6. Cleaning up test data...${colors.reset}`);
      await prisma.simpleResponse.delete({ where: { id: testResponse.id } });
      await prisma.simpleAssessment.delete({
        where: { id: testAssessment.id },
      });
      console.log(`${colors.green}✅ Test data cleaned up${colors.reset}`);
    } else {
      console.log(
        `${colors.yellow}   No test client found. Skipping record creation test.${colors.reset}`
      );
    }

    // Test 6: Check database schema
    console.log(
      `\n${colors.blue}7. Verifying database schema...${colors.reset}`
    );

    // Query to check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('SimpleAssessment', 'SimpleResponse')
      ORDER BY table_name;
    `;

    console.log(
      `   Found tables: ${tables.map((t) => t.table_name).join(", ")}`
    );

    // Test 7: Environment info
    console.log(`\n${colors.blue}8. Environment Information...${colors.reset}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
    console.log(
      `   DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"}`
    );
    console.log(
      `   Prisma Client Version: ${prisma._clientVersion || "unknown"}`
    );

    console.log(
      `\n${colors.green}✅ All database tests completed successfully!${colors.reset}`
    );
  } catch (error) {
    console.error(`\n${colors.red}❌ Database test failed:${colors.reset}`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);

    // Additional debugging for common issues
    if (error.message.includes("P1001")) {
      console.error(
        `\n${colors.yellow}💡 Connection error - Check if PostgreSQL is running${colors.reset}`
      );
    } else if (error.message.includes("P2002")) {
      console.error(
        `\n${colors.yellow}💡 Unique constraint error${colors.reset}`
      );
    } else if (error.message.includes("P2025")) {
      console.error(
        `\n${colors.yellow}💡 Record not found error${colors.reset}`
      );
    }
  } finally {
    await prisma.$disconnect();
    console.log(`\n${colors.cyan}Database connection closed${colors.reset}`);
  }
}

// Run the debug script
debugSimpleDatabase().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
