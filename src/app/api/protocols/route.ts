import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthToken } from '@/lib/auth';

// Response type for consistent API responses
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * GET /api/protocols
 * List protocols with filtering and pagination
 * Query params: clientId, status, protocolPhase, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const protocolPhase = searchParams.get('protocolPhase');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const skip = (validatedPage - 1) * validatedLimit;

    // Build where clause for filtering
    const whereClause: any = {};
    if (clientId) {
      whereClause.clientId = clientId;
    }
    if (status) {
      whereClause.status = status;
    }
    if (protocolPhase) {
      whereClause.protocolPhase = protocolPhase;
    }

    // Get total count for pagination
    const total = await prisma.enhancedProtocol.count({
      where: whereClause,
    });

    // Fetch protocols with related data
    const protocols = await prisma.enhancedProtocol.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        analysis: {
          select: {
            id: true,
            analysisDate: true,
            analysisVersion: true,
          },
        },
        protocolSupplements: {
          where: { isActive: true },
          orderBy: { priority: 'asc' },
        },
        protocolGenerations: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Last 5 generations
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: validatedLimit,
    });

    const totalPages = Math.ceil(total / validatedLimit);

    return NextResponse.json<APIResponse>({
      success: true,
      data: protocols,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching protocols:', error);
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: 'Failed to fetch protocols',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/protocols
 * Create a new protocol
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.clientId || !body.protocolName) {
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: 'Missing required fields: clientId, protocolName',
        },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: body.clientId },
    });

    if (!client) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Use transaction to create protocol and related data
    const protocol = await prisma.$transaction(async tx => {
      // Create the main protocol
      const newProtocol = await tx.enhancedProtocol.create({
        data: {
          clientId: body.clientId,
          analysisId: body.analysisId || null,
          protocolName: body.protocolName,
          protocolPhase: body.protocolPhase || null,
          supplements: body.supplements || null,
          dietaryGuidelines: body.dietaryGuidelines || null,
          lifestyleModifications: body.lifestyleModifications || null,
          monitoringRequirements: body.monitoringRequirements || null,
          startDate: body.startDate ? new Date(body.startDate) : null,
          durationWeeks: body.durationWeeks || null,
          status: body.status || 'planned',
          greeting: body.greeting || null,
          clinicalFocus: body.clinicalFocus || null,
          currentStatus: body.currentStatus || null,
          prioritySupplements: body.prioritySupplements || null,
          dailySchedule: body.dailySchedule || null,
          protocolNotes: body.protocolNotes || null,
          brandingConfig: body.brandingConfig || null,
        },
      });

      // Create associated supplements if provided
      if (body.supplementList && Array.isArray(body.supplementList)) {
        await tx.protocolSupplement.createMany({
          data: body.supplementList.map((supplement: any) => ({
            protocolId: newProtocol.id,
            productName: supplement.productName,
            dosage: supplement.dosage,
            timing: supplement.timing,
            purpose: supplement.purpose || null,
            priority: supplement.priority || 1,
            isActive: supplement.isActive !== false,
            startDate: supplement.startDate
              ? new Date(supplement.startDate)
              : null,
            endDate: supplement.endDate ? new Date(supplement.endDate) : null,
          })),
        });
      }

      return newProtocol;
    });

    // Fetch the created protocol with related data
    const protocolWithData = await prisma.enhancedProtocol.findUnique({
      where: { id: protocol.id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        analysis: true,
        protocolSupplements: {
          where: { isActive: true },
          orderBy: { priority: 'asc' },
        },
        protocolGenerations: true,
      },
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: protocolWithData,
    });
  } catch (error: any) {
    console.error('Error creating protocol:', error);
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: 'Failed to create protocol',
      },
      { status: 500 }
    );
  }
}
