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

class ClaudeClient {
  private client: Anthropic
  private static instance: ClaudeClient

  private constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required')
    }
    this.client = new Anthropic({ apiKey })
  }

  static getInstance(): ClaudeClient {
    if (!ClaudeClient.instance) {
      ClaudeClient.instance = new ClaudeClient()
    }
    return ClaudeClient.instance
  }

  private async analyzeWithClaude(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })

      return message.content[0].type === 'text' ? message.content[0].text : ''
    } catch (error) {
      console.error('Claude API error:', error)
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async detectReportType(pdfText: string): Promise<'nutriq' | 'kbmo' | 'dutch' | 'cgm' | 'food_photo'> {
    const systemPrompt = `You are an expert at identifying different types of lab reports and medical documents. 
    Analyze the provided text and determine which type of report it is. Return only one of these exact values:
    - nutriq (for NutriQ/NAQ assessments)
    - kbmo (for KBMO food intolerance tests)
    - dutch (for Dutch hormone tests)
    - cgm (for Continuous Glucose Monitor data)
    - food_photo (for food photos)
    
    Look for specific keywords, formatting, and content patterns that identify each type.`

    const prompt = `Please analyze this lab report text and tell me what type of report it is:

${pdfText.substring(0, 2000)}...`

    const result = await this.analyzeWithClaude(prompt, systemPrompt)
    const detectedType = result.toLowerCase().trim() as any
    
    if (['nutriq', 'kbmo', 'dutch', 'cgm', 'food_photo'].includes(detectedType)) {
      return detectedType
    }
    
    // Default to nutriq if unclear
    return 'nutriq'
  }

  async analyzeNutriQ(pdfText: string): Promise<NutriQAnalysis> {
    const systemPrompt = `You are an expert nutritionist analyzing NutriQ/NAQ assessment results. 
    Extract structured data about body system scores and provide detailed recommendations.
    
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
    
    Scores should be 0-100. Be thorough in your analysis and provide actionable recommendations.`

    const prompt = `Please analyze this NutriQ assessment and extract all relevant data:

${pdfText}`

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
}

export default ClaudeClient 