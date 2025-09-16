import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";



// Validation schema for creating notes
const createNoteSchema = z.object({
  clientId: z.string(),
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

export async function GET(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const noteType = searchParams.get("noteType");

    const notes = await prisma.note.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(noteType && { noteType: noteType as "INTERVIEW" | "COACHING" }),
      },
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
      orderBy: { createdAt: "desc" },
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

export async function POST(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createNoteSchema.parse(body);

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: validatedData.clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Create note with explicit field mapping to avoid schema mismatches
    const noteData = {
      clientId: validatedData.clientId,
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

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
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

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
