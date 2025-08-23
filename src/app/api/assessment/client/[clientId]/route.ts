import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth-middleware";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ clientId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await auth(req);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await context.params;

    // Verify the user has access to this client
    if (
      authResult.user.role === "CLIENT" &&
      authResult.user.clientId !== clientId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the most recent assessment for this client
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        clientId: clientId,
      },
      orderBy: {
        startedAt: "desc",
      },
      include: {
        template: true,
      },
    });

    if (!assessment) {
      return NextResponse.json({
        success: true,
        assessment: null,
      });
    }

    // Get total questions count
    const questionBank = assessment.template.questionBank as any[];
    const totalQuestions = questionBank?.length || 0;

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        status: assessment.status,
        currentModule: assessment.currentModule,
        questionsAsked: assessment.questionsAsked,
        totalQuestions,
        startedAt: assessment.startedAt,
        completedAt: assessment.completedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching client assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}
