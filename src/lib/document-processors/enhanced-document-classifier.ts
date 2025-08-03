import ClaudeClient from '../claude-client'

export type DocumentType = 
  | 'nutriq' 
  | 'kbmo' 
  | 'dutch' 
  | 'cgm' 
  | 'food_photo'
  | 'fit_test'
  | 'stool_test'
  | 'blood_test'
  | 'urine_test'
  | 'saliva_test'
  | 'hair_test'
  | 'lab_report'
  | 'medical_report'
  | 'prescription'
  | 'imaging'
  | 'unknown'

export interface DocumentClassification {
  type: DocumentType
  confidence: number
  keywords: string[]
  description: string
  processingInstructions: string[]
}

export interface DocumentMetadata {
  title?: string
  date?: string
  patientName?: string
  provider?: string
  testType?: string
  labName?: string
}

export class EnhancedDocumentClassifier {
  private static instance: EnhancedDocumentClassifier
  private claudeClient: ClaudeClient

  private constructor() {
    this.claudeClient = ClaudeClient.getInstance()
  }

  static getInstance(): EnhancedDocumentClassifier {
    if (!EnhancedDocumentClassifier.instance) {
      EnhancedDocumentClassifier.instance = new EnhancedDocumentClassifier()
    }
    return EnhancedDocumentClassifier.instance
  }

  async classifyDocument(documentText: string, documentName?: string): Promise<DocumentClassification> {
    console.log('[CLASSIFIER] Starting document classification...')
    console.log('[CLASSIFIER] Document name:', documentName)
    console.log('[CLASSIFIER] Text length:', documentText.length)

    try {
      // First, try keyword-based classification for speed
      const keywordClassification = this.classifyByKeywords(documentText, documentName)
      if (keywordClassification.confidence > 0.8) {
        console.log('[CLASSIFIER] High-confidence keyword classification:', keywordClassification.type)
        return keywordClassification
      }

      // If keyword classification is uncertain, use AI
      console.log('[CLASSIFIER] Using AI for classification...')
      return await this.classifyWithAI(documentText, documentName)
    } catch (error) {
      console.error('[CLASSIFIER] Classification failed:', error)
      return this.getDefaultClassification()
    }
  }

  private classifyByKeywords(documentText: string, documentName?: string): DocumentClassification {
    const text = (documentText + ' ' + (documentName || '')).toLowerCase()
    
    // FIT Test detection
    if (this.containsKeywords(text, ['fit test', 'fecal immunochemical', 'fecal occult blood', 'colon cancer screening', 'stool occult blood'])) {
      return {
        type: 'fit_test',
        confidence: 0.95,
        keywords: ['fit test', 'fecal immunochemical', 'colon cancer'],
        description: 'FIT (Fecal Immunochemical Test) for colon cancer screening',
        processingInstructions: ['Extract test results', 'Check for positive/negative', 'Note any abnormal findings']
      }
    }

    // Stool Test detection
    if (this.containsKeywords(text, ['stool test', 'fecal test', 'parasite', 'bacteria', 'microbiome', 'gut health'])) {
      return {
        type: 'stool_test',
        confidence: 0.9,
        keywords: ['stool', 'fecal', 'microbiome', 'gut'],
        description: 'Comprehensive stool analysis',
        processingInstructions: ['Extract microbiome data', 'Check for pathogens', 'Analyze gut health markers']
      }
    }

    // NutriQ detection
    if (this.containsKeywords(text, ['naq', 'nutritional assessment questionnaire', 'symptom burden', 'questions and answers'])) {
      return {
        type: 'nutriq',
        confidence: 0.95,
        keywords: ['naq', 'nutritional assessment', 'symptom burden'],
        description: 'NutriQ Nutritional Assessment Questionnaire',
        processingInstructions: ['Extract symptom scores', 'Analyze body systems', 'Generate recommendations']
      }
    }

    // KBMO detection
    if (this.containsKeywords(text, ['kbmo', 'food sensitivity', 'igg', 'food intolerance'])) {
      return {
        type: 'kbmo',
        confidence: 0.9,
        keywords: ['kbmo', 'food sensitivity', 'igg'],
        description: 'KBMO Food Sensitivity Test',
        processingInstructions: ['Extract IgG levels', 'Identify food sensitivities', 'Create elimination plan']
      }
    }

    // Dutch Test detection
    if (this.containsKeywords(text, ['dutch test', 'dutch', 'hormone', 'cortisol', 'estrogen', 'testosterone', 'urine hormone'])) {
      return {
        type: 'dutch',
        confidence: 0.9,
        keywords: ['dutch', 'hormone', 'cortisol', 'estrogen'],
        description: 'DUTCH Hormone Test',
        processingInstructions: ['Extract hormone levels', 'Analyze cortisol pattern', 'Assess sex hormones']
      }
    }

    // Blood Test detection
    if (this.containsKeywords(text, ['cbc', 'complete blood count', 'metabolic panel', 'lipid panel', 'glucose', 'cholesterol'])) {
      return {
        type: 'blood_test',
        confidence: 0.85,
        keywords: ['blood', 'cbc', 'metabolic', 'lipid'],
        description: 'Blood laboratory test',
        processingInstructions: ['Extract lab values', 'Compare to reference ranges', 'Identify abnormalities']
      }
    }

    // Urine Test detection
    if (this.containsKeywords(text, ['urinalysis', 'urine test', 'protein', 'ketones', 'specific gravity'])) {
      return {
        type: 'urine_test',
        confidence: 0.85,
        keywords: ['urine', 'urinalysis', 'protein', 'ketones'],
        description: 'Urine laboratory test',
        processingInstructions: ['Extract urine values', 'Check for abnormalities', 'Assess kidney function']
      }
    }

    // Saliva Test detection
    if (this.containsKeywords(text, ['saliva', 'cortisol', 'melatonin', 'hormone saliva'])) {
      return {
        type: 'saliva_test',
        confidence: 0.8,
        keywords: ['saliva', 'cortisol', 'melatonin'],
        description: 'Saliva hormone test',
        processingInstructions: ['Extract hormone levels', 'Analyze diurnal patterns', 'Assess stress response']
      }
    }

    // CGM detection
    if (this.containsKeywords(text, ['continuous glucose', 'cgm', 'glucose monitor', 'time in range'])) {
      return {
        type: 'cgm',
        confidence: 0.9,
        keywords: ['cgm', 'continuous glucose', 'time in range'],
        description: 'Continuous Glucose Monitor data',
        processingInstructions: ['Extract glucose patterns', 'Analyze time in range', 'Identify trends']
      }
    }

    // Food Photo detection
    if (this.containsKeywords(text, ['food photo', 'meal photo', 'food image', 'nutrition photo'])) {
      return {
        type: 'food_photo',
        confidence: 0.8,
        keywords: ['food', 'photo', 'meal', 'nutrition'],
        description: 'Food/meal photograph',
        processingInstructions: ['Analyze food items', 'Estimate nutrition', 'Provide recommendations']
      }
    }

    // Low confidence - needs AI analysis
    return {
      type: 'unknown',
      confidence: 0.3,
      keywords: [],
      description: 'Unknown document type - requires AI analysis',
      processingInstructions: ['Use AI classification', 'Extract available data', 'Provide general analysis']
    }
  }

