#!/usr/bin/env node

console.log(`
🧪 Testing Conditional Logic Fix
================================

1. Open your browser to: http://localhost:3000/test-complete-flow
2. Open DevTools Console (F12 or Cmd+Option+I)
3. Watch for these console logs:

When you answer questions:
- 💾 Saving response for [question-id]: "[your-answer]"
- YES_NO answer changed to: "[yes/no]"

When checking conditional logic:
- 🔍 Checking conditional for essential-food-list:
-    Depends on: essential-food-sensitivities
-    Show if: yes
-    Response value: [your answer]
-    Normalized comparison: "[your answer]" === "yes" = [true/false]
- ✅ Showing or ❌ Skipping

4. Test the food sensitivity question:
   - Answer "No" → Food list should be SKIPPED
   - Answer "Yes" → Food list should APPEAR

Expected Console Output for "No":
=================================
💾 Saving response for essential-food-sensitivities: "no"
🔍 Checking conditional for essential-food-list:
   Depends on: essential-food-sensitivities
   Show if: yes
   Found response: {questionId: "essential-food-sensitivities", value: "no"}
   Response value: no
   Normalized comparison: "no" === "yes" = false
❌ Skipping essential-food-list
➡️ Moving to question: essential-chronic-conditions

`);

// Check if the essential questions file has the correct format
const fs = require("fs");
const path = require("path");

const essentialQuestionsPath = path.join(
  __dirname,
  "../lib/assessment/essential-questions.ts"
);
const content = fs.readFileSync(essentialQuestionsPath, "utf8");

// Check for the conditional logic
if (content.includes('showIf: "yes"')) {
  console.log(
    '✅ Essential questions file has lowercase "yes" for conditional logic'
  );
} else if (content.includes('showIf: "YES"')) {
  console.log(
    '❌ WARNING: Essential questions file still has uppercase "YES" - conditional logic may fail!'
  );
}

// Check for the correct question IDs
if (
  content.includes('id: "essential-food-sensitivities"') &&
  content.includes('dependsOn: "essential-food-sensitivities"')
) {
  console.log("✅ Question IDs match correctly");
} else {
  console.log(
    "❌ WARNING: Question IDs may not match - check essential-questions.ts"
  );
}

console.log(
  '\n📝 Remember: The key fix is that YES_NO questions now save lowercase values ("yes"/"no")'
);
console.log("   and the conditional logic checks for lowercase values too.\n");
