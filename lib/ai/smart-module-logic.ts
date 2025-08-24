/**
 * Smart Module Logic - Context-Aware Assessment
 * 
 * This module makes the assessment actually intelligent by:
 * 1. Tracking negative vs positive responses
 * 2. Exiting modules when no issues detected
 * 3. Preventing redundant questions
 */

import { ClientResponse } from "../assessment/types";

export interface ModuleContext {
  module: string;
  responses: ClientResponse[];
  questionsAsked: number;
  negativeResponses: number;
  positiveResponses: number;
  averageSeverity: number;
  negativePercentage: number;
}

export interface ModuleExitDecision {
  shouldExit: boolean;
  reason: string;
  questionsRemaining: number;
}

// Module-specific exit criteria
const MODULE_EXIT_CRITERIA = {
  NEUROLOGICAL: {
    maxQuestionsNoIssues: 6,
    exitThreshold: 0.75,
    criticalQuestions: ["NEURO001", "NEURO003", "NEURO006", "NEURO007"]
  },
  DIGESTIVE: {
    maxQuestionsNoIssues: 6,
    exitThreshold: 0.75,
    criticalQuestions: ["DIG001", "DIG004", "DIG008", "DIG010"]
  },
  CARDIOVASCULAR: {
    maxQuestionsNoIssues: 5,
    exitThreshold: 0.80, // Exit faster - 80% negative
    criticalQuestions: ["CARDIO001", "CARDIO008", "CARDIO012"]
  },
  RESPIRATORY: {
    maxQuestionsNoIssues: 5,
    exitThreshold: 0.80,
    criticalQuestions: ["RESP001", "RESP004", "RESP008"]
  },
  IMMUNE: {
    maxQuestionsNoIssues: 5,
    exitThreshold: 0.75,
    criticalQuestions: ["IMMUNE001", "IMMUNE005", "IMMUNE009"]
  },
  MUSCULOSKELETAL: {
    maxQuestionsNoIssues: 5,
    exitThreshold: 0.80,
    criticalQuestions: ["MUSC001", "MUSC005", "MUSC009"]
  },
  ENDOCRINE: {
    maxQuestionsNoIssues: 6,
    exitThreshold: 0.75,
    criticalQuestions: ["ENDO001", "ENDO008", "ENDO014"]
  },
  INTEGUMENTARY: {
    maxQuestionsNoIssues: 4,
    exitThreshold: 0.80,
    criticalQuestions: ["SKIN001", "INTEG005"]
  },
  GENITOURINARY: {
    maxQuestionsNoIssues: 5,
    exitThreshold: 0.80,
    criticalQuestions: ["GU001", "GENITO001"]
  },
  SPECIAL_TOPICS: {
    maxQuestionsNoIssues: 8,
    exitThreshold: 0.70,
    criticalQuestions: ["SPEC004", "SPEC008"]
  }
};

/**
 * Analyzes module responses to build context
 */
export function analyzeModuleContext(
  module: string,
  responses: ClientResponse[]
): ModuleContext {
  let negativeResponses = 0;
  let positiveResponses = 0;
  let severitySum = 0;
  let severityCount = 0;
  
  responses.forEach(response => {
    // Count negative/positive responses
    if (response.responseType === "YES_NO") {
      if (response.responseValue === "no" || response.responseValue === "unsure") {
        negativeResponses++;
      } else if (response.responseValue === "yes") {
        positiveResponses++;
      }
    } else if (response.responseType === "FREQUENCY") {
      const value = response.responseValue as string;
      if (value === "never" || value === "rarely") {
        negativeResponses++;
      } else {
        positiveResponses++;
      }
    } else if (response.responseType === "MULTIPLE_CHOICE") {
      const value = response.responseValue as string;
      // Check for negative indicators in multiple choice
      if (value.includes("no") || value.includes("none") || value.includes("never")) {
        negativeResponses++;
      } else {
        positiveResponses++;
      }
    } else if (response.responseType === "LIKERT_SCALE") {
      const value = Number(response.responseValue) || 0;
      severitySum += value;
      severityCount++;
      
      // On 5-point scale: 1-2 is negative, 3 is neutral, 4-5 is positive
      if (value <= 2) {
        negativeResponses++;
      } else if (value >= 4) {
        positiveResponses++;
      }
    }
  });
  
  const questionsAsked = responses.length;
  const averageSeverity = severityCount > 0 ? severitySum / severityCount : 0;
  const negativePercentage = questionsAsked > 0 ? (negativeResponses / questionsAsked) * 100 : 0;
  
  return {
    module,
    responses,
    questionsAsked,
    negativeResponses,
    positiveResponses,
    averageSeverity,
    negativePercentage
  };
}

