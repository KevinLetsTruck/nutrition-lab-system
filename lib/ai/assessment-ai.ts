import { Anthropic } from "@anthropic-ai/sdk";
import {
  AssessmentQuestion,
  FunctionalModule,
  SeedOilAssessment,
} from "@/lib/assessment/types";
import { prisma } from "@/src/lib/db";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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

// Helper function for API routes
export async function getNextQuestionWithAI(params: {
  currentModule: string;
  responses: any[];
  symptomProfile: any;
  questionsAsked: number;
  assessmentContext: any;
}): Promise<{
  nextQuestion?: AssessmentQuestion;
  nextModule?: FunctionalModule;
  questionsInModule?: number;
  questionsSaved?: number;
  reasoning?: string;
}> {
  // Import the question modules
  const { getScreeningQuestions } = await import('@/lib/assessment/questions/screening-questions');
  const { getModuleQuestions } = await import('@/lib/assessment/questions');
  
  // Get current module questions
  const currentQuestions = params.currentModule === 'SCREENING' 
    ? getScreeningQuestions()
    : getModuleQuestions(params.currentModule as FunctionalModule);
  
  // Find answered question IDs
  const answeredQuestionIds = new Set(params.responses.map(r => r.questionId));
  
  // Get remaining questions in current module
  const remainingQuestions = currentQuestions.filter(q => !answeredQuestionIds.has(q.id));
  
  // If no remaining questions in current module, move to next module
  if (remainingQuestions.length === 0) {
    // Determine next module based on AI analysis
    const moduleOrder: FunctionalModule[] = [
      'SCREENING',
      'ASSIMILATION',
      'DEFENSE_REPAIR',
      'ENERGY',
      'BIOTRANSFORMATION',
      'TRANSPORT',
      'COMMUNICATION',
      'STRUCTURAL'
    ];
    
    const currentIndex = moduleOrder.indexOf(params.currentModule as FunctionalModule);
    
    // Check if assessment is complete
    if (currentIndex === moduleOrder.length - 1) {
      return {
        nextQuestion: undefined,
        reasoning: 'Assessment complete - all modules finished'
      };
    }
    
    // Move to next module
    const nextModule = moduleOrder[currentIndex + 1];
    const nextModuleQuestions = getModuleQuestions(nextModule);
    
    return {
      nextQuestion: nextModuleQuestions[0],
      nextModule,
      questionsInModule: nextModuleQuestions.length,
      reasoning: `Completed ${params.currentModule} module, moving to ${nextModule}`
    };
  }
  
  // Use AI to select most relevant question from remaining
  // For now, we'll use a simple algorithm based on symptom severity
  
  // Check for high severity symptoms that might skip questions
  const highSeveritySymptoms = params.assessmentContext?.highSeveritySymptoms || [];
  let questionsSaved = 0;
  
  // If we have high severity symptoms in this module, we can skip some questions
  if (highSeveritySymptoms.length > 0) {
    // Skip questions that would be redundant given high severity
    const skipCategories = ['mild_symptoms', 'lifestyle_basic'];
    const filteredQuestions = remainingQuestions.filter(
      q => !skipCategories.includes(q.category || '')
    );
    
    questionsSaved = remainingQuestions.length - filteredQuestions.length;
    
    if (filteredQuestions.length > 0) {
      return {
        nextQuestion: filteredQuestions[0],
        questionsSaved,
        reasoning: `Skipping ${questionsSaved} questions due to high severity symptoms`
      };
    }
  }
  
  // Default: return next question in sequence
  return {
    nextQuestion: remainingQuestions[0],
    questionsSaved: 0,
    reasoning: 'Proceeding with standard question sequence'
  };
}
