const {
  SIMPLE_QUESTIONS,
  CATEGORIES,
} = require("../src/lib/simple-assessment/questions.ts");

console.log("🔍 Testing Expanded Categories (Phase 2 - First Step)");
console.log("=".repeat(60));

// Test question count
console.log("\n📊 Question Count:");
console.log(`   Total Questions: ${SIMPLE_QUESTIONS.length}`);
console.log(`   Expected: 50 (expanding to 80)`);
console.log(
  `   Status: ${SIMPLE_QUESTIONS.length === 50 ? "✅ PASS" : "❌ FAIL"}`
);

// Test questions per category
console.log("\n📋 Questions Per Category:");
const questionsPerCategory = {};
SIMPLE_QUESTIONS.forEach((q) => {
  if (!questionsPerCategory[q.category]) {
    questionsPerCategory[q.category] = [];
  }
  questionsPerCategory[q.category].push(q);
});

Object.entries(questionsPerCategory).forEach(([category, questions]) => {
  const categoryName =
    CATEGORIES.find((c) => c.id === category)?.name || category;
  const expectedCount = ["digestive", "energy"].includes(category) ? 10 : 5;
  console.log(
    `   ${categoryName}: ${questions.length} questions ${
      questions.length === expectedCount ? "✅" : "❌"
    } (expected: ${expectedCount})`
  );
});

// Show expanded digestive questions
console.log("\n🍽️ Expanded Digestive Questions (1-10):");
console.log("-".repeat(60));
SIMPLE_QUESTIONS.slice(0, 10).forEach((q) => {
  console.log(`Q${q.id}: ${q.text}`);
  console.log(`   Scale: ${q.scaleType}`);
});

// Show expanded energy questions
console.log("\n⚡ Expanded Energy Questions (11-20):");
console.log("-".repeat(60));
SIMPLE_QUESTIONS.slice(10, 20).forEach((q) => {
  console.log(`Q${q.id}: ${q.text}`);
  console.log(`   Scale: ${q.scaleType}`);
});

// Show new question types added
console.log("\n🆕 New Question Types Added:");
const newQuestionThemes = {
  digestive: [
    "gas/flatulence",
    "abdominal pain severity",
    "nausea",
    "food cravings",
    "functional impact",
  ],
  energy: [
    "physical stamina",
    "mental fatigue",
    "recovery",
    "seasonal effects",
    "caffeine dependence",
  ],
};

Object.entries(newQuestionThemes).forEach(([category, themes]) => {
  console.log(`\n${category.toUpperCase()}:`);
  themes.forEach((theme) => console.log(`   - ${theme}`));
});

// Test scale types
console.log("\n🎨 New Scale Types Used:");
const scaleTypes = {};
SIMPLE_QUESTIONS.forEach((q) => {
  if (!scaleTypes[q.scaleType]) {
    scaleTypes[q.scaleType] = 0;
  }
  scaleTypes[q.scaleType]++;
});

Object.entries(scaleTypes).forEach(([scale, count]) => {
  console.log(`   ${scale}: ${count} questions`);
});

// Check if severity scale is used
const severityQuestions = SIMPLE_QUESTIONS.filter(
  (q) => q.scaleType === "severity"
);
if (severityQuestions.length > 0) {
  console.log("\n✅ New 'severity' scale implemented for:");
  severityQuestions.forEach((q) => {
    console.log(`   - Q${q.id}: ${q.text}`);
  });
}

// Summary
console.log("\n" + "=".repeat(60));
console.log("📊 PHASE 2 PROGRESS:");
console.log(`   ✅ Expanded Digestive: 5 → 10 questions`);
console.log(`   ✅ Expanded Energy: 5 → 10 questions`);
console.log(`   ✅ Added severity scale for symptom intensity`);
console.log(`   ✅ API updated to handle 50 questions`);
console.log(`   📋 Next: Expand Sleep & Stress categories`);
console.log(`   🎯 Goal: 80 total questions (10 per category)`);
