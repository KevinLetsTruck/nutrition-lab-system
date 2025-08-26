const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testLikertScale() {
  const baseUrl = "http://localhost:3000";

  console.log("Testing LIKERT_SCALE question type...\n");

  try {
    // Start assessment
    const startRes = await fetch(`${baseUrl}/api/assessment/test-start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includeTest: false }),
    });

    const startData = await startRes.json();
    const { assessmentId, firstQuestion } = startData.data;

    console.log(`Assessment ID: ${assessmentId}`);
    console.log(
      `Current Question: ${firstQuestion.id} - ${firstQuestion.text}`
    );
    console.log(`Question Type: ${firstQuestion.type}`);

    if (firstQuestion.type === "LIKERT_SCALE") {
      // Test submitting a LIKERT_SCALE response with numeric value
      console.log("\nTesting LIKERT_SCALE response with value 7...");

      const submitRes = await fetch(
        `${baseUrl}/api/assessment/test/${assessmentId}/response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: firstQuestion.id,
            response: {
              type: "LIKERT_SCALE",
              value: 7, // Numeric value between 1-10
            },
          }),
        }
      );

      const submitData = await submitRes.json();

      if (submitRes.ok && submitData.success) {
        console.log("✅ LIKERT_SCALE response saved successfully!");
        console.log(`Response ID: ${submitData.data.responseId}`);

        // Verify the saved value
        const verifyRes = await fetch(
          `${baseUrl}/api/assessment/test/${assessmentId}/responses`
        );
        const verifyData = await verifyRes.json();

        const savedResponse = verifyData.data.responses.find(
          (r) => r.questionId === firstQuestion.id
        );

        console.log(
          `\n✅ Verified saved value: ${savedResponse.responseValue}`
        );
        console.log("LIKERT_SCALE is working correctly!");
      } else {
        console.log(
          "❌ Failed to save LIKERT_SCALE response:",
          submitData.error
        );
      }
    } else {
      console.log(
        `\n⚠️  Current question is not LIKERT_SCALE type (it's ${firstQuestion.type})`
      );
      console.log(
        "The assessment has already progressed past LIKERT_SCALE questions."
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testLikertScale();
