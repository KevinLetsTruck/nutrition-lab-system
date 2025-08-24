import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth-middleware";
import { getNextQuestionWithAI } from "@/../lib/ai/assessment-ai";
// FunctionalModule removed - using body system strings directly

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await auth(req);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assessmentId } = await context.params;

    // Get assessment with template and client info
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        template: true,
        client: {
          select: {
            gender: true,
            dateOfBirth: true,
            medications: true,
          },
        },
        responses: {
          select: { questionId: true },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify user has access
    if (
      authResult.user.role === "CLIENT" &&
      authResult.user.clientId !== assessment.clientId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if assessment is already completed
    if (assessment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        completed: true,
        message: "Assessment already completed",
      });
    }

    // Get all questions from template
    const allQuestions = assessment.template.questionBank as any[];

    // Get answered question IDs
    const answeredIds = new Set(assessment.responses.map((r) => r.questionId));

    // Find questions for current module
    const moduleQuestions = allQuestions.filter(
      (q) => q.module === assessment.currentModule
    );

    // Find unanswered questions in current module
    let unansweredInModule = moduleQuestions.filter(
      (q) => !answeredIds.has(q.id)
    );

    // Apply gender filtering if client has gender specified
    if (assessment.client.gender) {
      unansweredInModule = unansweredInModule.filter((q) => {
        // Check genderSpecific property
        if (q.genderSpecific && q.genderSpecific !== assessment.client.gender) {
          return false;
        }

        // Check text-based gender filtering
        const questionText = q.text?.toLowerCase() || "";
        if (
          assessment.client.gender === "male" &&
          (questionText.includes("menstrual") ||
            questionText.includes("period") ||
            questionText.includes("pregnant") ||
            questionText.includes("menopause") ||
            questionText.includes("for women:"))
        ) {
          return false;
        }

        if (
          assessment.client.gender === "female" &&
          (questionText.includes("erectile") ||
            questionText.includes("prostate") ||
            questionText.includes("for men:"))
        ) {
          return false;
        }

        return true;
      });
    }
    
    // Apply conditional logic filtering
    const allResponses = await prisma.clientResponse.findMany({
      where: { assessmentId },
      select: { questionId: true, responseValue: true },
    });
    
    unansweredInModule = unansweredInModule.filter((q) => {
      // Check if this question should be skipped based on previous answers
      for (const response of allResponses) {
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

    let nextQuestion = null;
    let nextModule = assessment.currentModule;
    let aiDecision = null;

    // Try to use AI for intelligent question selection
    const useAI =
      process.env.ANTHROPIC_API_KEY && unansweredInModule.length > 0;

    if (useAI) {
      try {
        // Get ALL responses to ensure we don't repeat questions
        const allResponses = await prisma.clientResponse.findMany({
          where: { assessmentId },
          orderBy: { answeredAt: "desc" },
        });

        // Build context for AI
        const assessmentContext = {
          currentModule: assessment.currentModule,
          responses: allResponses.map((r) => ({
            questionId: r.questionId,
            questionText: r.questionText,
            responseValue: r.responseValue,
            responseType: r.responseType,
            module: r.module,
          })),
          symptomProfile: {}, // Can be enhanced with actual symptom analysis
          questionsAsked: answeredIds.size,
          clientInfo: {
            gender: assessment.client.gender,
            age: assessment.client.dateOfBirth
              ? Math.floor(
                  (new Date().getTime() -
                    new Date(assessment.client.dateOfBirth).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
                )
              : null,
            medications: assessment.client.medications,
          },
        };

        // Get AI recommendation (with caching and optimizations)
        const startTime = Date.now();
        aiDecision = await getNextQuestionWithAI(assessmentContext);
        const aiTime = Date.now() - startTime;

        if (aiDecision.nextQuestion) {
          nextQuestion = aiDecision.nextQuestion;

          // Check if this question was already answered
          if (answeredIds.has(nextQuestion.id)) {
            console.error(
              `WARNING: AI selected already answered question ${nextQuestion.id}! Total answered: ${answeredIds.size}`
            );
            console.error(
              `Answered IDs: ${Array.from(answeredIds).join(", ")}`
            );
            // Fallback to linear selection
            nextQuestion = null;
          } else {
            console.log(
              `AI selected question: ${nextQuestion.id} - Reasoning: ${aiDecision.reasoning} (${aiTime}ms)`
            );
          }
        }
      } catch (error) {
        console.error(
          "AI question selection failed, falling back to linear:",
          error
        );
      }
    }

    // Fallback to linear selection if AI didn't work or no AI key
    if (!nextQuestion) {
      if (unansweredInModule.length > 0) {
        // Still have questions in current module
        nextQuestion = unansweredInModule[0];
      } else {
        // Current module complete, find next module
        const modules = [
          "NEUROLOGICAL",
          "DIGESTIVE",
          "CARDIOVASCULAR",
          "RESPIRATORY",
          "IMMUNE",
          "MUSCULOSKELETAL",
          "ENDOCRINE",
          "INTEGUMENTARY",
          "GENITOURINARY",
          "SPECIAL_TOPICS",
        ];
        const currentIndex = modules.indexOf(assessment.currentModule);

        // Find next module with unanswered questions
        for (let i = currentIndex + 1; i < modules.length; i++) {
          let moduleQuestions = allQuestions.filter(
            (q) => q.module === modules[i] && !answeredIds.has(q.id)
          );

          // Apply gender filtering to next module questions
          if (assessment.client.gender) {
            moduleQuestions = moduleQuestions.filter((q) => {
              // Check genderSpecific property
              if (
                q.genderSpecific &&
                q.genderSpecific !== assessment.client.gender
              ) {
                return false;
              }

              // Check text-based gender filtering
              const questionText = q.text?.toLowerCase() || "";
              if (
                assessment.client.gender === "male" &&
                (questionText.includes("menstrual") ||
                  questionText.includes("period") ||
                  questionText.includes("pregnant") ||
                  questionText.includes("menopause") ||
                  questionText.includes("for women:"))
              ) {
                return false;
              }

              if (
                assessment.client.gender === "female" &&
                (questionText.includes("erectile") ||
                  questionText.includes("prostate") ||
                  questionText.includes("for men:"))
              ) {
                return false;
              }

              return true;
            });
          }
          
          // Apply conditional logic filtering to next module questions
          moduleQuestions = moduleQuestions.filter((q) => {
            // Check if this question should be skipped based on previous answers
            for (const response of allResponses) {
              const answeredQuestion = allQuestions.find(aq => aq.id === response.questionId);
              if (answeredQuestion?.conditionalLogic) {
                for (const logic of answeredQuestion.conditionalLogic) {
                  if (logic.action === "skip" && 
                      logic.condition === response.responseValue &&
                      logic.skipQuestions?.includes(q.id)) {
                    console.log(`Skipping question ${q.id} in module ${modules[i]} based on conditional logic from ${answeredQuestion.id}`);
                    return false; // Skip this question
                  }
                }
              }
            }
            return true;
          });

          if (moduleQuestions.length > 0) {
            nextQuestion = moduleQuestions[0];
            nextModule = modules[i];
            break;
          }
        }
      }
    }

    if (!nextQuestion) {
      // All questions answered, mark as complete
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          completionRate: 100,
        },
      });

      return NextResponse.json({
        success: true,
        completed: true,
        message: "Assessment completed successfully!",
      });
    }

    // Update current module if changed
    if (nextModule !== assessment.currentModule) {
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          currentModule: nextModule,
          lastActiveAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      question: nextQuestion,
      questionsAsked: answeredIds.size,
      totalQuestions: allQuestions.length,
      currentModule: nextModule,
      aiRecommendation: aiDecision
        ? {
            reasoning: aiDecision.reasoning,
            questionsSaved: aiDecision.questionsSaved || 0,
          }
        : null,
    });
  } catch (error) {
    console.error("Error getting next question:", error);
    return NextResponse.json(
      { error: "Failed to get next question" },
      { status: 500 }
    );
  }
}
