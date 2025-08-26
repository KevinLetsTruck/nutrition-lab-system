// Generate the new 80-question structure
const fs = require("fs");
const path = require("path");

// Read the backup file to get scales and categories
const questionsFile = fs.readFileSync(
  path.join(__dirname, "../src/lib/simple-assessment/questions-40.backup.ts"),
  "utf-8"
);

// Extract scales and categories sections
const scalesMatch = questionsFile.match(/export const SCALES = ({[\s\S]*?});/);
const categoriesMatch = questionsFile.match(
  /export const CATEGORIES = (\[[\s\S]*?\]);/
);

// Create the new 80-question array
const questions = [];
let id = 1;

// Category 1: Digestive (Questions 1-10)
// Existing 5 questions
questions.push(
  {
    id: id++,
    category: "digestive",
    text: "How often do you experience bloating after meals?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "digestive",
    text: "How regular are your bowel movements?",
    scaleType: "regularity",
  },
  {
    id: id++,
    category: "digestive",
    text: "How often do you have heartburn or acid reflux?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "digestive",
    text: "How well do you digest fatty foods?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "digestive",
    text: "How satisfied do you feel after eating?",
    scaleType: "satisfaction",
  }
);

// New digestive questions (6-10)
questions.push(
  {
    id: id++,
    category: "digestive",
    text: "How often do you experience gas or flatulence?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "digestive",
    text: "How severe is your abdominal pain when it occurs?",
    scaleType: "level",
  },
  {
    id: id++,
    category: "digestive",
    text: "How often do you experience nausea?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "digestive",
    text: "How strong are your food cravings?",
    scaleType: "level",
  },
  {
    id: id++,
    category: "digestive",
    text: "How much do digestive issues affect your daily activities?",
    scaleType: "level",
  }
);

// Category 2: Energy (Questions 11-20)
// Existing 5 questions
questions.push(
  {
    id: id++,
    category: "energy",
    text: "How consistent is your energy throughout the day?",
    scaleType: "consistency",
  },
  {
    id: id++,
    category: "energy",
    text: "How energetic do you feel when you wake up?",
    scaleType: "energy",
  },
  {
    id: id++,
    category: "energy",
    text: "How often do you experience afternoon energy crashes?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "energy",
    text: "How well can you maintain focus during work?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "energy",
    text: "How motivated do you feel to exercise regularly?",
    scaleType: "level",
  }
);

// New energy questions (16-20)
questions.push(
  {
    id: id++,
    category: "energy",
    text: "How good is your physical stamina throughout the day?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "energy",
    text: "How often do you experience mental fatigue?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "energy",
    text: "How quickly do you recover from physical exertion?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "energy",
    text: "How affected is your energy by seasonal changes?",
    scaleType: "level",
  },
  {
    id: id++,
    category: "energy",
    text: "How dependent are you on caffeine for energy?",
    scaleType: "level",
  }
);

// Category 3: Sleep (Questions 21-30)
// Moving existing sleep questions here and adding 5 new ones
questions.push(
  {
    id: id++,
    category: "sleep",
    text: "How easily do you fall asleep at night?",
    scaleType: "ease",
  },
  {
    id: id++,
    category: "sleep",
    text: "How often do you wake up during the night?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "sleep",
    text: "How refreshed do you feel upon waking?",
    scaleType: "level",
  },
  {
    id: id++,
    category: "sleep",
    text: "How consistent is your sleep schedule?",
    scaleType: "consistency",
  },
  {
    id: id++,
    category: "sleep",
    text: "How well do you sleep without interruptions?",
    scaleType: "quality",
  }
);

// New sleep questions
questions.push(
  {
    id: id++,
    category: "sleep",
    text: "How deep is your sleep quality?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "sleep",
    text: "How often do you remember your dreams?",
    scaleType: "frequency",
  },
  {
    id: id++,
    category: "sleep",
    text: "How often do you experience restless legs at night?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "sleep",
    text: "How often do you snore or have breathing issues during sleep?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "sleep",
    text: "How sensitive are you to room temperature when sleeping?",
    scaleType: "level",
  }
);

// Category 4: Stress (Questions 31-40)
// Moving existing stress questions here and adding 5 new ones
questions.push(
  {
    id: id++,
    category: "stress",
    text: "How well do you handle daily stress?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "stress",
    text: "How often do you feel overwhelmed?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "stress",
    text: "How relaxed do you feel at the end of the day?",
    scaleType: "level",
  },
  {
    id: id++,
    category: "stress",
    text: "How well do you manage work pressure?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "stress",
    text: "How balanced does your life feel overall?",
    scaleType: "level",
  }
);

// New stress questions
questions.push(
  {
    id: id++,
    category: "stress",
    text: "How high are your anxiety levels?",
    scaleType: "level",
  },
  {
    id: id++,
    category: "stress",
    text: "How often do you experience racing thoughts or worry?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "stress",
    text: "How quickly do you recover from stressful events?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "stress",
    text: "How often do you experience physical symptoms from stress?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "stress",
    text: "How effective are your stress coping strategies?",
    scaleType: "quality",
  }
);

