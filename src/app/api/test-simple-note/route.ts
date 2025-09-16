import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log('🧪 SIMPLE TEST: Endpoint called');
  
  try {
    // Step 1: Basic response test
    console.log('✅ Step 1: Basic endpoint working');
    
    // Step 2: Auth test
    const authHeader = request.headers.get("authorization");
    console.log('✅ Step 2: Auth header:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ Auth failed');
      return NextResponse.json({ 
        error: "Unauthorized",
        step: "auth",
        debug: true 
      }, { status: 401 });
    }
    
    // Step 3: Body parsing test
    const body = await request.json();
    console.log('✅ Step 3: Body parsed:', Object.keys(body));
    
    // Step 4: Database import test
    console.log('✅ Step 4: Testing database import...');
    const { prisma } = await import("@/lib/db");
    console.log('✅ Step 4: Database imported successfully');
    
    // Step 5: Database connection test
    console.log('✅ Step 5: Testing database connection...');
    await prisma.$connect();
    console.log('✅ Step 5: Database connected successfully');
    
    // Step 6: Simple query test
    console.log('✅ Step 6: Testing simple query...');
    const clientCount = await prisma.client.count();
    console.log('✅ Step 6: Found', clientCount, 'clients in database');
    
    // Success!
    console.log('🎉 All tests passed!');
    return NextResponse.json({
      success: true,
      message: "All tests passed",
      steps: [
        "Endpoint reached",
        "Auth header validated", 
        "Request body parsed",
        "Database imported",
        "Database connected",
        "Simple query executed"
      ],
      clientCount,
      debug: true
    });
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack",
      debug: true
    }, { status: 500 });
  }
}
