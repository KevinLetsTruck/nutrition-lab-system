import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import * as JSZip from 'jszip';
import {
  generateTimelineAnalysis,
  generateAssessmentAnalysis,
  generateExportGuide,
  fetchDocumentContent,
} from '@/lib/services/export-generators';

const ComprehensiveExportSchema = z.object({
  clientId: z.string(),
  includeAssessments: z.boolean().default(true),
  includeDocuments: z.boolean().default(true),
  includeLabResults: z.boolean().default(true),
  includeProtocols: z.boolean().default(true),
  includeClinicalNotes: z.boolean().default(true),
  includeTimeline: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await verifyAuthToken(request);

    const body = await request.json();
    const exportOptions = ComprehensiveExportSchema.parse(body);

    // Get comprehensive client data
    const client = await prisma.client.findUnique({
      where: { id: exportOptions.clientId },
      include: {
        simpleAssessments: {
          include: {
            responses: true,
          },
          orderBy: { completedAt: 'desc' },
        },
        documents: {
          where: { status: { not: 'FAILED' } },
          orderBy: { uploadedAt: 'desc' },
        },
        protocols: {
          include: {
            protocolSupplements: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        statuses: {
          orderBy: { createdAt: 'desc' },
        },
        clientAnalyses: {
          orderBy: { analysisDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Create ZIP package
    const zip = new JSZip.default();
    const clientName = `${client.firstName}-${client.lastName}`;
    const timestamp = new Date().toISOString().split('T')[0];

    // Add structured data files
    if (exportOptions.includeTimeline) {
      const timelineContent = await generateTimelineAnalysis(client);
      zip.file(`${clientName}-timeline-${timestamp}.md`, timelineContent);
    }

    if (
      exportOptions.includeAssessments &&
      client.simpleAssessments.length > 0
    ) {
      const assessmentContent = await generateAssessmentAnalysis(
        client.simpleAssessments
      );
      zip.file(`${clientName}-assessments-${timestamp}.md`, assessmentContent);
    }

    // Add client data as JSON for structured analysis
    const clientData = {
      profile: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        dateOfBirth: client.dateOfBirth,
        gender: client.gender,
        isTruckDriver: client.isTruckDriver,
        healthGoals: client.healthGoals,
        medications: client.medications,
        conditions: client.conditions,
        allergies: client.allergies,
      },
      assessments: client.simpleAssessments.map(a => ({
        id: a.id,
        status: a.status,
        completedAt: a.completedAt,
        responses: a.responses.map(r => ({
          questionId: r.questionId,
          questionText: r.questionText,
          category: r.category,
          score: r.score,
          answeredAt: r.answeredAt,
        })),
      })),
      documents: client.documents.map(d => ({
        id: d.id,
        fileName: d.fileName,
        originalFileName: d.originalFileName,
        documentType: d.documentType,
        labType: d.labType,
        fileSize: d.fileSize,
        uploadedAt: d.uploadedAt,
        status: d.status,
      })),
      protocols: client.protocols.map(p => ({
        id: p.id,
        protocolName: p.protocolName,
        status: p.status,
        supplements: p.supplements,
        dietary: p.dietary,
        lifestyle: p.lifestyle,
        createdAt: p.createdAt,
      })),
      notes: client.notes.map(n => ({
        id: n.id,
        noteType: n.noteType,
        title: n.title,
        chiefComplaints: n.chiefComplaints,
        healthHistory: n.healthHistory,
        goals: n.goals,
        generalNotes: n.generalNotes,
        createdAt: n.createdAt,
      })),
      exportMetadata: {
        exportDate: new Date().toISOString(),
        exportedBy: user.email,
        includeAssessments: exportOptions.includeAssessments,
        includeDocuments: exportOptions.includeDocuments,
        dataPointsCounts: {
          assessments: client.simpleAssessments.length,
          documents: client.documents.length,
          protocols: client.protocols.length,
          notes: client.notes.length,
        },
      },
    };

    zip.file(
      `${clientName}-data-${timestamp}.json`,
      JSON.stringify(clientData, null, 2)
    );

    // Add raw document files if requested
    if (exportOptions.includeDocuments && client.documents.length > 0) {
      const documentsFolder = zip.folder('documents');

      for (const document of client.documents) {
        try {
          const documentContent = await fetchDocumentContent(document);
          if (documentContent) {
            const fileName = document.originalFileName || document.fileName;
            documentsFolder?.file(fileName, documentContent);
          }
        } catch (error) {
          console.error(
            `Failed to fetch document: ${document.fileName}`,
            error
          );
          // Add placeholder for failed document
          documentsFolder?.file(
            `MISSING-${document.originalFileName || document.fileName}.txt`,
            `Document could not be retrieved: ${document.fileName}\nError: ${error}\nFile URL: ${document.fileUrl || 'No URL'}`
          );
        }
      }
    }

    // Add export guide
    const exportGuide = generateExportGuide(client, exportOptions);
    zip.file('EXPORT-GUIDE.md', exportGuide);

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const fileName = `${clientName}-comprehensive-export-${timestamp}.zip`;

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': zipBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Comprehensive export error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid export options', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to generate comprehensive export' },
      { status: 500 }
    );
  }
}
