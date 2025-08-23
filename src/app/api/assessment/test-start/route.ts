import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getQuestionsByModule, questionBank } from "../../../../lib/assessment/questions";
import { FunctionalModule, QuestionType } from "../../../../lib/assessment/types";

// Simple test questions for demonstrating all question types
const testQuestions = [
  {
    id: "TEST_LIKERT_01",
    text: "How would you rate your energy level throughout the day?",
    type: QuestionType.LIKERT_SCALE,
    module: FunctionalModule.SCREENING,
    scoringWeight: 1.5,
    clinicalRelevance: ["energy", "fatigue"],
    scaleMin: "No energy",
    scaleMax: "Abundant energy"
  },
  {
    id: "TEST_YN_01",
    text: "Do you experience brain fog or difficulty concentrating?",
    type: QuestionType.YES_NO,
    module: FunctionalModule.SCREENING,
    scoringWeight: 1.2,
    clinicalRelevance: ["cognitive_function"]
  },
  {
    id: "TEST_MC_01",
    text: "Which cooking oil do you use most frequently at home?",
    type: QuestionType.MULTIPLE_CHOICE,
    module: FunctionalModule.SCREENING,
    options: [
      { value: "olive", label: "Olive oil", score: 0 },
      { value: "coconut", label: "Coconut oil", score: 0 },
      { value: "canola", label: "Canola oil", score: 5 },
      { value: "vegetable", label: "Vegetable oil", score: 8 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["seed_oil_exposure"]
  },
  {
    id: "TEST_FREQ_01",
    text: "How often do you experience digestive discomfort after meals?",
    type: QuestionType.FREQUENCY,
    module: FunctionalModule.SCREENING,
    frequencyOptions: [
      { value: "never", label: "Never" },
      { value: "rarely", label: "Rarely (1-2 times/month)" },
      { value: "sometimes", label: "Sometimes (1-2 times/week)" },
      { value: "often", label: "Often (3-5 times/week)" },
      { value: "always", label: "Always (Daily)" }
    ],
    scoringWeight: 1.8,
    clinicalRelevance: ["digestive_health"]
  },
  {
    id: "TEST_MS_01",
    text: "Which symptoms do you currently experience? (Select all that apply)",
    type: QuestionType.MULTI_SELECT,
    module: FunctionalModule.SCREENING,
    options: [
      { value: "fatigue", label: "Chronic fatigue" },
      { value: "headaches", label: "Frequent headaches" },
      { value: "joint_pain", label: "Joint pain or stiffness" },
      { value: "digestive", label: "Digestive issues" }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["symptom_clustering"]
  }
];

// TEST ENDPOINT - No authentication required
export async function POST(req: NextRequest) {
  try {
    console.log("TEST: Starting assessment without auth");

    // Check if we should include test questions
    const body = await req.json().catch(() => ({}));
    const useTestQuestions = body.includeTest === true;

    // Create a test client if needed
    let testClient = await prisma.client.findFirst({
      where: { email: "test@example.com" }
    });

    if (!testClient) {
      testClient = await prisma.client.create({
        data: {
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          password: "test123", // Not used for testing
        }
      });
      console.log("Created test client:", testClient.id);
    }

    // Check if test client has an active assessment
    const existingAssessment = await prisma.clientAssessment.findFirst({
      where: {
        clientId: testClient.id,
        status: "IN_PROGRESS",
      },
    });

    if (existingAssessment) {
      console.log("Found existing assessment:", existingAssessment.id);
      
      // Get questions for current module
      let questions = useTestQuestions && existingAssessment.currentModule === "SCREENING"
        ? [...testQuestions, ...getQuestionsByModule(existingAssessment.currentModule as FunctionalModule)]
        : getQuestionsByModule(existingAssessment.currentModule as FunctionalModule);
      
      // If getQuestionsByModule returns empty, use all screening questions
      if (!questions || questions.length === 0) {
        console.log("No questions from getQuestionsByModule, using questionBank");
        questions = questionBank.filter(q => q.module === existingAssessment.currentModule);
      }
      
      if (!questions || questions.length === 0) {
        console.log("Still no questions, using first question from bank");
        questions = questionBank.filter(q => q.module === "SCREENING");
      }

      const answeredQuestions = await prisma.clientResponse.findMany({
        where: { assessmentId: existingAssessment.id },
        select: { questionId: true },
      });
      
      const answeredIds = new Set(answeredQuestions.map(r => r.questionId));
      const nextQuestion = questions.find(q => !answeredIds.has(q.id)) || questions[0];

      console.log(`Returning existing assessment with question: ${nextQuestion?.id}`);
      console.log(`Using test questions: ${useTestQuestions}`);

      return NextResponse.json({
        success: true,
        data: {
          assessmentId: existingAssessment.id,
          status: "resumed",
          currentModule: existingAssessment.currentModule,
          questionsAsked: existingAssessment.questionsAsked,
          firstQuestion: nextQuestion,
          totalQuestions: questions.length,
          answeredCount: answeredIds.size,
          includesTestQuestions: useTestQuestions
        }
      });
    }

    // Create new assessment
    const assessment = await prisma.clientAssessment.create({
      data: {
        clientId: testClient.id,
        templateId: "default",
        currentModule: "SCREENING",
        questionsAsked: 0,
        questionsSaved: 0,
        completionRate: 0,
        status: "IN_PROGRESS",
        startedAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    // Get first screening question - include test questions if requested
    let screeningQuestions = useTestQuestions 
      ? [...testQuestions, ...getQuestionsByModule("SCREENING" as FunctionalModule)]
      : getQuestionsByModule("SCREENING" as FunctionalModule);
    
    // Fallback if getQuestionsByModule doesn't work
    if (!screeningQuestions || screeningQuestions.length === 0) {
      console.log("getQuestionsByModule returned empty, using questionBank filter");
      screeningQuestions = questionBank.filter(q => q.module === "SCREENING");
    }
    
    // Final fallback - just get first questions from bank
    if (!screeningQuestions || screeningQuestions.length === 0) {
      console.log("No screening questions found, using first 10 from questionBank");
      screeningQuestions = questionBank.slice(0, 10);
    }

    const firstQuestion = screeningQuestions[0];

    console.log(`TEST: Created assessment ${assessment.id}`);
    console.log(`TEST: Using test questions: ${useTestQuestions}`);
    console.log(`TEST: Found ${screeningQuestions.length} screening questions`);
    console.log(`TEST: First question: ${firstQuestion?.id} - ${firstQuestion?.text?.substring(0, 50)}`);

    return NextResponse.json({
      success: true,
      data: {
        assessmentId: assessment.id,
        status: "started",
        currentModule: "SCREENING",
        questionsAsked: 0,
        firstQuestion,
        totalQuestions: screeningQuestions.length,
        includesTestQuestions: useTestQuestions
      }
    });

  } catch (error) {
    console.error("TEST: Assessment start error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to start assessment" 
      },
      { status: 500 }
    );
  }
}
