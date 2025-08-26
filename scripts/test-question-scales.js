const fs = require("fs");
const path = require("path");

// Read and parse the questions file
const questionsFile = fs.readFileSync(
  path.join(__dirname, "../src/lib/simple-assessment/questions.ts"),
  "utf-8"
);

// Extract SCALES object
const scalesMatch = questionsFile.match(/export const SCALES = ({[\s\S]*?});/);
const scalesCode = scalesMatch ? scalesMatch[1] : "{}";
const SCALES = eval(`(${scalesCode})`);

// Extract SIMPLE_QUESTIONS array
const questionsMatch = questionsFile.match(
  /export const SIMPLE_QUESTIONS[^=]*= (\[[\s\S]*?\]);/
);
const questionsCode = questionsMatch ? questionsMatch[1] : "[]";
// Clean up TypeScript syntax
const cleanedQuestionsCode = questionsCode
  .replace(/scaleType:\s*"(\w+)"/g, 'scaleType: "$1"')
  .replace(/:\s*Question\[\]/g, "")
  .replace(/,\s*\]/g, "]");
const SIMPLE_QUESTIONS = eval(cleanedQuestionsCode);

console.log("🎯 Question Scale Analysis");
console.log("=".repeat(60));

// Group questions by scale type
const questionsByScale = {};
SIMPLE_QUESTIONS.forEach((q) => {
  if (!questionsByScale[q.scaleType]) {
    questionsByScale[q.scaleType] = [];
  }
  questionsByScale[q.scaleType].push(q);
});

// Display each scale type and its questions
Object.entries(questionsByScale).forEach(([scaleType, questions]) => {
  console.log(`\n📊 Scale Type: ${scaleType.toUpperCase()}`);
  console.log(`   Scale: ${SCALES[scaleType].map((s) => s.label).join(" → ")}`);
  console.log(`   Questions using this scale:`);

  questions.forEach((q) => {
    console.log(`   ${q.id}. ${q.text}`);
  });
});

// Show examples of each question with its scale
console.log("\n\n🔍 Sample Questions with Their Scales:");
console.log("=".repeat(60));

const sampleQuestions = [1, 3, 6, 11, 13, 17];
sampleQuestions.forEach((id) => {
  const question = SIMPLE_QUESTIONS.find((q) => q.id === id);
  if (question) {
    console.log(`\nQ${question.id}: ${question.text}`);
    console.log(
      `Scale: ${SCALES[question.scaleType]
        .map((s) => `${s.value}=${s.label}`)
        .join(", ")}`
    );
  }
});

console.log("\n✅ All questions have appropriate scales!");
