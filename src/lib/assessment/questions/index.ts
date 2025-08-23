import { screeningQuestions } from "./screening-questions";
import { additionalScreeningQuestions } from "./screening-questions-additional";
import { assimilationQuestions } from './assimilation-questions';
import { defenserepairQuestions } from './defense-repair-questions';
import { energyQuestions } from './energy-questions';
import { biotransformationQuestions } from './biotransformation-questions';
import { transportQuestions } from './transport-questions';
import { communicationQuestions } from './communication-questions';
import { structuralQuestions } from './structural-questions';

import {
  AssessmentQuestion,
  QuestionCategory,
  FunctionalModule,
} from "../types";

// Combine all questions into one bank
export const questionBank: AssessmentQuestion[] = [
  ...screeningQuestions,
  ...additionalScreeningQuestions,
  ...assimilationQuestions,
  ...defenserepairQuestions,
  ...energyQuestions,
  ...biotransformationQuestions,
  ...transportQuestions,
  ...communicationQuestions,
  ...structuralQuestions,
];

// Alias for backward compatibility
export const allQuestions = questionBank;

// Helper functions for question management
export const getQuestionById = (id: string): AssessmentQuestion | undefined => {
  return questionBank.find((q) => q.id === id);
};

export const getQuestionsByModule = (
  module: FunctionalModule
): AssessmentQuestion[] => {
  return questionBank.filter((q) => q.module === module);
};

// Alias for getQuestionsByModule for backward compatibility
export const getModuleQuestions = getQuestionsByModule;

export const getSeedOilQuestions = (): AssessmentQuestion[] => {
  return questionBank.filter((q) => q.seedOilRelevant === true || q.category === QuestionCategory.SEED_OIL);
};

export const getQuestionsByCategory = (
  category: QuestionCategory
): AssessmentQuestion[] => {
  return questionBank.filter((q) => q.category === category);
};

export const getTriggeredQuestions = (
  questionId: string,
  responseValue: any
): string[] => {
  const question = getQuestionById(questionId);
  if (!question || !question.triggerConditions) return [];

  const triggeredQuestions: string[] = [];

  question.triggerConditions.forEach((condition) => {
    let shouldTrigger = false;

    switch (condition.operator) {
      case "gt":
        shouldTrigger = responseValue > condition.threshold;
        break;
      case "gte":
        shouldTrigger = responseValue >= condition.threshold;
        break;
      case "lt":
        shouldTrigger = responseValue < condition.threshold;
        break;
      case "lte":
        shouldTrigger = responseValue <= condition.threshold;
        break;
      case "eq":
        shouldTrigger = responseValue === condition.threshold;
        break;
      case "contains":
        shouldTrigger =
          Array.isArray(responseValue) &&
          responseValue.includes(condition.threshold);
        break;
    }

    if (shouldTrigger && condition.triggersQuestions) {
      triggeredQuestions.push(...condition.triggersQuestions);
    }
  });

  return [...new Set(triggeredQuestions)]; // Remove duplicates
};

export const calculateSeedOilExposureScore = (
  responses: Map<string, any>
): number => {
  const seedOilQuestions = getSeedOilQuestions();
  let totalScore = 0;
  let totalWeight = 0;

  seedOilQuestions.forEach((question) => {
    const response = responses.get(question.id);
    if (response !== undefined) {
      let score = 0;

      if (question.options) {
        const option = question.options.find((opt) => opt.value === response);
        if (option && option.score !== undefined) {
          score = option.score;
        }
      } else if (typeof response === "number") {
        score = response;
      }

      totalScore += score * question.scoringWeight;
      totalWeight += question.scoringWeight;
    }
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

// Export counts for verification
export const QUESTION_COUNTS = {
  total: questionBank.length,
  screening: screeningQuestions.length,
  assimilation: assimilationQuestions.length,
  defenseRepair: defenserepairQuestions.length,
  energy: energyQuestions.length,
  biotransformation: biotransformationQuestions.length,
  transport: transportQuestions.length,
  communication: communicationQuestions.length,  
  structural: structuralQuestions.length,
  seedOil: getSeedOilQuestions().length,
};

console.log('📊 Assessment Questions Loaded:', QUESTION_COUNTS);
