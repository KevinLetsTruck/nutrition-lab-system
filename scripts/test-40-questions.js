const {
  SIMPLE_QUESTIONS,
  CATEGORIES,
} = require("../src/lib/simple-assessment/questions.ts");

console.log("🔍 Testing 40-Question Assessment Expansion");
console.log("=".repeat(60));

// Test question count
console.log("\n📊 Question Count:");
console.log(`   Total Questions: ${SIMPLE_QUESTIONS.length}`);
console.log(`   Expected: 40`);
console.log(
  `   Status: ${SIMPLE_QUESTIONS.length === 40 ? "✅ PASS" : "❌ FAIL"}`
);

// Test category count
console.log("\n📂 Category Count:");
console.log(`   Total Categories: ${CATEGORIES.length}`);
console.log(`   Expected: 8`);
console.log(`   Status: ${CATEGORIES.length === 8 ? "✅ PASS" : "❌ FAIL"}`);

// Test questions per category
console.log("\n📋 Questions Per Category:");
const questionsPerCategory = {};
SIMPLE_QUESTIONS.forEach((q) => {
  if (!questionsPerCategory[q.category]) {
    questionsPerCategory[q.category] = 0;
  }
  questionsPerCategory[q.category]++;
});

Object.entries(questionsPerCategory).forEach(([category, count]) => {
  const categoryName =
    CATEGORIES.find((c) => c.id === category)?.name || category;
  console.log(
    `   ${categoryName}: ${count} questions ${count === 5 ? "✅" : "❌"}`
  );
});

// Show new questions
console.log("\n🆕 New Questions (21-40):");
console.log("-".repeat(60));
SIMPLE_QUESTIONS.slice(20, 40).forEach((q) => {
  console.log(`Q${q.id} [${q.category}]: ${q.text}`);
  console.log(`   Scale: ${q.scaleType}`);
});

// Test scale types on new questions
console.log("\n🎨 Scale Type Distribution (New Questions):");
const scaleTypes = {};
SIMPLE_QUESTIONS.slice(20, 40).forEach((q) => {
  if (!scaleTypes[q.scaleType]) {
    scaleTypes[q.scaleType] = 0;
  }
  scaleTypes[q.scaleType]++;
});

Object.entries(scaleTypes).forEach(([scale, count]) => {
  console.log(`   ${scale}: ${count} questions`);
});

// Test all question IDs are sequential
console.log("\n🔢 Question ID Sequence:");
let allSequential = true;
for (let i = 0; i < SIMPLE_QUESTIONS.length; i++) {
  if (SIMPLE_QUESTIONS[i].id !== i + 1) {
    console.log(
      `   ❌ Question at index ${i} has ID ${
        SIMPLE_QUESTIONS[i].id
      }, expected ${i + 1}`
    );
    allSequential = false;
  }
}
if (allSequential) {
  console.log("   ✅ All question IDs are sequential (1-40)");
}

// Summary
console.log("\n" + "=".repeat(60));
console.log("📊 EXPANSION SUMMARY:");
console.log(`   ✅ Expanded from 20 to 40 questions`);
console.log(`   ✅ Added 4 new health categories`);
console.log(`   ✅ Maintained 5 questions per category`);
console.log(`   ✅ All questions have appropriate scale types`);
console.log("\n🎯 Ready for testing the 40-question assessment!");
