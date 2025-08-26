// Simple test to verify if AI adaptive logic is working
// This uses the existing test-complete-flow infrastructure

console.log("🧪 Verifying AI Adaptive Assessment Logic");
console.log("=".repeat(50) + "\n");

console.log("📋 To test the AI adaptive logic:\n");

console.log(
  "1. Open your browser to: http://localhost:3001/test-complete-flow"
);
console.log("2. Start the assessment");
console.log("3. Answer questions with this pattern:");
console.log("   - Energy Level: 1 or 2 (very low)");
console.log("   - Sleep Quality: 1 or 2 (poor)");
console.log("   - Digestive issues: YES to all");
console.log("   - Bloating: YES");
console.log("   - Gas: YES");
console.log("   - Stomach pain: YES");
console.log("");
console.log("4. Open Developer Console (F12) and watch for:");
console.log("   - AI reasoning logs");
console.log("   - Module transitions");
console.log("   - Question selection patterns");
console.log("");
console.log("5. Expected behavior if AI is working:");
console.log("   ✅ Questions focus on digestive issues");
console.log("   ✅ More ASSIMILATION module questions");
console.log("   ✅ Fewer questions from unrelated modules");
console.log("   ✅ Total questions < 150 (not all 406)");
console.log("");
console.log("6. Signs AI is NOT working:");
console.log("   ❌ Questions appear in fixed order");
console.log("   ❌ All modules get equal questions");
console.log("   ❌ No adaptation to your answers");
console.log("   ❌ Assessment asks all 406 questions");
console.log("");

// Also let's check the server logs for AI activity
console.log("💡 Also check your server terminal for:");
console.log("   - 'AI question selection' logs");
console.log("   - 'AI reasoning:' messages");
console.log("   - Module transition decisions");
console.log("");

// Quick check of the codebase
const fs = require("fs");
const path = require("path");

// Check if AI service exists
const aiServicePath = path.join(__dirname, "../lib/ai/assessment-ai.ts");
if (fs.existsSync(aiServicePath)) {
  console.log("✅ AI service file exists: lib/ai/assessment-ai.ts");
} else {
  console.log("❌ AI service file NOT FOUND!");
}

// Check if next-question route uses AI
const nextQuestionPath = path.join(
  __dirname,
  "../src/app/api/assessment/[id]/next-question/route.ts"
);
if (fs.existsSync(nextQuestionPath)) {
  const content = fs.readFileSync(nextQuestionPath, "utf8");
  if (content.includes("getNextQuestionWithAI")) {
    console.log("✅ Next question API imports AI service");
    if (content.includes("await getNextQuestionWithAI")) {
      console.log("✅ AI service is being called");
    } else {
      console.log("⚠️  AI service imported but maybe not used");
    }
  } else {
    console.log("❌ Next question API does NOT use AI service");
  }
}

console.log("\n" + "=".repeat(50));
console.log("📊 Quick Code Analysis Complete");
console.log("=".repeat(50) + "\n");

// Check environment
if (process.env.ANTHROPIC_API_KEY) {
  console.log("✅ ANTHROPIC_API_KEY is set");
} else {
  const envPath = path.join(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("ANTHROPIC_API_KEY=")) {
      console.log("✅ ANTHROPIC_API_KEY found in .env.local");
    } else {
      console.log("❌ ANTHROPIC_API_KEY NOT found in .env.local");
    }
  }
}

console.log("\n🚀 Next step: Run the manual test in your browser");
console.log("   Then check console and server logs for AI activity\n");
