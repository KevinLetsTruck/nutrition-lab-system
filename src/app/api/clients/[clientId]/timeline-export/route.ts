/**
 * Timeline Export API Endpoint
 *
 * Generates and serves timeline analysis exports optimized for Claude Desktop workflow.
 * Supports multiple export formats and timeline types.
 *
 * Endpoints:
 * - POST: Generate new timeline export
 * - GET: Retrieve existing export or generate if not exists
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { TimelineAnalysisService } from "@/lib/services/timeline-analysis";
import { TimelineMarkdownGenerator } from "@/lib/services/timeline-markdown-generator";
import { z } from "zod";

// Validation schema for timeline export requests
const timelineExportSchema = z.object({
  timelineType: z
    .enum([
      "COMPREHENSIVE",
      "FOCUSED",
      "SYMPTOMS",
      "TREATMENTS",
      "ASSESSMENTS",
      "PROTOCOL_DEVELOPMENT",
    ])
    .default("COMPREHENSIVE"),
  format: z.enum(["markdown", "json"]).default("markdown"),
  includeMetadata: z.boolean().default(true),

  // Granular control options
  includeAssessments: z.boolean().default(true),
  includeDocuments: z.boolean().default(true),
  includeMedicalDocuments: z.boolean().default(true),
  includeNotes: z.boolean().default(true),
  includeProtocols: z.boolean().default(true),
  includeStatusChanges: z.boolean().default(true),
  includeAIAnalyses: z.boolean().default(true),

  dateRange: z
    .object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    })
    .optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const startTime = Date.now();

  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    const { clientId } = await params;

    // Validate client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validatedData = timelineExportSchema.parse(body);

    // Check for existing recent export (within 1 hour)
    const existingExport = await prisma.timelineExport.findFirst({
      where: {
        clientId,
        exportType: validatedData.timelineType,
        status: "COMPLETED",
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingExport && existingExport.markdownContent) {
      console.log(`Returning cached timeline export for client ${clientId}`);
      return NextResponse.json({
        export: existingExport,
        fromCache: true,
        processingTime: Date.now() - startTime,
      });
    }

    // Create new export record
    const timelineExport = await prisma.timelineExport.create({
      data: {
        clientId,
        exportType: validatedData.timelineType,
        status: "PENDING",
        requestedBy: user.id,
        fileName: `${client.firstName}-${
          client.lastName
        }-timeline-${Date.now()}.md`,
        analysisVersion: "v1.0",
        hipaaRelevant: true,
      },
    });

    // Update status to processing
    await prisma.timelineExport.update({
      where: { id: timelineExport.id },
      data: { status: "PROCESSING" },
    });

    try {
      // Generate timeline analysis
      console.log(`Generating timeline analysis for client ${clientId}`);

      // Build options from validated data
      const analysisOptions = {
        includeAssessments: validatedData.includeAssessments,
        includeDocuments: validatedData.includeDocuments,
        includeMedicalDocuments: validatedData.includeMedicalDocuments,
        includeNotes: validatedData.includeNotes,
        includeProtocols: validatedData.includeProtocols,
        includeStatusChanges: validatedData.includeStatusChanges,
        includeAIAnalyses: validatedData.includeAIAnalyses,
        dateRange: validatedData.dateRange
          ? {
              startDate: new Date(validatedData.dateRange.startDate!),
              endDate: new Date(validatedData.dateRange.endDate!),
            }
          : undefined,
      };

      const analysis = await TimelineAnalysisService.generateTimelineAnalysis(
        clientId,
        validatedData.timelineType,
        analysisOptions
      );

      // Generate markdown content
      const markdownContent =
        TimelineMarkdownGenerator.generateMarkdown(analysis);

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Prepare lab analysis tracking data
      let labAnalysisData = null;
      if (analysis.labAnalysis) {
        labAnalysisData = {
          totalLabValues: analysis.labAnalysis.summary.totalTests,
          criticalValues: analysis.labAnalysis.summary.criticalValues,
          suboptimalValues: analysis.labAnalysis.summary.suboptimalValues,
          optimalValues: analysis.labAnalysis.summary.optimalValues,
          systemsAnalyzed: analysis.labAnalysis.summary.systemsAnalyzed,
          systemStatuses: analysis.labAnalysis.systemAnalyses.map((system) => ({
            system: system.systemName,
            category: system.category,
            status: system.overallStatus,
            criticalCount: system.criticalCount,
            suboptimalCount: system.suboptimalCount,
            optimalCount: system.optimalCount,
          })),
          protocolPriorities:
            analysis.labAnalysis.protocolInsights.immediatePriorities.length,
          fmRangesApplied: true,
          analysisVersion: "v2.0-functional-medicine",
        };
        console.log(
          `🔬 Lab analysis complete: ${analysis.labAnalysis.summary.totalTests} tests, ${analysis.labAnalysis.summary.systemsAnalyzed} systems`
        );
      }

      // Prepare assessment analysis tracking data
      let assessmentAnalysisData = null;
      if (analysis.assessmentAnalysis) {
        assessmentAnalysisData = {
          totalCategories: analysis.assessmentAnalysis.summary.totalCategories,
          criticalCategories:
            analysis.assessmentAnalysis.summary.criticalCategories,
          highRiskCategories:
            analysis.assessmentAnalysis.summary.highRiskCategories,
          moderateRiskCategories:
            analysis.assessmentAnalysis.summary.moderateRiskCategories,
          systemsAnalyzed: analysis.assessmentAnalysis.summary.systemsAnalyzed,
          overallHealthScore:
            analysis.assessmentAnalysis.summary.overallHealthScore,
          systemStatuses: analysis.assessmentAnalysis.systemAnalyses.map(
            (system) => ({
              system: system.systemName,
              systemFocus: system.systemFocus,
              overallScore: system.overallScore,
              riskLevel: system.riskLevel,
              criticalCount: system.criticalCount,
              highRiskCount: system.highRiskCount,
              moderateCount: system.moderateCount,
            })
          ),
          highConfidencePatterns:
            analysis.assessmentAnalysis.patternInsights.highConfidencePatterns
              .length,
          rootCauseConnections:
            analysis.assessmentAnalysis.patternInsights.rootCauseConnections
              .length,
          interventionPhases: {
            immediate:
              analysis.assessmentAnalysis.interventionMatrix.phase1.length,
            building:
              analysis.assessmentAnalysis.interventionMatrix.phase2.length,
            optimization:
              analysis.assessmentAnalysis.interventionMatrix.phase3.length,
          },
          fmCategoriesApplied: true,
          analysisVersion: "v3.0-assessment-categorization",
        };
        console.log(
          `🎯 Assessment analysis complete: ${analysis.assessmentAnalysis.summary.totalCategories} categories, ${analysis.assessmentAnalysis.summary.systemsAnalyzed} systems`
        );
      }

      // Update export record with results
      const completedExport = await prisma.timelineExport.update({
        where: { id: timelineExport.id },
        data: {
          status: "COMPLETED",
          timelineData: analysis as any, // Store full analysis as JSON
          criticalFindings: analysis.criticalFindings as any,
          labAnalysisData: labAnalysisData as any, // Enhanced lab analysis tracking
          assessmentAnalysisData: assessmentAnalysisData as any, // Enhanced assessment analysis tracking
          markdownContent,
          exportedAt: new Date(),
          dataPoints: analysis.totalEvents,
          dateRange: {
            startDate: analysis.dateRange.startDate.toISOString(),
            endDate: analysis.dateRange.endDate.toISOString(),
          } as any,
          processingTime,
          analysisVersion:
            analysis.assessmentAnalysis && analysis.labAnalysis
              ? "v3.0-comprehensive-enhanced"
              : analysis.assessmentAnalysis
              ? "v3.0-assessment-enhanced"
              : analysis.labAnalysis
              ? "v2.0-lab-enhanced"
              : "v1.0",
        },
      });

      console.log(
        `Timeline export completed in ${processingTime}ms for client ${clientId}`
      );

      // Return appropriate format
      if (validatedData.format === "json") {
        return NextResponse.json({
          export: completedExport,
          analysis: validatedData.includeMetadata ? analysis : undefined,
          processingTime,
        });
      }

      // Return markdown as downloadable file
      return new NextResponse(markdownContent, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${completedExport.fileName}"`,
          "X-Export-ID": completedExport.id,
          "X-Processing-Time": processingTime.toString(),
        },
      });
    } catch (analysisError) {
      console.error("Timeline analysis failed:", analysisError);

      // Update export record with error
      await prisma.timelineExport.update({
        where: { id: timelineExport.id },
        data: {
          status: "FAILED",
          errorMessage:
            analysisError instanceof Error
              ? analysisError.message
              : "Analysis failed",
          processingTime: Date.now() - startTime,
        },
      });

      throw analysisError;
    }
  } catch (error) {
    console.error("Timeline export error:", error);

    // Handle authentication errors
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
          details: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: "Timeline export failed",
        details: error instanceof Error ? error.message : "Unknown error",
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    const { clientId } = await params;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const timelineType =
      (searchParams.get("timelineType") as any) || "COMPREHENSIVE";
    const format = searchParams.get("format") || "markdown";
    const exportId = searchParams.get("exportId");

    // Validate client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get specific export if ID provided
    if (exportId) {
      const specificExport = await prisma.timelineExport.findFirst({
        where: {
          id: exportId,
          clientId,
        },
      });

      if (!specificExport) {
        return NextResponse.json(
          { error: "Export not found" },
          { status: 404 }
        );
      }

      if (specificExport.status !== "COMPLETED") {
        return NextResponse.json({
          export: specificExport,
          message: `Export status: ${specificExport.status}`,
        });
      }

      // Return specific export
      if (format === "json") {
        return NextResponse.json({
          export: specificExport,
          analysis: specificExport.timelineData,
        });
      }

      return new NextResponse(specificExport.markdownContent, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${specificExport.fileName}"`,
          "X-Export-ID": specificExport.id,
        },
      });
    }

    // Look for recent completed export
    const recentExport = await prisma.timelineExport.findFirst({
      where: {
        clientId,
        exportType: timelineType,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentExport) {
      // Return existing export
      if (format === "json") {
        return NextResponse.json({
          export: recentExport,
          analysis: recentExport.timelineData,
          fromCache: true,
        });
      }

      return new NextResponse(recentExport.markdownContent, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${recentExport.fileName}"`,
          "X-Export-ID": recentExport.id,
          "X-From-Cache": "true",
        },
      });
    }

    // No existing export, generate new one
    const generateRequest = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({
        timelineType,
        format,
        includeMetadata: true,
      }),
    });

    return await this.POST(generateRequest, { params });
  } catch (error) {
    console.error("Timeline export GET error:", error);

    // Handle authentication errors
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to retrieve timeline export",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Export history endpoint
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    const { clientId } = await params;

    const searchParams = request.nextUrl.searchParams;
    const exportId = searchParams.get("exportId");

    if (!exportId) {
      return NextResponse.json(
        { error: "Export ID is required" },
        { status: 400 }
      );
    }

    // Verify client exists and user has access
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Delete the export
    const deletedExport = await prisma.timelineExport.delete({
      where: {
        id: exportId,
        clientId, // Ensure user can only delete exports for this client
      },
    });

    return NextResponse.json({
      message: "Timeline export deleted successfully",
      deletedExport: {
        id: deletedExport.id,
        fileName: deletedExport.fileName,
        exportType: deletedExport.exportType,
      },
    });
  } catch (error) {
    console.error("Timeline export DELETE error:", error);

    // Handle authentication errors
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Handle record not found
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        { error: "Export not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to delete timeline export",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
