import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth-middleware";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await auth(req);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, templateId } = await req.json();

    // Verify the user has access to this client
    if (
      authResult.user.role === "CLIENT" &&
      authResult.user.clientId !== clientId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if client already has an active assessment
    const existingAssessment = await prisma.clientAssessment.findFirst({
      where: {
        clientId,
        status: "IN_PROGRESS",
      },
    });

    if (existingAssessment) {
      return NextResponse.json(
        { error: "Client already has an active assessment" },
        { status: 400 }
      );
    }

    // Get template
    const template = await prisma.assessmentTemplate.findFirst({
      where: { id: templateId || "default" },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Assessment template not found" },
        { status: 404 }
      );
    }

    // Create new assessment
    const assessment = await prisma.clientAssessment.create({
      data: {
        clientId,
        templateId: template.id,
        currentModule: "NEUROLOGICAL", // Start with first body system
        status: "IN_PROGRESS",
        startedAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    // Get first question
    const questions = template.questionBank as any[];
    const firstQuestion = questions.find((q) => q.module === "NEUROLOGICAL");

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        status: assessment.status,
        currentModule: assessment.currentModule,
        questionsAsked: 0,
        totalQuestions: questions.length,
      },
      firstQuestion: firstQuestion || questions[0],
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}
