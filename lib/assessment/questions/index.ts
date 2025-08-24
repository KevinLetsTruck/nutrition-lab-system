// Main Question Bank Index
// Body System Questions Only - No Legacy Code

import { AssessmentQuestion } from "../types";

// Body system modules
import { neurologicalQuestions } from "./body-systems/neurological-questions";
import { digestiveQuestions } from "./body-systems/digestive-questions";
import { cardiovascularQuestions } from "./body-systems/cardiovascular-questions";
import { respiratoryQuestions } from "./body-systems/respiratory-questions";
import { immuneQuestions } from "./body-systems/immune-questions";
import { musculoskeletalQuestions } from "./body-systems/musculoskeletal-questions";
import { endocrineQuestions } from "./body-systems/endocrine-questions";
import { integumentaryQuestions } from "./body-systems/integumentary-questions";
import { genitourinaryQuestions } from "./body-systems/genitourinary-questions";
import { specialTopicsQuestions } from "./body-systems/special-topics-questions";

// Export all questions combined - BODY SYSTEMS ONLY
export const allQuestions: AssessmentQuestion[] = [
  ...neurologicalQuestions,      // 20 questions
  ...digestiveQuestions,          // 20 questions
  ...cardiovascularQuestions,    // 28 questions
  ...respiratoryQuestions,        // 26 questions
  ...immuneQuestions,             // 29 questions
  ...musculoskeletalQuestions,   // 28 questions
  ...endocrineQuestions,          // 30 questions
  ...integumentaryQuestions,      // 20 questions
  ...genitourinaryQuestions,      // 25 questions
  ...specialTopicsQuestions,      // 20 questions
];

// Export modules individually
export {
  neurologicalQuestions,
  digestiveQuestions,
  cardiovascularQuestions,
  respiratoryQuestions,
  immuneQuestions,
  musculoskeletalQuestions,
  endocrineQuestions,
  integumentaryQuestions,
  genitourinaryQuestions,
  specialTopicsQuestions,
};

// Body system question counts for validation
export const questionCounts = {
  NEUROLOGICAL: 20,
  DIGESTIVE: 20,
  CARDIOVASCULAR: 28,
  RESPIRATORY: 26,
  IMMUNE: 29,
  MUSCULOSKELETAL: 28,
  ENDOCRINE: 30,
  INTEGUMENTARY: 20,
  GENITOURINARY: 25,
  SPECIAL_TOPICS: 20,
  TOTAL: 246
};

// Get questions by body system
export function getQuestionsByBodySystem(system: string): AssessmentQuestion[] {
  switch (system) {
    case "NEUROLOGICAL":
      return neurologicalQuestions;
    case "DIGESTIVE":
      return digestiveQuestions;
    case "CARDIOVASCULAR":
      return cardiovascularQuestions;
    case "RESPIRATORY":
      return respiratoryQuestions;
    case "IMMUNE":
      return immuneQuestions;
    case "MUSCULOSKELETAL":
      return musculoskeletalQuestions;
    case "ENDOCRINE":
      return endocrineQuestions;
    case "INTEGUMENTARY":
      return integumentaryQuestions;
    case "GENITOURINARY":
      return genitourinaryQuestions;
    case "SPECIAL_TOPICS":
      return specialTopicsQuestions;
    default:
      return [];
  }
}

// Validate question IDs are unique
export function validateQuestionIds(): {
  valid: boolean;
  duplicates: string[];
} {
  const ids = allQuestions.map((q) => q.id);
  const uniqueIds = new Set(ids);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  return {
    valid: ids.length === uniqueIds.size,
    duplicates,
  };
}

// Get seed oil questions
export function getSeedOilQuestions(): AssessmentQuestion[] {
  return allQuestions.filter(
    (q) =>
      q.id?.includes("_SO") || q.category === "SEED_OIL" || q.seedOilRelevant
  );
}

// Summary statistics
export function getQuestionStats() {
  const total = allQuestions.length;
  const byBodySystem = allQuestions.reduce((acc, q) => {
    if (q.bodySystem) {
      acc[q.bodySystem] = (acc[q.bodySystem] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const byType = allQuestions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const seedOilCount = getSeedOilQuestions().length;

  return {
    total,
    byBodySystem,
    byType,
    seedOilCount,
  };
}

console.log(
  "📊 Body System Questions Loaded:",
  getQuestionStats().total,
  "total questions"
);