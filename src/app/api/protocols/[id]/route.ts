import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthToken } from '@/lib/auth';

// Response type for consistent API responses
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * GET /api/protocols/[id]
 * Get a single protocol with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch protocol with all related data
    const protocol = await prisma.enhancedProtocol.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        analysis: {
          select: {
            id: true,
            analysisDate: true,
            analysisVersion: true,
            executiveSummary: true,
            protocolRecommendations: true,
          },
        },
        protocolSupplements: {
          orderBy: { priority: 'asc' },
        },
        protocolGenerations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!protocol) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Protocol not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<APIResponse>({
      success: true,
      data: protocol,
    });
  } catch (error: any) {
    console.error('Error fetching protocol:', error);
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: 'Failed to fetch protocol',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/protocols/[id]
 * Update an existing protocol
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if protocol exists
    const existingProtocol = await prisma.enhancedProtocol.findUnique({
      where: { id },
    });

    if (!existingProtocol) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Protocol not found' },
        { status: 404 }
      );
    }

    // Use transaction to update protocol and related data
    const updatedProtocol = await prisma.$transaction(async tx => {
      // Update the main protocol
      const protocol = await tx.enhancedProtocol.update({
        where: { id },
        data: {
          protocolName: body.protocolName || existingProtocol.protocolName,
          protocolPhase: body.protocolPhase ?? existingProtocol.protocolPhase,
          supplements: body.supplements ?? existingProtocol.supplements,
          dietaryGuidelines:
            body.dietaryGuidelines ?? existingProtocol.dietaryGuidelines,
          lifestyleModifications:
            body.lifestyleModifications ??
            existingProtocol.lifestyleModifications,
          monitoringRequirements:
            body.monitoringRequirements ??
            existingProtocol.monitoringRequirements,
          startDate: body.startDate
            ? new Date(body.startDate)
            : existingProtocol.startDate,
          durationWeeks: body.durationWeeks ?? existingProtocol.durationWeeks,
          status: body.status || existingProtocol.status,
          complianceNotes:
            body.complianceNotes ?? existingProtocol.complianceNotes,
          effectivenessRating:
            body.effectivenessRating ?? existingProtocol.effectivenessRating,
          sideEffects: body.sideEffects ?? existingProtocol.sideEffects,
          modificationsMade:
            body.modificationsMade ?? existingProtocol.modificationsMade,
          greeting: body.greeting ?? existingProtocol.greeting,
          clinicalFocus: body.clinicalFocus ?? existingProtocol.clinicalFocus,
          currentStatus: body.currentStatus ?? existingProtocol.currentStatus,
          prioritySupplements:
            body.prioritySupplements ?? existingProtocol.prioritySupplements,
          dailySchedule: body.dailySchedule ?? existingProtocol.dailySchedule,
          protocolNotes: body.protocolNotes ?? existingProtocol.protocolNotes,
          brandingConfig:
            body.brandingConfig ?? existingProtocol.brandingConfig,
        },
      });

      // Handle supplement updates if provided
      if (body.supplementList && Array.isArray(body.supplementList)) {
        // Remove existing supplements
        await tx.protocolSupplement.deleteMany({
          where: { protocolId: id },
        });

        // Add updated supplements
        if (body.supplementList.length > 0) {
          await tx.protocolSupplement.createMany({
            data: body.supplementList.map((supplement: any) => ({
              protocolId: id,
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
      }

      return protocol;
    });

    // Fetch updated protocol with related data
    const protocolWithData = await prisma.enhancedProtocol.findUnique({
      where: { id: updatedProtocol.id },
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
          orderBy: { priority: 'asc' },
        },
        protocolGenerations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: protocolWithData,
    });
  } catch (error: any) {
    console.error('Error updating protocol:', error);
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: 'Failed to update protocol',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/protocols/[id]
 * Delete a protocol and all related data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if protocol exists
    const existingProtocol = await prisma.enhancedProtocol.findUnique({
      where: { id },
    });

    if (!existingProtocol) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Protocol not found' },
        { status: 404 }
      );
    }

    // Delete protocol (related data will be cascade deleted due to foreign key constraints)
    await prisma.enhancedProtocol.delete({
      where: { id },
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: { message: 'Protocol deleted successfully' },
    });
  } catch (error: any) {
    console.error('Error deleting protocol:', error);
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: 'Failed to delete protocol',
      },
      { status: 500 }
    );
  }
}
