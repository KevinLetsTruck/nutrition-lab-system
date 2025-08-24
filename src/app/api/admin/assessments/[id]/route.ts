import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth-middleware";
import { generateAssessmentAnalysis } from "@/lib/ai/assessment-analysis";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth(req);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: assessmentId } = await context.params;

    // Get assessment with all related data
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        responses: {
          orderBy: { answeredAt: "asc" },
        },
        analysis: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    // If completed but no analysis exists, generate it
    if (assessment.status === "COMPLETED" && !assessment.analysis) {
      try {
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

        assessment.analysis = savedAnalysis;
      } catch (error) {
        console.error("Error generating analysis:", error);
        // Continue without analysis if generation fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        assessment: {
          id: assessment.id,
          status: assessment.status,
          currentModule: assessment.currentModule,
          questionsAsked: assessment.questionsAsked,
          questionsSaved: assessment.questionsSaved,
          startedAt: assessment.startedAt,
          completedAt: assessment.completedAt,
          client: assessment.client,
        },
        analysis: assessment.analysis,
        responses: assessment.responses.map((r) => ({
          id: r.id,
          questionId: r.questionId,
          questionText: r.questionText,
          questionModule: r.questionModule,
          responseValue: r.responseValue,
          responseText: r.responseText,
          score: r.score,
          answeredAt: r.answeredAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}
