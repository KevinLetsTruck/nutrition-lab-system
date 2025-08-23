import { prisma } from "@/lib/db";
import { allQuestions as questionBank } from "./questions";
import { AssessmentQuestion, FunctionalModule, ClientResponse } from "./types";

export class IntegratedAssessmentService {
  /**
   * Starts a new assessment for a client
   */
  async startAssessment(clientId: string): Promise<{ assessmentId: string; firstQuestion: AssessmentQuestion }> {
    // Get active template
    const template = await prisma.assessmentTemplate.findFirst({
      where: { isActive: true },
    });

    if (!template) {
      throw new Error("No active assessment template found");
    }

    // Check for existing incomplete assessment
    const existing = await prisma.clientAssessment.findFirst({
      where: {
        clientId,
        status: { in: ["IN_PROGRESS", "PAUSED", "NOT_STARTED"] },
      },
    });

    if (existing) {
      // Get the first unanswered question
      const firstQuestion = await this.getNextQuestion(existing.id);
      if (!firstQuestion) {
        throw new Error("No questions available");
      }
      return { 
        assessmentId: existing.id,
        firstQuestion: firstQuestion.question 
      };
    }

    // Create new assessment
    const assessment = await prisma.clientAssessment.create({
      data: {
        clientId,
        templateId: template.id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
        currentModule: "SCREENING",
        questionsAsked: 0,
        questionsSaved: 0,
        aiContext: {},
        symptomProfile: {}
      },
    });

    // Get first question
    const firstQuestion = await this.getNextQuestion(assessment.id);
    if (!firstQuestion) {
      throw new Error("No questions available");
    }

    return { 
      assessmentId: assessment.id,
      firstQuestion: firstQuestion.question 
    };
  }

