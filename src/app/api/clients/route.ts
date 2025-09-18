import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClientSchema } from "@/lib/validations/client";
import { ZodError } from "zod";
import { verifyAuthToken } from "@/lib/auth";



export async function GET(request: NextRequest) {
  try {
    // Simplified auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

// Add CORS headers for OPTIONS requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Simplified auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const errorResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      errorResponse.headers.set("Access-Control-Allow-Origin", "*");
      errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return errorResponse;
    }

    const body = await request.json();
    const validatedData = createClientSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        id: `cm${Date.now()}${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
        ...validatedData,
        healthGoals: validatedData.healthGoals || undefined,
        medications: validatedData.medications || undefined,
        conditions: validatedData.conditions || undefined,
        allergies: validatedData.allergies || undefined,
        dateOfBirth: validatedData.dateOfBirth
          ? new Date(validatedData.dateOfBirth)
          : undefined,
        status: "ONGOING",
        updatedAt: new Date(), // Required field
      },
    });

    const response = NextResponse.json(client, { status: 201 });
    
    // Add CORS headers to success response
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      const errorResponse = NextResponse.json({ error: error.message }, { status: 401 });
      errorResponse.headers.set("Access-Control-Allow-Origin", "*");
      errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return errorResponse;
    }

    if (error instanceof ZodError) {
      const errorResponse = NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
      errorResponse.headers.set("Access-Control-Allow-Origin", "*");
      errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return errorResponse;
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      const errorResponse = NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 409 }
      );
      errorResponse.headers.set("Access-Control-Allow-Origin", "*");
      errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return errorResponse;
    }

    console.error("❌ Client creation error:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    const errorResponse = NextResponse.json(
      { 
        error: "Failed to create client",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
    
    // Add CORS headers to error response
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    return errorResponse;
  }
}
