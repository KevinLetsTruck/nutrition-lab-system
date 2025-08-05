import Anthropic from '@anthropic-ai/sdk'

// Types for different lab report analyses
export interface NutriQAnalysis {
  totalScore: number
  bodySystems: {
    energy: { score: number; issues: string[]; recommendations: string[] }
    mood: { score: number; issues: string[]; recommendations: string[] }
    sleep: { score: number; issues: string[]; recommendations: string[] }
    stress: { score: number; issues: string[]; recommendations: string[] }
    digestion: { score: number; issues: string[]; recommendations: string[] }
    immunity: { score: number; issues: string[]; recommendations: string[] }
  }
  overallRecommendations: string[]
  priorityActions: string[]
  followUpTests: string[]
}

export interface KBMOSensitivity {
  food: string
  iggLevel: number
  sensitivity: 'high' | 'moderate' | 'low'
  eliminationPeriod: string
  reintroductionNotes: string
}

export interface KBMAAnalysis {
  totalIggScore: number
  highSensitivityFoods: KBMOSensitivity[]
  moderateSensitivityFoods: KBMOSensitivity[]
  lowSensitivityFoods: KBMOSensitivity[]
  eliminationDietPlan: string[]
  reintroductionSchedule: string[]
  crossReactivityNotes: string[]
}

export interface DutchHormoneResult {
  hormone: string
  value: number
  unit: string
  referenceRange: string
  status: 'normal' | 'high' | 'low'
  clinicalSignificance: string
}

export interface DutchAnalysis {
  cortisolPattern: {
    am: DutchHormoneResult
    pm: DutchHormoneResult
    pattern: 'normal' | 'flat' | 'reversed' | 'elevated'
    interpretation: string
  }
  sexHormones: {
    testosterone: DutchHormoneResult
    estradiol: DutchHormoneResult
    progesterone: DutchHormoneResult
    dhea: DutchHormoneResult
  }
  organicAcids: DutchHormoneResult[]
  hormoneAnalysis: string
  recommendations: string[]
  followUpTests: string[]
}

export interface CGMAnalysis {
  averageGlucose: number
  glucoseVariability: number
  timeInRange: number
  hypoglycemicEvents: number
  postMealSpikes: number
  recommendations: string[]
  mealTiming: string[]
  lifestyleFactors: string[]
}

export interface FoodPhotoAnalysis {
  estimatedCalories: number
  macroBreakdown: {
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  foodItems: Array<{
    name: string
    quantity: string
    calories: number
  }>
  nutritionalQuality: 'excellent' | 'good' | 'fair' | 'poor'
  recommendations: string[]
}

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

class ClaudeClient {
  private client: Anthropic
  private static instance: ClaudeClient

  private constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    
    // Log environment info for debugging
    console.log('[CLAUDE] Environment:', process.env.NODE_ENV)
    console.log('[CLAUDE] API key available:', !!apiKey)
    
    if (apiKey) {
      console.log('[CLAUDE] API key length:', apiKey.length)
      console.log('[CLAUDE] API key format valid:', apiKey.startsWith('sk-ant-'))
      
      try {
        this.client = new Anthropic({ 
          apiKey,
          defaultHeaders: {
            'anthropic-version': '2023-06-01'
          }
        })
        console.log('[CLAUDE] Client initialized successfully')
      } catch (initError) {
        console.error('[CLAUDE] Failed to initialize Anthropic client:', initError)
        throw initError
      }
    } else {
      console.error('[CLAUDE] ANTHROPIC_API_KEY is not available in environment')
      console.log('[CLAUDE] Available env vars:', Object.keys(process.env).filter(k => k.includes('ANTHROPIC')))
      throw new Error('ANTHROPIC_API_KEY environment variable is required')
    }
  }

  static getInstance(): ClaudeClient {
    if (!ClaudeClient.instance) {
      console.log('[CLAUDE] getInstance called - creating new instance')
      ClaudeClient.instance = new ClaudeClient()
    }
    return ClaudeClient.instance
  }

