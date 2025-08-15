/**
 * Core assessment types for the FNTP Assessment System
 * These types ensure type safety and immutability for client data
 */

import { z } from "zod";

/**
 * Assessment question types
 */
export type QuestionType =
  | "multiple_choice"
  | "scale"
  | "text"
  | "number"
  | "boolean"
  | "multi_select";

/**
 * Base question interface
 */
export interface AssessmentQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  category?: string;
  helpText?: string;
  validationRules?: ValidationRule[];
  conditionalDisplay?: ConditionalRule;
  options?: QuestionOption[];
  scaleConfig?: ScaleConfig;
}

/**
 * Question option for multiple choice and multi-select
 */
export interface QuestionOption {
  value: string;
  label: string;
  score?: number;
  followUpQuestions?: string[]; // IDs of follow-up questions
}

/**
 * Scale configuration for scale-type questions
 */
export interface ScaleConfig {
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  midLabel?: string;
}

/**
 * Validation rule for questions
 */
export interface ValidationRule {
  type: "min" | "max" | "pattern" | "custom";
  value: any;
  message: string;
  validator?: (value: any) => boolean;
}

/**
 * Conditional display rule
 */
export interface ConditionalRule {
  dependsOn: string; // Question ID
  condition:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than";
  value: any;
}

/**
 * Immutable assessment response record
 */
export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  clientId: string;
  questionId: string;
  value: any;
  timestamp: Date;
  confidence?: number; // For AI-assisted entries
  source: "manual" | "ai_assisted" | "imported";
  metadata?: Record<string, any>;
}

/**
 * Assessment template/form definition
 */
export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  categories: AssessmentCategory[];
  questions: AssessmentQuestion[];
  scoringRules?: ScoringRule[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Assessment category for grouping questions
 */
export interface AssessmentCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  icon?: string;
}

/**
 * Scoring rule for assessments
 */
export interface ScoringRule {
  id: string;
  name: string;
  category?: string;
  calculation: "sum" | "average" | "weighted" | "custom";
  questionIds: string[];
  weights?: Record<string, number>;
  customCalculator?: (responses: AssessmentResponse[]) => number;
}

/**
 * Assessment session tracking
 */
export interface AssessmentSession {
  id: string;
  clientId: string;
  templateId: string;
  status: "draft" | "in_progress" | "completed" | "reviewed";
  startedAt: Date;
  completedAt?: Date;
  lastSavedAt: Date;
  progress: number; // 0-100
  responses: AssessmentResponse[];
  scores?: AssessmentScore[];
  aiAnalysis?: AIAnalysisResult;
}

/**
 * Assessment score result
 */
export interface AssessmentScore {
  ruleId: string;
  ruleName: string;
  category?: string;
  score: number;
  maxScore?: number;
  interpretation?: string;
  recommendations?: string[];
}

/**
 * AI analysis result
 */
export interface AIAnalysisResult {
  id: string;
  sessionId: string;
  analyzedAt: Date;
  model: string;
  findings: Finding[];
  recommendations: Recommendation[];
  riskFactors: RiskFactor[];
  confidence: number;
}

/**
 * Clinical finding from AI analysis
 */
export interface Finding {
  id: string;
  type: "symptom" | "pattern" | "correlation" | "anomaly";
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  relatedQuestions: string[];
  evidence: string[];
}

/**
 * AI-generated recommendation
 */
export interface Recommendation {
  id: string;
  type: "supplement" | "lifestyle" | "diet" | "testing" | "referral";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description: string;
  rationale: string;
  contraindications?: string[];
}

/**
 * Risk factor identification
 */
export interface RiskFactor {
  id: string;
  factor: string;
  level: "low" | "moderate" | "high" | "severe";
  description: string;
  mitigationStrategies: string[];
}

/**
 * Validation schemas using Zod
 */
export const AssessmentResponseSchema = z.object({
  questionId: z.string(),
  value: z.any(),
  confidence: z.number().min(0).max(1).optional(),
  source: z.enum(["manual", "ai_assisted", "imported"]),
  metadata: z.record(z.any()).optional(),
});

export const CreateAssessmentSessionSchema = z.object({
  clientId: z.string(),
  templateId: z.string(),
});

export const UpdateAssessmentResponseSchema = z.object({
  sessionId: z.string(),
  responses: z.array(AssessmentResponseSchema),
});

/**
 * Type guards
 */
export function isScaleQuestion(
  question: AssessmentQuestion
): question is AssessmentQuestion & { scaleConfig: ScaleConfig } {
  return question.type === "scale" && !!question.scaleConfig;
}

export function isOptionsQuestion(
  question: AssessmentQuestion
): question is AssessmentQuestion & { options: QuestionOption[] } {
  return (
    (question.type === "multiple_choice" || question.type === "multi_select") &&
    !!question.options
  );
}
