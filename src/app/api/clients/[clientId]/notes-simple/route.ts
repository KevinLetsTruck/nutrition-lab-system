import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Minimal note schema
const createNoteSchema = z.object({
  noteType: z.enum(["INTERVIEW", "COACHING"]),
  title: z.string().optional(),
  generalNotes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    console.log('🧪 Simple notes endpoint called');
    
    // Simple auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ Auth failed');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log('✅ Auth passed');

    const { clientId } = await params;
    console.log('📝 Creating note for client:', clientId);
    
    const body = await request.json();
    console.log('📋 Note data received:', body);
    
    const validatedData = createNoteSchema.parse(body);
    console.log('✅ Note data validated:', validatedData);

    // Try to import prisma
    let prisma;
    try {
      const { prisma: prismaClient } = await import("@/lib/db");
      prisma = prismaClient;
      console.log('✅ Prisma imported successfully');
    } catch (importError) {
      console.error('❌ Prisma import failed:', importError);
      return NextResponse.json({ 
        error: "Database connection failed",
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

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      console.log('❌ Client not found:', clientId);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    console.log('👤 Client found:', client.firstName, client.lastName);

    // Create note with minimal data
    const note = await prisma.note.create({
      data: {
        clientId,
        noteType: validatedData.noteType,
        title: validatedData.title || `${validatedData.noteType} Note`,
        generalNotes: validatedData.generalNotes || '',
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log('✅ Note created successfully:', note.id);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating note:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create note",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
