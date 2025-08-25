// Test saving analysis to database with new fields
import { prisma } from "../src/lib/db/prisma.js";

async function testDatabaseSave() {
  console.log("Testing database save with new functional medicine fields...\n");

  try {
    // Create a test assessment analysis
    const testAnalysis = await prisma.assessmentAnalysis.create({
      data: {
        assessmentId: "test-db-" + Date.now(), // This would normally reference a real assessment
        primaryPatterns: [
          {
            pattern: "HPA Axis Dysfunction",
            evidence: ["High stress", "Poor sleep", "Energy crashes"],
          },
        ],
        rootCauses: {
          primary_drivers: ["Chronic stress", "Sleep deprivation"],
          timeline_significance: "Started 2 years ago",
        },
        systemPriorities: {
          "1_digestive": "Primary concern",
          "2_hormonal": "Secondary concern",
        },
        keyFindings: {
          most_concerning: ["Severe fatigue", "Digestive issues"],
          positive_findings: ["Good hydration"],
          risk_factors: ["Sedentary lifestyle"],
        },
        labRecommendations: {
          essential: ["Comprehensive Metabolic Panel", "Thyroid Panel"],
          additional: ["Cortisol testing"],
        },
        supplementProtocol: {
          foundation: [
            {
              supplement: "Magnesium Glycinate",
              dosage: "400mg",
              timing: "Before bed",
              rationale: "Support sleep and relaxation",
            },
          ],
          targeted: [],
          timeline: "Start immediately",
        },
        lifestyleModifications: {
          dietary: ["Anti-inflammatory diet"],
          sleep: ["8 hours nightly"],
          stress: ["Daily meditation"],
          movement: ["30 min walking daily"],
        },
        treatmentPhases: {
          phase_1: {
            weeks: "1-4",
            focus: "Foundation",
            actions: ["Start supplements", "Improve sleep"],
          },
        },
        analysisVersion: "1.0",
        analyzedBy: "test-script",
        confidence: 0.85,
        // Legacy fields as null
        overallScore: null,
        nodeScores: {},
        seedOilScore: {},
        aiSummary: null,
        keyFindings: {},
        riskFactors: {},
        strengths: {},
        primaryConcerns: {},
        suggestedLabs: {},
        labPredictions: {},
        protocolPriority: {},
      },
    });

    console.log("✅ Successfully saved analysis to database!");
    console.log("Analysis ID:", testAnalysis.id);
    console.log("\nSaved fields:");
    console.log("- primaryPatterns:", testAnalysis.primaryPatterns ? "✓" : "✗");
    console.log("- rootCauses:", testAnalysis.rootCauses ? "✓" : "✗");
    console.log(
      "- systemPriorities:",
      testAnalysis.systemPriorities ? "✓" : "✗"
    );
    console.log(
      "- labRecommendations:",
      testAnalysis.labRecommendations ? "✓" : "✗"
    );
    console.log(
      "- supplementProtocol:",
      testAnalysis.supplementProtocol ? "✓" : "✗"
    );
    console.log(
      "- lifestyleModifications:",
      testAnalysis.lifestyleModifications ? "✓" : "✗"
    );
    console.log("- treatmentPhases:", testAnalysis.treatmentPhases ? "✓" : "✗");
    console.log("- analysisVersion:", testAnalysis.analysisVersion);
    console.log("- analyzedBy:", testAnalysis.analyzedBy);
    console.log("- confidence:", testAnalysis.confidence);

    // Clean up test data
    await prisma.assessmentAnalysis.delete({
      where: { id: testAnalysis.id },
    });
    console.log("\n🧹 Cleaned up test data");
  } catch (error) {
    console.error("❌ Database save failed:", error);
    console.error("\nThis usually means:");
    console.error("1. Database is not running");
    console.error("2. Prisma client needs regeneration");
    console.error("3. Schema mismatch");
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseSave();
