import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth,
      currentMedications,
      currentSupplements,
    } = body;

    // Check if client already exists
    let client = await prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      // Create new client
      client = await prisma.client.create({
        data: {
          firstName,
          lastName,
          email,
          phone: phone || "",
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          currentMedications: currentMedications || "",
          currentSupplements: currentSupplements || "",
          status: "ACTIVE",
        },
      });
    } else {
      // Update existing client info
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          firstName,
          lastName,
          phone: phone || client.phone,
          gender: gender || client.gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : client.dateOfBirth,
          currentMedications: currentMedications || client.currentMedications,
          currentSupplements: currentSupplements || client.currentSupplements,
        },
      });
    }

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
      },
    });
  } catch (error) {
    console.error("Error creating/updating client:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process client information",
      },
      { status: 500 }
    );
  }
}
