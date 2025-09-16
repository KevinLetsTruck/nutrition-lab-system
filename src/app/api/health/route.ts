import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic API functionality without database
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is working'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'API failed', details: error.message },
      { status: 500 }
    );
  }
}

// TEMPORARY: Test notes creation via working endpoint
export async function POST(request: NextRequest) {
  console.log('🧪 HEALTH POST: Testing notes creation');
  
  try {
    // Step 1: Basic response test
    console.log('✅ Step 1: Endpoint reached');
    
    // Step 2: Auth test
    const authHeader = request.headers.get("authorization");
    console.log('✅ Step 2: Auth header present:', !!authHeader);
    
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
    console.log('✅ Step 3: Body parsed, keys:', Object.keys(body));
    
    // Step 4: Database import test
    console.log('🔄 Step 4: Testing database import...');
    const { prisma } = await import("@/lib/db");
    console.log('✅ Step 4: Database imported');
    
    // Step 5: Database connection test
    console.log('🔄 Step 5: Testing database connection...');
    await prisma.$connect();
    console.log('✅ Step 5: Database connected');
    
    // Step 6: Client lookup test
    const clientId = body.clientId;
    if (!clientId) {
      return NextResponse.json({ 
        error: "clientId required in body",
        step: "validation",
        debug: true 
      }, { status: 400 });
    }
    
    console.log('🔄 Step 6: Looking up client:', clientId);
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });
    
    if (!client) {
      console.log('❌ Client not found');
      return NextResponse.json({ 
        error: "Client not found",
        clientId,
        step: "client_lookup",
        debug: true 
      }, { status: 404 });
    }
    
    console.log('✅ Step 6: Client found:', client.firstName, client.lastName);
    
    // Step 7: Note creation test
    console.log('🔄 Step 7: Creating test note...');
    
    // Generate a unique ID for the note
    const noteId = `cm${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    const note = await prisma.note.create({
      data: {
        id: noteId,
        clientId,
        noteType: "COACHING",
        title: "Test Note via Health Endpoint",
        generalNotes: body.generalNotes || "Test note for debugging",
        isImportant: false,
        followUpNeeded: false,
        updatedAt: new Date(),
      }
    });
    
    console.log('✅ Step 7: Note created successfully:', note.id);
    
    return NextResponse.json({
      success: true,
      message: "Note created successfully via health endpoint",
      noteId: note.id,
      client: `${client.firstName} ${client.lastName}`,
      steps: [
        "Endpoint reached",
        "Auth validated",
        "Body parsed", 
        "Database imported",
        "Database connected",
        "Client found",
        "Note created"
      ],
      debug: true
    });
    
  } catch (error) {
    console.error('❌ HEALTH POST ERROR:', error);
    return NextResponse.json({
      error: "Note creation failed",
      details: error instanceof Error ? error.message : "Unknown error",
      errorName: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : "No stack",
      debug: true
    }, { status: 500 });
  }
}
