import { NextResponse } from "next/server";

export async function GET() {
  try {
    const claudeApiKey = process.env.ANTHROPIC_API_KEY;
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      anthropicApiKeyPresent: !!claudeApiKey,
      anthropicApiKeyLength: claudeApiKey ? claudeApiKey.length : 0,
      anthropicApiKeyPrefix: claudeApiKey ? claudeApiKey.substring(0, 8) + "..." : "NOT SET",
      nodeEnv: process.env.NODE_ENV,
      allEnvVars: Object.keys(process.env).filter(key => 
        key.includes('ANTHROPIC') || 
        key.includes('CLAUDE') || 
        key.includes('API')
      )
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to check configuration",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