  private async classifyWithAI(documentText: string, documentName?: string): Promise<DocumentClassification> {
    const systemPrompt = `You are an expert medical document classifier. Analyze the provided document and determine its type.

Available document types:
- nutriq: NutriQ/NAQ assessments, nutritional questionnaires, symptom assessments
- kbmo: KBMO food intolerance tests, IgG food sensitivity tests
- dutch: DUTCH hormone tests, cortisol patterns, sex hormone analysis
- cgm: Continuous Glucose Monitor data, glucose patterns
- food_photo: Food photos, meal images, nutrition photos
- fit_test: FIT (Fecal Immunochemical Test), colon cancer screening
- stool_test: Comprehensive stool analysis, microbiome testing, parasite testing
- blood_test: Blood laboratory tests, CBC, metabolic panels, lipid panels
- urine_test: Urinalysis, urine laboratory tests
- saliva_test: Saliva hormone tests, cortisol saliva testing
- hair_test: Hair analysis, mineral testing, toxin testing
- lab_report: General laboratory reports
- medical_report: Medical reports, clinical notes
- prescription: Prescriptions, medication lists
- imaging: X-rays, MRIs, CT scans, ultrasounds
- unknown: Unknown or unclear document type

Return ONLY a JSON object with this exact structure:
{
  "type": "document_type",
  "confidence": 0.95,
  "keywords": ["keyword1", "keyword2"],
  "description": "Brief description of the document type",
  "processingInstructions": ["instruction1", "instruction2"]
}

Confidence should be 0.0-1.0. Be specific and accurate.`

    const prompt = `Classify this document:

Document Name: ${documentName || 'Unknown'}

Document Content:
${documentText.substring(0, 3000)}

Return ONLY the JSON classification object.`

    try {
      const result = await this.claudeClient.analyzeWithClaude(prompt, systemPrompt)
      const classification = JSON.parse(result) as DocumentClassification
      
      console.log('[CLASSIFIER] AI classification result:', classification)
      return classification
    } catch (error) {
      console.error('[CLASSIFIER] AI classification failed:', error)
      return this.getDefaultClassification()
    }
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()))
  }

  private getDefaultClassification(): DocumentClassification {
    return {
      type: 'unknown',
      confidence: 0.1,
      keywords: [],
      description: 'Unable to classify document',
      processingInstructions: ['Manual review required', 'Extract available data']
    }
  }

  async extractMetadata(documentText: string, documentName?: string): Promise<DocumentMetadata> {
    const systemPrompt = `Extract key metadata from this medical document. Return ONLY a JSON object with this structure:
{
  "title": "Document title if found",
  "date": "Date if found (YYYY-MM-DD format)",
  "patientName": "Patient name if found",
  "provider": "Provider/lab name if found",
  "testType": "Specific test type if found",
  "labName": "Laboratory name if found"
}

If any field is not found, use null. Be accurate and extract only what's clearly stated.`

    const prompt = `Extract metadata from this document:

Document Name: ${documentName || 'Unknown'}

Document Content:
${documentText.substring(0, 2000)}

Return ONLY the JSON metadata object.`

    try {
      const result = await this.claudeClient.analyzeWithClaude(prompt, systemPrompt)
      return JSON.parse(result) as DocumentMetadata
    } catch (error) {
      console.error('[CLASSIFIER] Metadata extraction failed:', error)
      return {}
    }
  }
} 