import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await context.params;
    const body = await request.json();

    console.log("Debug: Received request for assessment:", assessmentId);
    console.log("Debug: Request body:", body);

    // Check if this is a test assessment
    if (!body.isTest || !body.responses) {
      return NextResponse.json(
        {
          error: "This debug endpoint only handles test assessments",
        },
        { status: 400 }
      );
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: "ANTHROPIC_API_KEY not configured",
        },
        { status: 500 }
      );
    }

    // Format responses
    const responseMap: Record<string, any> = {};
    body.responses.forEach((response: any) => {
      responseMap[response.questionId] = response.value;
    });

    console.log("Debug: Formatted responses:", responseMap);

    // Create Claude client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Simple test analysis
    const prompt = `Analyze these health assessment responses and provide one key finding:
    ${JSON.stringify(responseMap, null, 2)}`;

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const analysisText =
      response.content[0].type === "text"
        ? response.content[0].text
        : "No response";

    return NextResponse.json({
      success: true,
      debug: true,
      assessmentId,
      responseCount: body.responses.length,
      analysis: {
        quickAnalysis: analysisText,
        primaryPatterns: [
          {
            pattern: "Test Pattern",
            evidence: ["This is a debug response"],
          },
        ],
        analysisVersion: "debug",
        analyzedBy: "claude-debug",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Debug analysis error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack?.split("\n").slice(0, 5),
      },
      { status: 500 }
    );
  }
}