  /**
   * Gets the next question for the assessment
   * Uses simple sequential logic as fallback when AI is unavailable
   */
  async getNextQuestion(
    assessmentId: string
  ): Promise<{ question: AssessmentQuestion; reasoning: string } | null> {
    try {
      const assessment = await prisma.clientAssessment.findUnique({
        where: { id: assessmentId },
        include: { 
          responses: {
            select: {
              questionId: true,
              questionModule: true,
              responseValue: true
            }
          }
        },
      });

      if (!assessment || assessment.status === "COMPLETED") {
        return null;
      }

      // Get answered question IDs
      const answeredIds = assessment.responses.map((r) => r.questionId);

      // Get available questions for current module
      const moduleQuestions = questionBank.filter(
        (q) =>
          q.module === assessment.currentModule && !answeredIds.includes(q.id)
      );

      // If no questions left in current module, move to next
      if (moduleQuestions.length === 0) {
        const nextModule = await this.determineNextModule(assessmentId);
        if (!nextModule) {
          // Assessment complete
          await this.completeAssessment(assessmentId);
          return null;
        }

        // Update to next module
        await prisma.clientAssessment.update({
          where: { id: assessmentId },
          data: { 
            currentModule: nextModule,
            lastActiveAt: new Date()
          },
        });

        // Recursively get first question of new module
        return this.getNextQuestion(assessmentId);
      }

      // Try AI selection first, but with timeout and fallback
      let selectedQuestion: AssessmentQuestion | null = null;
      let reasoning = "Sequential selection (fallback)";

      try {
        // Only try AI if API key exists
        if (process.env.ANTHROPIC_API_KEY) {
          // Set a timeout for AI call
          const aiPromise = this.selectQuestionWithAI(
            moduleQuestions,
            assessment.responses,
            assessment.currentModule
          );
          
          const timeoutPromise = new Promise<null>((resolve) => 
            setTimeout(() => resolve(null), 3000) // 3 second timeout
          );

          const aiResult = await Promise.race([aiPromise, timeoutPromise]);
          
          if (aiResult) {
            selectedQuestion = aiResult.question;
            reasoning = aiResult.reasoning;
          }
        }
      } catch (aiError) {
        console.warn("AI selection failed, using fallback:", aiError);
      }

      // Fallback to simple selection if AI fails
      if (!selectedQuestion) {
        // Prioritize seed oil questions if not many have been answered
        const seedOilQuestions = moduleQuestions.filter(q => q.isSeedOilQuestion);
        const answeredSeedOilCount = assessment.responses.filter(
          r => questionBank.find(q => q.id === r.questionId)?.isSeedOilQuestion
        ).length;

        if (seedOilQuestions.length > 0 && answeredSeedOilCount < 2) {
          selectedQuestion = seedOilQuestions[0];
          reasoning = "Prioritizing seed oil assessment questions";
        } else {
          // Just take the first available question
          selectedQuestion = moduleQuestions[0];
          reasoning = "Sequential selection";
        }
      }

      // Update questions asked count
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          questionsAsked: assessment.questionsAsked + 1,
          lastActiveAt: new Date()
        }
      });

      return {
        question: selectedQuestion,
        reasoning
      };

    } catch (error) {
      console.error("Error getting next question:", error);
      throw error;
    }
  }

  /**
   * Saves a response and updates assessment progress
   */
  async saveResponse(
    assessmentId: string,
    questionId: string,
    response: any
  ): Promise<void> {
    const question = questionBank.find((q) => q.id === questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    try {
      // Save response
      await prisma.clientResponse.create({
        data: {
          assessmentId,
          questionId,
          questionText: question.text,
          questionModule: question.module,
          responseType: question.type,
          responseValue: response,
          responseText: typeof response === 'string' ? response : JSON.stringify(response),
          confidenceScore: 1.0, // Default confidence
          answeredAt: new Date()
        },
      });

      // Update progress
      const assessment = await prisma.clientAssessment.findUnique({
        where: { id: assessmentId },
        include: { responses: true },
      });

      if (assessment) {
        const totalQuestions = 150; // Approximate for adaptive assessment
        const completionRate = Math.min(
          (assessment.responses.length / totalQuestions) * 100,
          99 // Never show 100% until truly complete
        );

        await prisma.clientAssessment.update({
          where: { id: assessmentId },
          data: {
            questionsAsked: assessment.responses.length,
            lastActiveAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Error saving response:", error);
      throw error;
    }
  }

  /**
   * Determines the next module based on responses
   */
  private async determineNextModule(assessmentId: string): Promise<string | null> {
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) return null;

    const moduleSequence = [
      "SCREENING",
      "ASSIMILATION",
      "DEFENSE_REPAIR",
      "ENERGY",
      "BIOTRANSFORMATION",
      "TRANSPORT",
      "COMMUNICATION",
      "STRUCTURAL"
    ];

    const currentIndex = moduleSequence.indexOf(assessment.currentModule);
    
    // For now, just go sequential. Later we can add AI logic to skip modules
    if (currentIndex < moduleSequence.length - 1) {
      return moduleSequence[currentIndex + 1];
    }

    return null; // Assessment complete
  }

  /**
   * Gets progress information
   */
  async getProgress(assessmentId: string): Promise<any> {
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: { responses: true },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const totalEstimated = 150; // Adaptive assessment target
    const answered = assessment.responses.length;
    const percentComplete = Math.min(Math.round((answered / totalEstimated) * 100), 99);

    return {
      questionsAnswered: answered,
      estimatedTotal: totalEstimated,
      percentComplete,
      currentModule: assessment.currentModule,
      moduleProgress: this.getModuleProgress(assessment.currentModule, assessment.responses)
    };
  }

  /**
   * Gets module-specific progress
   */
  private getModuleProgress(currentModule: string, responses: any[]): string {
    const moduleResponses = responses.filter(r => r.questionModule === currentModule);
    const moduleQuestions = questionBank.filter(q => q.module === currentModule);
    
    if (moduleQuestions.length === 0) return "0%";
    
    const percent = Math.round((moduleResponses.length / moduleQuestions.length) * 100);
    return `${percent}%`;
  }

  /**
   * Completes the assessment
   */
  private async completeAssessment(assessmentId: string): Promise<void> {
    await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Update client's assessment status
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (assessment) {
      await prisma.client.update({
        where: { id: assessment.clientId },
        data: {
          assessmentCompleted: true,
          assessmentCompletedAt: new Date()
        }
      });
    }
  }

  /**
   * Try to use AI for question selection (with proper error handling)
   */
  private async selectQuestionWithAI(
    availableQuestions: AssessmentQuestion[],
    responses: ClientResponse[],
    currentModule: string
  ): Promise<{ question: AssessmentQuestion; reasoning: string } | null> {
    try {
      // This is a placeholder - implement actual AI logic when ready
      // For now, just return null to use fallback
      return null;
    } catch (error) {
      console.warn("AI selection error:", error);
      return null;
    }
  }

  /**
   * Pause assessment
   */
  async pauseAssessment(assessmentId: string): Promise<void> {
    await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "PAUSED",
        lastActiveAt: new Date()
      }
    });
  }

  /**
   * Resume assessment
   */
  async resumeAssessment(assessmentId: string): Promise<void> {
    await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "IN_PROGRESS",
        lastActiveAt: new Date()
      }
    });
  }
}

// Export a singleton instance
export const assessmentService = new IntegratedAssessmentService();
