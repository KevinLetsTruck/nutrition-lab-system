import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: "ANTHROPIC_API_KEY not set",
        },
        { status: 500 }
      );
    }

    // Create client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Simple test prompt
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content:
            'Say "Hello, I am Claude and I can analyze health assessments!"',
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message:
        response.content[0].type === "text"
          ? response.content[0].text
          : "No text response",
    });
  } catch (error: any) {
    console.error("Claude test error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
