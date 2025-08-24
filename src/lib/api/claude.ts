import Anthropic from "@anthropic-ai/sdk";

// Document Structure Analysis Types
interface DocumentStructureAnalysis {
  documentType: string;
  labSource: string;
  ocrQuality: {
    overall: number;
    issues: string[];
    problematicSections: string[];
  };
  structure: {
    sections: Array<{
      name: string;
      startLine: number;
      endLine: number;
      type: "header" | "table" | "list" | "paragraph";
    }>;
    tables: Array<{
      startLine: number;
      endLine: number;
      columns: number;
      hasHeaders: boolean;
      description: string;
    }>;
  };
  labValueLocations: Array<{
    section: string;
    format: "table" | "list" | "inline";
    pattern: string;
    confidence: number;
    notes: string;
  }>;
  extractionStrategy: {
    recommendedApproach: string;
    specialConsiderations: string[];
    expectedTestCount: number;
  };
  criticalObservations: string[];
}

// Lab Extraction Result Types
interface LabExtractionResult {
  extractionSummary: {
    totalExtracted: number;
    confidence: number;
    extractionMethod: string;
    issues: string[];
  };
  labValues: Array<{
    testName: string;
    value: number;
    unit: string;
    referenceRange: {
      low: number | null;
      high: number | null;
      text: string;
    };
    functionalRange: {
      low: number | null;
      high: number | null;
      source: string;
    };
    status: {
      conventional: "normal" | "low" | "high";
      functional: "optimal" | "suboptimal" | "concerning" | "critical";
    };
    flags: string[];
    confidence: number;
    extractionNotes: string;
  }>;
  missedValues: Array<{
    potentialTest: string;
    reason: string;
    rawText: string;
  }>;
  validationChecks: {
    expectedCount: number;
    extractedCount: number;
    discrepancyReason: string | null;
  };
  isValid?: boolean;
}

// Functional Analysis Result Types
interface SystemAssessment {
  status: string;
  markers: string[];
  interpretation: string;
}

interface FunctionalAnalysisResult {
  summary: {
    overallHealth:
      | "excellent"
      | "good"
      | "fair"
      | "needs-attention"
      | "critical";
    primaryConcerns: string[];
    positiveFindings: string[];
  };
  patterns: Array<{
    name: string;
    severity: "mild" | "moderate" | "significant";
    confidence: "high" | "medium" | "low";
    markers: string[];
    explanation: string;
  }>;
  rootCauses: Array<{
    cause: string;
    evidence: string[];
    likelihood: "high" | "medium" | "low";
    explanation: string;
  }>;
  systemsAssessment: {
    inflammation: SystemAssessment;
    metabolic: SystemAssessment;
    gut: SystemAssessment;
    hpaAxis: SystemAssessment;
  };
  narrativeReport: {
    introduction: string;
    whatWeFound: string;
    whatThisMeans: string;
    rootCauseExplanation: string;
    positiveNews: string;
    nextSteps: string;
    additionalTesting: string;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  additionalTestsNeeded: Array<{
    test: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }>;
  truckDriverConsiderations: {
    relevant: boolean;
    specificChallenges: string[];
    adaptedRecommendations: string[];
  };
}

class ClaudeService {
  private client: Anthropic | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error("WARNING: ANTHROPIC_API_KEY is not configured");
      return;
    }

