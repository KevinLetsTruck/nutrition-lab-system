// Simple API test to check if the endpoint is working

async function testAPI() {
  const testId = "test-123";

  console.log("Testing API endpoint...");
  console.log(`URL: http://localhost:3000/api/assessment/${testId}/analysis`);

  try {
    // First, test with a simple GET to see if route exists
    console.log("\n1. Testing GET request...");
    const getResponse = await fetch(
      `http://localhost:3000/api/assessment/${testId}/analysis`
    );
    console.log("GET Status:", getResponse.status);

    // Now test POST
    console.log("\n2. Testing POST request...");
    const postResponse = await fetch(
      `http://localhost:3000/api/assessment/${testId}/analysis`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isTest: true,
          responses: [{ questionId: "test1", value: "yes" }],
          clientInfo: { age: 45 },
        }),
      }
    );

    console.log("POST Status:", postResponse.status);
    console.log("Content-Type:", postResponse.headers.get("content-type"));

    const text = await postResponse.text();

    // Try to parse as JSON
    try {
      const data = JSON.parse(text);
      console.log("\nResponse:", JSON.stringify(data, null, 2));
    } catch (e) {
      console.log("\nNot JSON. First 500 chars:");
      console.log(text.substring(0, 500));
    }
  } catch (error) {
    console.error("Request error:", error);
  }
}

testAPI();
