import { NextResponse } from 'next/server';

// Simple test endpoint to verify API is working
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Test endpoint is working",
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  try {
    // Log to help debug
    console.log("TEST-START: Endpoint called at", new Date().toISOString());
    
    // First, just return a simple success to test if the endpoint works
    return NextResponse.json({
      success: true,
      data: {
        assessmentId: "test-" + Date.now(),
        status: "test-mode",
        currentModule: "SCREENING",
        questionsAsked: 0,
        firstQuestion: {
          id: "TEST_001",
          module: "SCREENING",
          text: "This is a test question - How would you rate your overall health?",
          type: "LIKERT_SCALE",
          options: [
            { value: 1, label: "Poor" },
            { value: 5, label: "Average" },
            { value: 10, label: "Excellent" }
          ]
        }
      }
    });
  } catch (error) {
    console.error("TEST-START: Error occurred:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
