import { NextRequest, NextResponse } from "next/server";
import {
  analyzeAssessment,
  getAnalysis,
} from "@/lib/assessment/analysis-service";
import { prisma } from "@/lib/db/prisma";
import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null;

// POST endpoint to trigger analysis
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await context.params;
    const body = await request.json();

    // Check if this is a test assessment with direct responses
    if (body.isTest && body.responses) {
      console.log("Test assessment with direct responses detected");

      // Format responses for Claude
      const responseMap: Record<string, any> = {};
      body.responses.forEach((response: any) => {
        responseMap[response.questionId] = response.value;
      });

      const clientInfo = body.clientInfo || {
        age: "Unknown",
        gender: "Unknown",
        occupation: "Unknown",
      };

      // Create comprehensive prompt
      const prompt = `
You are an expert functional medicine practitioner analyzing a comprehensive health assessment.

Client Information:
${JSON.stringify(clientInfo, null, 2)}

Assessment Responses:
${JSON.stringify(responseMap, null, 2)}

Provide a comprehensive functional medicine analysis including:

1. PRIMARY PATTERNS IDENTIFIED
List the main functional medicine patterns you observe (e.g., HPA axis dysfunction, gut-brain axis, methylation issues, mitochondrial dysfunction)

2. ROOT CAUSE ANALYSIS
Identify likely root causes based on symptom patterns and timeline

3. SYSTEM PRIORITIES
Rank which body systems need support (1 = highest priority):
- Digestive
- Immune
- Energy/Mitochondrial
- Detoxification
- Hormonal
- Neurological
- Structural

4. KEY FINDINGS
- Most concerning symptoms
- Positive findings/strengths
- Risk factors

5. LABORATORY RECOMMENDATIONS
Suggest specific functional medicine labs based on patterns:
- Essential labs (must have)
- Additional labs (nice to have)

6. SUPPLEMENT PROTOCOL
Recommend supplements with specific dosing:
- Foundation supplements
- Targeted supplements for primary concerns
- Timeline (what to start first)

7. LIFESTYLE MODIFICATIONS
- Dietary recommendations
- Sleep optimization
- Stress management
- Movement/exercise

8. TREATMENT PRIORITIES
Create a phased approach:
- Phase 1 (Weeks 1-4): Foundation
- Phase 2 (Weeks 5-8): Targeted intervention
- Phase 3 (Weeks 9-12): Optimization

Format your response as JSON for easy parsing. Use this exact structure:
{
  "primaryPatterns": [
    {
      "pattern": "Pattern name",
      "evidence": ["evidence1", "evidence2"]
    }
  ],
  "rootCauses": {
    "primary_drivers": ["cause1", "cause2"],
    "timeline_significance": "explanation"
  },
  "systemPriorities": {
    "1_digestive": "explanation",
    "2_hormonal": "explanation",
    "3_energy_mitochondrial": "explanation",
    "4_neurological": "explanation",
    "5_immune": "explanation",
    "6_detoxification": "explanation",
    "7_structural": "explanation"
  },
  "keyFindings": {
    "most_concerning": ["finding1", "finding2"],
    "positive_findings": ["strength1", "strength2"],
    "risk_factors": ["risk1", "risk2"]
  },
  "labRecommendations": {
    "essential": ["lab1", "lab2"],
    "additional": ["lab3", "lab4"]
  },
  "supplementProtocol": {
    "foundation": [
      {
        "supplement": "Supplement name",
        "dosage": "dosage",
        "timing": "when to take",
        "rationale": "why"
      }
    ],
    "targeted": [
      {
        "supplement": "Supplement name",
        "dosage": "dosage",
        "timing": "when to take",
        "rationale": "why"
      }
    ],
    "timeline": "implementation timeline"
  },
  "lifestyleModifications": {
    "dietary": ["modification1", "modification2"],
    "sleep": ["recommendation1"],
    "stress": ["technique1"],
    "movement": ["recommendation1"]
  },
  "treatmentPhases": {
    "phase_1": {
      "weeks": "1-4",
      "focus": "Foundation",
      "actions": ["action1", "action2"]
    },
    "phase_2": {
      "weeks": "5-8",
      "focus": "Targeted intervention",
      "actions": ["action1", "action2"]
    },
    "phase_3": {
      "weeks": "9-12",
      "focus": "Optimization",
      "actions": ["action1", "action2"]
    }
  }
}
`;

      // Check if Anthropic client is available
      if (!anthropic) {
        console.error("ANTHROPIC_API_KEY not configured");
        return NextResponse.json(
          {
            error:
              "AI service not configured. Please set ANTHROPIC_API_KEY in environment variables.",
          },
          { status: 500 }
        );
      }

      // Send to Claude
      console.log("Sending test assessment to Claude for analysis...");

      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Parse response
      const responseText =
        response.content[0].type === "text" ? response.content[0].text : "";

      let analysis;

      try {
        // Extract JSON from the response (it might be wrapped in markdown code blocks)
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;

        analysis = JSON.parse(jsonString);
      } catch (error) {
        console.error("Failed to parse Claude response as JSON:", error);
        console.error("Response text:", responseText);
        throw new Error("Invalid analysis format received");
      }

      // Return the analysis without saving (since it's a test)
      return NextResponse.json({
        success: true,
        analysis: {
          ...analysis,
          analysisVersion: "1.0",
          analyzedBy: "claude-3-opus-20240229",
          createdAt: new Date().toISOString(),
        },
      });
    }

    // Normal flow for real assessments
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: { analysis: true },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment must be completed before analysis" },
        { status: 400 }
      );
    }

    // Check if analysis already exists
    if (assessment.analysis) {
      return NextResponse.json({
        message: "Analysis already exists",
        analysis: assessment.analysis,
      });
    }

    // Generate new analysis
    console.log(`Analyzing assessment ${assessmentId}...`);
    const analysis = await analyzeAssessment(assessmentId);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze assessment" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing analysis
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await context.params;

    // Check if this is a test assessment
    if (assessmentId.startsWith("test-")) {
      // For test assessments, we don't store in database
      // The analysis should be in sessionStorage on the client
      return NextResponse.json({
        error:
          "Test assessment analysis should be retrieved from sessionStorage",
        isTest: true,
      });
    }

    const analysis = await getAnalysis(assessmentId);

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
