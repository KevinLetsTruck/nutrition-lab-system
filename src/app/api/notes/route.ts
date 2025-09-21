import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { z } from "zod";
import { handleApiError } from "@/lib/error-handler";
import { createCachedResponse, getCached, setCached } from "@/lib/cache";



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
    const user = await verifyAuthToken(request);

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
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

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
    return handleApiError(error);
  }
}
