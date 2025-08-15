import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { APIResponse, APIErrorResponse } from "@/types/api";
import jwt from "jsonwebtoken";

/**
 * Verify authentication token
 */
function verifyAuthToken(request: NextRequest): {
  userId: string;
  email: string;
} {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No valid authorization header");
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return { userId: payload.id, email: payload.email };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * POST /api/assessment/analyze - Trigger AI analysis for an assessment
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuthToken(request);
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Session ID is required",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get session with all related data
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            isTruckDriver: true,
            healthGoals: true,
            medications: true,
            conditions: true,
            allergies: true,
          },
        },
        template: {
          include: {
            questions: true,
            categories: true,
            scoringRules: true,
          },
        },
        responses: {
          orderBy: { timestamp: "desc" },
          distinct: ["questionId"],
        },
        scores: true,
        aiAnalysis: true,
      },
    });

    if (!session) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Assessment session not found",
        statusCode: 404,
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if assessment is complete enough for analysis
    const totalQuestions = session.template.questions.length;
    const answeredQuestions = session.responses.length;
    const completionPercentage = (answeredQuestions / totalQuestions) * 100;

    if (completionPercentage < 70) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Assessment must be at least 70% complete for analysis",
        details: {
          currentProgress: Math.round(completionPercentage),
          requiredProgress: 70,
        },
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if analysis already exists and is recent
    if (session.aiAnalysis) {
      const hoursSinceAnalysis =
        (new Date().getTime() -
          new Date(session.aiAnalysis.analyzedAt).getTime()) /
        (1000 * 60 * 60);

      if (hoursSinceAnalysis < 24) {
        const response: APIResponse<typeof session.aiAnalysis> = {
          success: true,
          data: session.aiAnalysis,
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(response);
      }
    }

    // Calculate scores first
    const scores = await calculateAssessmentScores(session);

    // Save scores
    await prisma.$transaction(
      scores.map((score) =>
        prisma.assessmentScore.create({
          data: {
            sessionId,
            ...score,
          },
        })
      )
    );

    // Prepare data for AI analysis
    const analysisData = {
      client: session.client,
      template: {
        name: session.template.name,
        description: session.template.description,
        categories: session.template.categories,
      },
      responses: session.responses.map((r) => {
        const question = session.template.questions.find(
          (q) => q.id === r.questionId
        );
        return {
          question: question?.text,
          category: question?.category,
          type: question?.type,
          value: r.value,
          timestamp: r.timestamp,
        };
      }),
      scores,
    };

    // Call AI service (placeholder - will be implemented in AI service)
    // const aiAnalysis = await analyzeAssessment(analysisData);

    // For now, return a placeholder response
    const placeholderAnalysis = {
      id: `analysis_${Date.now()}`,
      sessionId,
      analyzedAt: new Date(),
      model: "claude-3",
      findings: [],
      recommendations: [],
      riskFactors: [],
      confidence: 0.85,
    };

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userEmail: user.email,
        action: "CREATE",
        resource: "AI_ANALYSIS",
        resourceId: placeholderAnalysis.id,
        clientId: session.clientId,
        success: true,
        details: {
          sessionId,
          templateName: session.template.name,
          responsesAnalyzed: session.responses.length,
        },
      },
    });

    const response: APIResponse<typeof placeholderAnalysis> = {
      success: true,
      data: placeholderAnalysis,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to analyze assessment:", error);

    const errorResponse: APIErrorResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to analyze assessment",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Calculate assessment scores based on scoring rules
 */
async function calculateAssessmentScores(session: any) {
  const scores = [];

  for (const rule of session.template.scoringRules) {
    const relevantResponses = session.responses.filter((r: any) =>
      rule.questionIds.includes(r.questionId)
    );

    let score = 0;
    let maxScore = 0;

    switch (rule.calculation) {
      case "sum":
        score = relevantResponses.reduce((sum: number, r: any) => {
          const value = typeof r.value === "number" ? r.value : 0;
          return sum + value;
        }, 0);
        maxScore = rule.questionIds.length * 10; // Assuming max value of 10
        break;

      case "average":
        const sum = relevantResponses.reduce((sum: number, r: any) => {
          const value = typeof r.value === "number" ? r.value : 0;
          return sum + value;
        }, 0);
        score =
          relevantResponses.length > 0 ? sum / relevantResponses.length : 0;
        maxScore = 10; // Assuming max value of 10
        break;

      case "weighted":
        score = relevantResponses.reduce((sum: number, r: any) => {
          const value = typeof r.value === "number" ? r.value : 0;
          const weight = rule.weights?.[r.questionId] || 1;
          return sum + value * weight;
        }, 0);
        maxScore = rule.questionIds.reduce((sum: number, qId: string) => {
          const weight = rule.weights?.[qId] || 1;
          return sum + 10 * weight; // Assuming max value of 10
        }, 0);
        break;

      case "custom":
        if (rule.customCalculator) {
          score = rule.customCalculator(relevantResponses);
        }
        break;
    }

    scores.push({
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      maxScore: Math.round(maxScore * 100) / 100,
      interpretation: getScoreInterpretation(score, maxScore, rule.name),
      recommendations: getScoreRecommendations(score, maxScore, rule.name),
    });
  }

  return scores;
}

/**
 * Get interpretation for a score
 */
function getScoreInterpretation(
  score: number,
  maxScore: number,
  ruleName: string
): string {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  if (percentage >= 80) {
    return `Excellent performance in ${ruleName}. Minimal concerns identified.`;
  } else if (percentage >= 60) {
    return `Good performance in ${ruleName} with some areas for improvement.`;
  } else if (percentage >= 40) {
    return `Moderate concerns in ${ruleName}. Several areas need attention.`;
  } else {
    return `Significant concerns in ${ruleName}. Immediate attention recommended.`;
  }
}

/**
 * Get recommendations based on score
 */
function getScoreRecommendations(
  score: number,
  maxScore: number,
  ruleName: string
): string[] {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const recommendations: string[] = [];

  if (percentage < 40) {
    recommendations.push(
      `Schedule immediate consultation to address ${ruleName} concerns`
    );
    recommendations.push(`Consider comprehensive intervention plan`);
  } else if (percentage < 60) {
    recommendations.push(`Focus on improving weak areas in ${ruleName}`);
    recommendations.push(`Regular monitoring recommended`);
  } else if (percentage < 80) {
    recommendations.push(`Continue current approach with minor adjustments`);
    recommendations.push(`Reassess in 3-6 months`);
  } else {
    recommendations.push(`Maintain current positive practices`);
    recommendations.push(`Annual reassessment sufficient`);
  }

  return recommendations;
}
