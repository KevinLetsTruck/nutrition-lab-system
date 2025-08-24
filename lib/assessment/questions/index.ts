// Main Question Bank Index
// Combines all assessment modules

import { AssessmentQuestion } from '../types';

// Original functional medicine modules
import { screeningQuestions } from './screening-questions';
import { additionalScreeningQuestionsPart2 } from './screening-questions-additional';
import { assimilationQuestionsChunk1 } from './assimilation-chunk1';
import { assimilationQuestionsChunk2 } from './assimilation-chunk2';
import { assimilationQuestionsChunk3 } from './assimilation-chunk3';
import { assimilationQuestionsChunk4 } from './assimilation-chunk4';
import { defenserepairQuestions } from './defense-repair-questions';
import { energyQuestions } from './energy-questions';
import { biotransformationQuestions } from './biotransformation-questions';
import { transportQuestions } from './transport-questions';
import { communicationQuestions } from './communication-questions';
import { additionalCommunicationQuestions } from './communication-questions-additional';
import { structuralQuestions } from './structural-questions';

// New body system modules
import { neurologicalQuestions } from './body-systems/neurological-questions';
import { digestiveQuestions } from './body-systems/digestive-questions';
import { cardiovascularQuestions } from './body-systems/cardiovascular-questions';
import { respiratoryQuestions } from './body-systems/respiratory-questions';
import { immuneQuestions } from './body-systems/immune-questions';
import { musculoskeletalQuestions } from './body-systems/musculoskeletal-questions';
import { endocrineQuestions } from './body-systems/endocrine-questions';
import { integumentaryQuestions } from './body-systems/integumentary-questions';
import { genitourinaryQuestions } from './body-systems/genitourinary-questions';
import { specialTopicsQuestions } from './body-systems/special-topics-questions';

// Combine screening questions
const allScreeningQuestions = [
  ...screeningQuestions,
  ...additionalScreeningQuestionsPart2
];

// Combine assimilation questions
const assimilationQuestions = [
  ...assimilationQuestionsChunk1,
  ...assimilationQuestionsChunk2,
  ...assimilationQuestionsChunk3,
  ...assimilationQuestionsChunk4
];

// Combine communication questions
const allCommunicationQuestions = [
  ...communicationQuestions,
  ...additionalCommunicationQuestions
];

// Export all questions combined - NEW BODY SYSTEMS APPROACH
export const allQuestions: AssessmentQuestion[] = [
  // Body system questions (246 total)
  ...neurologicalQuestions,      // 20 questions
  ...digestiveQuestions,          // 20 questions
  ...cardiovascularQuestions,    // 28 questions
  ...respiratoryQuestions,        // 26 questions
  ...immuneQuestions,             // 29 questions
  ...musculoskeletalQuestions,   // 28 questions
  ...endocrineQuestions,          // 30 questions
  ...integumentaryQuestions,      // 20 questions
  ...genitourinaryQuestions,      // 25 questions
  ...specialTopicsQuestions       // 20 questions
];

// Legacy questions for backwards compatibility
export const legacyQuestions: AssessmentQuestion[] = [
  ...allScreeningQuestions,       // ~100 questions
  ...assimilationQuestions,       // ~80 questions  
  ...defenserepairQuestions,      // 40 questions
  ...energyQuestions,             // 49 questions
  ...biotransformationQuestions, // 37 questions
  ...transportQuestions,          // 27 questions
  ...allCommunicationQuestions,   // 75 questions
  ...structuralQuestions          // 32 questions
];

// Export modules individually
export {
  // Body systems
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
  // Legacy modules
  screeningQuestions,
  additionalScreeningQuestionsPart2,
  assimilationQuestions,
  defenserepairQuestions,
  energyQuestions,
  biotransformationQuestions,
  transportQuestions,
  communicationQuestions,
  additionalCommunicationQuestions,
  structuralQuestions
};

// Module question counts for validation
export const questionCounts = {
  // Body systems
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
  // Legacy modules
  SCREENING: 100,
  ASSIMILATION: 80,
  DEFENSE_REPAIR: 40,
  ENERGY: 49,
  BIOTRANSFORMATION: 37,
  TRANSPORT: 27,
  COMMUNICATION: 75,
  STRUCTURAL: 32,
  BODY_SYSTEM_TOTAL: 246,
  LEGACY_TOTAL: 440
};

// Get questions by body system
export function getQuestionsByBodySystem(system: string): AssessmentQuestion[] {
  switch(system) {
    case 'NEUROLOGICAL':
      return neurologicalQuestions;
    case 'DIGESTIVE':
      return digestiveQuestions;
    case 'CARDIOVASCULAR':
      return cardiovascularQuestions;
    case 'RESPIRATORY':
      return respiratoryQuestions;
    case 'IMMUNE':
      return immuneQuestions;
    case 'MUSCULOSKELETAL':
      return musculoskeletalQuestions;
    case 'ENDOCRINE':
      return endocrineQuestions;
    case 'INTEGUMENTARY':
      return integumentaryQuestions;
    case 'GENITOURINARY':
      return genitourinaryQuestions;
    case 'SPECIAL_TOPICS':
      return specialTopicsQuestions;
    default:
      return [];
  }
}

// Get questions by module (legacy)
export function getQuestionsByModule(module: string): AssessmentQuestion[] {
  switch(module) {
    case 'SCREENING':
      return allScreeningQuestions;
    case 'ASSIMILATION':
      return assimilationQuestions;
    case 'DEFENSE_REPAIR':
      return defenserepairQuestions;
    case 'ENERGY':
      return energyQuestions;
    case 'BIOTRANSFORMATION':
      return biotransformationQuestions;
    case 'TRANSPORT':
      return transportQuestions;
    case 'COMMUNICATION':
      return allCommunicationQuestions;
    case 'STRUCTURAL':
      return structuralQuestions;
    default:
      return [];
  }
}

// Validate question IDs are unique
export function validateQuestionIds(): { valid: boolean; duplicates: string[] } {
  const ids = allQuestions.map(q => q.id);
  const uniqueIds = new Set(ids);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  
  return {
    valid: ids.length === uniqueIds.size,
    duplicates
  };
}

// Get seed oil questions
export function getSeedOilQuestions(): AssessmentQuestion[] {
  return allQuestions.filter(q => 
    q.id?.includes('_SO') || q.category === 'SEED_OIL' || q.seedOilRelevant
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
    completionPercentage: Math.round((total / questionCounts.BODY_SYSTEM_TOTAL) * 100)
  };
}

console.log('📊 Question Bank Loaded:', getQuestionStats().total, 'total questions (Body Systems)');