  // Updated method to support both text and vision inputs
  private async analyzeWithClaude(
    prompt: string | Anthropic.MessageParam['content'], 
    systemPrompt: string
  ): Promise<string> {
    console.log('[CLAUDE] ===== Starting Claude API call =====')
    console.log('[CLAUDE] System prompt length:', systemPrompt.length)
    
    // Handle both text-only and multi-modal inputs
    const isTextOnly = typeof prompt === 'string'
    if (isTextOnly) {
      console.log('[CLAUDE] User prompt length:', prompt.length)
      console.log('[CLAUDE] First 200 chars of prompt:', prompt.substring(0, 200))
    } else {
      console.log('[CLAUDE] Multi-modal prompt with', Array.isArray(prompt) ? prompt.length : 1, 'parts')
    }
    
    try {
      const requestPayload = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0,
        system: systemPrompt,
        messages: [{ 
          role: 'user' as const, 
          content: prompt 
        }]
      }
      
      console.log('[CLAUDE] Request payload:', {
        model: requestPayload.model,
        max_tokens: requestPayload.max_tokens,
        temperature: requestPayload.temperature,
        systemPromptLength: systemPrompt.length,
        contentType: isTextOnly ? 'text' : 'multi-modal'
      })
      
      console.log('[CLAUDE] Sending request to Anthropic API...')
      const startTime = Date.now()
      
      const message = await this.client.messages.create(requestPayload)
      
      const endTime = Date.now()
      console.log('[CLAUDE] API call successful! Response time:', endTime - startTime, 'ms')
      console.log('[CLAUDE] Response details:', {
        id: message.id,
        model: message.model,
        role: message.role,
        usage: message.usage,
        stop_reason: message.stop_reason
      })
      
      if (message.content && message.content.length > 0 && message.content[0].type === 'text') {
        const responseText = message.content[0].text
        console.log('[CLAUDE] Response text length:', responseText.length)
        console.log('[CLAUDE] First 200 chars of response:', responseText.substring(0, 200))
        return responseText
      } else {
        console.error('[CLAUDE] Unexpected response format:', message)
        throw new Error('Received empty or invalid response from Claude')
      }
      
    } catch (error) {
      console.error('[CLAUDE] ===== API ERROR OCCURRED =====')
      console.error('[CLAUDE] Error type:', error?.constructor?.name)
      console.error('[CLAUDE] Error details:', error)
      
      // Provide detailed error information
      if (error instanceof Anthropic.APIError) {
        console.error('[CLAUDE] Anthropic API Error Details:', {
          status: error.status,
          headers: error.headers,
          error: error.error,
          message: error.message
        })
        
        // Log the raw error response if available
        if (error.error) {
          console.error('[CLAUDE] Raw error response:', JSON.stringify(error.error, null, 2))
        }
        
        // Handle specific error types
        if (error.status === 401) {
          throw new Error('AI analysis failed: Invalid API key. Please check your ANTHROPIC_API_KEY environment variable.')
        } else if (error.status === 400) {
          // Extract more specific error message from the response
          const errorMessage = (error.error as any)?.error?.message || error.message || 'Bad request'
          throw new Error(`AI analysis failed: Invalid request - ${errorMessage}`)
        } else if (error.status === 429) {
          throw new Error('AI analysis failed: Rate limit exceeded. Please try again in a few moments.')
        } else if (error.status === 500 || error.status === 502 || error.status === 503) {
          throw new Error(`AI analysis failed: Claude API service error (${error.status}). Please try again.`)
        } else {
          throw new Error(`AI analysis failed: ${error.message} (Status: ${error.status})`)
        }
      } else if (error instanceof Error) {
        console.error('[CLAUDE] JavaScript Error:', {
          message: error.message,
          stack: error.stack
        })
        
        // Network errors or other issues
        if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
          throw new Error('AI analysis failed: Unable to connect to Claude API. Please check your internet connection.')
        } else if (error.message.includes('timeout')) {
          throw new Error('AI analysis failed: Request timed out. The document may be too large or complex.')
        } else if (error.message.includes('fetch failed')) {
          throw new Error('AI analysis failed: Network error. Please check your internet connection.')
        } else {
          throw new Error(`AI analysis failed: ${error.message}`)
        }
      } else {
        console.error('[CLAUDE] Unknown error type:', error)
        throw new Error('AI analysis failed: An unexpected error occurred while communicating with Claude API')
      }
    }
  }

  // New method to analyze images with Claude Vision
  async analyzeImageWithVision(
    imageBase64: string, 
    imageType: string,
    analysisPrompt: string,
    systemPrompt: string
  ): Promise<string> {
    console.log('[CLAUDE] Analyzing image with Vision API')
    console.log('[CLAUDE] Image type:', imageType)
    console.log('[CLAUDE] Image size (base64):', imageBase64.length, 'chars')
    
    // Construct multi-modal message content
    const content: Anthropic.MessageParam['content'] = [
      {
        type: 'text',
        text: analysisPrompt
      },
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageType as any, // e.g., 'image/png', 'image/jpeg'
          data: imageBase64
        }
      }
    ]
    
    return await this.analyzeWithClaude(content, systemPrompt)
  }

  // Flexible vision analysis method that accepts multiple images or mixed content
  async analyzeWithVision(
    textPrompt: string,
    images: Array<{
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
        data: string
      }
    }>,
    systemPrompt: string
  ): Promise<string> {
    console.log('[CLAUDE] Analyzing with Vision API - flexible method')
    console.log('[CLAUDE] Number of images:', images.length)
    
    // Construct multi-modal message content
    const content: Anthropic.MessageParam['content'] = [
      {
        type: 'text',
        text: textPrompt
      },
      ...images
    ]
    
    return await this.analyzeWithClaude(content, systemPrompt)
  }

  // New method specifically for analyzing documents (PDFs)
  async analyzeWithDocument(
    textPrompt: string,
    document: {
      type: 'document',
      source: {
        type: 'base64',
        media_type: string,
        data: string
      }
    },
    systemPrompt: string
  ): Promise<string> {
    console.log('[CLAUDE] Analyzing with Document API')
    console.log('[CLAUDE] Document type:', document.source.media_type)
    
    // Construct multi-modal message content with document
    const content: Anthropic.MessageParam['content'] = [
      {
        type: 'text',
        text: textPrompt
      },
      document as any  // Cast to any to handle TypeScript type issues
    ]
    
    return await this.analyzeWithClaude(content, systemPrompt)
  }

  // New method for analyzing PDF pages as images
  async analyzePDFPagesAsImages(
    pageImages: Array<{ base64: string; pageNumber: number }>,
    systemPrompt: string,
    textExtract?: string
  ): Promise<string> {
    console.log('[CLAUDE] Analyzing', pageImages.length, 'PDF pages as images')
    
    // Build the content array with text instructions and all page images
    const content: Anthropic.MessageParam['content'] = []
    
    // Add initial instruction
    content.push({
      type: 'text',
      text: `Please analyze these PDF pages and extract all relevant information. ${textExtract ? `For context, here's what text extraction found (may be incomplete): ${textExtract.substring(0, 1000)}` : 'The PDF appears to be image-based or contains charts/graphs.'}`
    })
    
    // Add each page image
    for (const { base64, pageNumber } of pageImages) {
      content.push({
        type: 'text',
        text: `Page ${pageNumber}:`
      })
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: base64
        }
      })
    }
    
    // Add final instruction
    content.push({
      type: 'text',
      text: 'Please extract all text, data from charts/graphs, tables, and any other relevant information from these pages.'
    })
    
    return await this.analyzeWithClaude(content, systemPrompt)
  }

  async detectReportType(pdfText: string): Promise<'nutriq' | 'kbmo' | 'dutch' | 'cgm' | 'food_photo' | 'fit_test' | 'stool_test' | 'blood_test' | 'urine_test' | 'saliva_test' | 'lab_report'> {
    console.log('[CLAUDE] Detecting report type from text length:', pdfText.length)
    
    const systemPrompt = `You are an expert at identifying different types of lab reports and medical documents. 
    Analyze the provided text and determine which type of report it is. Return only one of these exact values:
    - nutriq (for NutriQ/NAQ assessments, nutritional questionnaires, symptom assessments)
    - kbmo (for KBMO food intolerance tests)
    - dutch (for Dutch hormone tests)
    - cgm (for Continuous Glucose Monitor data)
    - food_photo (for food photos)
    - fit_test (for FIT/Fecal Immunochemical Tests, colon cancer screening)
    - stool_test (for comprehensive stool analysis, microbiome testing)
    - blood_test (for blood laboratory tests, CBC, metabolic panels)
    - urine_test (for urinalysis, urine laboratory tests)
    - saliva_test (for saliva hormone tests)
    - lab_report (for general laboratory reports)
    
    CRITICAL RULES:
    1. If you see "NAQ", "Nutritional Assessment Questionnaire", "Symptom Burden", "Questions and Answers", or similar terms - ALWAYS return 'nutriq'
    2. Dutch tests specifically mention "Dutch Test", "DUTCH", "hormone", "cortisol", "estrogen", "testosterone" in the context of urine/saliva testing
    3. KBMO tests mention "KBMO", "food sensitivity", "IgG", "food intolerance"
    4. FIT tests mention "FIT", "Fecal Immunochemical", "FOBT", "colon cancer screening", "fecal occult blood"
    5. Stool tests mention "stool", "fecal", "microbiome", "parasite", "bacteria"
    6. Blood tests mention "CBC", "complete blood count", "metabolic panel", "lipid panel", "glucose", "cholesterol"
    7. Urine tests mention "urinalysis", "urine", "protein", "ketones", "specific gravity"
    8. Saliva tests mention "saliva", "cortisol", "melatonin", "hormone saliva"
    9. When in doubt between nutriq and dutch, prefer 'nutriq' unless it's clearly a hormone test
    10. When in doubt, prefer the most specific type over 'lab_report'
    
    Look for specific keywords, formatting, and content patterns that identify each type.`

    const prompt = `Please analyze this lab report text and tell me what type of report it is:

${pdfText.substring(0, 2000)}...`

    try {
      const result = await this.analyzeWithClaude(prompt, systemPrompt)
      const detectedType = result?.toLowerCase().trim() as any
      
      console.log('[CLAUDE] Detected report type:', detectedType)
      
      const validTypes = ['nutriq', 'kbmo', 'dutch', 'cgm', 'food_photo', 'fit_test', 'stool_test', 'blood_test', 'urine_test', 'saliva_test', 'lab_report']
      if (validTypes.includes(detectedType)) {
        return detectedType
      }
      
      console.warn('[CLAUDE] Unknown report type detected:', detectedType, '- defaulting to lab_report')
      // Default to lab_report if unclear
      return 'lab_report'
    } catch (error) {
      console.error('[CLAUDE] Failed to detect report type:', error)
      throw new Error(`Failed to detect report type: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async analyzeNutriQ(pdfText: string): Promise<NutriQAnalysis> {
    const systemPrompt = `You are an expert nutritionist analyzing NutriQ/NAQ assessment results. 
    This may be a questionnaire with answers, a symptom burden graph, or other NutriQ assessment data.
    Extract whatever data is available and provide analysis based on what you find.
    
    CRITICAL: You MUST return ONLY valid JSON. Do not include any text before or after the JSON object.
    Do not include explanations, apologies, or any other text - just the JSON object.
    
    Return your analysis as a JSON object with this exact structure:
    {
      "totalScore": number,
      "bodySystems": {
        "energy": {"score": number, "issues": [string], "recommendations": [string]},
        "mood": {"score": number, "issues": [string], "recommendations": [string]},
        "sleep": {"score": number, "issues": [string], "recommendations": [string]},
        "stress": {"score": number, "issues": [string], "recommendations": [string]},
        "digestion": {"score": number, "issues": [string], "recommendations": [string]},
        "immunity": {"score": number, "issues": [string], "recommendations": [string]}
      },
      "overallRecommendations": [string],
      "priorityActions": [string],
      "followUpTests": [string]
    }
    
    If specific scores aren't available, estimate based on the content. Scores should be 0-100. 
    For symptom burden graphs, analyze the visual patterns described. For questionnaires, analyze the answers.
    Be thorough in your analysis and provide actionable recommendations.
    
    REMEMBER: Return ONLY the JSON object, nothing else.`

    const prompt = `Analyze this NutriQ assessment and return ONLY a JSON object with the analysis:

${pdfText}

Return ONLY the JSON object with the analysis structure specified above. Do not include any other text.`

    const result = await this.analyzeWithClaude(prompt, systemPrompt)
    
    console.log('[CLAUDE] Raw NutriQ analysis result:', result.substring(0, 500))
    
    try {
      const analysis = JSON.parse(result)
      return analysis as NutriQAnalysis
    } catch (error) {
      console.error('[CLAUDE] JSON parse error:', error)
      console.error('[CLAUDE] Raw result that failed to parse:', result)
      throw new Error(`Failed to parse NutriQ analysis: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  /**
   * Analyze NutriQ assessment with specific client context
   * This ensures the analysis is associated with the correct client from the PDF
   */
  async analyzeNutriQWithClientContext(pdfText: string, clientName: string): Promise<NutriQAnalysis> {
    const systemPrompt = `You are an expert nutritionist analyzing NutriQ/NAQ assessment results. 
    Extract structured data about body system scores and provide detailed recommendations.
    
    IMPORTANT: This assessment is for client "${clientName}". Use this client name in your analysis.
    
    Return your analysis as a JSON object with this exact structure:
    {
      "totalScore": number,
      "bodySystems": {
        "energy": {"score": number, "issues": [string], "recommendations": [string]},
        "mood": {"score": number, "issues": [string], "recommendations": [string]},
        "sleep": {"score": number, "issues": [string], "recommendations": [string]},
        "stress": {"score": number, "issues": [string], "recommendations": [string]},
        "digestion": {"score": number, "issues": [string], "recommendations": [string]},
        "immunity": {"score": number, "issues": [string], "recommendations": [string]}
      },
      "overallRecommendations": [string],
      "priorityActions": [string],
      "followUpTests": [string]
    }
    
    Scores should be 0-100. Be thorough in your analysis and provide actionable recommendations for ${clientName}.`

    const prompt = `Please analyze this NutriQ assessment for client "${clientName}" and extract all relevant data:

${pdfText}

IMPORTANT: This assessment belongs to ${clientName}. Ensure all recommendations and analysis are personalized for this specific client.`

    const result = await this.analyzeWithClaude(prompt, systemPrompt)
    
    try {
      const analysis = JSON.parse(result)
      return analysis as NutriQAnalysis
    } catch (error) {
      throw new Error(`Failed to parse NutriQ analysis: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  async analyzeKBMO(pdfText: string): Promise<KBMAAnalysis> {
    const systemPrompt = `You are an expert analyzing KBMO food intolerance test results. 
    Extract IgG levels for different foods and categorize them by sensitivity level.
    
    Return your analysis as a JSON object with this exact structure:
    {
      "totalIggScore": number,
      "highSensitivityFoods": [{"food": string, "iggLevel": number, "sensitivity": "high", "eliminationPeriod": string, "reintroductionNotes": string}],
      "moderateSensitivityFoods": [{"food": string, "iggLevel": number, "sensitivity": "moderate", "eliminationPeriod": string, "reintroductionNotes": string}],
      "lowSensitivityFoods": [{"food": string, "iggLevel": number, "sensitivity": "low", "eliminationPeriod": string, "reintroductionNotes": string}],
      "eliminationDietPlan": [string],
      "reintroductionSchedule": [string],
      "crossReactivityNotes": [string]
    }
    
    IgG levels typically range from 0-100+. Categorize as: high (>50), moderate (25-50), low (<25).`

    const prompt = `Please analyze this KBMO food intolerance test and extract all relevant data:

${pdfText}`

    const result = await this.analyzeWithClaude(prompt, systemPrompt)
    
    try {
      const analysis = JSON.parse(result)
      return analysis as KBMAAnalysis
    } catch (error) {
      throw new Error(`Failed to parse KBMO analysis: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  async analyzeDutch(pdfText: string): Promise<DutchAnalysis> {
    const systemPrompt = `You are an expert analyzing Dutch hormone test results. 
    Extract hormone levels, interpret patterns, and provide clinical recommendations.
    
    Return your analysis as a JSON object with this exact structure:
    {
      "cortisolPattern": {
        "am": {"hormone": "cortisol_am", "value": number, "unit": string, "referenceRange": string, "status": "normal|high|low", "clinicalSignificance": string},
        "pm": {"hormone": "cortisol_pm", "value": number, "unit": string, "referenceRange": string, "status": "normal|high|low", "clinicalSignificance": string},
        "pattern": "normal|flat|reversed|elevated",
        "interpretation": string
      },
      "sexHormones": {
        "testosterone": {"hormone": "testosterone", "value": number, "unit": string, "referenceRange": string, "status": "normal|high|low", "clinicalSignificance": string},
        "estradiol": {"hormone": "estradiol", "value": number, "unit": string, "referenceRange": string, "status": "normal|high|low", "clinicalSignificance": string},
        "progesterone": {"hormone": "progesterone", "value": number, "unit": string, "referenceRange": string, "status": "normal|high|low", "clinicalSignificance": string},
        "dhea": {"hormone": "dhea", "value": number, "unit": string, "referenceRange": string, "status": "normal|high|low", "clinicalSignificance": string}
      },
      "organicAcids": [{"hormone": string, "value": number, "unit": string, "referenceRange": string, "status": "normal|high|low", "clinicalSignificance": string}],
      "hormoneAnalysis": string,
      "recommendations": [string],
      "followUpTests": [string]
    }`

    const prompt = `Please analyze this Dutch hormone test and extract all relevant data:

${pdfText}`

    const result = await this.analyzeWithClaude(prompt, systemPrompt)
    
    try {
      const analysis = JSON.parse(result)
      return analysis as DutchAnalysis
    } catch (error) {
      throw new Error(`Failed to parse Dutch analysis: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  async analyzeCGM(pdfText: string): Promise<CGMAnalysis> {
    const systemPrompt = `You are an expert analyzing Continuous Glucose Monitor (CGM) data. 
    Extract glucose patterns, variability metrics, and provide lifestyle recommendations.
    
    Return your analysis as a JSON object with this exact structure:
    {
      "averageGlucose": number,
      "glucoseVariability": number,
      "timeInRange": number,
      "hypoglycemicEvents": number,
      "postMealSpikes": number,
      "recommendations": [string],
      "mealTiming": [string],
      "lifestyleFactors": [string]
    }
    
    Time in range should be percentage (0-100). Glucose values in mg/dL.`

    const prompt = `Please analyze this CGM data and extract all relevant metrics:

${pdfText}`

    const result = await this.analyzeWithClaude(prompt, systemPrompt)
    
    try {
      const analysis = JSON.parse(result)
      return analysis as CGMAnalysis
    } catch (error) {
      throw new Error(`Failed to parse CGM analysis: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  async analyzeFoodPhoto(imageDescription: string): Promise<FoodPhotoAnalysis> {
    const systemPrompt = `You are an expert nutritionist analyzing food photos. 
    Estimate nutritional content and provide recommendations based on the food description.
    
    Return your analysis as a JSON object with this exact structure:
    {
      "estimatedCalories": number,
      "macroBreakdown": {"protein": number, "carbs": number, "fat": number, "fiber": number},
      "foodItems": [{"name": string, "quantity": string, "calories": number}],
      "nutritionalQuality": "excellent|good|fair|poor",
      "recommendations": [string]
    }
    
    Provide realistic estimates based on typical portion sizes and food composition.`

    const prompt = `Please analyze this food photo and provide nutritional analysis:

${imageDescription}`

    const result = await this.analyzeWithClaude(prompt, systemPrompt)
    
    try {
      const analysis = JSON.parse(result)
      return analysis as FoodPhotoAnalysis
    } catch (error) {
      throw new Error(`Failed to parse food photo analysis: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  async analyzeFITTest(pdfText: string): Promise<FITTestResult> {
    const systemPrompt = `You are an expert gastroenterologist analyzing FIT (Fecal Immunochemical Test) results. 
    Extract all relevant information and provide clinical interpretation.

    Return ONLY a JSON object with this exact structure:
    {
      "testType": "FIT" | "FOBT" | "Fecal Immunochemical",
      "result": "positive" | "negative" | "inconclusive",
      "hemoglobinLevel": number or null,
      "unit": "ng/mL" or "μg/g" or null,
      "referenceRange": "string or null,
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

    const result = await this.analyzeWithClaude(prompt, systemPrompt)
    
    console.log('[CLAUDE] Raw FIT test analysis result:', result.substring(0, 500))
    
    try {
      const analysis = JSON.parse(result)
      return analysis as FITTestResult
    } catch (error) {
      console.error('[CLAUDE] JSON parse error:', error)
      console.error('[CLAUDE] Raw result that failed to parse:', result)
      throw new Error(`Failed to parse FIT test analysis: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  public async analyzePractitionerReport(prompt: string, systemPrompt: string): Promise<string> {
    return this.analyzeWithClaude(prompt, systemPrompt)
  }
}

export default ClaudeClient 