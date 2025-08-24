import { Anthropic } from "@anthropic-ai/sdk";
import {
  AssessmentQuestion,
  ClientResponse,
  ModuleType,
  FunctionalModule,
} from "../assessment/types";
import { getQuestionsByModule, allQuestions as getAllQuestions } from "../assessment/questions/index";
// Import other modules when they are implemented
// import { getAssimilationQuestions } from '@/lib/assessment/questions/assimilation-questions';
// import { getDefenseRepairQuestions } from '@/lib/assessment/questions/defense-repair-questions';
// import { getEnergyQuestions } from '@/lib/assessment/questions/energy-questions';
// import { getBiotransformationQuestions } from '@/lib/assessment/questions/biotransformation-questions';
// import { getTransportQuestions } from '@/lib/assessment/questions/transport-questions';
// import { getCommunicationQuestions } from '@/lib/assessment/questions/communication-questions';
// import { getStructuralQuestions } from '@/lib/assessment/questions/structural-questions';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface AssessmentContext {
  currentModule: ModuleType;
  responses: ClientResponse[];
  symptomProfile: any;
  questionsAsked: number;
  assessmentContext?: any;
  clientInfo?: {
    gender?: string | null;
    age?: number | null;
    medications?: any;
  };
}

interface AIDecision {
  nextQuestion?: AssessmentQuestion;
  nextModule?: ModuleType;
  questionsInModule?: number;
  questionsSaved?: number;
  reasoning: string;
}

const MODULE_SEQUENCE: ModuleType[] = [
  "SCREENING",
  "ASSIMILATION",
  "DEFENSE_REPAIR",
  "ENERGY",
  "BIOTRANSFORMATION",
  "TRANSPORT",
  "COMMUNICATION",
  "STRUCTURAL",
];

function getQuestionsForModule(module: ModuleType): AssessmentQuestion[] {
  // Convert Prisma ModuleType to FunctionalModule enum
  const functionalModule = module as unknown as FunctionalModule;
  return getQuestionsByModule(functionalModule);
}

// Cache for AI decisions to avoid repeated calls
const decisionCache = new Map<string, AIDecision>();

// Track last selected question to detect loops
let lastSelectedQuestionId: string | null = null;

// Determine if AI is needed based on question count and severity
function shouldUseAI(
  responses: ClientResponse[],
  questionsAsked: number
): boolean {
  // Use AI for key decision points
  if (questionsAsked === 0 || questionsAsked % 10 === 0) return true;

  // Use AI if high severity symptoms detected
  const hasHighSeverity = responses.some(
    (r) =>
      r.responseType === "LIKERT_SCALE" &&
      typeof r.responseValue === "number" &&
      r.responseValue >= 4 // Changed from 7 to 4 for 5-point scale
  );

  // Use AI if multiple concerning patterns
  const concerningResponses = responses.filter(
    (r) => r.responseType === "YES_NO" && r.responseValue === "yes"
  ).length;

  return hasHighSeverity || concerningResponses >= 3;
}

