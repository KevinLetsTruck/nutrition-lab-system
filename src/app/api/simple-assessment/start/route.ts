import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { clientId } = await req.json();

    // Validate clientId is provided
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID required" },
        { status: 400 }
      );
    }

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Check for existing in-progress assessment
    const existingAssessment = await prisma.simpleAssessment.findFirst({
      where: {
        clientId,
        status: "in_progress",
      },
      include: {
        responses: {
          orderBy: { questionId: "asc" },
        },
      },
    });

    // Return existing assessment with 200 status
    if (existingAssessment) {
      return NextResponse.json(
        {
          success: true,
          assessment: {
            id: existingAssessment.id,
            status: existingAssessment.status,
            responses: existingAssessment.responses,
          },
        },
        { status: 200 }
      );
    }

    // Create new assessment
    const newAssessment = await prisma.simpleAssessment.create({
      data: {
        clientId,
        status: "in_progress",
      },
      include: {
        responses: true,
      },
    });

    // Return new assessment with 201 status
    return NextResponse.json(
      {
        success: true,
        assessment: {
          id: newAssessment.id,
          status: newAssessment.status,
          responses: newAssessment.responses,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Start assessment error:", error);

    // Handle database errors gracefully
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start assessment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
