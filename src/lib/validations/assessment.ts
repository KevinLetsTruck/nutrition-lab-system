import { z } from "zod";

// Assessment start validation
export const assessmentStartSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  templateId: z.string().optional().default("default"),
});

// Assessment response validation
export const assessmentResponseSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  response: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.object({}).passthrough(), // For complex responses
  ]),
  questionType: z.string().optional(),
});

// Public assessment start validation
export const publicAssessmentStartSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientEmail: z.string().email("Valid email is required"),
});

// Next question params
export const nextQuestionParamsSchema = z.object({
  includeContext: z.boolean().optional().default(false),
  skipAI: z.boolean().optional().default(false),
});

// Assessment pause validation
export const assessmentPauseSchema = z.object({
  reason: z.string().optional(),
  saveProgress: z.boolean().optional().default(true),
});

export type AssessmentStartInput = z.infer<typeof assessmentStartSchema>;
export type AssessmentResponseInput = z.infer<typeof assessmentResponseSchema>;
export type PublicAssessmentStartInput = z.infer<typeof publicAssessmentStartSchema>;
export type NextQuestionParams = z.infer<typeof nextQuestionParamsSchema>;
export type AssessmentPauseInput = z.infer<typeof assessmentPauseSchema>;
