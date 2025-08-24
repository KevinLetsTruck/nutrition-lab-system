import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth-helpers";
import { generateAssessmentAnalysis } from "../../../../../../lib/ai/assessment-analysis";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authenticated user
    const session = await auth(req);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: assessmentId } = await params;

    // Get completed assessment with all responses
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: assessmentId,
        clientId: session.user.id,
        status: "COMPLETED",
      },
      include: {
        responses: {
          orderBy: { answeredAt: "asc" },
        },
        analysis: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Completed assessment not found" },
        { status: 404 }
      );
    }

    // Check if analysis already exists
    if (assessment.analysis) {
      return NextResponse.json({
        success: true,
        data: {
          assessment: {
            id: assessment.id,
            completedAt: assessment.completedAt,
            questionsAsked: assessment.questionsAsked,
            questionsSaved: assessment.questionsSaved,
          },
          analysis: assessment.analysis,
          responses: assessment.responses,
        },
      });
    }

    // Generate analysis if it doesn't exist
    const analysisResult = await generateAssessmentAnalysis({
      assessmentId,
      responses: assessment.responses,
      symptomProfile: assessment.symptomProfile as any,
      aiContext: assessment.aiContext as any,
    });

    // Save the analysis
    const savedAnalysis = await prisma.assessmentAnalysis.create({
      data: {
        assessmentId,
        overallScore: analysisResult.overallScore,
        nodeScores: analysisResult.nodeScores,
        aiSummary: analysisResult.summary,
        keyFindings: analysisResult.keyFindings,
        riskFactors: analysisResult.riskFactors,
        strengths: analysisResult.strengths,
        primaryConcerns: analysisResult.primaryConcerns,
        suggestedLabs: analysisResult.suggestedLabs,
        labPredictions: analysisResult.labPredictions,
        seedOilScore: analysisResult.seedOilAssessment,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        assessment: {
          id: assessment.id,
          completedAt: assessment.completedAt,
          questionsAsked: assessment.questionsAsked,
          questionsSaved: assessment.questionsSaved,
        },
        analysis: savedAnalysis,
        responses: assessment.responses,
      },
    });
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch assessment results",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