export async function getNextQuestionWithAI(
  context: AssessmentContext
): Promise<AIDecision> {
  const {
    currentModule,
    responses,
    symptomProfile,
    questionsAsked,
    clientInfo,
  } = context;

  // Check cache first (include gender in cache key for accurate caching)
  const cacheKey = `${currentModule}-${questionsAsked}-${responses.length}-${
    clientInfo?.gender || "unknown"
  }`;

  // Check if we have a cached decision
  if (decisionCache.has(cacheKey)) {
    const cachedDecision = decisionCache.get(cacheKey)!;
    
    // Get already answered question IDs
    const answeredQuestionIds = new Set(responses.map((r) => r.questionId));

    // Detect if we're about to return the same question as last time OR an already answered question
    if (
      cachedDecision.nextQuestion?.id === lastSelectedQuestionId ||
      (cachedDecision.nextQuestion?.id && answeredQuestionIds.has(cachedDecision.nextQuestion.id))
    ) {
      console.warn(
        `Detected repeated/duplicate question selection: ${cachedDecision.nextQuestion?.id}. Clearing cache.`
      );
      decisionCache.clear();
      lastSelectedQuestionId = null;
    } else {
      // Update last selected question and return cached decision
      lastSelectedQuestionId = cachedDecision.nextQuestion?.id || null;
      return cachedDecision;
    }
  }

  // Get available questions for current module
  const moduleQuestions = getQuestionsForModule(currentModule);

  // Get already answered question IDs
  const answeredQuestionIds = responses.map((r) => r.questionId);

  // Filter to get remaining unanswered questions
  let remainingQuestions = moduleQuestions.filter(
    (q) => !answeredQuestionIds.includes(q.id)
  );

  // Filter out gender-specific questions if gender is known
  if (clientInfo?.gender) {
    console.log(`Filtering questions for gender: ${clientInfo.gender}`);
    const beforeCount = remainingQuestions.length;
    
    remainingQuestions = remainingQuestions.filter((q) => {
      // Check genderSpecific property first
      if (q.genderSpecific && q.genderSpecific !== clientInfo.gender) {
        console.log(`Filtering out ${q.genderSpecific}-specific question for ${clientInfo.gender} user: ${q.id} - ${q.text}`);
        return false;
      }

      const questionText = q.text.toLowerCase();

      // Skip female-specific questions for males
      if (
        clientInfo.gender === "male" &&
        (questionText.includes("menstrual") ||
          questionText.includes("period") ||
          questionText.includes("pregnant") ||
          questionText.includes("menopause") ||
          questionText.includes("for women:"))
      ) {
        console.log(`Filtering out female question for male user: ${q.id} - ${q.text}`);
        return false;
      }

      // Skip male-specific questions for females
      if (
        clientInfo.gender === "female" &&
        (questionText.includes("erectile") ||
          questionText.includes("prostate") ||
          questionText.includes("for men:"))
      ) {
        console.log(`Filtering out male question for female user: ${q.id} - ${q.text}`);
        return false;
      }

      return true;
    });
    
    console.log(`Gender filtering: ${beforeCount} → ${remainingQuestions.length} questions`);
  } else {
    console.log("No gender info available for filtering");
  }

  // Filter out questions based on conditional logic
  remainingQuestions = remainingQuestions.filter((q) => {
    // Check if this question should be skipped based on previous answers
    for (const response of responses) {
      // Need to check ALL questions, not just current module, for conditional logic
      const allQuestions = getAllQuestions;
      const answeredQuestion = allQuestions.find(aq => aq.id === response.questionId);
      if (answeredQuestion?.conditionalLogic) {
        for (const logic of answeredQuestion.conditionalLogic) {
          if (logic.action === "skip" && 
              logic.condition === response.responseValue &&
              logic.skipQuestions?.includes(q.id)) {
            console.log(`Skipping question ${q.id} based on conditional logic from ${answeredQuestion.id}`);
            return false; // Skip this question
          }
        }
      }
    }
    return true;
  });

  // If no questions remain in current module, move to next
  if (remainingQuestions.length === 0) {
    const currentModuleIndex = MODULE_SEQUENCE.indexOf(currentModule);
    if (currentModuleIndex < MODULE_SEQUENCE.length - 1) {
      const nextModule = MODULE_SEQUENCE[currentModuleIndex + 1];
      const nextModuleQuestions = getQuestionsForModule(nextModule);

      // Use Claude to select first question of new module
      return selectQuestionWithClaude(
        nextModuleQuestions,
        responses,
        symptomProfile,
        nextModule,
        true // isNewModule
      );
    } else {
      // Assessment complete
      return {
        nextQuestion: undefined,
        reasoning: "All modules completed",
        questionsSaved: 0,
      };
    }
  }

  // Check if we should use AI for this decision
  if (!shouldUseAI(responses, questionsAsked)) {
    // Use simple algorithm for faster response
    const decision = fallbackQuestionSelection(
      remainingQuestions,
      responses,
      currentModule,
      false,
      clientInfo
    );
    decisionCache.set(cacheKey, decision);
    lastSelectedQuestionId = decision.nextQuestion?.id || null;
    return decision;
  }

  // Use Claude to intelligently select next question
  const aiDecision = await selectQuestionWithClaude(
    remainingQuestions,
    responses,
    { ...symptomProfile, clientInfo },
    currentModule,
    false
  );

  // Cache the decision and track last selected question
  decisionCache.set(cacheKey, aiDecision);
  lastSelectedQuestionId = aiDecision.nextQuestion?.id || null;

  return aiDecision;
}

