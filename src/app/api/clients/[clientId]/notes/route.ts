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
    console.log("Token verification failed in API route:", error);
    throw new Error("Invalid token");
  }
}

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
  try {
    // Verify authentication
    const user = verifyAuthToken(request);
    console.log("Authenticated user creating note:", user.email);

    const { clientId } = await params;
    const body = await request.json();
    const validatedData = createNoteSchema.parse(body);

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const note = await prisma.note.create({
      data: {
        ...validatedData,
        clientId,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Verify authentication
    const user = verifyAuthToken(request);
    console.log("Authenticated user fetching notes:", user.email);

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
