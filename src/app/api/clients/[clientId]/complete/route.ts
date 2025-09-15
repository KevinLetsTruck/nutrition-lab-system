// Combined API endpoint for client detail page - all data in one request
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Simple auth check without database lookup
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = params;

    // Try to get basic client data first
    const clientData = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Try to get related data with error handling
    let documents = [];
    let notes = [];

    try {
      const documentsResult = await prisma.document.findMany({
        where: { clientId },
        orderBy: { uploadedAt: "desc" },
        take: 50,
      });
      documents = documentsResult || [];
    } catch (docError) {
      console.warn("Could not fetch documents:", docError);
      documents = [];
    }

    try {
      const notesResult = await prisma.note.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      notes = notesResult || [];
    } catch (noteError) {
      console.warn("Could not fetch notes:", noteError);
      notes = [];
    }

    // Calculate note counts by type
    const noteCounts = {
      interview: notes.filter((n) => n.noteType === "INTERVIEW").length,
      coaching: notes.filter((n) => n.noteType === "COACHING").length,
    };

    // Separate notes by type for easier client-side processing
    const notesByType = {
      interview: notes.filter((n) => n.noteType === "INTERVIEW"),
      coaching: notes.filter((n) => n.noteType === "COACHING"),
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
      documents: documents,
      notes: notes,
      notesByType,
      noteCounts,
      stats: {
        totalDocuments: documents.length,
        totalNotes: notes.length,
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
