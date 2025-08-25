#!/usr/bin/env node

// Quick check to see if AI is being called in your assessment

const { exec } = require("child_process");
const fs = require("fs");

console.log("\n🔍 Quick AI Assessment Check");
console.log("=".repeat(40) + "\n");

// Check 1: Is the server running?
exec("lsof -i :3001", (error, stdout) => {
  if (stdout) {
    console.log("✅ Server is running on port 3001");
  } else {
    console.log("❌ Server NOT running! Run: npm run dev");
    console.log("   Then visit: http://localhost:3001/test-complete-flow");
    return;
  }
});

// Check 2: Is Claude API key set?
const envPath = ".env.local";
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  if (
    env.includes("ANTHROPIC_API_KEY=") &&
    !env.includes('ANTHROPIC_API_KEY=""')
  ) {
    console.log("✅ Claude API key is configured");
  } else {
    console.log("❌ Claude API key NOT configured!");
    console.log("   Add ANTHROPIC_API_KEY to .env.local");
  }
} else {
  console.log("❌ No .env.local file found!");
}

// Check 3: Show what to look for
console.log("\n📋 To verify AI is working:");
console.log("1. Open: http://localhost:3001/test-complete-flow");
console.log("2. Start assessment and answer 10-15 questions");
console.log("3. Watch your SERVER TERMINAL (not browser) for:");
console.log("   - 'getNextQuestionWithAI called'");
console.log("   - 'AI decision:' messages");
console.log("   - 'AI question selection took XXXms'");
console.log("   - Module transition logs");
console.log("\n4. In BROWSER, count questions:");
console.log("   - If AI works: < 150 total questions");
console.log("   - If sequential: All 406 questions");
console.log("\n5. Answer with patterns:");
console.log("   - All digestive = YES → More digestive Qs");
console.log("   - All energy = LOW → More energy Qs");
console.log("   - Clean diet = More skip processed food Qs");

// Check 4: Show AI trigger points
console.log("\n🎯 AI triggers at:");
console.log("   - Question 1 (always)");
console.log("   - Every 10 questions");
console.log("   - High severity answers (4-5 on scale)");
console.log("   - Multiple 'yes' to symptoms");

// Check 5: Quick file check
const aiFile = fs.existsSync("./lib/ai/assessment-ai.ts");
const hasAI = fs.existsSync(
  "./src/app/api/assessment/[id]/next-question/route.ts"
);

console.log("\n✅ AI files present:", aiFile && hasAI);

console.log("\n💡 TIP: Clear browser data if testing multiple times");
console.log("   to avoid cached responses\n");
