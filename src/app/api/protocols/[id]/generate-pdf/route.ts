import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuthToken } from '@/lib/auth';
import { generateProtocolPDFWithRetry } from '@/lib/services/pdf-service';
import { formatFileSize } from '@/lib/utils/pdf-helpers';
import {
  type PDFProtocolData,
  type PDFTemplateOptions,
} from '@/lib/templates/protocol-pdf-template';

// Response type for consistent API responses
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * POST /api/protocols/[id]/generate-pdf
 * Generate a professional PDF document for the protocol
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();

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

    console.log(`📋 Generating PDF for protocol: ${id}`);

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
          },
        },
        protocolSupplements: {
          orderBy: { priority: 'asc' },
        },
      },
    });

    if (!protocol) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Protocol not found' },
        { status: 404 }
      );
    }

    // Transform database data to PDF protocol data format
    const protocolData: PDFProtocolData = {
      id: protocol.id,
      protocolName: protocol.protocolName,
      protocolPhase: protocol.protocolPhase || undefined,
      status: protocol.status,
      startDate: protocol.startDate || undefined,
      durationWeeks: protocol.durationWeeks || undefined,
      greeting: protocol.greeting || undefined,
      clinicalFocus: protocol.clinicalFocus || undefined,
      currentStatus: protocol.currentStatus || undefined,
      protocolNotes: protocol.protocolNotes || undefined,
      effectivenessRating: protocol.effectivenessRating || undefined,
      client: {
        id: protocol.client.id,
        firstName: protocol.client.firstName,
        lastName: protocol.client.lastName,
        email: protocol.client.email,
      },
      analysis: protocol.analysis
        ? {
            id: protocol.analysis.id,
            analysisDate: protocol.analysis.analysisDate,
            analysisVersion: protocol.analysis.analysisVersion,
          }
        : undefined,
      supplements: protocol.protocolSupplements.map(supplement => ({
        id: supplement.id,
        productName: supplement.productName,
        dosage: supplement.dosage,
        timing: supplement.timing,
        purpose: supplement.purpose || undefined,
        priority: supplement.priority,
        isActive: supplement.isActive,
      })),
      dailySchedule: (protocol.dailySchedule as any) || undefined,
    };

    // Configure PDF template options from request body
    const templateOptions: PDFTemplateOptions = {
      paperSize: (body.paperSize || 'A4') as 'A4' | 'Letter',
      includeGreeting: body.includeGreeting !== false,
      includeSupplements: body.includeSupplements !== false,
      includeDietaryGuidelines: body.includeDietaryGuidelines !== false,
      includeLifestyleModifications:
        body.includeLifestyleModifications !== false,
      includeSchedule: body.includeSchedule !== false,
      brandingConfig: {
        theme: body.theme || 'professional',
        includeClinicLogo: body.includeClinicLogo !== false,
        primaryColor: body.primaryColor || '#10b981',
        logoUrl: body.logoUrl,
      },
    };

    // Generate PDF using our PDF service
    const result = await generateProtocolPDFWithRetry({
      protocol: protocolData,
      options: templateOptions,
      filename: body.filename,
    });

    if (!result.success) {
      console.error(
        `❌ PDF generation failed for protocol ${id}:`,
        result.error
      );
      return NextResponse.json<APIResponse>(
        { success: false, error: result.error || 'PDF generation failed' },
        { status: 500 }
      );
    }

    const fileMetadata = result.fileMetadata!;

    // Create protocol generation record in database
    const protocolGeneration = await prisma.protocolGeneration.create({
      data: {
        protocolId: protocol.id,
        clientId: protocol.clientId,
        pdfUrl: fileMetadata.url,
        generationData: {
          // Generation metadata
          generationType: 'pdf',
          requestedBy: authUser.id,
          requestedAt: startTime,
          generatedAt: fileMetadata.generatedAt.toISOString(),

          // Template options used
          templateOptions: templateOptions,

          // File information
          filename: fileMetadata.filename,
          filePath: fileMetadata.filePath,
          fileSize: fileMetadata.size,
          pageCount: fileMetadata.pages,

          // Protocol metadata
          protocolName: protocol.protocolName,
          clientName: `${protocol.client.firstName} ${protocol.client.lastName}`,
          supplementCount: protocolData.supplements.filter(s => s.isActive)
            .length,

          // Performance metrics
          generationTime: result.generationTime,
          templateSize: result.debugInfo?.templateSize,

          // Request details
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      },
    });

    const totalTime = Date.now() - startTime;
    console.log(
      `✅ PDF generation completed in ${totalTime}ms for protocol ${id}`
    );

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        generationId: protocolGeneration.id,
        pdfUrl: fileMetadata.url,
        status: 'generated',
        message: 'PDF generation completed successfully',

        // File metadata
        file: {
          filename: fileMetadata.filename,
          url: fileMetadata.url,
          size: fileMetadata.size,
          sizeFormatted: formatFileSize(fileMetadata.size),
          pages: fileMetadata.pages,
          generatedAt: fileMetadata.generatedAt,
        },

        // Protocol information
        protocol: {
          id: protocol.id,
          name: protocol.protocolName,
          clientName: `${protocol.client.firstName} ${protocol.client.lastName}`,
          supplementCount: protocolData.supplements.filter(s => s.isActive)
            .length,
        },

        // Performance metrics
        performance: {
          generationTime: result.generationTime,
          totalTime,
          templateSize: result.debugInfo?.templateSize,
          pdfSize: result.debugInfo?.pdfSize,
        },

        // Download information
        download: {
          url: fileMetadata.url,
          filename: fileMetadata.filename,
          contentType: 'application/pdf',
          disposition: 'inline',
        },
      },
    });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ PDF generation error after ${totalTime}ms:`, error);

    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : String(error),
        generationTime: totalTime,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/protocols/[id]/generate-pdf
 * Get PDF generation history for a protocol
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

    // Fetch protocol generation history
    const generations = await prisma.protocolGeneration.findMany({
      where: { protocolId: id },
      orderBy: { createdAt: 'desc' },
      take: 10, // Last 10 generations
    });

    const protocol = await prisma.enhancedProtocol.findUnique({
      where: { id },
      select: {
        id: true,
        protocolName: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
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
      data: {
        protocol: {
          id: protocol.id,
          name: protocol.protocolName,
          clientName: `${protocol.client.firstName} ${protocol.client.lastName}`,
        },
        generations: generations.map(gen => ({
          id: gen.id,
          pdfUrl: gen.pdfUrl,
          createdAt: gen.createdAt,
          generationData: gen.generationData,
        })),
        totalGenerations: generations.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching PDF generations:', error);
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: 'Failed to fetch PDF generations',
      },
      { status: 500 }
    );
  }
}
