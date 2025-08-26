// Script to help expand from 40 to 80 questions
// We'll reorganize existing questions and add new ones

const fs = require("fs");
const path = require("path");

// Read current questions
const questionsFile = fs.readFileSync(
  path.join(__dirname, "../src/lib/simple-assessment/questions-40.backup.ts"),
  "utf-8"
);

// Extract the existing questions
const questionsMatch = questionsFile.match(
  /export const SIMPLE_QUESTIONS[^=]*= (\[[\s\S]*?\]);/
);
const questionsCode = questionsMatch ? questionsMatch[1] : "[]";

// Parse and evaluate the questions array
const cleanedQuestionsCode = questionsCode
  .replace(/scaleType:\s*"(\w+)"/g, 'scaleType: "$1"')
  .replace(/:\s*Question\[\]/g, "")
  .replace(/,\s*\]/g, "]");
const EXISTING_QUESTIONS = eval(cleanedQuestionsCode);

// Group existing questions by category
const questionsByCategory = {
  digestive: [],
  energy: [],
  sleep: [],
  stress: [],
  immune: [],
  hormonal: [],
  detox: [],
  cardiovascular: [],
};

EXISTING_QUESTIONS.forEach((q) => {
  questionsByCategory[q.category].push(q);
});

console.log("📊 Current Question Distribution:");
Object.entries(questionsByCategory).forEach(([cat, questions]) => {
  console.log(
    `   ${cat}: ${questions.length} questions (IDs: ${questions
      .map((q) => q.id)
      .join(", ")})`
  );
});

// Define the new 80-question structure
console.log("\n📈 New 80-Question Structure:");
console.log("   Digestive: Questions 1-10");
console.log("   Energy: Questions 11-20");
console.log("   Sleep: Questions 21-30");
console.log("   Stress: Questions 31-40");
console.log("   Immune: Questions 41-50");
console.log("   Hormonal: Questions 51-60");
console.log("   Detox: Questions 61-70");
console.log("   Cardiovascular: Questions 71-80");

// Define new questions to add
const newDigestiveQuestions = [
  {
    category: "digestive",
    text: "How often do you experience gas or flatulence?",
    scaleType: "frequencyReverse",
  },
  {
    category: "digestive",
    text: "How severe is your abdominal pain when it occurs?",
    scaleType: "level",
  },
  {
    category: "digestive",
    text: "How often do you experience nausea?",
    scaleType: "frequencyReverse",
  },
  {
    category: "digestive",
    text: "How strong are your food cravings?",
    scaleType: "level",
  },
  {
    category: "digestive",
    text: "How much do digestive issues affect your daily activities?",
    scaleType: "level",
  },
];

const newEnergyQuestions = [
  {
    category: "energy",
    text: "How good is your physical stamina throughout the day?",
    scaleType: "quality",
  },
  {
    category: "energy",
    text: "How often do you experience mental fatigue?",
    scaleType: "frequencyReverse",
  },
  {
    category: "energy",
    text: "How quickly do you recover from physical exertion?",
    scaleType: "quality",
  },
  {
    category: "energy",
    text: "How affected is your energy by seasonal changes?",
    scaleType: "level",
  },
  {
    category: "energy",
    text: "How dependent are you on caffeine for energy?",
    scaleType: "level",
  },
];

console.log("\n✅ Ready to create 80-question structure!");
console.log("   - 5 new digestive questions defined");
console.log("   - 5 new energy questions defined");
console.log("   - Existing questions will be renumbered");
console.log(
  "\nRun 'node scripts/generate-80-questions.js' to create the new file."
);
