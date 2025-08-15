import { assessmentAI } from "@/lib/ai/assessment-ai";
import { prisma } from "@/lib/db/prisma";
import { questionBank } from "./questions";
import { AssessmentQuestion, FunctionalModule } from "./types";

export class AssessmentService {
  /**
   * Starts a new assessment for a client
   */
  async startAssessment(clientId: string): Promise<string> {
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
        status: { in: ["IN_PROGRESS", "PAUSED"] },
      },
    });

    if (existing) {
      return existing.id;
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
        completionRate: 0,
      },
    });

    return assessment.id;
  }

  /**
   * Gets the next question for the assessment
   */
  async getNextQuestion(
    assessmentId: string
  ): Promise<AssessmentQuestion | null> {
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: { responses: true },
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

    if (moduleQuestions.length === 0) {
      // Module complete, check for next module
      const nextModule = await this.determineNextModule(assessmentId);
      if (nextModule) {
        await prisma.clientAssessment.update({
          where: { id: assessmentId },
          data: { currentModule: nextModule },
        });
        return this.getNextQuestion(assessmentId);
      }
      return null;
    }

    // Use AI to select the best next question
    const selection = await assessmentAI.selectNextQuestion(
      assessmentId,
      moduleQuestions,
      assessment.responses
    );

    const question = moduleQuestions.find((q) => q.id === selection.questionId);

    if (!question) {
      // Fallback to first available question
      return moduleQuestions[0];
    }

    return question;
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

    // Save response
    await prisma.clientResponse.create({
      data: {
        assessmentId,
        questionId,
        questionText: question.text,
        questionModule: question.module,
        responseType: question.type,
        responseValue: response.value,
        responseText: response.text,
        confidenceScore: response.confidence,
      },
    });

    // Update progress
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: { responses: true },
    });

    if (assessment) {
      const totalQuestions = 400; // Approximate
      const completionRate =
        (assessment.responses.length / totalQuestions) * 100;

      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          questionsAsked: assessment.responses.length,
          completionRate,
          lastActiveAt: new Date(),
        },
      });

      // Check for high-risk responses that need immediate attention
      await this.checkForRedFlags(assessmentId, questionId, response);
    }
  }

  /**
   * Determines the next module based on AI analysis
   */
  private async determineNextModule(
    assessmentId: string
  ): Promise<string | null> {
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) return null;

    // If still in screening, analyze which modules to activate
    if (assessment.currentModule === "SCREENING") {
      const activation = await assessmentAI.analyzeModuleActivation(
        assessmentId
      );

      // Return the first activated module
      if (activation.activateModules.length > 0) {
        return activation.activateModules[0];
      }
    }

    // Define module progression order
    const moduleOrder = [
      "SCREENING",
      "ASSIMILATION",
      "DEFENSE_REPAIR",
      "ENERGY",
      "BIOTRANSFORMATION",
      "TRANSPORT",
      "COMMUNICATION",
      "STRUCTURAL",
    ];

    const currentIndex = moduleOrder.indexOf(assessment.currentModule);
    if (currentIndex < moduleOrder.length - 1) {
      return moduleOrder[currentIndex + 1];
    }

    return null;
  }

  /**
   * Checks for red flag responses that need immediate attention
   */
  private async checkForRedFlags(
    assessmentId: string,
    questionId: string,
    response: any
  ): Promise<void> {
    // Define red flag conditions
    const redFlags = {
      SCR001: { threshold: 2, message: "Severe fatigue reported" },
      SCR_SO01: { threshold: 4, message: "Daily fried food consumption" },
      // Add more red flag definitions
    };

    const flag = redFlags[questionId as keyof typeof redFlags];
    if (flag && response.value >= flag.threshold) {
      // Store red flag in assessment context
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          aiContext: {
            redFlags: {
              [questionId]: {
                message: flag.message,
                value: response.value,
                timestamp: new Date(),
              },
            },
          },
        },
      });
    }
  }

  /**
   * Completes the assessment and triggers analysis
   */
  async completeAssessment(assessmentId: string): Promise<void> {
    // Run comprehensive scoring
    const analysis = await assessmentAI.scoreAssessment(assessmentId);

    // Generate lab recommendations
    const labs = await assessmentAI.recommendLabs(assessmentId);

    // Update assessment status
    await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        seedOilRisk: analysis.seedOilAssessment,
      },
    });

    // Update analysis with lab recommendations
    await prisma.assessmentAnalysis.update({
      where: { assessmentId },
      data: {
        suggestedLabs: labs,
        labPredictions: labs.expectedFindings,
      },
    });
  }
}

export const assessmentService = new AssessmentService();
