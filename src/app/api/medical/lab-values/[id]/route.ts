import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { value } = body;

    // Validate value
    if (
      value !== null &&
      (typeof value !== "number" || value < 0 || value > 3)
    ) {
      return NextResponse.json(
        { error: "Invalid value. Must be null or 0-3" },
        { status: 400 }
      );
    }

    // Update the lab value
    const updatedValue = await prisma.medicalLabValue.update({
      where: { id },
      data: {
        value,
        // Update flag based on value
        flag:
          value === null
            ? "normal"
            : value === 0
            ? "normal"
            : value === 1
            ? "low"
            : value === 2
            ? "normal"
            : "high",
        // Set high confidence when manually entered
        confidence: value !== null ? 1.0 : 0.5,
      },
    });

    return NextResponse.json({
      success: true,
      labValue: updatedValue,
    });
  } catch (error) {
    console.error("Error updating lab value:", error);
    return NextResponse.json(
      { error: "Failed to update lab value" },
      { status: 500 }
    );
  }
}
