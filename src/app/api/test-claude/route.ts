import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🧪 Testing Claude API directly...");
    
    const claudeApiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!claudeApiKey) {
      return NextResponse.json({
        success: false,
        error: "API key not configured"
      });
    }
    
    console.log("🔑 API Key found, making test request...");
    
    // Simple test request
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 100,
        messages: [
          { role: "user", content: "Say hello and confirm you are working." }
        ]
      })
    });

    console.log("📡 Claude API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Claude API error:", response.status, errorText);
      return NextResponse.json({
        success: false,
        status: response.status,
        error: errorText
      });
    }

    const data = await response.json();
    console.log("✅ Claude API success!");
    
    return NextResponse.json({
      success: true,
      status: response.status,
      message: data.content[0].text,
      model: "claude-3-5-sonnet-20241022"
    });

  } catch (error) {
    console.error("🔥 Test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
