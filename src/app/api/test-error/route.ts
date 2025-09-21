import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 TEST ERROR - This should appear in logs");
    
    // Intentionally throw an error to test logging
    throw new Error("Test error for logging verification");
    
  } catch (error) {
    console.error("❌ TEST ERROR - Caught error:", error);
    
    return NextResponse.json(
      { 
        error: "Test error endpoint",
        message: "This is intentional for testing logging"
      },
      { status: 500 }
    );
  }
}
