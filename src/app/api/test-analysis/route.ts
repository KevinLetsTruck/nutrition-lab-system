import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Test endpoint working",
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Just echo back what we received
    return NextResponse.json({
      success: true,
      received: body,
      apiKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
