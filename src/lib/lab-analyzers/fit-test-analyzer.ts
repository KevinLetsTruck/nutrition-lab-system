import ClaudeClient from '../claude-client'

export interface FITTestResult {
  testType: 'FIT' | 'FOBT' | 'Fecal Immunochemical'
  result: 'positive' | 'negative' | 'inconclusive'
  hemoglobinLevel?: number
  unit?: string
  referenceRange?: string
  collectionDate?: string
  processingDate?: string
  labName?: string
  patientName?: string
  clinicalSignificance: string
  recommendations: string[]
  followUpRequired: boolean
  followUpInstructions: string[]
  riskFactors: string[]
  nextSteps: string[]
}

export class FITTestAnalyzer {
  private static instance: FITTestAnalyzer
  private claudeClient: ClaudeClient

  private constructor() {
    this.claudeClient = ClaudeClient.getInstance()
  }

  static getInstance(): FITTestAnalyzer {
    if (!FITTestAnalyzer.instance) {
      FITTestAnalyzer.instance = new FITTestAnalyzer()
    }
    return FITTestAnalyzer.instance
  }

  async analyzeFITTest(pdfText: string): Promise<FITTestResult> {
    console.log('[FIT-ANALYZER] Starting FIT test analysis...')

    const systemPrompt = `You are an expert gastroenterologist analyzing FIT (Fecal Immunochemical Test) results. 
    Extract all relevant information and provide clinical interpretation.

    Return ONLY a JSON object with this exact structure:
    {
      "testType": "FIT" | "FOBT" | "Fecal Immunochemical",
      "result": "positive" | "negative" | "inconclusive",
      "hemoglobinLevel": number or null,
      "unit": "ng/mL" or "μg/g" or null,
      "referenceRange": "string or null",
      "collectionDate": "YYYY-MM-DD or null",
      "processingDate": "YYYY-MM-DD or null",
      "labName": "string or null",
      "patientName": "string or null",
      "clinicalSignificance": "Detailed clinical interpretation",
      "recommendations": ["recommendation1", "recommendation2"],
      "followUpRequired": boolean,
      "followUpInstructions": ["instruction1", "instruction2"],
      "riskFactors": ["risk factor1", "risk factor2"],
      "nextSteps": ["next step1", "next step2"]
    }

    CRITICAL RULES:
    1. Positive FIT tests require immediate follow-up colonoscopy
    2. Negative tests should be repeated annually for screening
    3. Inconclusive results need repeat testing
    4. Consider patient age, family history, and symptoms
    5. Provide clear, actionable recommendations

    Return ONLY the JSON object, nothing else.`

    const prompt = `Analyze this FIT test result and return ONLY a JSON object with the analysis:

${pdfText}

Return ONLY the JSON object with the analysis structure specified above. Do not include any other text.`

    try {
      const result = await this.claudeClient.analyzePractitionerReport(prompt, systemPrompt)
      console.log('[FIT-ANALYZER] Raw analysis result:', result.substring(0, 500))
      
      const analysis = JSON.parse(result) as FITTestResult
      console.log('[FIT-ANALYZER] Analysis complete:', analysis.result)
      
      return analysis
    } catch (error) {
      console.error('[FIT-ANALYZER] Analysis failed:', error)
      throw new Error(`FIT test analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async analyzeFITTestWithClientContext(pdfText: string, clientName: string, clientAge?: number): Promise<FITTestResult> {
    console.log('[FIT-ANALYZER] Starting FIT test analysis with client context...')

    const systemPrompt = `You are an expert gastroenterologist analyzing FIT (Fecal Immunochemical Test) results for a specific client.
    Consider the client's context when providing recommendations.

    Return ONLY a JSON object with this exact structure:
    {
      "testType": "FIT" | "FOBT" | "Fecal Immunochemical",
      "result": "positive" | "negative" | "inconclusive",
      "hemoglobinLevel": number or null,
      "unit": "ng/mL" or "μg/g" or null,
      "referenceRange": "string or null,
      "collectionDate": "YYYY-MM-DD or null",
      "processingDate": "YYYY-MM-DD or null",
      "labName": "string or null,
      "patientName": "string or null,
      "clinicalSignificance": "Detailed clinical interpretation",
      "recommendations": ["recommendation1", "recommendation2"],
      "followUpRequired": boolean,
      "followUpInstructions": ["instruction1", "instruction2"],
      "riskFactors": ["risk factor1", "risk factor2"],
      "nextSteps": ["next step1", "next step2"]
    }

    CLIENT CONTEXT:
    - Client Name: ${clientName}
    - Client Age: ${clientAge || 'Unknown'}

    CRITICAL RULES:
    1. Positive FIT tests require immediate follow-up colonoscopy
    2. Negative tests should be repeated annually for screening
    3. Consider client's age and risk factors
    4. Provide personalized recommendations
    5. Include truck driver-specific considerations if relevant

    Return ONLY the JSON object, nothing else.`

    const prompt = `Analyze this FIT test result for client ${clientName} and return ONLY a JSON object with the analysis:

${pdfText}

Return ONLY the JSON object with the analysis structure specified above. Do not include any other text.`

    try {
      const result = await this.claudeClient.analyzePractitionerReport(prompt, systemPrompt)
      const analysis = JSON.parse(result) as FITTestResult
      
      // Ensure patient name is set
      if (!analysis.patientName) {
        analysis.patientName = clientName
      }
      
      console.log('[FIT-ANALYZER] Contextual analysis complete:', analysis.result)
      return analysis
    } catch (error) {
      console.error('[FIT-ANALYZER] Contextual analysis failed:', error)
      throw new Error(`FIT test analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
} 