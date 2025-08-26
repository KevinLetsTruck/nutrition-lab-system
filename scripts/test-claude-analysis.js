import { Anthropic } from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "❌ ERROR: ANTHROPIC_API_KEY not found in environment variables"
  );
  console.log("\nTo fix this:");
  console.log("1. Create a .env.local file in the project root");
  console.log('2. Add: ANTHROPIC_API_KEY="sk-ant-api03-your-actual-key-here"');
  console.log("3. Get your key from: https://console.anthropic.com");
  console.log("\nThen run this script again.");
  process.exit(1);
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Mock a complete assessment response set
const mockAssessmentData = {
  clientInfo: {
    age: 45,
    gender: "female",
    occupation: "truck driver",
  },
  responses: {
    // Energy & Fatigue
    "essential-energy-level": 3, // Low energy
    "essential-sleep-quality": 2, // Poor sleep
    "essential-sleep-hours": 5, // Insufficient sleep

    // Digestive
    "essential-digest-meals": "yes",
    "essential-digest-meals-details": ["Bloating", "Gas", "Stomach pain"],
    "essential-digest-primary": "Bloating",
    "essential-digest-primary-severity": 4, // Severe
    "essential-bowel-regular": "no",
    "essential-bowel-issues": ["Constipation", "Straining"],

    // Chronic Conditions
    "essential-chronic-conditions": "yes",
    "essential-chronic-conditions-list": [
      "Thyroid Disorder",
      "High Blood Pressure",
    ],
    "essential-chronic-primary": "Thyroid Disorder",
    "essential-chronic-primary-impact": 4,

    // Medications
    "essential-medications": "yes",
    "essential-medications-list": "Levothyroxine 100mcg, Lisinopril 10mg",

    // Immune
    "essential-sick-frequency": "Often (5+ times/year)",
    "essential-allergies": "yes",
    "essential-allergies-list": ["Pollen/Hay fever", "Dairy"],

    // Inflammation
    "essential-inflammation": "yes",
    "essential-inflammation-details": [
      "Joint pain - knees",
      "Morning stiffness",
    ],
    "essential-inflammation-primary": "Joint pain - knees",
    "essential-inflammation-primary-severity": 3,

    // Energy Patterns
    "essential-energy-crashes": "yes",
    "essential-energy-crashes-timing": "2 hours after eating",
    "essential-energy-pattern": "Energy is consistently low",

    // Mental Health
    "essential-brain-fog": "Often",
    "essential-anxiety-mood": "yes",
    "essential-anxiety-mood-details": ["General anxiety", "Irritability"],
    "essential-stress-level": 4,

    // Timeline
    "essential-symptom-timeline": "2-5 years ago",
  },
};

const FUNCTIONAL_MEDICINE_ANALYSIS_PROMPT = `
You are an expert functional medicine practitioner analyzing a comprehensive health assessment.

Client Information:
${JSON.stringify(mockAssessmentData.clientInfo, null, 2)}

Assessment Responses:
${JSON.stringify(mockAssessmentData.responses, null, 2)}

Provide a comprehensive functional medicine analysis including:

1. PRIMARY PATTERNS IDENTIFIED
List the main functional medicine patterns you observe (e.g., HPA axis dysfunction, gut-brain axis, methylation issues, mitochondrial dysfunction)

2. ROOT CAUSE ANALYSIS
Identify likely root causes based on symptom patterns and timeline

3. SYSTEM PRIORITIES
Rank which body systems need support (1 = highest priority):
- Digestive
- Immune
- Energy/Mitochondrial
- Detoxification
- Hormonal
- Neurological
- Structural

4. KEY FINDINGS
- Most concerning symptoms
- Positive findings/strengths
- Risk factors

5. LABORATORY RECOMMENDATIONS
Suggest specific functional medicine labs based on patterns:
- Essential labs (must have)
- Additional labs (nice to have)

6. SUPPLEMENT PROTOCOL
Recommend supplements with specific dosing:
- Foundation supplements
- Targeted supplements for primary concerns
- Timeline (what to start first)

7. LIFESTYLE MODIFICATIONS
- Dietary recommendations
- Sleep optimization
- Stress management
- Movement/exercise

8. TREATMENT PRIORITIES
Create a phased approach:
- Phase 1 (Weeks 1-4): Foundation
- Phase 2 (Weeks 5-8): Targeted intervention
- Phase 3 (Weeks 9-12): Optimization

Format your response as JSON for easy parsing.
`;

async function testClaudeAnalysis() {
  console.log("Testing Claude Analysis Capability...\n");
  console.log("Sending mock assessment data to Claude...\n");

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: FUNCTIONAL_MEDICINE_ANALYSIS_PROMPT,
        },
      ],
    });

    console.log("=== CLAUDE ANALYSIS RESPONSE ===\n");
    console.log(response.content[0].text);

    // Try to parse as JSON
    try {
      const analysis = JSON.parse(response.content[0].text);
      console.log("\n=== PARSED SUCCESSFULLY ===");
      console.log("Primary Patterns:", analysis.primary_patterns?.length || 0);
      console.log(
        "Supplements Recommended:",
        analysis.supplement_protocol?.length || 0
      );
      console.log(
        "Labs Recommended:",
        analysis.laboratory_recommendations?.essential?.length || 0
      );
    } catch (e) {
      console.log("\n=== RESPONSE IS TEXT (NOT JSON) ===");
      console.log("This is fine for now - we can structure it later");
    }

    console.log("\n✅ SUCCESS: Claude can analyze assessment data!");
    console.log("\nNext Steps:");
    console.log(
      "1. If the analysis looks clinically sound, we proceed to Phase 2"
    );
    console.log(
      "2. If not, we need to refine the prompt or reconsider the approach"
    );
  } catch (error) {
    console.error("❌ FAILED:", error.message);
    console.log("\nThis means either:");
    console.log("1. API key issue - check ANTHROPIC_API_KEY in .env.local");
    console.log("2. Network issue - check connection");
    console.log("3. API error - check error message above");
  }
}

// Run the test
testClaudeAnalysis();
