const fs = require("fs");
const path = require("path");

// List of duplicate question IDs to remove (keeping the better version)
const duplicatesToRemove = [
  "COM118", // Duplicate of SCR044: Rate your overall stress level
  "ENE024", // Similar to SCR051: unexplained weight changes
  "BIO004", // Duplicate of SCR056: mold exposure
  "COM015", // Duplicate of SCR050: mood swings
  "STR001", // Duplicate of SCR004: joint pain
  "ENE026", // Similar to DEF031: body temperature
  "COM087", // Similar to ENE010: refreshed upon waking
  "BIO018", // Similar to SCR061: EMF sensitivity
  "DEF008", // Similar to SCR041: wound healing
  "DEF025", // Similar to SCR044: stress level
  "ENE015", // Duplicate of SCR052: sugar cravings
  "COM013", // Duplicate of SCR066: handle stress
];

// Question files to process
const questionFiles = [
  "screening-questions.ts",
  "screening-questions-additional.ts",
  "assimilation-chunk1.ts",
  "assimilation-chunk2.ts",
  "assimilation-chunk3.ts",
  "assimilation-chunk4.ts",
  "defense-repair-questions.ts",
  "energy-questions.ts",
  "biotransformation-questions.ts",
  "transport-questions.ts",
  "communication-questions.ts",
  "communication-questions-additional.ts",
  "structural-questions.ts",
];

function removeQuestionFromFile(filePath, questionId) {
  let content = fs.readFileSync(filePath, "utf8");

  // Pattern to match a complete question object
  const questionPattern = new RegExp(
    `\\{[^{}]*id:\\s*["']${questionId}["'][^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}\\s*,?`,
    "gs"
  );

  const originalLength = content.length;
  content = content.replace(questionPattern, "");

  // Clean up any double commas
  content = content.replace(/,\s*,/g, ",");

  // Clean up trailing comma before closing bracket
  content = content.replace(/,\s*\]/g, "]");

  if (content.length < originalLength) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

console.log("Removing duplicate questions...\n");

const questionsDir = path.join(__dirname, "../lib/assessment/questions");
let removedCount = 0;

duplicatesToRemove.forEach((questionId) => {
  let removed = false;

  questionFiles.forEach((file) => {
    const filePath = path.join(questionsDir, file);
    if (fs.existsSync(filePath)) {
      if (removeQuestionFromFile(filePath, questionId)) {
        console.log(`✅ Removed ${questionId} from ${file}`);
        removed = true;
        removedCount++;
      }
    }
  });

  if (!removed) {
    console.log(`❌ ${questionId} not found in any file`);
  }
});

console.log(`\n✅ Removed ${removedCount} duplicate questions`);
console.log("Remember to reseed the database after this change!");
