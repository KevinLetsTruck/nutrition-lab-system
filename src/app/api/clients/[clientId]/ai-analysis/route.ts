import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

const FUNCTIONAL_MEDICINE_PROMPT = `You are an expert Functional Medicine practitioner analyzing a client's comprehensive health data.

CLIENT DATA:
{{CLIENT_DATA}}

ANALYSIS REQUIREMENTS:
1. **COMPREHENSIVE HEALTH ASSESSMENT**
   - Overall health status and key concerns
   - Pattern recognition across symptoms and assessments
   - Root cause analysis using functional medicine principles

2. **ASSESSMENT ANALYSIS**
   - Analyze assessment scores and identify significant patterns
   - Highlight scores indicating dysfunction or imbalance
   - Connect assessment findings to potential root causes

3. **DOCUMENT & LAB INSIGHTS**
   - Review any uploaded documents and lab results
   - Identify critical values and patterns
   - Correlate with assessment findings

4. **FUNCTIONAL MEDICINE RECOMMENDATIONS**
   - Identify likely underlying dysfunctions
   - Suggest targeted interventions (supplements, lifestyle, testing)
   - Prioritize recommendations by impact and urgency
   - Include monitoring and follow-up suggestions

5. **CLINICAL NOTES INTEGRATION**
   - Incorporate practitioner notes and observations
   - Highlight important patient-reported symptoms
   - Consider treatment history and responses

OUTPUT FORMAT: Provide a comprehensive markdown-formatted analysis that a functional medicine practitioner can use for clinical decision-making. Use clear headings, bullet points, and prioritized recommendations.`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // 1. Authentication (copied from export API)
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    // 2. Data Aggregation (exact query from export API)
    const clientData = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        // SimpleAssessment data
        simpleAssessments: {
          include: {
            responses: true,
          },
          orderBy: { startedAt: "desc" },
        },
        // Document data with analysis
        documents: {
          include: {
            DocumentAnalysis: true,
            LabValue: true,
          },
          orderBy: { uploadedAt: "desc" },
        },
        // Clinical notes
        notes: {
          orderBy: { createdAt: "desc" },
        },
        // Treatment protocols
        protocols: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // 3. Validation
    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 4. Check for existing recent analysis (24-hour caching)
    const existingAnalysis = clientData.aiAnalysisResults;
    const analysisDate = clientData.aiAnalysisDate;
    const isRecentAnalysis = analysisDate && 
      new Date().getTime() - new Date(analysisDate).getTime() < 24 * 60 * 60 * 1000; // 24 hours

    if (isRecentAnalysis && existingAnalysis) {
      return NextResponse.json({
        success: true,
        data: {
          analysis: existingAnalysis,
          analysisDate: analysisDate,
          cached: true,
          clientName: `${clientData.firstName} ${clientData.lastName}`
        }
      });
    }

    // 5. Prepare structured client data (similar to export API)
    const structuredData = {
      client: {
        id: clientData.id,
        name: `${clientData.firstName} ${clientData.lastName}`,
        email: clientData.email,
        phone: clientData.phone,
        dateOfBirth: clientData.dateOfBirth,
        gender: clientData.gender,
        isTruckDriver: clientData.isTruckDriver,
        dotNumber: clientData.dotNumber,
        cdlNumber: clientData.cdlNumber,
        status: clientData.status,
        healthGoals: clientData.healthGoals,
        medications: clientData.medications,
        conditions: clientData.conditions,
        allergies: clientData.allergies,
        createdAt: clientData.createdAt,
        lastVisit: clientData.lastVisit,
      },
      assessments: clientData.simpleAssessments.map((assessment) => ({
        id: assessment.id,
        status: assessment.status,
        startedAt: assessment.startedAt,
        completedAt: assessment.completedAt,
        responses: assessment.responses.map((response) => ({
          questionId: response.questionId,
          questionText: response.questionText,
          category: response.category,
          score: response.score,
          answeredAt: response.answeredAt,
        })),
        totalQuestions: assessment.responses.length,
        averageScore:
          assessment.responses.length > 0
            ? assessment.responses.reduce((sum, r) => sum + r.score, 0) /
              assessment.responses.length
            : 0,
      })),
      documents: clientData.documents.map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        documentType: doc.documentType,
        uploadedAt: doc.uploadedAt,
        extractedText: doc.extractedText,
        aiAnalysis: doc.aiAnalysis,
        ocrConfidence: doc.ocrConfidence,
        labValues: doc.LabValue?.map((lv) => ({
          name: lv.name,
          value: lv.value,
          unit: lv.unit,
          referenceRange: lv.referenceRange,
          isCritical: lv.isCritical,
        })) || [],
        analysis: doc.DocumentAnalysis?.map((da) => ({
          analysisType: da.analysisType,
          findings: da.findings,
          confidence: da.confidence,
          analyzedAt: da.analyzedAt,
        })) || [],
      })),
      notes: clientData.notes.map((note) => ({
        id: note.id,
        noteType: note.noteType,
        title: note.title,
        chiefComplaints: note.chiefComplaints,
        healthHistory: note.healthHistory,
        currentMedications: note.currentMedications,
        goals: note.goals,
        protocolAdjustments: note.protocolAdjustments,
        complianceNotes: note.complianceNotes,
        progressMetrics: note.progressMetrics,
        nextSteps: note.nextSteps,
        generalNotes: note.generalNotes,
        isImportant: note.isImportant,
        followUpNeeded: note.followUpNeeded,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
      protocols: clientData.protocols.map((protocol) => ({
        id: protocol.id,
        name: protocol.name,
        description: protocol.description,
        supplements: protocol.supplements,
        dietary: protocol.dietary,
        lifestyle: protocol.lifestyle,
        monitoring: protocol.monitoring,
        duration: protocol.duration,
        status: protocol.status,
        createdAt: protocol.createdAt,
      })),
    };

    // 6. Claude API Call
    const claudeApiKey = process.env.ANTHROPIC_API_KEY;
    if (!claudeApiKey) {
      throw new Error("Claude API key not configured");
    }

    const prompt = FUNCTIONAL_MEDICINE_PROMPT.replace(
      "{{CLIENT_DATA}}",
      JSON.stringify(structuredData, null, 2)
    );

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.text();
      console.error("Claude API error:", claudeResponse.status, errorData);
      throw new Error(`Claude API error: ${claudeResponse.status} - ${errorData}`);
    }

    const claudeData = await claudeResponse.json();
    const analysis = claudeData.content[0].text;

    // 7. Store Results in Database
    await prisma.client.update({
      where: { id: clientId },
      data: {
        aiAnalysisResults: analysis,
        aiAnalysisDate: new Date(),
        aiAnalysisVersion: 'v1.0'
      }
    });

    // 8. Return Success Response
    return NextResponse.json({
      success: true,
      data: {
        analysis: analysis,
        analysisDate: new Date(),
        cached: false,
        clientName: `${clientData.firstName} ${clientData.lastName}`,
        summary: {
          totalAssessments: clientData.simpleAssessments.length,
          totalDocuments: clientData.documents.length,
          totalNotes: clientData.notes.length,
          totalProtocols: clientData.protocols.length,
        }
      }
    });

  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "AI analysis failed",
      details: error instanceof Error ? error.stack : "Unknown error"
    }, { status: 500 });
  }
}
