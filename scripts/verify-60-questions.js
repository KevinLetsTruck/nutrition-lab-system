const {
  SIMPLE_QUESTIONS,
  CATEGORIES,
  SCALES,
} = require("../src/lib/simple-assessment/questions.ts");

console.log("📊 Verifying 60-Question System Status");
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

// Verify question ID sequence
console.log("\n🔢 Question ID Verification:");
let allSequential = true;
let gaps = [];
for (let i = 0; i < SIMPLE_QUESTIONS.length; i++) {
  if (SIMPLE_QUESTIONS[i].id !== i + 1) {
    allSequential = false;
    gaps.push(i + 1);
  }
}
console.log(`   Sequential IDs: ${allSequential ? "✅ Yes" : "❌ No"}`);
if (!allSequential) {
  console.log(`   Missing IDs: ${gaps.join(", ")}`);
}

// Phase 2 expansion progress
console.log("\n🚀 Phase 2 Expansion Progress:");
const phase2Progress = [
  { phase: "2A", categories: ["Digestive", "Energy"], status: "✅ Complete" },
  { phase: "2B", categories: ["Sleep", "Stress"], status: "✅ Complete" },
  { phase: "2C", categories: ["Immune", "Hormonal"], status: "⏳ Next" },
  {
    phase: "2D",
    categories: ["Detox", "Cardiovascular"],
    status: "⏳ Pending",
  },
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
console.log(`   Categories Complete: ${completedCategories}/8`);
console.log(
  `   Questions Complete: ${
    SIMPLE_QUESTIONS.length
  }/80 (${totalProgress.toFixed(0)}%)`
);
console.log(`   Next Milestone: 70 questions (Phase 2C)`);
console.log(`   Final Goal: 80 questions (100%)`);
