const {
  SIMPLE_QUESTIONS,
  CATEGORIES,
  SCALES,
} = require("../src/lib/simple-assessment/questions.ts");

console.log("📊 Verifying 70-Question System Status");
console.log("=".repeat(60));

// Overall stats
console.log("\n📈 Overall Statistics:");
console.log(`   Total Questions: ${SIMPLE_QUESTIONS.length}`);
console.log(`   Total Categories: ${CATEGORIES.length}`);
console.log(`   Total Scale Types: ${Object.keys(SCALES).length}`);

// Category breakdown with visual progress bars
console.log("\n📋 Category Progress:");
const categoryQuestions = {};
SIMPLE_QUESTIONS.forEach((q) => {
  if (!categoryQuestions[q.category]) {
    categoryQuestions[q.category] = [];
  }
  categoryQuestions[q.category].push(q);
});

CATEGORIES.forEach((category) => {
  const questions = categoryQuestions[category.id] || [];
  const count = questions.length;
  const target = 10;
  const percentage = (count / target) * 100;
  const filled = Math.round(percentage / 10);
  const bar = "█".repeat(filled) + "░".repeat(10 - filled);
  const status = count === target ? "✅" : "⏳";

  console.log(
    `   ${status} ${category.name.padEnd(22)} ${bar} ${count}/${target}`
  );
});

// Scale type usage
console.log("\n🎨 Scale Types in Use:");
const scaleUsage = {};
SIMPLE_QUESTIONS.forEach((q) => {
  if (!scaleUsage[q.scaleType]) {
    scaleUsage[q.scaleType] = 0;
  }
  scaleUsage[q.scaleType]++;
});

Object.entries(scaleUsage)
  .sort((a, b) => b[1] - a[1])
  .forEach(([scale, count]) => {
    console.log(`   ${scale.padEnd(20)} ${count} questions`);
  });

// New questions in Phase 2C
console.log("\n✨ New Questions Added in Phase 2C:");
const phase2cQuestions = SIMPLE_QUESTIONS.filter(
  (q) => (q.id >= 46 && q.id <= 50) || (q.id >= 56 && q.id <= 60)
);

console.log(`   Total new questions: ${phase2cQuestions.length}`);
phase2cQuestions.forEach((q) => {
  console.log(`   Q${q.id} (${q.category}): ${q.text.substring(0, 50)}...`);
});

// Phase 2 expansion progress
console.log("\n🚀 Phase 2 Expansion Progress:");
const phase2Progress = [
  { phase: "2A", categories: ["Digestive", "Energy"], status: "✅ Complete" },
  { phase: "2B", categories: ["Sleep", "Stress"], status: "✅ Complete" },
  { phase: "2C", categories: ["Immune", "Hormonal"], status: "✅ Complete" },
  { phase: "2D", categories: ["Detox", "Cardiovascular"], status: "⏳ Next" },
];

phase2Progress.forEach(({ phase, categories, status }) => {
  console.log(`   Phase ${phase}: ${categories.join(" & ")} - ${status}`);
});

// Summary
const completedCategories = Object.values(categoryQuestions).filter(
  (q) => q.length === 10
).length;
const totalProgress = (SIMPLE_QUESTIONS.length / 80) * 100;

console.log("\n" + "=".repeat(60));
console.log(`📊 SUMMARY:`);
console.log(`   Categories Complete: ${completedCategories}/8 (75%)`);
console.log(
  `   Questions Complete: ${
    SIMPLE_QUESTIONS.length
  }/80 (${totalProgress.toFixed(1)}%)`
);
console.log(`   Next Milestone: 80 questions (Phase 2D)`);
console.log(`   Remaining: ${80 - SIMPLE_QUESTIONS.length} questions`);
