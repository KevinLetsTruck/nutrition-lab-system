// Combined API endpoint for client detail page - all data in one request
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

interface AuthPayload {
  id: string;
  email: string;
  role: string;
}

async function verifyAuthToken(request: NextRequest): Promise<AuthPayload> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No valid authorization header");
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const user = await verifyAuthToken(request);
    const { clientId } = await params;

    // Single database query to get all client data with related records
    const clientData = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        documents: {
          orderBy: { uploadedAt: "desc" },
          take: 50, // Limit to recent documents
          select: {
            id: true,
            fileName: true,
            originalFileName: true,
            documentType: true,
            uploadedAt: true,
            fileUrl: true,
            status: true,
            fileSize: true,
            fileType: true,
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
          take: 100, // Limit to recent notes
          select: {
            id: true,
            noteType: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            chiefComplaints: true,
            healthHistory: true,
            currentMedications: true,
            goals: true,
            protocolAdjustments: true,
            complianceNotes: true,
            progressMetrics: true,
            nextSteps: true,
            generalNotes: true,
            isImportant: true,
            followUpNeeded: true,
          },
        },
      },
    });

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Calculate note counts by type
    const noteCounts = {
      interview: clientData.notes.filter((n) => n.noteType === "INTERVIEW")
        .length,
      coaching: clientData.notes.filter((n) => n.noteType === "COACHING")
        .length,
    };

    // Separate notes by type for easier client-side processing
    const notesByType = {
      interview: clientData.notes.filter((n) => n.noteType === "INTERVIEW"),
      coaching: clientData.notes.filter((n) => n.noteType === "COACHING"),
    };

    return NextResponse.json({
      client: {
        id: clientData.id,
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone,
        dateOfBirth: clientData.dateOfBirth,
        gender: clientData.gender,
        isTruckDriver: clientData.isTruckDriver,
        healthGoals: clientData.healthGoals,
        status: clientData.status,
        createdAt: clientData.createdAt,
        updatedAt: clientData.updatedAt,
      },
      documents: clientData.documents,
      notes: clientData.notes,
      notesByType,
      noteCounts,
      stats: {
        totalDocuments: clientData.documents.length,
        totalNotes: clientData.notes.length,
        interviewNotes: noteCounts.interview,
        coachingNotes: noteCounts.coaching,
      },
    });
  } catch (error) {
    console.error("Error fetching complete client data:", error);
    console.error("Full error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    return NextResponse.json(
      {
        error: "Failed to fetch client data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
