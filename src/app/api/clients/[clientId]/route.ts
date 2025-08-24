import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import jwt from "jsonwebtoken";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No valid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    const { clientId } = await params;

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No valid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    const { clientId } = await params;
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = ["status", "firstName", "lastName", "email", "phone"];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return NextResponse.json(client);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    console.log("PATCH request received");
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No valid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    const { clientId } = await params;
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    // Allow updating more fields for intake form
    const allowedFields = [
      "dateOfBirth",
      "gender",
      "medications",
      "healthGoals",
      "conditions",
      "allergies",
    ];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "dateOfBirth" && body[field]) {
          // Convert date string to DateTime object
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Handle height/weight/primaryHealthGoal if provided (store in healthGoals)
    if (body.height || body.weight || body.primaryHealthGoal) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { healthGoals: true },
      });

      const healthGoalsData =
        typeof client?.healthGoals === "object" && client.healthGoals !== null
          ? (client.healthGoals as any)
          : {};

      if (body.height) healthGoalsData.height = body.height;
      if (body.weight) healthGoalsData.weight = body.weight;
      if (body.primaryHealthGoal)
        healthGoalsData.primaryGoal = body.primaryHealthGoal;

      updateData.healthGoals = healthGoalsData;
    }

    console.log(
      "Update data to be saved:",
      JSON.stringify(updateData, null, 2)
    );

    const client = await prisma.client.update({
      where: { id: clientId },
      data: updateData,
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to update client",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No valid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    const { clientId } = await params;

    // Delete all related records first to avoid foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete assessments and their responses
      const assessments = await tx.clientAssessment.findMany({
        where: { clientId },
        select: { id: true },
      });

      for (const assessment of assessments) {
        await tx.clientResponse.deleteMany({
          where: { assessmentId: assessment.id },
        });
        await tx.assessmentAnalysis.deleteMany({
          where: { assessmentId: assessment.id },
        });
      }

      await tx.clientAssessment.deleteMany({
        where: { clientId },
      });

      // Delete other related records
      await tx.clientStatus.deleteMany({
        where: { clientId },
      });

      await tx.note.deleteMany({
        where: { clientId },
      });

      await tx.document.deleteMany({
        where: { clientId },
      });

      await tx.protocol.deleteMany({
        where: { clientId },
      });

      await tx.medicalDocument.deleteMany({
        where: { clientId },
      });

      // Finally delete the client
      await tx.client.delete({
        where: { id: clientId },
      });
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(
      { 
        error: "Failed to delete client",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
