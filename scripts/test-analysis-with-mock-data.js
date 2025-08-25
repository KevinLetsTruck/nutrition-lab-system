import { analyzeAssessment } from "../lib/assessment/analysis-service.js";
import { prisma } from "../lib/db/prisma.js";

// Create a mock completed assessment in the database
async function createMockAssessment() {
  console.log("Creating mock assessment for analysis testing...\n");

  try {
    // 1. Create a test client
    const testClient = await prisma.client.create({
      data: {
        firstName: "Test",
        lastName: "Client",
        email: `test-${Date.now()}@example.com`,
        dateOfBirth: new Date("1979-01-01"),
        gender: "female",
        isTruckDriver: true,
      },
    });

    // 2. Create assessment template (if needed)
    let template = await prisma.assessmentTemplate.findFirst({
      where: { isActive: true },
    });

    if (!template) {
      template = await prisma.assessmentTemplate.create({
        data: {
          name: "Test Template",
          version: "1.0",
          questionBank: {},
          modules: {},
          scoringRules: {},
          isActive: true,
        },
      });
    }

    // 3. Create completed assessment
    const assessment = await prisma.clientAssessment.create({
      data: {
        clientId: testClient.id,
        templateId: template.id,
        status: "COMPLETED",
        questionsAsked: 30,
        questionsSaved: 30,
        completionRate: 100,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // 4. Create mock responses
    const mockResponses = [
      // Energy & Fatigue
      {
        questionId: "essential-energy-level",
        responseValue: 3,
        questionText: "Rate your overall energy level",
        questionModule: "ENERGY",
      },
      {
        questionId: "essential-sleep-quality",
        responseValue: 2,
        questionText: "Rate your sleep quality",
        questionModule: "ENERGY",
      },
      {
        questionId: "essential-sleep-hours",
        responseValue: 5,
        questionText: "How many hours of sleep?",
        questionModule: "ENERGY",
      },

      // Digestive
      {
        questionId: "essential-digest-meals",
        responseValue: "yes",
        questionText: "Do you have digestive issues?",
        questionModule: "DIGESTIVE",
      },
      {
        questionId: "essential-digest-meals-details",
        responseValue: ["Bloating", "Gas", "Stomach pain"],
        questionText: "What digestive issues?",
        questionModule: "DIGESTIVE",
      },
      {
        questionId: "essential-digest-primary",
        responseValue: "Bloating",
        questionText: "Primary digestive issue?",
        questionModule: "DIGESTIVE",
      },
      {
        questionId: "essential-digest-primary-severity",
        responseValue: 4,
        questionText: "Severity of bloating?",
        questionModule: "DIGESTIVE",
      },
      {
        questionId: "essential-bowel-regular",
        responseValue: "no",
        questionText: "Regular bowel movements?",
        questionModule: "DIGESTIVE",
      },
      {
        questionId: "essential-bowel-issues",
        responseValue: ["Constipation", "Straining"],
        questionText: "Bowel issues?",
        questionModule: "DIGESTIVE",
      },

      // Chronic Conditions
      {
        questionId: "essential-chronic-conditions",
        responseValue: "yes",
        questionText: "Any chronic conditions?",
        questionModule: "CHRONIC",
      },
      {
        questionId: "essential-chronic-conditions-list",
        responseValue: ["Thyroid Disorder", "High Blood Pressure"],
        questionText: "List conditions",
        questionModule: "CHRONIC",
      },
      {
        questionId: "essential-chronic-primary",
        responseValue: "Thyroid Disorder",
        questionText: "Primary condition?",
        questionModule: "CHRONIC",
      },
      {
        questionId: "essential-chronic-primary-impact",
        responseValue: 4,
        questionText: "Impact of thyroid disorder?",
        questionModule: "CHRONIC",
      },

      // Medications
      {
        questionId: "essential-medications",
        responseValue: "yes",
        questionText: "Taking medications?",
        questionModule: "MEDICATIONS",
      },
      {
        questionId: "essential-medications-list",
        responseValue: "Levothyroxine 100mcg, Lisinopril 10mg",
        questionText: "List medications",
        questionModule: "MEDICATIONS",
      },

      // Immune
      {
        questionId: "essential-sick-frequency",
        responseValue: "Often (5+ times/year)",
        questionText: "How often sick?",
        questionModule: "IMMUNE",
      },
      {
        questionId: "essential-allergies",
        responseValue: "yes",
        questionText: "Any allergies?",
        questionModule: "IMMUNE",
      },
      {
        questionId: "essential-allergies-list",
        responseValue: ["Pollen/Hay fever", "Dairy"],
        questionText: "List allergies",
        questionModule: "IMMUNE",
      },

      // Inflammation
      {
        questionId: "essential-inflammation",
        responseValue: "yes",
        questionText: "Signs of inflammation?",
        questionModule: "INFLAMMATION",
      },
      {
        questionId: "essential-inflammation-details",
        responseValue: ["Joint pain - knees", "Morning stiffness"],
        questionText: "Inflammation details?",
        questionModule: "INFLAMMATION",
      },
      {
        questionId: "essential-inflammation-primary",
        responseValue: "Joint pain - knees",
        questionText: "Primary inflammation?",
        questionModule: "INFLAMMATION",
      },
      {
        questionId: "essential-inflammation-primary-severity",
        responseValue: 3,
        questionText: "Joint pain severity?",
        questionModule: "INFLAMMATION",
      },

      // Energy Patterns
      {
        questionId: "essential-energy-crashes",
        responseValue: "yes",
        questionText: "Energy crashes?",
        questionModule: "ENERGY",
      },
      {
        questionId: "essential-energy-crashes-timing",
        responseValue: "2 hours after eating",
        questionText: "When do crashes occur?",
        questionModule: "ENERGY",
      },
      {
        questionId: "essential-energy-pattern",
        responseValue: "Energy is consistently low",
        questionText: "Energy pattern?",
        questionModule: "ENERGY",
      },

      // Mental Health
      {
        questionId: "essential-brain-fog",
        responseValue: "Often",
        questionText: "Brain fog frequency?",
        questionModule: "MENTAL",
      },
      {
        questionId: "essential-anxiety-mood",
        responseValue: "yes",
        questionText: "Anxiety or mood issues?",
        questionModule: "MENTAL",
      },
      {
        questionId: "essential-anxiety-mood-details",
        responseValue: ["General anxiety", "Irritability"],
        questionText: "Mood details?",
        questionModule: "MENTAL",
      },
      {
        questionId: "essential-stress-level",
        responseValue: 4,
        questionText: "Stress level?",
        questionModule: "MENTAL",
      },

      // Timeline
      {
        questionId: "essential-symptom-timeline",
        responseValue: "2-5 years ago",
        questionText: "When did symptoms start?",
        questionModule: "TIMELINE",
      },
    ];

    // Save all responses
    for (const response of mockResponses) {
      await prisma.clientResponse.create({
        data: {
          assessmentId: assessment.id,
          questionId: response.questionId,
          questionText: response.questionText,
          questionModule: response.questionModule,
          responseType:
            typeof response.responseValue === "number"
              ? "LIKERT"
              : Array.isArray(response.responseValue)
              ? "MULTI_SELECT"
              : "TEXT",
          responseValue: response.responseValue,
          responseText: JSON.stringify(response.responseValue),
          score:
            typeof response.responseValue === "number"
              ? response.responseValue
              : 0,
        },
      });
    }

    console.log("✅ Mock assessment created successfully!");
    console.log("Assessment ID:", assessment.id);
    console.log("Client ID:", testClient.id);
    console.log("Responses created:", mockResponses.length);

    return assessment.id;
  } catch (error) {
    console.error("❌ Failed to create mock assessment:", error);
    throw error;
  }
}

// Test the analysis
async function testAnalysis() {
  try {
    console.log("\n=== TESTING FUNCTIONAL MEDICINE ANALYSIS ===\n");

    // Create mock assessment
    const assessmentId = await createMockAssessment();

    console.log("\nAnalyzing assessment...");
    const startTime = Date.now();

    // Run analysis
    const analysis = await analyzeAssessment(assessmentId);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Analysis completed in ${duration}s\n`);

    // Display results
    console.log("=== ANALYSIS RESULTS ===\n");

    console.log("PRIMARY PATTERNS:");
    analysis.primaryPatterns.forEach((pattern, idx) => {
      console.log(`${idx + 1}. ${pattern.pattern}`);
      pattern.evidence.forEach((e) => console.log(`   - ${e}`));
    });

    console.log("\nKEY FINDINGS:");
    console.log("Most Concerning:", analysis.keyFindings.most_concerning);
    console.log("Positive:", analysis.keyFindings.positive_findings);
    console.log("Risk Factors:", analysis.keyFindings.risk_factors);

    console.log("\nSUPPLEMENT RECOMMENDATIONS:");
    console.log(
      "Foundation:",
      analysis.supplementProtocol.foundation.length,
      "supplements"
    );
    console.log(
      "Targeted:",
      analysis.supplementProtocol.targeted.length,
      "supplements"
    );

    console.log("\nLAB RECOMMENDATIONS:");
    console.log(
      "Essential:",
      analysis.labRecommendations.essential.length,
      "labs"
    );
    console.log(
      "Additional:",
      analysis.labRecommendations.additional.length,
      "labs"
    );

    console.log("\n✅ Analysis saved to database!");
    console.log(
      `\nView full analysis at: http://localhost:3000/assessment/${assessmentId}/analysis`
    );
  } catch (error) {
    console.error("\n❌ Analysis test failed:", error);
    console.log("\nTroubleshooting:");
    console.log("1. Ensure ANTHROPIC_API_KEY is set in .env.local");
    console.log("2. Run database migrations: npx prisma migrate dev");
    console.log("3. Check network connection");
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAnalysis();
