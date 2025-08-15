// Core Assessment Types
export interface AssessmentQuestion {
  id: string;
  module: FunctionalModule;
  category?: QuestionCategory;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  scoringWeight: number;
  clinicalRelevance: string[];
  labCorrelations?: string[];
  triggerConditions?: TriggerCondition[];
  validationRules?: ValidationRule[];
  helpText?: string;
  required?: boolean;
}

export enum FunctionalModule {
  SCREENING = "SCREENING",
  ASSIMILATION = "ASSIMILATION",
  DEFENSE_REPAIR = "DEFENSE_REPAIR",
  ENERGY = "ENERGY",
  BIOTRANSFORMATION = "BIOTRANSFORMATION",
  TRANSPORT = "TRANSPORT",
  COMMUNICATION = "COMMUNICATION",
  STRUCTURAL = "STRUCTURAL",
}

export enum QuestionCategory {
  SEED_OIL = "SEED_OIL",
  DIGESTIVE = "DIGESTIVE",
  IMMUNE = "IMMUNE",
  HORMONAL = "HORMONAL",
  METABOLIC = "METABOLIC",
  TOXIC_BURDEN = "TOXIC_BURDEN",
  LIFESTYLE = "LIFESTYLE",
  STRESS = "STRESS",
}

export enum QuestionType {
  LIKERT_SCALE = "LIKERT_SCALE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  YES_NO = "YES_NO",
  FREQUENCY = "FREQUENCY",
  DURATION = "DURATION",
  TEXT = "TEXT",
  MULTI_SELECT = "MULTI_SELECT",
  NUMBER = "NUMBER",
}

export interface QuestionOption {
  value: string | number;
  label: string;
  score?: number;
  triggers?: string[]; // Question IDs to trigger
}

export interface TriggerCondition {
  threshold: number;
  operator: "gt" | "gte" | "lt" | "lte" | "eq" | "contains";
  triggersModule?: FunctionalModule;
  triggersQuestions?: string[];
  priority?: "high" | "medium" | "low";
}

export interface ValidationRule {
  type: "required" | "min" | "max" | "pattern";
  value?: any;
  message: string;
}

export interface AssessmentModule {
  id: FunctionalModule;
  name: string;
  description: string;
  questionCount: number;
  activationThreshold: number;
  questions: string[];
  dependencies?: FunctionalModule[];
  seedOilIntegration?: boolean;
}

export interface SeedOilAssessment {
  exposureLevel: number; // 0-10
  damageIndicators: number; // 0-10
  recoveryPotential: number; // 0-10
  priorityLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  recommendedInterventions: string[];
}
