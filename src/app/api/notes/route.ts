import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Helper function to verify JWT token
function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No valid authorization header");
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return payload;
  } catch (error) {

    throw new Error("Invalid token");
  }
}

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
    // Verify authentication
    const user = verifyAuthToken(request);

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
    // Verify authentication
    const user = verifyAuthToken(request);

    const body = await request.json();
    const validatedData = createNoteSchema.parse(body);

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: validatedData.clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const note = await prisma.note.create({
      data: {
        clientId: validatedData.clientId,
        noteType: validatedData.noteType,
        title: validatedData.title,
        chiefComplaints: validatedData.chiefComplaints,
        healthHistory: validatedData.healthHistory,
        currentMedications: validatedData.currentMedications,
        goals: validatedData.goals,
        protocolAdjustments: validatedData.protocolAdjustments,
        complianceNotes: validatedData.complianceNotes,
        progressMetrics: validatedData.progressMetrics,
        nextSteps: validatedData.nextSteps,
        generalNotes: validatedData.generalNotes,
        isImportant: validatedData.isImportant || false,
        followUpNeeded: validatedData.followUpNeeded || false,
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
