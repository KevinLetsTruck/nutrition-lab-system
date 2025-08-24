import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAllQuestions } from "@/lib/assessment/questions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, clientEmail } = body;

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
    const firstQuestion = questions.find(q => q.module === "NEUROLOGICAL" && q.id === "NEURO001");

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
    console.error("Error starting assessment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start assessment",
      },
      { status: 500 }
    );
  }
}
