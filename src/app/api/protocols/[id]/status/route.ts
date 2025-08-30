import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const StatusUpdateSchema = z.object({
  newStatus: z.enum(['planned', 'active', 'paused', 'completed', 'discontinued']),
  reasonForChange: z.string().optional(),
  adjustmentNotes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: protocolId } = await params;
    const body = await request.json();
    
    const validation = StatusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid status data', 
          details: validation.error.issues 
        }, 
        { status: 400 }
      );
    }

    const statusData = validation.data;

    // Get current protocol
    const protocol = await prisma.enhancedProtocol.findUnique({
      where: { id: protocolId }
    });

    if (!protocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    // Use a transaction to update protocol and record status change
    const result = await prisma.$transaction(async (tx) => {
      // Update protocol status
      const updatedProtocol = await tx.enhancedProtocol.update({
        where: { id: protocolId },
        data: {
          status: statusData.newStatus,
          updatedAt: new Date(),
          ...(statusData.newStatus === 'completed' && { 
            completedAt: new Date(),
            effectivenessRating: null // Can be updated later by practitioner
          })
        }
      });

      // Record status change
      await tx.protocolStatusChanges.create({
        data: {
          protocolId,
          previousStatus: protocol.status,
          newStatus: statusData.newStatus,
          reasonForChange: statusData.reasonForChange,
          adjustmentNotes: statusData.adjustmentNotes,
          changedBy: authUser.id,
        }
      });

      return updatedProtocol;
    });

    console.log(`✅ Protocol ${protocolId} status changed from ${protocol.status} to ${statusData.newStatus}`);

    return NextResponse.json({
      success: true,
      protocol: result,
      statusChange: {
        from: protocol.status,
        to: statusData.newStatus,
        changedAt: new Date(),
        changedBy: authUser.id
      }
    });

  } catch (error) {
    console.error('Error updating protocol status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Fetch protocol status history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: protocolId } = await params;

    // Get protocol with status history
    const protocol = await prisma.enhancedProtocol.findUnique({
      where: { id: protocolId },
      include: {
        protocolStatusChanges: {
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    if (!protocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    return NextResponse.json({
      currentStatus: protocol.status,
      statusHistory: protocol.protocolStatusChanges,
      protocolInfo: {
        id: protocol.id,
        name: protocol.protocolName,
        startDate: protocol.startDate,
        completedAt: protocol.completedAt,
        durationWeeks: protocol.durationWeeks
      }
    });

  } catch (error) {
    console.error('Error fetching protocol status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
