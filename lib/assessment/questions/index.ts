// Main Question Bank Index
// Combines all assessment modules

import { AssessmentQuestion } from '../types';
import { screeningQuestions } from './screening-questions';
import { assimilationQuestions } from './assimilation-questions';
import { defenserepairQuestions } from './defense-repair-questions';
import { energyQuestions } from './energy-questions';
import { biotransformationQuestions } from './biotransformation-questions';
import { transportQuestions } from './transport-questions';
import { communicationQuestions } from './communication-questions';
import { additionalCommunicationQuestions } from './communication-questions-additional';
import { structuralQuestions } from './structural-questions';

// Combine communication questions
const allCommunicationQuestions = [
  ...communicationQuestions,
  ...additionalCommunicationQuestions
];

// Export all questions combined
export const allQuestions: AssessmentQuestion[] = [
  ...screeningQuestions,        // 75 questions
  ...assimilationQuestions,     // 65 questions  
  ...defenserepairQuestions,    // 40 questions (from earlier today)
  ...energyQuestions,            // 49 questions (from earlier today)
  ...biotransformationQuestions,// 37 questions (from earlier today)
  ...transportQuestions,         // 27 questions (from earlier today)
  ...allCommunicationQuestions,  // 75 questions (from earlier today)
  ...structuralQuestions         // 32 questions (from earlier today)
];

// Export modules individually
export {
  screeningQuestions,
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
  SCREENING: 75,
  ASSIMILATION: 65,
  DEFENSE_REPAIR: 40,
  ENERGY: 49,
  BIOTRANSFORMATION: 37,
  TRANSPORT: 27,
  COMMUNICATION: 75,
  STRUCTURAL: 32,
  TOTAL: 400
};

// Get questions by module
export function getQuestionsByModule(module: string): AssessmentQuestion[] {
  switch(module) {
    case 'SCREENING':
      return screeningQuestions;
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
  const byModule = allQuestions.reduce((acc, q) => {
    acc[q.module] = (acc[q.module] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byType = allQuestions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const seedOilCount = getSeedOilQuestions().length;
  
  return {
    total,
    byModule,
    byType,
    seedOilCount,
    completionPercentage: Math.round((total / questionCounts.TOTAL) * 100)
  };
}

console.log('📊 Question Bank Loaded:', getQuestionStats().total, 'total questions');
