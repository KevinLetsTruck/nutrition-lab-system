import { prisma } from "@/lib/db/prisma";
import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

interface AnalysisResult {
  primaryPatterns: Array<{
    pattern: string;
    evidence: string[];
  }>;
  rootCauses: {
    primary_drivers: string[];
    timeline_significance: string;
  };
  systemPriorities: Record<string, string>;
  keyFindings: {
    most_concerning: string[];
    positive_findings: string[];
    risk_factors: string[];
  };
  labRecommendations: {
    essential: string[];
    additional: string[];
  };
  supplementProtocol: {
    foundation: Array<{
      supplement: string;
      dosage: string;
      timing: string;
      rationale: string;
    }>;
    targeted: Array<{
      supplement: string;
      dosage: string;
      timing: string;
      rationale: string;
    }>;
    timeline: string;
  };
  lifestyleModifications: {
    dietary: string[];
    sleep: string[];
    stress: string[];
    movement: string[];
  };
  treatmentPhases: {
    phase_1: {
      weeks: string;
      focus: string;
      actions: string[];
    };
    phase_2: {
      weeks: string;
      focus: string;
      actions: string[];
    };
    phase_3: {
      weeks: string;
      focus: string;
      actions: string[];
    };
  };
}

export async function analyzeAssessment(
  assessmentId: string
): Promise<AnalysisResult> {
  // 1. Load assessment with all responses
  const assessment = await prisma.clientAssessment.findUnique({
    where: { id: assessmentId },
    include: {
      responses: true,
      client: true,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  // 2. Format responses for Claude
  const responseMap: Record<string, any> = {};
  assessment.responses.forEach((response) => {
    responseMap[response.questionId] = response.responseValue;
  });

  // Get client info
  const clientInfo = {
    age: assessment.client?.dateOfBirth
      ? new Date().getFullYear() -
        new Date(assessment.client.dateOfBirth).getFullYear()
      : "Unknown",
    gender: assessment.client?.gender || "Unknown",
    occupation: assessment.client?.isTruckDriver
      ? "Truck Driver"
      : "Not specified",
  };

  // 3. Create comprehensive prompt
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

  // 4. Send to Claude
  console.log("Sending assessment to Claude for analysis...");

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

  // 5. Parse response
  const responseText =
    response.content[0].type === "text" ? response.content[0].text : "";

  let analysis: AnalysisResult;

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

  // 6. Save to database
  await prisma.assessmentAnalysis.create({
    data: {
      assessmentId,
      primaryPatterns: analysis.primaryPatterns,
      rootCauses: analysis.rootCauses,
      systemPriorities: analysis.systemPriorities,
      keyFindings: analysis.keyFindings,
      labRecommendations: analysis.labRecommendations,
      supplementProtocol: analysis.supplementProtocol,
      lifestyleModifications: analysis.lifestyleModifications,
      treatmentPhases: analysis.treatmentPhases,
      analysisVersion: "1.0",
      analyzedBy: "claude-3-opus-20240229",
      confidence: 0.85, // Default confidence score
    },
  });

  return analysis;
}

export async function getAnalysis(assessmentId: string) {
  const analysis = await prisma.assessmentAnalysis.findUnique({
    where: { assessmentId },
  });

  return analysis;
}
