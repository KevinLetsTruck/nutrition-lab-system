// Test direct analysis with mock responses

const mockResponses = [
  { questionId: "essential-energy-level", value: 3 },
  { questionId: "essential-sleep-quality", value: 2 },
  { questionId: "essential-sleep-hours", value: 5 },
  { questionId: "essential-digest-meals", value: "yes" },
  {
    questionId: "essential-digest-meals-details",
    value: ["Bloating", "Gas", "Stomach pain"],
  },
  { questionId: "essential-digest-primary", value: "Bloating" },
  { questionId: "essential-digest-primary-severity", value: 4 },
  { questionId: "essential-chronic-conditions", value: "yes" },
  {
    questionId: "essential-chronic-conditions-list",
    value: ["Thyroid Disorder", "High Blood Pressure"],
  },
  { questionId: "essential-medications", value: "yes" },
  {
    questionId: "essential-medications-list",
    value: "Levothyroxine 100mcg, Lisinopril 10mg",
  },
];

async function testDirectAnalysis() {
  const testId = "test-" + Date.now();

  console.log("Testing direct analysis with test assessment:", testId);
  console.log("Number of responses:", mockResponses.length);

  try {
    const response = await fetch(
      `http://localhost:3001/api/test-analysis-simple`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentId: testId,
          isTest: true,
          responses: mockResponses,
          clientInfo: {
            age: 45,
            gender: "female",
            occupation: "truck driver",
          },
        }),
      }
    );

    let data;
    const responseText = await response.text();

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON");
      console.error("Response status:", response.status);
      console.error("Response text preview:", responseText.substring(0, 200));
      return;
    }

    if (response.ok && data.success) {
      console.log("\n✅ Analysis successful!");
      console.log("\n=== KEY FINDINGS ===");

      if (data.analysis.primaryPatterns) {
        console.log("\nPrimary Patterns:");
        data.analysis.primaryPatterns.forEach((p, i) => {
          console.log(`${i + 1}. ${p.pattern}`);
        });
      }

      // Show full analysis structure
      console.log("\n=== FULL ANALYSIS STRUCTURE ===");
      console.log(
        JSON.stringify(data.analysis, null, 2).substring(0, 1000) + "..."
      );

      if (data.analysis.keyFindings?.most_concerning) {
        console.log("\nMost Concerning:");
        data.analysis.keyFindings.most_concerning.forEach((f) =>
          console.log("- " + f)
        );
      }

      if (data.analysis.supplementProtocol?.foundation) {
        console.log("\nFoundation Supplements:");
        data.analysis.supplementProtocol.foundation.forEach((s) => {
          console.log(`- ${s.supplement}: ${s.dosage}`);
        });
      }

      console.log("\n💡 Full analysis stored in sessionStorage");
      console.log(
        `📊 View at: http://localhost:3001/assessment/${testId}/analysis`
      );
    } else {
      console.error("\n❌ Analysis failed:");
      console.error("Status:", response.status);
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("\n❌ Request failed:", error.message);
    console.log("\nMake sure:");
    console.log("1. Server is running (npm run dev)");
    console.log("2. ANTHROPIC_API_KEY is set in .env.local");
  }
}

testDirectAnalysis();
