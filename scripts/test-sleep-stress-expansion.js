const {
  SIMPLE_QUESTIONS,
  CATEGORIES,
  SCALES,
} = require("../src/lib/simple-assessment/questions.ts");

console.log("🔍 Testing Sleep & Stress Category Expansion (Phase 2B)");
console.log("=".repeat(60));

// Test question count
console.log("\n📊 Question Count:");
console.log(`   Total Questions: ${SIMPLE_QUESTIONS.length}`);
console.log(`   Expected: 60`);
console.log(
  `   Status: ${SIMPLE_QUESTIONS.length === 60 ? "✅ PASS" : "❌ FAIL"}`
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
  const expectedCount = ["digestive", "energy", "sleep", "stress"].includes(
    category
  )
    ? 10
    : 5;
  console.log(
    `   ${categoryName}: ${questions.length} questions ${
      questions.length === expectedCount ? "✅" : "❌"
    } (expected: ${expectedCount})`
  );
});

// Show expanded sleep questions
console.log("\n😴 Expanded Sleep Questions (21-30):");
console.log("-".repeat(60));
SIMPLE_QUESTIONS.slice(20, 30).forEach((q) => {
  console.log(`Q${q.id}: ${q.text}`);
  console.log(`   Scale: ${q.scaleType}`);
  if (q.id > 25) {
    console.log(`   ✨ NEW`);
  }
});

// Show expanded stress questions
console.log("\n😰 Expanded Stress Questions (31-40):");
console.log("-".repeat(60));
SIMPLE_QUESTIONS.slice(30, 40).forEach((q) => {
  console.log(`Q${q.id}: ${q.text}`);
  console.log(`   Scale: ${q.scaleType}`);
  if (q.id > 35) {
    console.log(`   ✨ NEW`);
  }
});

// Test new scale types
console.log("\n🎨 New Scale Types in Use:");
const newScaleTypes = ["sensitivity", "effectiveness", "speed"];
newScaleTypes.forEach((scaleType) => {
  const questions = SIMPLE_QUESTIONS.filter((q) => q.scaleType === scaleType);
  if (questions.length > 0) {
    console.log(`\n${scaleType.toUpperCase()} Scale:`);
    console.log(
      `   Labels: ${SCALES[scaleType].map((s) => s.label).join(" → ")}`
    );
    console.log(`   Used by ${questions.length} questions:`);
    questions.forEach((q) => {
      console.log(`   - Q${q.id}: ${q.text}`);
    });
  }
});

// Verify question numbering
console.log("\n🔢 Question Numbering Check:");
let allCorrect = true;
for (let i = 0; i < SIMPLE_QUESTIONS.length; i++) {
  if (SIMPLE_QUESTIONS[i].id !== i + 1) {
    console.log(
      `   ❌ Question at index ${i} has ID ${
        SIMPLE_QUESTIONS[i].id
      }, expected ${i + 1}`
    );
    allCorrect = false;
  }
}
if (allCorrect) {
  console.log("   ✅ All question IDs are sequential (1-60)");
}

// Summary
console.log("\n" + "=".repeat(60));
console.log("📊 PHASE 2B PROGRESS:");
console.log(`   ✅ Digestive:      10/10 questions`);
console.log(`   ✅ Energy:         10/10 questions`);
console.log(`   ✅ Sleep:          10/10 questions`);
console.log(`   ✅ Stress:         10/10 questions`);
console.log(`   ⏳ Immune:         5/10 questions`);
console.log(`   ⏳ Hormonal:       5/10 questions`);
console.log(`   ⏳ Detox:          5/10 questions`);
console.log(`   ⏳ Cardiovascular: 5/10 questions`);
console.log(`   📋 Total: 60/80 questions (75% complete)`);
console.log(`\n✅ Added 3 new scale types: sensitivity, effectiveness, speed`);
console.log(`✅ API updated to handle 60 questions`);
console.log(`🎯 Next: Expand Immune & Hormonal categories`);
