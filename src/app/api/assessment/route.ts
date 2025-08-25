import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth-middleware";

export async function POST(req: NextRequest) {
  try {
    // For testing, skip auth - in production, re-enable this
    // const authResult = await auth(req);
    // if (!authResult.authenticated) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { clientId, templateId } = await req.json();

    // Handle test client creation
    let actualClientId = clientId;
    if (clientId === "test-client") {
      // Get or create test client
      let testClient = await prisma.client.findFirst({
        where: { email: "test@example.com" },
      });

      if (!testClient) {
        testClient = await prisma.client.create({
          data: {
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            phone: "555-0123",
            gender: "male",
            dateOfBirth: new Date("1980-01-01"),
          },
        });
      }
      actualClientId = testClient.id;
    }

    // Check if client already has an active assessment
    const existingAssessment = await prisma.clientAssessment.findFirst({
      where: {
        clientId: actualClientId,
        status: "IN_PROGRESS",
      },
    });

    if (existingAssessment) {
      return NextResponse.json(
        {
          error: "Client already has an active assessment",
          existingId: existingAssessment.id,
        },
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
        clientId: actualClientId,
        templateId: template.id,
        currentModule: "SCREENING", // Start with screening questions
        status: "IN_PROGRESS",
        startedAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    // Get first question from the template
    const questions = template.questionBank as any[];
    const firstQuestion = questions[0]; // Just get the first question in the list

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
