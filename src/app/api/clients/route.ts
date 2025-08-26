import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClientSchema } from "@/lib/validations/client";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

// Helper function to verify JWT token
function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No valid authorization header");
  }

  const token = authHeader.substring(7);

  // Basic JWT format validation before verification
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    throw new Error("Malformed JWT token");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return payload;
  } catch (error) {

    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid or expired token");
    }
    throw new Error("Token verification failed");
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuthToken(request);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const clients = await prisma.client.findMany({
      where: {
        ...(status && { status }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuthToken(request);

    const body = await request.json();
    const validatedData = createClientSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        healthGoals: validatedData.healthGoals || undefined,
        medications: validatedData.medications || undefined,
        conditions: validatedData.conditions || undefined,
        allergies: validatedData.allergies || undefined,
        dateOfBirth: validatedData.dateOfBirth
          ? new Date(validatedData.dateOfBirth)
          : undefined,
        status: "SIGNED_UP",
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
