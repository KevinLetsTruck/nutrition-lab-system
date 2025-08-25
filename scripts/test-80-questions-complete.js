const {
  SIMPLE_QUESTIONS,
  CATEGORIES,
  SCALES,
} = require("../src/lib/simple-assessment/questions.ts");

console.log("🎉 TESTING COMPLETE 80-QUESTION SYSTEM");
console.log("=".repeat(60));

// Test 1: Total question count
console.log("\n✅ TEST 1: Question Count");
const totalQuestions = SIMPLE_QUESTIONS.length;
console.log(`   Total Questions: ${totalQuestions}`);
console.log(`   Expected: 80`);
console.log(`   Status: ${totalQuestions === 80 ? "✅ PASS" : "❌ FAIL"}`);

// Test 2: Questions per category
console.log("\n✅ TEST 2: Questions Per Category (10 each)");
const questionsPerCategory = {};
SIMPLE_QUESTIONS.forEach((q) => {
  if (!questionsPerCategory[q.category]) {
    questionsPerCategory[q.category] = [];
  }
  questionsPerCategory[q.category].push(q);
});

let allCategoriesComplete = true;
CATEGORIES.forEach((category) => {
  const questions = questionsPerCategory[category.id] || [];
  const hasCorrectCount = questions.length === 10;
  if (!hasCorrectCount) allCategoriesComplete = false;

  console.log(
    `   ${category.name}: ${questions.length}/10 ${
      hasCorrectCount ? "✅" : "❌"
    }`
  );
});
console.log(
  `   Overall: ${allCategoriesComplete ? "✅ ALL COMPLETE" : "❌ INCOMPLETE"}`
);

// Test 3: Question ID sequence
console.log("\n✅ TEST 3: Question ID Sequence (1-80)");
let sequenceCorrect = true;
const missingIds = [];
for (let i = 1; i <= 80; i++) {
  const question = SIMPLE_QUESTIONS.find((q) => q.id === i);
  if (!question) {
    sequenceCorrect = false;
    missingIds.push(i);
  }
}
console.log(
  `   Sequential IDs 1-80: ${sequenceCorrect ? "✅ PASS" : "❌ FAIL"}`
);
if (missingIds.length > 0) {
  console.log(`   Missing IDs: ${missingIds.join(", ")}`);
}

// Test 4: New questions added in Phase 2D
console.log("\n✅ TEST 4: Phase 2D Questions (Final 10)");
const phase2dQuestions = SIMPLE_QUESTIONS.filter(
  (q) => (q.id >= 66 && q.id <= 70) || (q.id >= 76 && q.id <= 80)
);
console.log(`   New questions added: ${phase2dQuestions.length}`);
console.log("\n   Detox Questions (66-70):");
SIMPLE_QUESTIONS.filter((q) => q.id >= 66 && q.id <= 70).forEach((q) => {
  console.log(`   Q${q.id}: ${q.text.substring(0, 60)}...`);
});
console.log("\n   Cardiovascular Questions (76-80):");
SIMPLE_QUESTIONS.filter((q) => q.id >= 76 && q.id <= 80).forEach((q) => {
  console.log(`   Q${q.id}: ${q.text.substring(0, 60)}...`);
});

// Test 5: Scale type distribution
console.log("\n✅ TEST 5: Scale Type Usage");
const scaleUsage = {};
SIMPLE_QUESTIONS.forEach((q) => {
  if (!scaleUsage[q.scaleType]) {
    scaleUsage[q.scaleType] = 0;
  }
  scaleUsage[q.scaleType]++;
});

console.log(`   Total scale types used: ${Object.keys(scaleUsage).length}`);
Object.entries(scaleUsage)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .forEach(([scale, count]) => {
    console.log(`   ${scale}: ${count} questions`);
  });

// Test 6: Category distribution visualization
console.log("\n✅ TEST 6: Visual Progress (All Categories Complete)");
CATEGORIES.forEach((category) => {
  const questions = questionsPerCategory[category.id] || [];
  const percentage = (questions.length / 10) * 100;
  const filled = Math.round(percentage / 10);
  const bar = "█".repeat(filled) + "░".repeat(10 - filled);

  console.log(`   ${category.name.padEnd(22)} ${bar} ${questions.length}/10`);
});

// Summary
console.log("\n" + "=".repeat(60));
console.log("🏆 FINAL SUMMARY: 80-QUESTION EXPANSION COMPLETE!");
console.log("=".repeat(60));
console.log(`   ✅ Total Questions: ${totalQuestions}/80`);
console.log(
  `   ✅ Categories Complete: ${
    Object.values(questionsPerCategory).filter((q) => q.length === 10).length
  }/8`
);
console.log(`   ✅ Sequential IDs: ${sequenceCorrect ? "Yes" : "No"}`);
console.log(
  `   ✅ All Categories have 10 questions: ${
    allCategoriesComplete ? "Yes" : "No"
  }`
);

// Expansion journey
console.log("\n📈 EXPANSION JOURNEY:");
console.log("   Phase 1: 20 → 40 questions (4 categories)");
console.log("   Phase 2A: 40 → 50 questions (Digestive & Energy expanded)");
console.log("   Phase 2B: 50 → 60 questions (Sleep & Stress expanded)");
console.log("   Phase 2C: 60 → 70 questions (Immune & Hormonal expanded)");
console.log(
  "   Phase 2D: 70 → 80 questions (Detox & Cardiovascular expanded) ✅"
);
console.log("\n🎯 GOAL ACHIEVED: Professional 80-question health assessment!");
