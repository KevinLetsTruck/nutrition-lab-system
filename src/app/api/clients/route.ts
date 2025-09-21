import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClientSchema } from "@/lib/validations/client";
import { verifyAuthToken } from "@/lib/auth";
import { handleApiError, createNotFoundError } from "@/lib/error-handler";
import { createCachedResponse, getCached, setCached } from "@/lib/cache";



export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Create cache key based on query parameters
    const cacheKey = `clients:${user.id}:${status || 'all'}:${search || 'none'}`;
    
    // Check cache first
    const cached = getCached(cacheKey);
    if (cached) {
      return createCachedResponse(cached, { 
        maxAge: 300, // 5 minutes
        tags: ['clients'] 
      });
    }

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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Only select what we need for the list view
      },
      orderBy: { createdAt: "desc" },
    });

    // Cache the results
    setCached(cacheKey, clients, 300);

    return createCachedResponse(clients, { 
      maxAge: 300,
      tags: ['clients'] 
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

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
