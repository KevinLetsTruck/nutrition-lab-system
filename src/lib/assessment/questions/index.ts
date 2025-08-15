import { screeningQuestions } from './screening-questions';
// Import other modules as you create them
// import { assimilationQuestions } from './assimilation-questions';
// import { defenseRepairQuestions } from './defense-repair-questions';
// import { energyQuestions } from './energy-questions';
// import { biotransformationQuestions } from './biotransformation-questions';
// import { transportQuestions } from './transport-questions';
// import { communicationQuestions } from './communication-questions';
// import { structuralQuestions } from './structural-questions';

import { AssessmentQuestion, QuestionCategory, FunctionalModule } from '../types';

// Combine all questions into one bank
export const questionBank: AssessmentQuestion[] = [
  ...screeningQuestions,
  // ...assimilationQuestions,
  // ...defenseRepairQuestions,
  // ...energyQuestions,
  // ...biotransformationQuestions,
  // ...transportQuestions,
  // ...communicationQuestions,
  // ...structuralQuestions,
];

// Helper functions for question management
export const getQuestionById = (id: string): AssessmentQuestion | undefined => {
  return questionBank.find(q => q.id === id);
};

export const getQuestionsByModule = (module: FunctionalModule): AssessmentQuestion[] => {
  return questionBank.filter(q => q.module === module);
};

export const getSeedOilQuestions = (): AssessmentQuestion[] => {
  return questionBank.filter(q => q.category === QuestionCategory.SEED_OIL);
};

export const getQuestionsByCategory = (category: QuestionCategory): AssessmentQuestion[] => {
  return questionBank.filter(q => q.category === category);
};

export const getTriggeredQuestions = (questionId: string, responseValue: any): string[] => {
  const question = getQuestionById(questionId);
  if (!question || !question.triggerConditions) return [];
  
  const triggeredQuestions: string[] = [];
  
  question.triggerConditions.forEach(condition => {
    let shouldTrigger = false;
    
    switch (condition.operator) {
      case 'gt':
        shouldTrigger = responseValue > condition.threshold;
        break;
      case 'gte':
        shouldTrigger = responseValue >= condition.threshold;
        break;
      case 'lt':
        shouldTrigger = responseValue < condition.threshold;
        break;
      case 'lte':
        shouldTrigger = responseValue <= condition.threshold;
        break;
      case 'eq':
        shouldTrigger = responseValue === condition.threshold;
        break;
      case 'contains':
        shouldTrigger = Array.isArray(responseValue) && responseValue.includes(condition.threshold);
        break;
    }
    
    if (shouldTrigger && condition.triggersQuestions) {
      triggeredQuestions.push(...condition.triggersQuestions);
    }
  });
  
  return [...new Set(triggeredQuestions)]; // Remove duplicates
};

// Export alias for backward compatibility
export const getModuleQuestions = getQuestionsByModule;

export const calculateSeedOilExposureScore = (responses: Map<string, any>): number => {
  const seedOilQuestions = getSeedOilQuestions();
  let totalScore = 0;
  let totalWeight = 0;
  
  seedOilQuestions.forEach(question => {
    const response = responses.get(question.id);
    if (response !== undefined) {
      let score = 0;
      
      if (question.options) {
        const option = question.options.find(opt => opt.value === response);
        if (option && option.score !== undefined) {
          score = option.score;
        }
      } else if (typeof response === 'number') {
        score = response;
      }
      
      totalScore += score * question.scoringWeight;
      totalWeight += question.scoringWeight;
    }
  });
  
  return totalWeight > 0 ? (totalScore / totalWeight) : 0;
};
