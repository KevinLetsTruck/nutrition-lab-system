import { NextRequest, NextResponse } from 'next/server';
import { claudeService } from '@/lib/api/claude';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, assessmentId } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Fetch client data
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        documents: {
          where: { 
            documentType: 'lab_report',
            aiAnalysis: { not: null }
          },
          orderBy: { uploadedAt: 'desc' },
          take: 5, // Get last 5 analyzed lab reports
        },
        assessments: assessmentId ? {
          where: { id: assessmentId },
        } : {
          where: { status: 'completed' },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Extract lab results from analyzed documents
    const labResults = client.documents.map(doc => ({
      date: doc.uploadedAt,
      type: doc.labType,
      analysis: doc.aiAnalysis,
    }));

    const assessmentData = client.assessments[0] || null;

    // Generate protocol with Claude
    const protocolData = await claudeService.generateProtocol(
      {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        isTruckDriver: client.isTruckDriver,
        healthGoals: client.healthGoals,
        medications: client.medications,
        conditions: client.conditions,
        allergies: client.allergies,
      },
      labResults,
      assessmentData
    );

    // Create protocol in database
    const protocol = await prisma.protocol.create({
      data: {
        clientId: client.id,
        assessmentId: assessmentData?.id,
        protocolName: `${client.firstName} ${client.lastName} - ${new Date().toLocaleDateString()} Protocol`,
        status: 'active',
        supplements: protocolData.supplements || protocolData,
        dietary: protocolData.dietary || {},
        lifestyle: protocolData.lifestyle || {},
        timeline: protocolData.timeline || {},
        metrics: protocolData.metrics || {},
      },
    });

    return NextResponse.json({
      protocol,
      generatedData: protocolData,
    });

  } catch (error) {
    console.error('Protocol Generation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Protocol generation failed' },
      { status: 500 }
    );
  }
}