/**
 * Determines if we should exit the current module
 */
export function shouldExitModule(context: ModuleContext): ModuleExitDecision {
  const criteria = MODULE_EXIT_CRITERIA[context.module];
  if (!criteria) {
    return {
      shouldExit: false,
      reason: "No exit criteria defined for module",
      questionsRemaining: 999
    };
  }
  
  // Have we asked enough questions?
  if (context.questionsAsked < 3) {
    return {
      shouldExit: false,
      reason: "Too few questions asked",
      questionsRemaining: criteria.maxQuestionsNoIssues - context.questionsAsked
    };
  }
  
  // Check if we've hit the max questions for no issues
  if (context.questionsAsked >= criteria.maxQuestionsNoIssues) {
    const negativeRatio = context.negativeResponses / context.questionsAsked;
    
    if (negativeRatio >= criteria.exitThreshold) {
      return {
        shouldExit: true,
        reason: `${Math.round(context.negativePercentage)}% negative responses - no issues detected`,
        questionsRemaining: 0
      };
    }
  }
  
  // If average severity is very low after several questions
  if (context.questionsAsked >= 4 && context.averageSeverity < 1.5) {
    return {
      shouldExit: true,
      reason: `Very low severity (${context.averageSeverity.toFixed(1)}/5) - minimal issues`,
      questionsRemaining: 0
    };
  }
  
  // If ALL responses are negative after critical questions
  if (context.questionsAsked >= 3 && context.negativePercentage === 100) {
    return {
      shouldExit: true,
      reason: "All responses negative - no issues in this module",
      questionsRemaining: 0
    };
  }
  
  // Calculate remaining questions
  const questionsRemaining = Math.max(
    0,
    criteria.maxQuestionsNoIssues - context.questionsAsked
  );
  
  return {
    shouldExit: false,
    reason: `Continue assessment (${context.positiveResponses} positive indicators)`,
    questionsRemaining
  };
}

/**
 * Gets critical questions that should be asked first
 */
export function getCriticalQuestions(module: string): string[] {
  return MODULE_EXIT_CRITERIA[module]?.criticalQuestions || [];
}

/**
 * Generates a smart prompt for AI that includes context
 */
export function generateSmartAIPrompt(
  context: ModuleContext,
  availableQuestions: any[],
  clientInfo: any
): string {
  const exitDecision = shouldExitModule(context);
  
  return `You are selecting the next question for a ${clientInfo.age || "unknown"}-year-old ${clientInfo.gender || "person"} in the ${context.module} module.

MODULE CONTEXT:
- Questions asked: ${context.questionsAsked}
- Negative responses: ${context.negativeResponses} (${Math.round(context.negativePercentage)}%)
- Positive responses: ${context.positiveResponses}
- Average severity: ${context.averageSeverity.toFixed(1)}/5

${context.negativePercentage >= 60 ? 
  "⚠️ IMPORTANT: This person has mostly indicated NO issues in this area." : 
  "This person has indicated some issues that need exploration."}

${exitDecision.questionsRemaining <= 2 ? 
  `⚠️ ONLY ${exitDecision.questionsRemaining} QUESTIONS REMAINING before module exit.` : 
  ""}

Recent responses (last 5):
${context.responses.slice(-5).map(r => 
  `- ${r.questionId}: "${r.responseValue}" (${r.responseType})`
).join('\n')}

Available questions: ${availableQuestions.length}
${availableQuestions.slice(0, 10).map(q => `${q.id}: ${q.text}`).join('\n')}

CRITICAL RULES:
1. If person has NO issues (>75% negative), only ask critical gateway questions
2. ${exitDecision.shouldExit ? "STRONGLY CONSIDER MOVING TO NEXT MODULE" : "Continue exploring symptoms"}
3. DO NOT ask variations of symptoms already marked as "no" or "never"
4. Prioritize questions that explore DIFFERENT symptoms
5. Maximum ${MODULE_EXIT_CRITERIA[context.module]?.maxQuestionsNoIssues || 10} questions if no issues

${exitDecision.shouldExit ? 
  'Return: {"skipToNextModule": true, "reasoning": "' + exitDecision.reason + '"}' :
  'Return: {"selectedQuestionId": "ID", "reasoning": "brief explanation"}'
}`;
}
