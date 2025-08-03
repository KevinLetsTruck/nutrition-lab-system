import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface VisionAnalysisResult {
  documentType: string;
  extractedData: any;
  keyFindings: string[];
  structuredData: any;
}

export async function analyzeDocumentWithVision(
  pages: Array<{ base64: string; pageNumber: number }>,
  fileName: string
): Promise<VisionAnalysisResult> {
  
  try {
    // Analyze first few pages to determine document type
    const documentTypePrompt = `
    Analyze this document image and identify what type of health assessment or lab report this is.
    
    Document types to recognize:
    - NAQ (Nutritional Assessment Questionnaire)
    - NutriQ reports
    - KBMO food sensitivity testing
    - Dutch hormone testing
    - Standard blood chemistry panels
    - Heavy metal testing
    - Toxin/environmental testing
    - Stool analysis
    - Urine analysis
    - Genetic testing results
    - Client intake forms
    - Symptom burden graphs/charts
    
    Return just the document type identifier and confidence level.
    `;

    const typeResponse = await anthropic.messages.create({
      model: "claude-3-sonnet-20241022",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: documentTypePrompt
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: pages[0].base64
            }
          }
        ]
      }]
    });

    const documentType = typeResponse.content[0].text.toLowerCase();
    
    // Based on document type, use appropriate analysis
    if (documentType.includes('naq') || documentType.includes('nutriq')) {
      return await analyzeNAQDocument(pages);
    } else if (documentType.includes('symptom') || documentType.includes('burden')) {
      return await analyzeSymptomBurdenGraph(pages);
    } else if (documentType.includes('kbmo') || documentType.includes('food sensitivity')) {
      return await analyzeKBMODocument(pages);
    } else if (documentType.includes('dutch') || documentType.includes('hormone')) {
      return await analyzeDutchDocument(pages);
    } else {
      return await analyzeGenericHealthDocument(pages, documentType);
    }
    
  } catch (error) {
    console.error('Claude vision analysis failed:', error);
    throw new Error(`Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function analyzeNAQDocument(pages: Array<{ base64: string; pageNumber: number }>): Promise<VisionAnalysisResult> {
  const prompt = `
  As Kevin Rutherford, FNTP specializing in truck driver health optimization, analyze this NAQ (Nutritional Assessment Questionnaire) document.

  ANALYSIS REQUIREMENTS:
  1. Extract all symptom scores and responses
  2. Identify highest symptom burden areas
  3. Calculate total symptom burden score
  4. Identify patterns suggesting root causes:
     - Gut dysfunction (digestive symptoms)
     - HPA axis dysfunction (adrenal/stress symptoms)  
     - Detoxification impairment
     - Inflammation markers
     - Nutrient deficiencies
  5. Note any truck driver-specific concerns

  FUNCTIONAL MEDICINE PERSPECTIVE:
  - Look for systemic patterns across body systems
  - Identify root causes vs. symptoms
  - Consider ancestral health mismatches
  - Prioritize interventions by impact

  Return structured JSON with:
  {
    "documentType": "NAQ",
    "totalSymptomBurden": number,
    "systemScores": {
      "digestive": number,
      "detoxification": number,
      "inflammatory": number,
      "adrenal": number,
      "hormonal": number,
      "neurological": number
    },
    "keyFindings": ["finding1", "finding2"],
    "rootCauseIndicators": ["cause1", "cause2"],
    "severestSymptoms": [
      {"symptom": "name", "score": number, "system": "category"}
    ],
    "recommendedTesting": ["test1", "test2"],
    "truckDriverConcerns": ["concern1", "concern2"]
  }
  `;

  const responses = await Promise.all(
    pages.map(async (page) => {
      const response = await anthropic.messages.create({
        model: "claude-3-sonnet-20241022",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `${prompt}\n\nAnalyze page ${page.pageNumber}:`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: page.base64
              }
            }
          ]
        }]
      });
      return response.content[0].text;
    })
  );

  // Combine and synthesize all page analyses
  const synthesisPrompt = `
  Combine these individual page analyses into one comprehensive NAQ analysis:
  
  ${responses.join('\n\n---\n\n')}
  
  Create final comprehensive analysis following the JSON structure requested.
  `;

  const finalResponse = await anthropic.messages.create({
    model: "claude-3-sonnet-20241022",
    max_tokens: 3000,
    messages: [{
      role: "user",
      content: synthesisPrompt
    }]
  });

  const analysisText = finalResponse.content[0].text;
  
  // Extract JSON from response
  const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
  const structuredData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  return {
    documentType: 'NAQ',
    extractedData: structuredData,
    keyFindings: structuredData.keyFindings || [],
    structuredData
  };
}

async function analyzeSymptomBurdenGraph(pages: Array<{ base64: string; pageNumber: number }>): Promise<VisionAnalysisResult> {
  const prompt = `
  Analyze this symptom burden graph/chart document.
  
  Extract:
  1. Body system scores and percentages
  2. Highest burden areas
  3. Patterns and trends
  4. Comparative data if present
  
  Return structured data about the graph contents.
  `;

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20241022",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: prompt
        },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: pages[0].base64
          }
        }
      ]
    }]
  });

  const analysisText = response.content[0].text;
  
  return {
    documentType: 'Symptom Burden Graph',
    extractedData: { analysis: analysisText },
    keyFindings: [analysisText],
    structuredData: { graphAnalysis: analysisText }
  };
}

async function analyzeKBMODocument(pages: Array<{ base64: string; pageNumber: number }>): Promise<VisionAnalysisResult> {
  const prompt = `
  As Kevin Rutherford, FNTP, analyze this KBMO food sensitivity test document.
  
  Extract:
  1. IgG and IgA antibody levels for all foods
  2. Identify high reactive foods (Class 3-4)
  3. Moderate reactive foods (Class 2)
  4. Low reactive foods (Class 1)
  5. Food family patterns
  6. Gut health implications
  
  Return structured data with food reactions categorized by severity.
  `;

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20241022",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: prompt
        },
        ...pages.map(page => ({
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: "image/png" as const,
            data: page.base64
          }
        }))
      ]
    }]
  });

  const analysisText = response.content[0].text;
  
  return {
    documentType: 'KBMO Food Sensitivity',
    extractedData: { analysis: analysisText },
    keyFindings: [analysisText],
    structuredData: { foodSensitivities: analysisText }
  };
}

async function analyzeDutchDocument(pages: Array<{ base64: string; pageNumber: number }>): Promise<VisionAnalysisResult> {
  const prompt = `
  As Kevin Rutherford, FNTP, analyze this DUTCH hormone test document.
  
  Extract:
  1. Cortisol patterns and metabolites
  2. Sex hormone levels and metabolites
  3. Methylation markers
  4. Detoxification pathways
  5. Neurotransmitter metabolites
  6. HPA axis function indicators
  
  Identify hormonal imbalances and their root causes.
  `;

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20241022",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: prompt
        },
        ...pages.map(page => ({
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: "image/png" as const,
            data: page.base64
          }
        }))
      ]
    }]
  });

  const analysisText = response.content[0].text;
  
  return {
    documentType: 'DUTCH Hormone Test',
    extractedData: { analysis: analysisText },
    keyFindings: [analysisText],
    structuredData: { hormoneAnalysis: analysisText }
  };
}

async function analyzeGenericHealthDocument(
  pages: Array<{ base64: string; pageNumber: number }>,
  documentType: string
): Promise<VisionAnalysisResult> {
  
  const prompt = `
  As Kevin Rutherford, FNTP, analyze this ${documentType} health document.
  
  Extract:
  1. Key health metrics and values
  2. Abnormal findings
  3. Patterns of dysfunction
  4. Functional medicine insights
  5. Root cause indicators
  
  Provide functional medicine interpretation of findings.
  `;

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20241022",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: prompt
        },
        ...pages.map(page => ({
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: "image/png" as const,
            data: page.base64
          }
        }))
      ]
    }]
  });

  const analysisText = response.content[0].text;
  
  return {
    documentType,
    extractedData: { analysis: analysisText },
    keyFindings: [analysisText],
    structuredData: { analysis: analysisText }
  };
}