    try {
      this.client = new Anthropic({
        apiKey: apiKey,
      });

    } catch (error) {
      console.error("Failed to initialize Claude:", error);
    }
  }

  async analyzeDocumentStructure(
    ocrText: string
  ): Promise<DocumentStructureAnalysis> {
    if (!this.client) {
      throw new Error("Claude AI service not initialized - check API key");
    }

    const SYSTEM_PROMPT = `You are an expert medical document analyst specializing in lab reports and medical records. Your task is to analyze document structure and identify the location and format of important information.

You excel at:
- Identifying document types (LabCorp, Quest, hospital labs, etc.)
- Recognizing table structures even in poor OCR
- Finding lab values and their associated reference ranges
- Assessing OCR quality and identifying problematic areas
- Understanding medical document layouts

Important: Focus on WHERE information is located, not extracting the values themselves yet.`;

    const USER_PROMPT = `Analyze this medical document's structure and provide a detailed assessment.

DOCUMENT TEXT:
${ocrText}

ANALYSIS REQUIRED:
1. Identify the document type and source
2. Assess OCR quality (rate 1-10 and identify problem areas)
3. Map the document structure (sections, tables, lists)
4. Identify where lab values are located
5. Note any formatting patterns for values and ranges
6. Flag any areas that need special attention

RESPOND WITH THIS JSON STRUCTURE:
{
  "documentType": "string (e.g., 'LabCorp Comprehensive Metabolic Panel')",
  "labSource": "string (e.g., 'LabCorp', 'Quest', 'Hospital', 'Unknown')",
  "ocrQuality": {
    "overall": "number (1-10)",
    "issues": ["list of specific OCR problems"],
    "problematicSections": ["list of sections with poor OCR"]
  },
  "structure": {
    "sections": [
      {
        "name": "string (e.g., 'Patient Information')",
        "startLine": "number",
        "endLine": "number",
        "type": "string (e.g., 'header', 'table', 'list', 'paragraph')"
      }
    ],
    "tables": [
      {
        "startLine": "number",
        "endLine": "number",
        "columns": "number",
        "hasHeaders": "boolean",
        "description": "string (what this table contains)"
      }
    ]
  },
  "labValueLocations": [
    {
      "section": "string (which section)",
      "format": "string (e.g., 'table', 'list', 'inline')",
      "pattern": "string (e.g., 'TestName Value Unit Range')",
      "confidence": "number (0-1)",
      "notes": "string (any special observations)"
    }
  ],
  "extractionStrategy": {
    "recommendedApproach": "string (e.g., 'table-based', 'line-by-line', 'pattern-matching')",
    "specialConsiderations": ["list of things to watch for"],
    "expectedTestCount": "number (approximate)"
  },
  "criticalObservations": ["any urgent notes about the document"]
}`;

    try {
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022", // We'll upgrade this later
        max_tokens: 4000,
        temperature: 0.1, // Very low for consistency
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: USER_PROMPT,
          },
        ],
      });

      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Enhanced JSON parsing with error handling
      try {
        const result = JSON.parse(content);
        return result as DocumentStructureAnalysis;
      } catch (parseError) {
        console.error("Failed to parse structure analysis:", parseError);

        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]);
            return result as DocumentStructureAnalysis;
          } catch (secondError) {
            throw new Error("Could not parse document structure analysis");
          }
        }

        throw new Error("Invalid response format from Claude");
      }
    } catch (error) {
      console.error("Document structure analysis failed:", error);
      throw error;
    }
  }

  async extractLabValuesWithStructure(
    ocrText: string,
    structureAnalysis: DocumentStructureAnalysis
  ): Promise<LabExtractionResult> {
    if (!this.client) {
      throw new Error("Claude AI service not initialized - check API key");
    }

    // Build context from structure analysis
    const structureContext = `
Document Type: ${structureAnalysis.documentType}
Lab Source: ${structureAnalysis.labSource}
OCR Quality: ${structureAnalysis.ocrQuality.overall}/10
Extraction Strategy: ${structureAnalysis.extractionStrategy.recommendedApproach}
Expected Test Count: ${structureAnalysis.extractionStrategy.expectedTestCount}
Pattern: ${structureAnalysis.labValueLocations[0]?.pattern || "Unknown"}
${
  structureAnalysis.ocrQuality.issues.length > 0
    ? `OCR Issues: ${structureAnalysis.ocrQuality.issues.join(", ")}`
    : ""
}
`;

    const SYSTEM_PROMPT = `You are Kevin Rutherford, FNTP, extracting lab values from medical documents with precision. You have already analyzed the document structure and know exactly where to look.

EXTRACTION RULES:
1. Only extract values that are clearly readable
2. Use the pattern identified in the structure analysis
3. Include reference ranges when present
4. Apply functional medicine optimal ranges knowledge
5. Flag values outside both conventional and functional ranges
6. If a value is unclear, note it but don't guess

CRITICAL: Maintain high accuracy. It's better to extract 7 correct values than 10 with 3 errors.`;

    const USER_PROMPT = `Extract lab values from this ${structureAnalysis.documentType}.

STRUCTURE CONTEXT:
${structureContext}

DOCUMENT TEXT:
${ocrText}

EXTRACTION REQUIREMENTS:
1. Extract each lab test with its value, unit, and reference range
2. Use standardized test names (e.g., "Glucose" not "Gluc" or "GLU")
3. Include both conventional and functional medicine ranges
4. Calculate if values are optimal, suboptimal, or concerning
5. Note extraction confidence for each value

RESPOND WITH THIS JSON STRUCTURE:
{
  "extractionSummary": {
    "totalExtracted": "number",
    "confidence": "number (0-1)",
    "extractionMethod": "string",
    "issues": ["any extraction problems encountered"]
  },
  "labValues": [
    {
      "testName": "string (standardized name)",
      "value": "number",
      "unit": "string",
      "referenceRange": {
        "low": "number or null",
        "high": "number or null",
        "text": "string (original range text from document)"
      },
      "functionalRange": {
        "low": "number or null",
        "high": "number or null",
        "source": "string (e.g., 'Optimal DX', 'IFM Guidelines')"
      },
      "status": {
        "conventional": "normal|low|high",
        "functional": "optimal|suboptimal|concerning|critical"
      },
      "flags": ["any flags from the original document"],
      "confidence": "number (0-1)",
      "extractionNotes": "string (any notes about extraction)"
    }
  ],
  "missedValues": [
    {
      "potentialTest": "string",
      "reason": "string (why it couldn't be extracted)",
      "rawText": "string (the problematic text)"
    }
  ],
  "validationChecks": {
    "expectedCount": ${structureAnalysis.extractionStrategy.expectedTestCount},
    "extractedCount": "number",
    "discrepancyReason": "string or null"
  }
}`;

    try {
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 6000, // Increased for detailed extraction
        temperature: 0.05, // Even lower for maximum consistency
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: USER_PROMPT,
          },
        ],
      });

      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      try {
        const result = JSON.parse(content);

        // Add post-processing validation
        result.isValid = this.validateExtraction(result, structureAnalysis);

        return result as LabExtractionResult;
      } catch (parseError) {
        console.error("Failed to parse lab extraction:", parseError);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]);
            result.isValid = this.validateExtraction(result, structureAnalysis);
            return result as LabExtractionResult;
          } catch (secondError) {
            throw new Error("Could not parse lab extraction results");
          }
        }

        throw new Error("Invalid response format from Claude");
      }
    } catch (error) {
      console.error("Lab value extraction failed:", error);
      throw error;
    }
  }

  // Helper method for validation
  private validateExtraction(
    result: any,
    structureAnalysis: DocumentStructureAnalysis
  ): boolean {
    if (!result.labValues || !Array.isArray(result.labValues)) {
      return false;
    }

    const extractedCount = result.labValues.length;
    const expectedCount =
      structureAnalysis.extractionStrategy.expectedTestCount;

    // Allow 20% variance from expected count
    const variance = Math.abs(extractedCount - expectedCount) / expectedCount;

    return variance <= 0.2 && result.extractionSummary?.confidence >= 0.7;
  }

  async analyzeFunctionalPatterns(
    labValues: any[],
    clientInfo?: any
  ): Promise<FunctionalAnalysisResult> {
    if (!this.client) {
      throw new Error("Claude AI service not initialized - check API key");
    }

    // Format lab values for analysis
    const formattedLabs = labValues.map((lab) => ({
      test: lab.testName,
      value: lab.value,
      unit: lab.unit,
      status: lab.status?.functional || "unknown",
      conventional: `${lab.referenceRange?.low || "?"}-${
        lab.referenceRange?.high || "?"
      }`,
      functional: `${lab.functionalRange?.low || "?"}-${
        lab.functionalRange?.high || "?"
      }`,
    }));

    const SYSTEM_PROMPT = `You are Kevin Rutherford, FNTP (Functional Nutrition Therapy Practitioner), analyzing lab results to identify root causes and patterns affecting health, particularly for truck drivers. 

Your expertise includes:
- Identifying inflammatory patterns and their sources
- Recognizing metabolic dysfunction and insulin resistance
- Detecting gut dysfunction and dysbiosis patterns
- Assessing HPA axis dysfunction and stress impact
- Understanding how trucking lifestyle affects these patterns
- Translating complex medical concepts into language clients understand

IMPORTANT: Write in a warm, conversational tone that educates and empowers clients without overwhelming them with medical jargon.`;

    const USER_PROMPT = `Analyze these lab results for functional medicine patterns and root causes.

CLIENT CONTEXT:
${
  clientInfo
    ? `
- Name: ${clientInfo.firstName} ${clientInfo.lastName}
- Occupation: ${
        clientInfo.isTruckDriver
          ? "Professional Truck Driver"
          : clientInfo.occupation || "Not specified"
      }
- Health Goals: ${clientInfo.healthGoals || "General health optimization"}
- Current Conditions: ${clientInfo.conditions || "None reported"}
- Medications: ${clientInfo.medications || "None reported"}
`
    : "No client information provided"
}

LAB VALUES:
${JSON.stringify(formattedLabs, null, 2)}

ANALYSIS REQUIREMENTS:
1. Identify all functional medicine patterns present
2. Determine likely root causes based on lab patterns
3. Assess inflammation, metabolic, gut, and HPA axis status
4. Consider truck driver lifestyle factors if applicable
5. Write a narrative explanation the client can understand
6. Prioritize findings by health impact
7. Suggest which additional tests would be helpful

RESPOND WITH THIS JSON STRUCTURE:
{
  "summary": {
    "overallHealth": "excellent|good|fair|needs-attention|critical",
    "primaryConcerns": ["top 3 concerns in simple language"],
    "positiveFindings": ["what's working well"]
  },
  "patterns": [
    {
      "name": "Pattern name (e.g., 'Metabolic Dysfunction')",
      "severity": "mild|moderate|significant",
      "confidence": "high|medium|low",
      "markers": ["which lab values indicate this"],
      "explanation": "Simple explanation of what this means"
    }
  ],
  "rootCauses": [
    {
      "cause": "Root cause name (e.g., 'Chronic Inflammation')",
      "evidence": ["lab values supporting this"],
      "likelihood": "high|medium|low",
      "explanation": "Why we suspect this root cause"
    }
  ],
  "systemsAssessment": {
    "inflammation": {
      "status": "none|low|moderate|high",
      "markers": ["relevant lab values"],
      "interpretation": "What this means for the client"
    },
    "metabolic": {
      "status": "optimal|early-dysfunction|dysfunction|severe",
      "markers": ["relevant lab values"],
      "interpretation": "What this means for the client"
    },
    "gut": {
      "status": "healthy|possible-issues|likely-dysfunction",
      "markers": ["relevant lab values"],
      "interpretation": "What this means for the client"
    },
    "hpaAxis": {
      "status": "balanced|early-stress|dysfunction|exhaustion",
      "markers": ["relevant lab values"],
      "interpretation": "What this means for the client"
    }
  },
  "narrativeReport": {
    "introduction": "Warm greeting and overview paragraph",
    "whatWeFound": "2-3 paragraphs explaining key findings in simple terms",
    "whatThisMeans": "2-3 paragraphs explaining the health implications",
    "rootCauseExplanation": "1-2 paragraphs explaining likely root causes",
    "positiveNews": "1 paragraph highlighting what's working well",
    "nextSteps": "1-2 paragraphs on recommended actions",
    "additionalTesting": "Paragraph explaining which tests would provide more insight"
  },
  "recommendations": {
    "immediate": ["Top 3 things to address now"],
    "shortTerm": ["Things to work on over next 1-3 months"],
    "longTerm": ["Long-term health optimization strategies"]
  },
  "additionalTestsNeeded": [
    {
      "test": "Test name",
      "reason": "Why this test would be helpful",
      "priority": "high|medium|low"
    }
  ],
  "truckDriverConsiderations": {
    "relevant": true|false,
    "specificChallenges": ["Challenges specific to trucking lifestyle"],
    "adaptedRecommendations": ["Recommendations that work on the road"]
  }
}`;

    try {
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 6000,
        temperature: 0.2, // Slightly higher for narrative writing
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: USER_PROMPT,
          },
        ],
      });

      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      try {
        const result = JSON.parse(content);
        return result as FunctionalAnalysisResult;
      } catch (parseError) {
        console.error("Failed to parse functional analysis:", parseError);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]) as FunctionalAnalysisResult;
          } catch (secondError) {
            throw new Error("Could not parse functional analysis results");
          }
        }

        throw new Error("Invalid response format from Claude");
      }
    } catch (error) {
      console.error("Functional analysis failed:", error);
      throw error;
    }
  }

  async analyzeLabDocument(
    text: string,
    documentType: string,
    clientInfo?: any
  ): Promise<any> {
    if (!this.client) {
      throw new Error("Claude AI service not initialized - check API key");
    }

    try {
      const prompt = `You are Kevin Rutherford, FNTP, analyzing a ${documentType} lab report for a truck driver client.

      ${
        clientInfo
          ? `Client Information:
      - Name: ${clientInfo.firstName} ${clientInfo.lastName}
      - Truck Driver: ${clientInfo.isTruckDriver ? "Yes" : "No"}
      - Health Goals: ${clientInfo.healthGoals || "Not specified"}
      - Current Medications: ${clientInfo.medications || "None listed"}
      - Health Conditions: ${clientInfo.conditions || "None listed"}
      `
          : ""
      }

      Lab Document Text:
      ${text}

      Please analyze and provide:
      1. Extract all lab values with results and reference ranges
      2. Identify values outside optimal functional medicine ranges (not just standard ranges)
      3. Identify patterns suggesting root causes (gut dysfunction, inflammation, HPA axis, etc.)
      4. Flag any DOT medical concerns that could affect CDL
      5. Provide truck-driver specific recommendations

      Important considerations:
      - Use functional medicine optimal ranges, not just lab ranges
      - Consider how trucking lifestyle impacts these markers
      - Flag urgent issues that need immediate attention
      - Suggest practical interventions compatible with OTR lifestyle

      Format your response as JSON with these sections:
      {
        "summary": "Brief overview of main findings",
        "extracted_values": [
          {
            "marker": "name",
            "value": "result",
            "unit": "unit",
            "reference_range": "lab range",
            "optimal_range": "functional range",
            "status": "optimal/suboptimal/concerning/critical"
          }
        ],
        "patterns_identified": [
          {
            "pattern": "pattern name",
            "confidence": "high/medium/low",
            "supporting_markers": ["marker1", "marker2"],
            "explanation": "why this pattern"
          }
        ],
        "root_causes": [
          {
            "cause": "root cause name",
            "priority": "high/medium/low",
            "evidence": "supporting evidence"
          }
        ],
        "dot_concerns": [
          {
            "issue": "concern",
            "severity": "immediate/monitor/low",
            "action_required": "what to do"
          }
        ],
        "immediate_recommendations": [
          "recommendation 1",
          "recommendation 2"
        ],
        "supplement_protocol": [
          {
            "supplement": "name",
            "dose": "amount",
            "timing": "when to take",
            "duration": "how long",
            "truck_instructions": "how to take on the road"
          }
        ],
        "dietary_changes": [
          "truck-compatible dietary change 1",
          "truck-compatible dietary change 2"
        ],
        "follow_up": "recommended timeline and next steps"
      }`;

      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Extract the response text
      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Try to parse JSON from the response
      try {
        // Look for JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse Claude response as JSON:", parseError);
      }

      // Return raw response if JSON parsing fails
      return {
        summary: "Analysis completed but formatting error occurred",
        raw_response: content,
        error: "JSON_PARSE_ERROR",
      };
    } catch (error) {
      console.error("Claude API Error:", error);
      throw new Error(
        `Failed to analyze document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async generateProtocol(
    clientData: any,
    labResults: any[],
    assessmentData?: any
  ): Promise<any> {
    if (!this.client) {
      throw new Error("Claude AI service not initialized - check API key");
    }

    try {
      const prompt = `As Kevin Rutherford, FNTP specializing in truck driver health, create a comprehensive functional medicine protocol.

      Client Information:
      ${JSON.stringify(clientData, null, 2)}

      Lab Results Summary:
      ${JSON.stringify(labResults, null, 2)}

      ${
        assessmentData
          ? `Assessment Data:
      ${JSON.stringify(assessmentData, null, 2)}`
          : ""
      }

      Create a detailed protocol that includes:

      1. PHASE 1: IMMEDIATE (Week 1-2)
         - Address urgent issues and symptoms
         - Foundation support
         - Quick wins for motivation

      2. PHASE 2: SHORT-TERM (Week 3-6)
         - Root cause interventions
         - Gut restoration if needed
         - Metabolic support

      3. PHASE 3: LONG-TERM (Week 7-12)
         - Optimization protocols
         - Hormone balancing if needed
         - Maintenance planning

      For each phase provide:
      - Specific supplements with dosing (prioritize algae-based omega-3 from LetsTruck.com)
      - Dietary modifications (truck-stop compatible)
      - Lifestyle interventions (realistic for OTR lifestyle)
      - Success metrics
      - Red flags to watch

      Format as JSON with clear, actionable steps.`;

      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse protocol response:", parseError);
      }

      return {
        protocol: content,
        error: "JSON_PARSE_ERROR",
      };
    } catch (error) {
      console.error("Protocol generation error:", error);
      throw error;
    }
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: 'Respond with just "OK" if you can hear me.',
          },
        ],
      });

      return (
        response.content[0].type === "text" &&
        response.content[0].text.includes("OK")
      );
    } catch (error) {
      console.error("Claude connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const claudeService = new ClaudeService();
