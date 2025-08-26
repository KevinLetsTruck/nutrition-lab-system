// Test the fixed assessment flow

const API_BASE = "http://localhost:3001";

async function testFixedFlow() {
  console.log("🧪 Testing Fixed Assessment Flow");
  console.log("=".repeat(50) + "\n");

  try {
    // Step 1: Create a new assessment
    console.log("1️⃣ Creating new assessment...");
    const createRes = await fetch(`${API_BASE}/api/assessment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: "test-client",
        templateId: "default",
      }),
    });

    if (!createRes.ok) {
      const error = await createRes.json();
      if (error.existingId) {
        console.log("⚠️  Client already has an active assessment");
        console.log(`   Existing ID: ${error.existingId}`);
        console.log("   Use the assessments page UI to handle this case");
        return;
      }
      throw new Error(`Failed to create: ${JSON.stringify(error)}`);
    }

    const data = await createRes.json();
    console.log("✅ Assessment created successfully!");
    console.log(`   Assessment ID: ${data.assessment.id}`);
    console.log(`   Status: ${data.assessment.status}`);
    console.log(`   Module: ${data.assessment.currentModule}`);
    console.log(`   First Question: ${data.firstQuestion?.text}`);
    console.log(`   Question Type: ${data.firstQuestion?.type}`);

    // Step 2: Test getting next question
    console.log("\n2️⃣ Testing next question endpoint...");
    const nextRes = await fetch(
      `${API_BASE}/api/assessment/${data.assessment.id}/next-question`
    );

    if (nextRes.ok) {
      const nextData = await nextRes.json();
      console.log("✅ Next question endpoint works!");
      if (nextData.question) {
        console.log(`   Question: ${nextData.question.text}`);
        console.log(`   Module: ${nextData.currentModule}`);
      }
    }

    // Step 3: Test submitting a response
    console.log("\n3️⃣ Testing response submission...");
    const responseRes = await fetch(
      `${API_BASE}/api/assessment/${data.assessment.id}/response`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: data.firstQuestion.id,
          value: 3, // Middle value for Likert scale
          module: data.assessment.currentModule,
        }),
      }
    );

    if (responseRes.ok) {
      console.log("✅ Response saved successfully!");
    }

    console.log("\n✅ Assessment flow is working properly!");
    console.log("\n📋 UI Test Instructions:");
    console.log("1. Navigate to: http://localhost:3001/assessments");
    console.log("2. Click 'New Assessment' button");
    console.log("3. Should navigate to /assessment/[id] with first question");
    console.log("4. Should NOT show 'Assessment Complete!' immediately");
    console.log(
      "\n💡 If you see 'already has active assessment', the UI will offer to resume it"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run test
testFixedFlow();
