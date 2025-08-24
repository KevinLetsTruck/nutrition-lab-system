import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { allQuestions as getAllQuestions } from "../../../../../../lib/assessment/questions";
import { publicAssessmentStartSchema } from "@/lib/validations/assessment";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validationResult = publicAssessmentStartSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid request data",
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { clientId, clientEmail } = validationResult.data;

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client || client.email !== clientEmail) {
      return NextResponse.json(
        { success: false, error: "Invalid client information" },
        { status: 400 }
      );
    }

    // Check for existing incomplete assessment
    const existingAssessment = await prisma.clientAssessment.findFirst({
      where: {
        clientId,
        status: "IN_PROGRESS",
      },
    });

    if (existingAssessment) {
      return NextResponse.json({
        success: true,
        assessment: existingAssessment,
        message: "Resuming existing assessment",
      });
    }

    // Get the assessment template
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: "default" },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Assessment template not found" },
        { status: 404 }
      );
    }

    // Create new assessment
    const assessment = await prisma.clientAssessment.create({
      data: {
        clientId,
        templateId: template.id,
        status: "IN_PROGRESS",
        currentModule: "NEUROLOGICAL", // Start with first body system
        questionsAsked: 0,
        questionsSaved: 0,
        completionRate: 0,
        startedAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    // Get first question
    const questions = getAllQuestions();
    const firstQuestion = questions.find(
      (q) => q.module === "NEUROLOGICAL" && q.id === "NEURO001"
    );

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        clientId: assessment.clientId,
        status: assessment.status,
        currentModule: assessment.currentModule,
        questionsAsked: assessment.questionsAsked,
      },
      firstQuestion,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    console.error("Error starting assessment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start assessment",
        message: process.env.NODE_ENV === "development" 
          ? error instanceof Error ? error.message : "Unknown error"
          : undefined,
      },
      { status: 500 }
    );
  }
}
