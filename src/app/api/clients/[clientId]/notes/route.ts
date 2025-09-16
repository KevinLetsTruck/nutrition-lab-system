import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for creating notes
const createNoteSchema = z.object({
  noteType: z.enum(["INTERVIEW", "COACHING"]),
  title: z.string().optional(),
  chiefComplaints: z.string().optional(),
  healthHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  goals: z.string().optional(),
  protocolAdjustments: z.string().optional(),
  complianceNotes: z.string().optional(),
  progressMetrics: z.string().optional(),
  nextSteps: z.string().optional(),
  generalNotes: z.string().optional(),
  isImportant: z.boolean().optional(),
  followUpNeeded: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  console.log('🚀 POST /api/clients/[clientId]/notes endpoint called');
  
  try {
    // Simple auth check
    const authHeader = request.headers.get("authorization");
    console.log('🔐 Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ Auth failed - no bearer token');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;
    console.log('📝 Creating note for client:', clientId);
    
    const body = await request.json();
    console.log('📋 Note data received:', body);
    
    const validatedData = createNoteSchema.parse(body);
    console.log('✅ Note data validated:', validatedData);

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      console.log('❌ Client not found:', clientId);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    console.log('👤 Client found:', client.firstName, client.lastName);

    // Create note with explicit field mapping to avoid schema mismatches
    const noteData = {
      clientId,
      noteType: validatedData.noteType,
      title: validatedData.title || null,
      chiefComplaints: validatedData.chiefComplaints || null,
      healthHistory: validatedData.healthHistory || null,
      currentMedications: validatedData.currentMedications || null,
      goals: validatedData.goals || null,
      protocolAdjustments: validatedData.protocolAdjustments || null,
      complianceNotes: validatedData.complianceNotes || null,
      progressMetrics: validatedData.progressMetrics || null,
      nextSteps: validatedData.nextSteps || null,
      generalNotes: validatedData.generalNotes || null,
      isImportant: validatedData.isImportant || false,
      followUpNeeded: validatedData.followUpNeeded || false,
      updatedAt: new Date(),
    };

    // Generate a unique ID for the note
    const noteId = `cm${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const noteDataWithId = {
      id: noteId,
      ...noteData
    };

    console.log('📝 Creating note with data:', noteDataWithId);

    const note = await prisma.note.create({
      data: noteDataWithId,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log('✅ Note created successfully:', note.id);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating note:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      cause: error instanceof Error ? error.cause : undefined
    });
    
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    // Return detailed error information for debugging
    return NextResponse.json(
      { 
        error: "Failed to create note",
        details: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.name : typeof error,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Simple auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const noteType = searchParams.get("type");
    const search = searchParams.get("search");
    const important = searchParams.get("important");
    const followUp = searchParams.get("followUp");
    const sortBy = searchParams.get("sortBy") || "newest";

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Build where clause
    const whereClause: any = {
      clientId,
      ...(noteType && { noteType: noteType as "INTERVIEW" | "COACHING" }),
      ...(important === "true" && { isImportant: true }),
      ...(followUp === "true" && { followUpNeeded: true }),
    };

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { generalNotes: { contains: search, mode: "insensitive" } },
        { chiefComplaints: { contains: search, mode: "insensitive" } },
        { healthHistory: { contains: search, mode: "insensitive" } },
        { currentMedications: { contains: search, mode: "insensitive" } },
        { goals: { contains: search, mode: "insensitive" } },
        { protocolAdjustments: { contains: search, mode: "insensitive" } },
        { complianceNotes: { contains: search, mode: "insensitive" } },
        { progressMetrics: { contains: search, mode: "insensitive" } },
        { nextSteps: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order by clause
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "updated") {
      orderBy = { updatedAt: "desc" };
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy,
    });

    return NextResponse.json(notes);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
