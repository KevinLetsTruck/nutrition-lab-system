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

// TEMPORARY: Test notes creation via health endpoint
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEMP: Testing notes via health endpoint');
    
    // Simple auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ Auth failed');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log('✅ Auth passed');

    const body = await request.json();
    console.log('📋 Request body:', body);
    
    // Test database import
    let prisma;
    try {
      const { prisma: prismaClient } = await import("@/lib/db");
      prisma = prismaClient;
      console.log('✅ Prisma imported successfully');
    } catch (importError) {
      console.error('❌ Prisma import failed:', importError);
      return NextResponse.json({ 
        error: "Database import failed",
        details: importError instanceof Error ? importError.message : "Unknown import error"
      }, { status: 500 });
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log('✅ Database connected');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json({ 
        error: "Database connection failed",
        details: dbError instanceof Error ? dbError.message : "Unknown db error"
      }, { status: 500 });
    }

    // Test client lookup
    const clientId = body.clientId;
    if (!clientId) {
      return NextResponse.json({ error: "clientId required" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      console.log('❌ Client not found:', clientId);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    console.log('👤 Client found:', client.firstName, client.lastName);

    // Create minimal note
    const note = await prisma.note.create({
      data: {
        clientId,
        noteType: "COACHING",
        title: "Test Note via Health Endpoint",
        generalNotes: body.generalNotes || "Test note created via health endpoint",
      },
    });

    console.log('✅ Note created successfully:', note.id);
    return NextResponse.json({ 
      success: true,
      message: "Note created via health endpoint",
      noteId: note.id,
      client: `${client.firstName} ${client.lastName}`
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Health endpoint error:', error);
    return NextResponse.json({
      error: "Health endpoint failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
