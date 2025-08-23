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
  // Scale properties for LIKERT_SCALE questions
  scaleMin?: string;
  scaleMax?: string;
  // Text input properties
  maxLength?: number;
  placeholder?: string;
  scale?: {
    min: number;
    max: number;
    labels?: Record<number, string>;
  };
  // Additional properties for other question types
  seedOilRelevant?: boolean;
  frequencyOptions?: FrequencyOption[];
  frequencyType?: 'bowel' | 'pain' | 'fatigue'; // For custom frequency patterns
  durationOptions?: DurationOption[];
  textOptions?: TextOptions;
  numberOptions?: NumberOptions;
  multiSelectOptions?: MultiSelectOptions;
  conditionalLogic?: ConditionalLogic[];
  genderSpecific?: 'male' | 'female'; // Only show to specific gender
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
  description?: string;
  seedOilRisk?: 'low' | 'medium' | 'high';
}

export interface ConditionalLogic {
  condition: string | number; // The response value that triggers this logic
  action: 'skip' | 'trigger' | 'require';
  skipQuestions?: string[]; // Question IDs to skip
  triggerQuestions?: string[]; // Question IDs to trigger
  requiredQuestions?: string[]; // Question IDs that become required
}

export interface FrequencyOption {
  value: string;
  label: string;
  description?: string;
}

export interface DurationOption {
  value: string;
  label: string;
}

export interface TextOptions {
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  rows?: number;
  suggestions?: string[];
}

export interface NumberOptions {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  prefix?: string;
  suffix?: string;
  thresholds?: Array<{
    min: number;
    max: number;
    label: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface MultiSelectOptions {
  maxSelections?: number;
  minSelections?: number;
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

// Type aliases for compatibility
export type ModuleType = FunctionalModule;

// Client Response interface for assessment responses
export interface ClientResponse {
  id: string;
  assessmentId: string;
  questionId: string;
  questionText: string;
  questionModule: string;
  responseType: QuestionType;
  responseValue: any;
  responseText?: string;
  aiReasoning?: string;
  confidenceScore?: number;
  clinicalFlags?: any;
  answeredAt: Date;
}
