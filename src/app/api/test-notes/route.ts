import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test endpoint called');
    
    // Test basic response
    return NextResponse.json({
      success: true,
      message: "Test endpoint working",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      error: "Test endpoint failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test POST endpoint called');
    
    // Test auth header
    const authHeader = request.headers.get("authorization");
    console.log('🔐 Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Test request body parsing
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    return NextResponse.json({
      success: true,
      message: "Test POST working",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test POST error:', error);
    return NextResponse.json({
      error: "Test POST failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
