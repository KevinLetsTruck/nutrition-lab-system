import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.responses || !Array.isArray(body.responses)) {
      return NextResponse.json(
        {
          error: "No responses provided",
        },
        { status: 400 }
      );
    }

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

**CRITICAL**: Return ONLY valid JSON in the exact format specified at the end. No explanations or text outside the JSON structure.

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

CRITICAL INSTRUCTIONS:
1. You MUST always return a valid JSON response, no exceptions
2. If data is limited, still provide analysis based on available information
3. Never return plain text explanations - always use the JSON structure below
4. Provide at least 2 patterns, even if preliminary
5. All fields are required - use reasonable defaults if needed

Format your response EXACTLY as this JSON structure:
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

Remember: Return ONLY the JSON above, no additional text or explanations.`;

    // Create Claude client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });

    console.log("Sending assessment to Claude for analysis...");
    console.log("Number of responses:", body.responses.length);

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
      console.error("Failed to parse Claude response as JSON");
      // Return the raw response if parsing fails
      return NextResponse.json({
        success: true,
        analysis: {
          rawAnalysis: responseText,
          primaryPatterns: [
            {
              pattern: "Analysis generated - see raw text",
              evidence: ["Claude provided analysis in text format"],
            },
          ],
          analysisVersion: "1.0",
          analyzedBy: "claude-3-opus-20240229",
          createdAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        analysisVersion: "1.0",
        analyzedBy: "claude-3-opus-20240229",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