// Categories 5-8 will be kept with their existing 5 questions for now
// But renumbered to fit the new structure

// Category 5: Immune (Questions 41-50)
questions.push(
  {
    id: id++,
    category: "immune",
    text: "How often do you get colds or flu?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "immune",
    text: "How quickly do you recover from infections?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "immune",
    text: "How often do you experience allergic reactions?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "immune",
    text: "How strong is your immune system overall?",
    scaleType: "level",
  },
  {
    id: id++,
    category: "immune",
    text: "How often do you need antibiotics?",
    scaleType: "frequencyReverse",
  }
);

// Category 6: Hormonal (Questions 51-60)
questions.push(
  {
    id: id++,
    category: "hormonal",
    text: "How stable are your moods throughout the month?",
    scaleType: "consistency",
  },
  {
    id: id++,
    category: "hormonal",
    text: "How often do you experience hot flashes or night sweats?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "hormonal",
    text: "How balanced is your appetite and weight?",
    scaleType: "level",
  },
  {
    id: id++,
    category: "hormonal",
    text: "How healthy is your libido?",
    scaleType: "level",
  },
  {
    id: id++,
    category: "hormonal",
    text: "How regular are your menstrual cycles? (if applicable)",
    scaleType: "regularity",
  }
);

// Category 7: Detox (Questions 61-70)
questions.push(
  {
    id: id++,
    category: "detox",
    text: "How often do you experience headaches?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "detox",
    text: "How clear is your skin?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "detox",
    text: "How often do you feel chemically sensitive?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "detox",
    text: "How well does your body eliminate toxins?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "detox",
    text: "How often do you experience brain fog?",
    scaleType: "frequencyReverse",
  }
);

// Category 8: Cardiovascular (Questions 71-80)
questions.push(
  {
    id: id++,
    category: "cardiovascular",
    text: "How stable is your blood pressure?",
    scaleType: "consistency",
  },
  {
    id: id++,
    category: "cardiovascular",
    text: "How often do you experience chest discomfort?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "cardiovascular",
    text: "How good is your circulation?",
    scaleType: "quality",
  },
  {
    id: id++,
    category: "cardiovascular",
    text: "How often do you get short of breath?",
    scaleType: "frequencyReverse",
  },
  {
    id: id++,
    category: "cardiovascular",
    text: "How strong is your cardiovascular endurance?",
    scaleType: "level",
  }
);

// Verify we have 50 questions so far
console.log(`Generated ${questions.length} questions so far (should be 50)`);

// Generate the new TypeScript file content
let newContent = scalesMatch ? scalesMatch[0] + "\n\n" : "";
newContent += "export type ScaleType = keyof typeof SCALES;\n\n";
newContent += "export interface Question {\n";
newContent += "  id: number;\n";
newContent += "  category: string;\n";
newContent += "  text: string;\n";
newContent += "  scaleType: ScaleType;\n";
newContent += "}\n\n";
newContent += "export const SIMPLE_QUESTIONS: Question[] = [\n";

// Add all questions
questions.forEach((q, index) => {
  const comment =
    index % 10 === 0
      ? `  // ${
          q.category.charAt(0).toUpperCase() + q.category.slice(1)
        } (Questions ${q.id}-${
          q.id + 9 > questions.length ? questions.length : q.id + 9
        })\n`
      : "";
  if (comment) newContent += comment;

  newContent += "  {\n";
  newContent += `    id: ${q.id},\n`;
  newContent += `    category: "${q.category}",\n`;
  newContent += `    text: "${q.text}",\n`;
  newContent += `    scaleType: "${q.scaleType}",${
    q.scaleType.includes("Reverse") ? " // Lower frequency is better" : ""
  }\n`;
  newContent += "  },\n";

  if ((index + 1) % 5 === 0 && index < questions.length - 1) {
    newContent += "\n";
  }
});

newContent += "];\n\n";
newContent += "// Legacy labels - kept for backwards compatibility\n";
newContent += "export const SCORING_LABELS = [\n";
newContent += '  { value: 1, label: "Very Poor" },\n';
newContent += '  { value: 2, label: "Poor" },\n';
newContent += '  { value: 3, label: "Average" },\n';
newContent += '  { value: 4, label: "Good" },\n';
newContent += '  { value: 5, label: "Excellent" },\n';
newContent += "];\n\n";
newContent += categoriesMatch ? categoriesMatch[0] : "";

// Write the partial file (50 questions)
fs.writeFileSync(
  path.join(__dirname, "../src/lib/simple-assessment/questions-partial-80.ts"),
  newContent
);

console.log("\n✅ Created questions-partial-80.ts with:");
console.log("   - 10 digestive questions");
console.log("   - 10 energy questions");
console.log("   - 10 sleep questions");
console.log("   - 10 stress questions");
console.log("   - 5 immune questions (needs 5 more)");
console.log("   - 5 hormonal questions (needs 5 more)");
console.log("   - 5 detox questions (needs 5 more)");
console.log("   - 5 cardiovascular questions (needs 5 more)");
console.log(
  "\nTotal: 50 questions generated, 30 more needed for complete 80-question system."
);
