import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

const FUNCTIONAL_MEDICINE_PROMPT = `You are an expert Functional Medicine practitioner analyzing a client's comprehensive health data.

CRITICAL INSTRUCTIONS:
- ONLY use the specific data provided in CLIENT DATA below
- DO NOT make assumptions or create generic recommendations
- IF data is missing or limited, state this explicitly
- Reference specific assessment scores, document findings, and practitioner notes when available
- Provide analysis ONLY based on what is actually documented

CLIENT DATA:
{{CLIENT_DATA}}

ANALYSIS REQUIREMENTS:

1. **CLIENT OVERVIEW** (Use ONLY provided data)
   - Name, demographics, and health goals from client object
   - Current health status from client.status
   - Medications, conditions, allergies if provided

2. **ASSESSMENT ANALYSIS** (Reference specific scores)
   - IF assessments exist: Analyze actual scores from responses array
   - Quote specific questionText and score values
   - Calculate patterns from actual averageScore values
   - IF no assessments: State "No assessment data available"

3. **DOCUMENT REVIEW** (Use actual document content)
   - IF documents exist: Review extractedText and aiAnalysis content
   - Reference specific labValues with actual values and ranges
   - Quote findings from DocumentAnalysis if available
   - IF no documents: State "No documents uploaded for analysis"

4. **CLINICAL NOTES REVIEW** (Use actual practitioner notes)
   - IF notes exist: Quote from chiefComplaints, healthHistory, currentMedications
   - Reference protocolAdjustments and progressMetrics
   - Include nextSteps and generalNotes content
   - IF no notes: State "No practitioner notes available"

5. **PROTOCOL REVIEW** (Reference existing protocols)
   - IF protocols exist: Review supplements, dietary, lifestyle recommendations
   - Quote monitoring and duration details
   - IF no protocols: State "No protocols currently assigned"

6. **DATA-DRIVEN RECOMMENDATIONS**
   - Base recommendations ONLY on findings from above sections
   - IF insufficient data: Focus on what assessments/testing are needed
   - Prioritize based on actual documented concerns, not assumptions

REQUIRED OUTPUT SECTIONS:
1. **Data Summary** - What information was actually available
2. **Findings Analysis** - What the available data reveals
3. **Recommendations** - Based only on documented findings
4. **Data Gaps** - What additional information is needed

FORMAT: Use markdown with clear headings. Start analysis with "Based on the available data for [client name]..." and explicitly reference data sources throughout.`;

// GET handler to retrieve existing AI analysis results
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // 1. Authentication
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = params;

    // 2. Fetch client with existing AI analysis results
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        aiAnalysisResults: true,
        aiAnalysisDate: true,
        aiAnalysisVersion: true,
      }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 3. Return analysis results if they exist
    if (client.aiAnalysisResults) {
      return NextResponse.json({
        success: true,
        analysis: client.aiAnalysisResults,
        analysisDate: client.aiAnalysisDate,
        analysisVersion: client.aiAnalysisVersion,
        cached: true
      });
    } else {
      // No analysis exists yet
      return NextResponse.json({
        success: false,
        message: "No AI analysis available for this client"
      }, { status: 404 });
    }

  } catch (error) {
    console.error("AI Analysis GET error:", error);
    return NextResponse.json(
      { 
        error: "Failed to retrieve AI analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // 1. Authentication - Fixed 2025-08-26
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = params;

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
    console.log("🔑 Claude API Key check:", claudeApiKey ? "FOUND" : "MISSING");
    
    if (!claudeApiKey) {
      console.error("❌ ANTHROPIC_API_KEY environment variable not set");
      throw new Error("Claude API key not configured - please set ANTHROPIC_API_KEY environment variable");
    }

    const prompt = FUNCTIONAL_MEDICINE_PROMPT.replace(
      "{{CLIENT_DATA}}",
      JSON.stringify(structuredData, null, 2)
    );

    // Debug: Log data summary being sent to Claude
    console.log("📊 Data summary being sent to Claude:");
    console.log("  - Client:", structuredData.client.name, `(${structuredData.client.gender}, age based on DOB: ${structuredData.client.dateOfBirth})`);
    console.log("  - Health Goals:", structuredData.client.healthGoals);
    console.log("  - Assessments:", structuredData.assessments.length);
    console.log("  - Documents:", structuredData.documents.length);
    console.log("  - Notes:", structuredData.notes.length);
    console.log("  - Protocols:", structuredData.protocols.length);
    
    // Log sample data to verify content
    if (structuredData.assessments.length > 0) {
      console.log("  - Sample assessment responses:", structuredData.assessments[0].responses.length, "questions");
    }
    if (structuredData.documents.length > 0) {
      console.log("  - Sample document:", structuredData.documents[0].fileName, "type:", structuredData.documents[0].documentType);
    }
    if (structuredData.notes.length > 0) {
      console.log("  - Sample note:", structuredData.notes[0].title, "type:", structuredData.notes[0].noteType);
    }

    console.log("🤖 Making Claude API request...");
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    console.log("📡 Claude API response status:", claudeResponse.status);

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.text();
      console.error("Claude API error:", claudeResponse.status, errorData);
      throw new Error(`Claude API error: ${claudeResponse.status} - ${errorData}`);
    }

    const claudeData = await claudeResponse.json();
    const analysis = claudeData.content[0].text;

    // 7. Store Results in Database
    console.log("💾 Saving analysis to database...");
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        aiAnalysisResults: analysis,
        aiAnalysisDate: new Date(),
        aiAnalysisVersion: 'v1.0'
      }
    });
    console.log("✅ Analysis saved successfully");
    console.log("🔍 Verification - Saved analysis length:", updatedClient.aiAnalysisResults?.length || 0);
    console.log("📅 Verification - Analysis date:", updatedClient.aiAnalysisDate);

    // 8. Return Success Response
    console.log("📤 Returning success response");
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
