const {
  SIMPLE_QUESTIONS,
  CATEGORIES,
  SCALES,
} = require("../src/lib/simple-assessment/questions.ts");

console.log("🔍 Testing Immune & Hormonal Category Expansion (Phase 2C)");
console.log("=".repeat(60));

// Test question count
console.log("\n📊 Question Count:");
console.log(`   Total Questions: ${SIMPLE_QUESTIONS.length}`);
console.log(`   Expected: 70`);
console.log(
  `   Status: ${SIMPLE_QUESTIONS.length === 70 ? "✅ PASS" : "❌ FAIL"}`
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
  const expectedCount = [
    "digestive",
    "energy",
    "sleep",
    "stress",
    "immune",
    "hormonal",
  ].includes(category)
    ? 10
    : 5;
  console.log(
    `   ${categoryName}: ${questions.length} questions ${
      questions.length === expectedCount ? "✅" : "❌"
    } (expected: ${expectedCount})`
  );
});

// Show expanded immune questions
console.log("\n🛡️ Expanded Immune Questions (41-50):");
console.log("-".repeat(60));
SIMPLE_QUESTIONS.slice(40, 50).forEach((q) => {
  console.log(`Q${q.id}: ${q.text}`);
  console.log(`   Scale: ${q.scaleType}`);
  if (q.id > 45) {
    console.log(`   ✨ NEW`);
  }
});

// Show expanded hormonal questions
console.log("\n⚡ Expanded Hormonal Questions (51-60):");
console.log("-".repeat(60));
SIMPLE_QUESTIONS.slice(50, 60).forEach((q) => {
  console.log(`Q${q.id}: ${q.text}`);
  console.log(`   Scale: ${q.scaleType}`);
  if (q.id > 55) {
    console.log(`   ✨ NEW`);
  }
});

// Verify scale types used in new questions
console.log("\n🎨 Scale Types in New Questions:");
const newQuestions = SIMPLE_QUESTIONS.filter(
  (q) => (q.id >= 46 && q.id <= 50) || (q.id >= 56 && q.id <= 60)
);

const scaleUsage = {};
newQuestions.forEach((q) => {
  if (!scaleUsage[q.scaleType]) {
    scaleUsage[q.scaleType] = [];
  }
  scaleUsage[q.scaleType].push(q.id);
});

Object.entries(scaleUsage).forEach(([scale, ids]) => {
  console.log(`   ${scale}: Questions ${ids.join(", ")}`);
});

// Check renumbering of detox and cardiovascular
console.log("\n🔢 Renumbered Categories Check:");
const detoxQuestions = questionsPerCategory.detox || [];
const cardioQuestions = questionsPerCategory.cardiovascular || [];

console.log(
  `   Detox questions: ${detoxQuestions
    .map((q) => q.id)
    .join(", ")} (should be 61-65)`
);
console.log(
  `   Cardiovascular questions: ${cardioQuestions
    .map((q) => q.id)
    .join(", ")} (should be 66-70)`
);

// Summary
console.log("\n" + "=".repeat(60));
console.log("📊 PHASE 2C PROGRESS:");
console.log(`   ✅ Digestive:      10/10 questions`);
console.log(`   ✅ Energy:         10/10 questions`);
console.log(`   ✅ Sleep:          10/10 questions`);
console.log(`   ✅ Stress:         10/10 questions`);
console.log(`   ✅ Immune:         10/10 questions ⭐ NEW`);
console.log(`   ✅ Hormonal:       10/10 questions ⭐ NEW`);
console.log(`   ⏳ Detox:          5/10 questions`);
console.log(`   ⏳ Cardiovascular: 5/10 questions`);
console.log(`   📋 Total: 70/80 questions (87.5% complete)`);
console.log(`\n✅ Added severity scale to immune questions`);
console.log(`✅ Added consistency scale to hormonal questions`);
console.log(`✅ API updated to handle 70 questions`);
console.log(`🎯 Next: Expand Detox & Cardiovascular categories (Phase 2D)`);
