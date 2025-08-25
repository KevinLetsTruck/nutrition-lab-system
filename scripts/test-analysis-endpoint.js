// Test script to verify the analysis endpoint
// This creates a mock completed assessment and triggers analysis

async function testAnalysisEndpoint() {
  const testAssessmentId = "test-analysis-" + Date.now();

  console.log("Testing Analysis Endpoint...");
  console.log("Assessment ID:", testAssessmentId);

  try {
    // First, check if we can trigger analysis
    console.log("\n1. Triggering analysis for test assessment...");

    const response = await fetch(
      `http://localhost:3000/api/assessment/${testAssessmentId}/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("\n✅ Analysis triggered successfully!");
      console.log("\n=== ANALYSIS RESULTS ===");
      console.log(JSON.stringify(data.analysis, null, 2));

      // Now try to fetch the analysis
      console.log("\n2. Fetching saved analysis...");
      const getResponse = await fetch(
        `http://localhost:3000/api/assessment/${testAssessmentId}/analysis`
      );
      const getData = await getResponse.json();

      if (getResponse.ok && getData.success) {
        console.log("✅ Analysis retrieved successfully!");
      } else {
        console.log("❌ Failed to retrieve analysis:", getData.error);
      }
    } else {
      console.log("\n❌ Analysis failed:");
      console.log("Status:", response.status);
      console.log("Error:", data.error);
      console.log("\nThis is expected if:");
      console.log("- No assessment exists with this ID");
      console.log("- Assessment is not marked as COMPLETED");
      console.log("- Database migrations haven't been run");
    }
  } catch (error) {
    console.error("\n❌ Request failed:", error.message);
    console.log("\nMake sure:");
    console.log("1. The server is running (npm run dev)");
    console.log("2. You're using the correct port");
  }
}

// Run the test
testAnalysisEndpoint();
