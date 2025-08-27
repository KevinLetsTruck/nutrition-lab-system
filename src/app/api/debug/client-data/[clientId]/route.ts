import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = params;
    
    // Get exact same data as AI analysis endpoint
    const clientData = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        simpleAssessments: {
          include: {
            responses: true,
          },
          orderBy: { startedAt: "desc" },
        },
        documents: {
          include: {
            DocumentAnalysis: true,
            LabValue: true,
          },
          orderBy: { uploadedAt: "desc" },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
        protocols: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Return summary of what data is available
    const summary = {
      client: {
        name: `${clientData.firstName} ${clientData.lastName}`,
        healthGoals: clientData.healthGoals,
        medications: clientData.medications,
        conditions: clientData.conditions,
        allergies: clientData.allergies,
        status: clientData.status,
      },
      assessments: {
        count: clientData.simpleAssessments.length,
        details: clientData.simpleAssessments.map(assessment => ({
          id: assessment.id,
          status: assessment.status,
          responseCount: assessment.responses.length,
          sampleResponses: assessment.responses.slice(0, 3).map(r => ({
            questionText: r.questionText,
            score: r.score,
            category: r.category,
          })),
        })),
      },
      documents: {
        count: clientData.documents.length,
        details: clientData.documents.map(doc => ({
          fileName: doc.fileName,
          documentType: doc.documentType,
          hasExtractedText: !!doc.extractedText,
          extractedTextLength: doc.extractedText?.length || 0,
          hasAiAnalysis: !!doc.aiAnalysis,
          labValuesCount: doc.LabValue?.length || 0,
        })),
      },
      notes: {
        count: clientData.notes.length,
        details: clientData.notes.map(note => ({
          title: note.title,
          noteType: note.noteType,
          hasChiefComplaints: !!note.chiefComplaints,
          hasHealthHistory: !!note.healthHistory,
          hasGeneralNotes: !!note.generalNotes,
        })),
      },
      protocols: {
        count: clientData.protocols.length,
        details: clientData.protocols.map(protocol => ({
          name: protocol.name,
          status: protocol.status,
          hasSupplements: !!protocol.supplements,
          hasDietary: !!protocol.dietary,
        })),
      },
    };

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Debug client data error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve client data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