async function selectQuestionWithClaude(
  availableQuestions: AssessmentQuestion[],
  responses: ClientResponse[],
  symptomProfile: any,
  module: ModuleType,
  isNewModule: boolean
): Promise<AIDecision> {
  try {
    // Prepare context for Claude
    const recentResponses = responses.slice(-10).map((r) => ({
      question: r.questionText,
      answer: r.responseValue,
      type: r.responseType,
    }));

    const highSeveritySymptoms = responses
      .filter((r) => {
        return (
          r.responseType === "LIKERT_SCALE" &&
          typeof r.responseValue === "number" &&
          r.responseValue >= 7
        );
      })
      .map((r) => ({
        symptom: r.questionText,
        severity: r.responseValue,
      }));

    // Simplified, focused prompt for faster processing
    const prompt = `Select the most diagnostic question from these options:

Module: ${module}
Questions asked: ${responses.length}
Key symptoms: ${highSeveritySymptoms.map((s) => s.symptom).join(", ") || "none"}
${
  symptomProfile.clientInfo
    ? `Client: ${symptomProfile.clientInfo.age || "Unknown age"}yo ${
        symptomProfile.clientInfo.gender || "unknown gender"
      }`
    : ""
}
${
  symptomProfile.clientInfo?.medications
    ? `On medications: ${JSON.stringify(
        symptomProfile.clientInfo.medications.current || []
      )}`
    : ""
}

Available questions (first 10):
${availableQuestions
  .slice(0, 10)
  .map((q) => `${q.id}: ${q.text}`)
  .join("\n")}

Select based on:
1. Maximum diagnostic value
2. Avoid redundancy
3. Prioritize severe symptoms
4. Consider client demographics

Return only: {"selectedQuestionId": "ID", "reasoning": "one sentence"}`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Much faster model (5-10x speed improvement)
      max_tokens: 300, // Reduced for faster response
      temperature: 0.2, // Lower temperature for more consistent clinical decisions
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse Claude's response
    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (Claude might include explanation text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse Claude response");
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    // Find the selected question
    const selectedQuestion = availableQuestions.find(
      (q) => q.id === aiResponse.selectedQuestionId
    );

    if (!selectedQuestion) {
      // Fallback to first available question if Claude's selection not found
      console.error(
        "Claude selected invalid question ID:",
        aiResponse.selectedQuestionId
      );
      return {
        nextQuestion: availableQuestions[0],
        nextModule: isNewModule ? module : undefined,
        questionsInModule: getQuestionsForModule(module).length,
        questionsSaved: 0,
        reasoning: "Fallback to sequential selection",
      };
    }

    return {
      nextQuestion: selectedQuestion,
      nextModule: isNewModule ? module : undefined,
      questionsInModule: getQuestionsForModule(module).length,
      questionsSaved: aiResponse.estimatedQuestionsSaved || 0,
      reasoning: aiResponse.reasoning,
    };
  } catch (error) {
    console.error("Error calling Claude API:", error);

    // Fallback to simple algorithm if Claude fails
    return fallbackQuestionSelection(
      availableQuestions,
      responses,
      module,
      isNewModule,
      symptomProfile?.clientInfo
    );
  }
}

// Fallback algorithm if Claude API fails
function fallbackQuestionSelection(
  availableQuestions: AssessmentQuestion[],
  responses: ClientResponse[],
  module: ModuleType,
  isNewModule: boolean,
  clientInfo?: any
): AIDecision {
  // If no available questions, return empty decision
  if (availableQuestions.length === 0) {
    return {
      nextQuestion: undefined,
      nextModule: undefined,
      questionsInModule: 0,
      questionsSaved: 0,
      reasoning: "No available questions in module",
    };
  }

  // Get answered question IDs to ensure we don't select them again
  const answeredQuestionIds = new Set(responses.map((r) => r.questionId));

  // Filter out any questions that might have slipped through as already answered
  let trulyAvailableQuestions = availableQuestions.filter(
    (q) => !answeredQuestionIds.has(q.id)
  );

  // Apply gender filtering in fallback too
  if (clientInfo?.gender) {
    console.log(`[Fallback] Filtering questions for gender: ${clientInfo.gender}`);
    trulyAvailableQuestions = trulyAvailableQuestions.filter((q) => {
      // Check genderSpecific property first
      if (q.genderSpecific && q.genderSpecific !== clientInfo.gender) {
        console.log(`[Fallback] Filtering out ${q.genderSpecific}-specific question: ${q.id}`);
        return false;
      }

      const questionText = q.text.toLowerCase();
      
      if (
        clientInfo.gender === "male" &&
        (questionText.includes("menstrual") ||
          questionText.includes("period") ||
          questionText.includes("pregnant") ||
          questionText.includes("menopause") ||
          questionText.includes("for women:"))
      ) {
        console.log(`[Fallback] Filtering out female question: ${q.id}`);
        return false;
      }
      
      if (
        clientInfo.gender === "female" &&
        (questionText.includes("erectile") ||
          questionText.includes("prostate") ||
          questionText.includes("for men:"))
      ) {
        return false;
      }
      
      return true;
    });
  }

  // Apply conditional logic filtering in fallback too
  trulyAvailableQuestions = trulyAvailableQuestions.filter((q) => {
    // Check if this question should be skipped based on previous answers
    for (const response of responses) {
      const allQuestions = getAllQuestions;
      const answeredQuestion = allQuestions.find(aq => aq.id === response.questionId);
      if (answeredQuestion?.conditionalLogic) {
        for (const logic of answeredQuestion.conditionalLogic) {
          if (logic.action === "skip" && 
              logic.condition === response.responseValue &&
              logic.skipQuestions?.includes(q.id)) {
            console.log(`[Fallback] Skipping question ${q.id} based on conditional logic from ${answeredQuestion.id}`);
            return false; // Skip this question
          }
        }
      }
    }
    return true;
  });

  if (trulyAvailableQuestions.length === 0) {
    return {
      nextQuestion: undefined,
      nextModule: undefined,
      questionsInModule: 0,
      questionsSaved: 0,
      reasoning: "All questions in module already answered",
    };
  }

  // Check for high severity symptoms (adjusted for 5-point scale)
  const hasHighSeverity = responses.some(
    (r) =>
      r.responseType === "LIKERT_SCALE" &&
      typeof r.responseValue === "number" &&
      r.responseValue >= 4
  );

  let questionsSaved = 0;
  let nextQuestion = trulyAvailableQuestions[0];
  let reasoning = "Sequential selection (fallback mode)";

  if (hasHighSeverity && trulyAvailableQuestions.length > 5) {
    // Skip some basic questions if high severity exists
    const skipCount = Math.min(
      3,
      Math.floor(trulyAvailableQuestions.length * 0.2)
    );
    nextQuestion =
      trulyAvailableQuestions[
        Math.min(skipCount, trulyAvailableQuestions.length - 1)
      ];
    questionsSaved = skipCount;
    reasoning = `Skipping ${skipCount} basic questions due to high severity symptoms`;
  }

  return {
    nextQuestion,
    nextModule: isNewModule ? module : undefined,
    questionsInModule: getQuestionsForModule(module).length,
    questionsSaved,
    reasoning,
  };
}

// Keep the original assessment AI class and methods below for other functionality

import { SeedOilAssessment } from "@/lib/assessment/types";
import { prisma } from "@/lib/db";

export class AssessmentAIService {
  private readonly MODEL = "claude-3-opus-20240229";
  private readonly MAX_TOKENS = 4000;

  /**
   * Analyzes responses and selects the next most relevant question
   */
  async selectNextQuestion(
    assessmentId: string,
    availableQuestions: AssessmentQuestion[],
    completedResponses: any[]
  ): Promise<{
    questionId: string;
    reasoning: string;
    expectedValue: number;
    priority: "high" | "medium" | "low";
  }> {
    try {
      // Get assessment context
      const assessment = await prisma.clientAssessment.findUnique({
        where: { id: assessmentId },
        include: { responses: true },
      });

      if (!assessment) {
        throw new Error("Assessment not found");
      }

      // Build context for Claude
      const context = this.buildAssessmentContext(
        assessment,
        completedResponses
      );

      const prompt = `
You are analyzing a functional medicine assessment for a client.

Current Assessment Context:
${JSON.stringify(context, null, 2)}

Available Questions:
${JSON.stringify(availableQuestions.slice(0, 20), null, 2)}

Based on the patterns you see in the responses, select the next most clinically relevant question.

Selection Criteria:
1. Maximum diagnostic value - choose questions that will reveal the most about the client's health
2. Avoid redundancy - don't ask questions that have already been answered or implied
3. Follow clinical logic - ask follow-up questions that make sense given previous answers
4. Prioritize seed oil exposure if inflammatory patterns are emerging
5. Consider symptom clustering - identify related symptoms that point to specific conditions

Analyze the responses for:
- Seed oil exposure patterns (frequency of fried foods, types of oils used)
- Energy/fatigue patterns that suggest mitochondrial dysfunction
- Digestive symptoms that indicate gut dysbiosis
- Inflammatory markers across multiple systems
- Red flags that need immediate deeper investigation

Return your selection as JSON:
{
  "questionId": "string",
  "reasoning": "detailed clinical reasoning for selection",
  "expectedValue": "0-10 predicted importance of this question",
  "priority": "high|medium|low based on clinical urgency"
}
`;

      const response = await anthropic.messages.create({
        model: this.MODEL,
        max_tokens: this.MAX_TOKENS,
        temperature: 0.3, // Lower temperature for more consistent clinical decisions
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Parse Claude's response
      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      const result = this.parseJSONResponse(content);

      // Store AI reasoning for audit
      await this.storeAIReasoning(assessmentId, "question_selection", result);

      return result;
    } catch (error) {
      console.error("Error selecting next question:", error);
      // Fallback to first available question
      return {
        questionId: availableQuestions[0]?.id || "",
        reasoning: "Fallback selection due to AI error",
        expectedValue: 5,
        priority: "medium",
      };
    }
  }

  /**
   * Analyzes symptom patterns and identifies which modules to activate
   */
  async analyzeModuleActivation(assessmentId: string): Promise<{
    activateModules: FunctionalModule[];
    skipModules: FunctionalModule[];
    reasoning: Record<FunctionalModule, string>;
  }> {
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: { responses: true },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const prompt = `
Analyze these screening responses to determine which functional medicine modules should be activated.

Client Responses:
${JSON.stringify(assessment.responses, null, 2)}

Functional Modules Available:
1. ASSIMILATION - Digestive system and gut health
2. DEFENSE_REPAIR - Immune system and inflammation
3. ENERGY - Mitochondrial and metabolic function
4. BIOTRANSFORMATION - Detoxification pathways
5. TRANSPORT - Cardiovascular and lymphatic
6. COMMUNICATION - Hormonal and neurological
7. STRUCTURAL - Musculoskeletal system

Activation Criteria:
- Look for symptom clusters that indicate dysfunction in specific systems
- Prioritize modules where multiple symptoms converge
- Consider seed oil exposure (high exposure should activate ENERGY and DEFENSE_REPAIR)
- Identify red flags that require immediate investigation
- Skip modules with no relevant symptoms to reduce assessment burden

Analyze for:
- Digestive symptoms (bloating, irregular bowels, food sensitivities)
- Energy/fatigue patterns (crashes, exercise intolerance, brain fog)
- Inflammatory symptoms (joint pain, skin issues, autoimmune signs)
- Hormonal imbalances (mood, sleep, weight changes)
- Toxic burden (chemical sensitivities, poor detox signs)

Return as JSON:
{
  "activateModules": ["MODULE_NAMES"],
  "skipModules": ["MODULE_NAMES"],
  "reasoning": {
    "MODULE_NAME": "specific reasoning for activation or skipping"
  }
}
`;

    const response = await anthropic.messages.create({
      model: this.MODEL,
      max_tokens: this.MAX_TOKENS,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    const result = this.parseJSONResponse(content);

    // Update assessment with AI context
    await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        aiContext: {
          moduleActivation: result,
          timestamp: new Date(),
        },
      },
    });

    return result;
  }

  /**
   * Performs comprehensive scoring of the assessment
   */
  async scoreAssessment(assessmentId: string): Promise<{
    overallScore: number;
    nodeScores: Record<string, number>;
    seedOilAssessment: SeedOilAssessment;
    riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    primaryConcerns: string[];
    strengths: string[];
    hiddenPatterns: string[];
  }> {
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: true,
        client: {
          include: {
            medicalDocuments: {
              include: {
                labValues: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    // Extract lab values if available
    const labValues = assessment.client.medicalDocuments
      .flatMap((doc) => doc.labValues)
      .filter(Boolean);

    const prompt = `
Perform a comprehensive functional medicine analysis of this assessment.

Assessment Responses:
${JSON.stringify(assessment.responses, null, 2)}

Lab Values (if available):
${JSON.stringify(labValues, null, 2)}

Generate a complete health analysis including:

1. Overall Health Score (0-100)
   - Weight energy/fatigue heavily (25%)
   - Digestive function (20%)
   - Inflammation/immune (20%)
   - Hormonal balance (15%)
   - Detox capacity (10%)
   - Structural integrity (10%)

2. Individual Node Scores (0-100 each)
   - ASSIMILATION (digestive health)
   - DEFENSE_REPAIR (immune/inflammation)
   - ENERGY (mitochondrial function)
   - BIOTRANSFORMATION (detox capacity)
   - TRANSPORT (cardiovascular/lymphatic)
   - COMMUNICATION (hormonal/neurological)
   - STRUCTURAL (musculoskeletal)

3. Seed Oil Assessment
   - Exposure level (0-10): Based on frequency of fried foods, types of oils used
   - Damage indicators (0-10): Inflammatory symptoms, energy crashes, digestive issues
   - Recovery potential (0-10): Higher if younger, shorter exposure, fewer symptoms
   - Priority level: LOW/MODERATE/HIGH/CRITICAL

4. Risk Stratification
   - Consider all red flags
   - Weight multiple system involvement heavily
   - Account for symptom severity and duration

5. Primary Concerns (Top 3-5)
   - Most impactful issues affecting quality of life
   - Root causes that affect multiple systems
   - Seed oil damage if exposure is high

6. Hidden Patterns
   - Subclinical issues not immediately obvious
   - System interconnections
   - Early warning signs

Return as JSON:
{
  "overallScore": number,
  "nodeScores": {
    "ASSIMILATION": number,
    "DEFENSE_REPAIR": number,
    "ENERGY": number,
    "BIOTRANSFORMATION": number,
    "TRANSPORT": number,
    "COMMUNICATION": number,
    "STRUCTURAL": number
  },
  "seedOilAssessment": {
    "exposureLevel": number,
    "damageIndicators": number,
    "recoveryPotential": number,
    "priorityLevel": "LOW|MODERATE|HIGH|CRITICAL",
    "recommendedInterventions": ["specific interventions"]
  },
  "riskLevel": "LOW|MODERATE|HIGH|CRITICAL",
  "primaryConcerns": ["top concerns"],
  "strengths": ["positive findings"],
  "hiddenPatterns": ["subtle patterns identified"]
}
`;

    const response = await anthropic.messages.create({
      model: this.MODEL,
      max_tokens: this.MAX_TOKENS,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    const result = this.parseJSONResponse(content);

    // Store the analysis
    await this.storeAssessmentAnalysis(assessmentId, result);

    return result;
  }

  /**
   * Generates personalized lab recommendations based on assessment
   */
  async recommendLabs(assessmentId: string): Promise<{
    essential: string[];
    recommended: string[];
    optional: string[];
    reasoning: Record<string, string>;
    expectedFindings: Record<string, string>;
  }> {
    const analysis = await prisma.assessmentAnalysis.findUnique({
      where: { assessmentId },
    });

    if (!analysis) {
      throw new Error("Assessment analysis not found");
    }

    const prompt = `
Based on this functional medicine assessment analysis, recommend appropriate lab tests.

Assessment Analysis:
${JSON.stringify(analysis, null, 2)}

Consider:
1. Seed oil damage markers if exposure is high:
   - F2-isoprostanes (gold standard for lipid peroxidation)
   - 4-HNE (oxidative damage marker)
   - Omega-6:Omega-3 ratio
   - Oxidized LDL

2. Functional medicine labs based on node scores:
   - GI-MAP for digestive issues
   - DUTCH for hormonal imbalances
   - Organic Acids Test for mitochondrial dysfunction
   - Heavy metals if detox impairment
   - Food sensitivity if multiple reactions

3. Standard labs to rule out pathology:
   - CBC, CMP, Thyroid panel
   - Inflammatory markers (CRP, ESR)
   - Metabolic markers if indicated

Categorize as:
- Essential: Must have for accurate diagnosis
- Recommended: Would significantly enhance understanding
- Optional: Nice to have but not critical

Return as JSON:
{
  "essential": ["lab names"],
  "recommended": ["lab names"],
  "optional": ["lab names"],
  "reasoning": {
    "lab_name": "specific clinical reasoning"
  },
  "expectedFindings": {
    "lab_name": "what we expect to find based on symptoms"
  }
}
`;

    const response = await anthropic.messages.create({
      model: this.MODEL,
      max_tokens: this.MAX_TOKENS,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    return this.parseJSONResponse(content);
  }

  // Helper methods
  private buildAssessmentContext(assessment: any, responses: any[]) {
    return {
      currentModule: assessment.currentModule,
      questionsAsked: assessment.questionsAsked,
      responseCount: responses.length,
      symptomProfile: assessment.symptomProfile || {},
      seedOilRisk: assessment.seedOilRisk || {},
      lastResponses: responses.slice(-5), // Last 5 responses for context
    };
  }

  private parseJSONResponse(content: string): any {
    try {
      // Extract JSON from Claude's response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("No JSON found in response");
    } catch (error) {
      console.error("Error parsing AI response:", error);
      throw new Error("Failed to parse AI response");
    }
  }

  private async storeAIReasoning(
    assessmentId: string,
    type: string,
    reasoning: any
  ) {
    // Store in database for audit trail
    await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        aiContext: {
          ...reasoning,
          type,
          timestamp: new Date(),
        },
      },
    });
  }

  private async storeAssessmentAnalysis(assessmentId: string, analysis: any) {
    await prisma.assessmentAnalysis.upsert({
      where: { assessmentId },
      create: {
        assessmentId,
        overallScore: analysis.overallScore,
        nodeScores: analysis.nodeScores,
        seedOilScore: analysis.seedOilAssessment,
        aiSummary: JSON.stringify(analysis),
        keyFindings: analysis.primaryConcerns,
        riskFactors: analysis.hiddenPatterns,
        strengths: analysis.strengths,
        primaryConcerns: analysis.primaryConcerns,
        suggestedLabs: {},
        labPredictions: {},
      },
      update: {
        overallScore: analysis.overallScore,
        nodeScores: analysis.nodeScores,
        seedOilScore: analysis.seedOilAssessment,
        aiSummary: JSON.stringify(analysis),
        keyFindings: analysis.primaryConcerns,
        riskFactors: analysis.hiddenPatterns,
        strengths: analysis.strengths,
        updatedAt: new Date(),
      },
    });
  }
}

// Export singleton instance
export const assessmentAI = new AssessmentAIService();
