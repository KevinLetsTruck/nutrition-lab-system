import { OCRService } from './ocr-service'
import { getAIServiceManager } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

interface ProcessingResult {
  success: boolean
  extractedData?: any
  enhancedData?: any
  error?: string
  confidence?: number
}

export class DocumentProcessor {
  private ocrService: OCRService
  private aiManager = getAIServiceManager()
  
  constructor() {
    this.ocrService = OCRService.getInstance()
  }

  async processLabDocument(
    labResultId: string,
    fileUrl: string,
    fileType: string
  ): Promise<ProcessingResult> {
    try {
      // Update status to processing
      await prisma.labResult.update({
        where: { id: labResultId },
        data: { processingStatus: 'processing' }
      })

      // Step 1: Download file from storage
      const fileBuffer = await this.downloadFile(fileUrl)
      
      // Step 2: Extract text using OCR
      console.log('🔍 Starting OCR extraction...')
      const ocrResult = await this.ocrService.processFile(fileBuffer, fileType)
      
      if (ocrResult.error) {
        throw new Error(`OCR failed: ${ocrResult.error}`)
      }

      // Step 3: Get lab test catalog for mapping
      const labTests = await prisma.labTestCatalog.findMany()
      
      // Step 4: Enhance with Claude if we have structured data
      let enhancedData = ocrResult.structuredData
      if (ocrResult.structuredData && ocrResult.structuredData.markers?.length > 0) {
        console.log('🤖 Enhancing with Claude AI...')
        enhancedData = await this.enhanceWithClaude(
          ocrResult.structuredData,
          ocrResult.text,
          labTests
        )
      }

      // Step 5: Create lab value records
      const labResult = await prisma.labResult.findUnique({
        where: { id: labResultId },
        include: { client: true }
      })

      if (!labResult) {
        throw new Error('Lab result not found')
      }

      // Create individual lab values
      if (enhancedData.markers) {
        for (const marker of enhancedData.markers) {
          // Find matching test in catalog
          const catalogTest = labTests.find(t => 
            this.fuzzyMatchTestName(t.testName, marker.testName)
          )

          if (catalogTest && typeof marker.value === 'number') {
            const isOptimal = marker.value >= (catalogTest.optimalRangeLow || 0) && 
                            marker.value <= (catalogTest.optimalRangeHigh || 999)
            const isTruckDriverOptimal = marker.value >= (catalogTest.truckDriverRangeLow || 0) && 
                                       marker.value <= (catalogTest.truckDriverRangeHigh || 999)

            await prisma.labValue.create({
              data: {
                labResultId,
                testCatalogId: catalogTest.id,
                testName: marker.testName,
                value: marker.value,
                unit: marker.unit,
                referenceRange: marker.reference,
                isOptimal,
                isTruckDriverOptimal,
                flag: marker.flag,
                interpretation: marker.interpretation
              }
            })
          }
        }
      }

      // Step 6: Detect patterns
      const patterns = await this.detectPatterns(enhancedData, labTests)
      
      // Create pattern records
      for (const pattern of patterns) {
        await prisma.labPattern.create({
          data: {
            labResultId,
            ...pattern
          }
        })
      }

      // Step 7: Generate protocols
      const protocols = await this.generateProtocols(
        labResult.client,
        enhancedData,
        patterns
      )

      // Create protocol records
      for (const protocol of protocols) {
        await prisma.labProtocol.create({
          data: {
            labResultId,
            clientId: labResult.clientId,
            ...protocol
          }
        })
      }

      // Step 8: Update lab result with analysis
      await prisma.labResult.update({
        where: { id: labResultId },
        data: {
          processingStatus: 'completed',
          labName: enhancedData.labName || 'Unknown Lab',
          collectionDate: enhancedData.collectionDate ? 
            new Date(enhancedData.collectionDate) : new Date(),
          rawText: ocrResult.text,
          structuredData: enhancedData,
          aiAnalysis: enhancedData.aiAnalysis || {},
          detectedPatterns: patterns.map(p => p.patternName),
          confidenceScores: {
            ocr: ocrResult.confidence,
            extraction: enhancedData.extractionConfidence || 0.8,
            analysis: enhancedData.analysisConfidence || 0.9
          }
        }
      })

      return {
        success: true,
        extractedData: ocrResult.structuredData,
        enhancedData,
        confidence: ocrResult.confidence
      }

    } catch (error) {
      console.error('Document processing error:', error)
      
      // Update status to failed
      await prisma.labResult.update({
        where: { id: labResultId },
        data: {
          processingStatus: 'failed',
          processingError: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async downloadFile(fileUrl: string): Promise<Buffer> {
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  private async enhanceWithClaude(
    structuredData: any,
    rawText: string,
    labTests: any[]
  ): Promise<any> {
    const prompt = `You are analyzing lab results. Here's the extracted data:

Structured Data:
${JSON.stringify(structuredData, null, 2)}

Raw Text (first 2000 chars):
${rawText.substring(0, 2000)}

Available Lab Tests in our catalog:
${labTests.map(t => `- ${t.testName} (${t.testCode}): ${t.category}`).join('\n')}

Please:
1. Verify and correct any OCR errors in test names or values
2. Map extracted tests to our catalog test names where possible
3. Identify any missing important markers
4. Provide clinical interpretation
5. Note truck driver specific concerns
6. Generate a summary analysis

Return a JSON object with:
{
  "labName": "corrected lab name",
  "collectionDate": "YYYY-MM-DD",
  "markers": [
    {
      "testName": "standardized name from catalog",
      "value": numeric_value,
      "unit": "unit",
      "reference": "reference range",
      "flag": "H/L/HH/LL or null",
      "interpretation": "brief interpretation"
    }
  ],
  "missingImportantMarkers": ["list of important tests not included"],
  "aiAnalysis": {
    "summary": "overall summary",
    "keyFindings": ["key finding 1", "key finding 2"],
    "truckDriverConsiderations": ["consideration 1", "consideration 2"],
    "recommendations": {
      "immediate": ["immediate action 1"],
      "shortTerm": ["short term action 1"],
      "lifestyle": ["lifestyle change 1"]
    }
  },
  "extractionConfidence": 0.0-1.0,
  "analysisConfidence": 0.0-1.0
}`

    try {
      // Use the AI service manager
      const response = await this.aiManager.createCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are a medical lab analysis expert. Analyze the provided lab results and return structured JSON data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        maxTokens: 4096
      })
      
      const enhanced = JSON.parse(response.content)
      return {
        ...structuredData,
        ...enhanced
      }
    } catch (error) {
      console.error('Claude enhancement error:', error)
      // Return original data if enhancement fails
      return structuredData
    }
  }

  private fuzzyMatchTestName(catalogName: string, extractedName: string): boolean {
    // Normalize both names
    const normalize = (str: string) => str.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/hemoglobin/g, 'hb')
      .replace(/glucose/g, 'gluc')
      .replace(/cholesterol/g, 'chol')
      .replace(/triglycerides/g, 'trig')
    
    const catalogNorm = normalize(catalogName)
    const extractedNorm = normalize(extractedName)
    
    // Exact match
    if (catalogNorm === extractedNorm) return true
    
    // Contains match
    if (catalogNorm.includes(extractedNorm) || extractedNorm.includes(catalogNorm)) return true
    
    // Common variations
    const variations: Record<string, string[]> = {
      'glucose': ['gluc', 'bloodsugar', 'bs'],
      'hba1c': ['a1c', 'hemoglobina1c', 'glycatedhemoglobin'],
      'cholesterol': ['chol', 'totalchol'],
      'hdl': ['hdlchol', 'goodcholesterol'],
      'ldl': ['ldlchol', 'badcholesterol'],
      'triglycerides': ['trig', 'trigs'],
      'tsh': ['thyroidstimulatinghormone'],
      'vitamind': ['vitd', '25ohd', '25hydroxyvitamind']
    }
    
    for (const [key, values] of Object.entries(variations)) {
      if ((catalogNorm.includes(key) || values.some(v => catalogNorm.includes(v))) &&
          (extractedNorm.includes(key) || values.some(v => extractedNorm.includes(v)))) {
        return true
      }
    }
    
    return false
  }

  private async detectPatterns(data: any, labTests: any[]): Promise<any[]> {
    const patterns = []
    const markers = data.markers || []
    
    // Helper to find marker value
    const findMarkerValue = (names: string[]): number | null => {
      for (const name of names) {
        const marker = markers.find((m: any) => 
          this.fuzzyMatchTestName(name, m.testName)
        )
        if (marker && typeof marker.value === 'number') {
          return marker.value
        }
      }
      return null
    }

    // Insulin Resistance Pattern
    const glucose = findMarkerValue(['Glucose, Fasting', 'Glucose', 'Blood Sugar'])
    const insulin = findMarkerValue(['Insulin, Fasting', 'Insulin'])
    const hba1c = findMarkerValue(['Hemoglobin A1c', 'HbA1c', 'A1C'])
    const triglycerides = findMarkerValue(['Triglycerides', 'Trig'])
    
    if (glucose && glucose > 90 && triglycerides && triglycerides > 150) {
      patterns.push({
        patternName: 'insulin_resistance',
        patternCategory: 'metabolic',
        confidenceScore: 0.8,
        supportingMarkers: [
          { marker: 'Glucose', value: glucose },
          { marker: 'Triglycerides', value: triglycerides },
          ...(hba1c ? [{ marker: 'HbA1c', value: hba1c }] : [])
        ],
        clinicalSignificance: 'Early metabolic dysfunction indicating insulin resistance',
        truckDriverImpact: 'Increases fatigue, brain fog, and accident risk. Threatens DOT certification.',
        priorityLevel: 'high'
      })
    }

    // Thyroid Dysfunction Pattern
    const tsh = findMarkerValue(['TSH', 'Thyroid Stimulating Hormone'])
    const ft4 = findMarkerValue(['Free T4', 'FT4'])
    const ft3 = findMarkerValue(['Free T3', 'FT3'])
    
    if (tsh && (tsh > 2.5 || tsh < 0.5)) {
      patterns.push({
        patternName: tsh > 2.5 ? 'hypothyroid' : 'hyperthyroid',
        patternCategory: 'hormonal',
        confidenceScore: 0.9,
        supportingMarkers: [
          { marker: 'TSH', value: tsh },
          ...(ft4 ? [{ marker: 'Free T4', value: ft4 }] : []),
          ...(ft3 ? [{ marker: 'Free T3', value: ft3 }] : [])
        ],
        clinicalSignificance: tsh > 2.5 ? 
          'Underactive thyroid affecting metabolism' : 
          'Overactive thyroid requiring evaluation',
        truckDriverImpact: tsh > 2.5 ?
          'Causes severe fatigue, weight gain, slow reflexes' :
          'May cause anxiety, tremors affecting driving safety',
        priorityLevel: 'immediate'
      })
    }

    // Inflammation Pattern
    const crp = findMarkerValue(['hs-CRP', 'CRP', 'C-Reactive Protein'])
    const homocysteine = findMarkerValue(['Homocysteine', 'Hcy'])
    const ferritin = findMarkerValue(['Ferritin'])
    
    if ((crp && crp > 1.0) || (homocysteine && homocysteine > 10)) {
      patterns.push({
        patternName: 'inflammation',
        patternCategory: 'inflammatory',
        confidenceScore: 0.85,
        supportingMarkers: [
          ...(crp ? [{ marker: 'CRP', value: crp }] : []),
          ...(homocysteine ? [{ marker: 'Homocysteine', value: homocysteine }] : []),
          ...(ferritin && ferritin > 200 ? [{ marker: 'Ferritin', value: ferritin }] : [])
        ],
        clinicalSignificance: 'Systemic inflammation increasing disease risk',
        truckDriverImpact: 'Linked to poor diet, sedentary lifestyle. Increases all chronic disease risks.',
        priorityLevel: 'high'
      })
    }

    // Nutritional Deficiency Pattern
    const vitD = findMarkerValue(['Vitamin D', '25-OH Vitamin D', '25(OH)D'])
    const b12 = findMarkerValue(['Vitamin B12', 'B12', 'Cobalamin'])
    const magnesium = findMarkerValue(['Magnesium', 'Mag', 'RBC Magnesium'])
    
    const deficiencies = []
    if (vitD && vitD < 30) deficiencies.push({ marker: 'Vitamin D', value: vitD })
    if (b12 && b12 < 400) deficiencies.push({ marker: 'B12', value: b12 })
    if (magnesium && magnesium < 4.5) deficiencies.push({ marker: 'Magnesium', value: magnesium })
    
    if (deficiencies.length > 0) {
      patterns.push({
        patternName: 'nutritional_deficiencies',
        patternCategory: 'nutritional',
        confidenceScore: 1.0,
        supportingMarkers: deficiencies,
        clinicalSignificance: 'Multiple nutritional deficiencies affecting overall health',
        truckDriverImpact: 'Common in truckers due to poor diet and limited sun exposure',
        priorityLevel: 'moderate'
      })
    }

    return patterns
  }

  private async generateProtocols(
    client: any,
    data: any,
    patterns: any[]
  ): Promise<any[]> {
    const protocols = []
    
    // Generate protocols based on patterns
    for (const pattern of patterns) {
      if (pattern.patternName === 'insulin_resistance') {
        protocols.push({
          protocolType: 'supplement',
          priority: 'immediate',
          title: 'Metabolic Support Protocol',
          description: 'Comprehensive protocol to improve insulin sensitivity and metabolic health',
          supplementProtocol: {
            phase1: [
              { name: 'Berberine', dose: '500 mg', timing: 'twice daily with meals' },
              { name: 'Alpha Lipoic Acid', dose: '300 mg', timing: 'twice daily' },
              { name: 'Chromium Picolinate', dose: '200 mcg', timing: 'once daily' }
            ],
            phase2: [
              { name: 'Cinnamon Extract', dose: '500 mg', timing: 'once daily' },
              { name: 'Gymnema Sylvestre', dose: '400 mg', timing: 'twice daily' }
            ]
          },
          dietaryModifications: {
            eliminate: ['refined sugars', 'processed foods', 'white bread'],
            increase: ['vegetables', 'lean proteins', 'healthy fats'],
            timing: 'Implement 16:8 intermittent fasting'
          },
          lifestyleInterventions: [
            'Walk 10 minutes after each meal',
            'Park further away at truck stops',
            'Do bodyweight exercises during breaks'
          ],
          specificRecommendations: [
            'Monitor blood glucose with home meter',
            'Track food intake for 2 weeks',
            'Retest labs in 3 months'
          ],
          truckDriverAdaptations: 'All supplements stable at room temperature. Pack healthy snacks to avoid truck stop food.'
        })
      }
      
      if (pattern.patternName === 'vitamin_d_deficiency' || 
          pattern.patternName === 'nutritional_deficiencies') {
        protocols.push({
          protocolType: 'supplement',
          priority: 'high',
          title: 'Nutritional Restoration Protocol',
          description: 'Targeted supplementation to correct deficiencies',
          supplementProtocol: {
            immediate: [
              { name: 'Vitamin D3', dose: '5000 IU', timing: 'morning with food' },
              { name: 'Vitamin K2', dose: '100 mcg', timing: 'with D3' },
              { name: 'Methylated B-Complex', dose: '1 capsule', timing: 'morning' },
              { name: 'Magnesium Glycinate', dose: '400 mg', timing: 'evening' }
            ]
          },
          specificRecommendations: [
            'Get 15 minutes of sunlight daily when possible',
            'Eat vitamin D rich foods (salmon, eggs)',
            'Consider UV lamp for cab during winter months'
          ],
          truckDriverAdaptations: 'Keep supplements in organized pill box. Set phone reminders for doses.'
        })
      }
    }
    
    // Add general wellness protocol if no specific patterns
    if (protocols.length === 0) {
      protocols.push({
        protocolType: 'lifestyle',
        priority: 'moderate',
        title: 'General Wellness Protocol',
        description: 'Foundation protocol for overall health improvement',
        lifestyleInterventions: [
          'Increase water intake to 64 oz daily',
          'Aim for 7-8 hours of sleep',
          'Take 5-minute movement breaks every 2 hours'
        ],
        dietaryModifications: {
          focus: 'Whole foods, lean proteins, vegetables',
          avoid: 'Processed foods, excessive caffeine'
        },
        specificRecommendations: [
          'Track symptoms daily',
          'Schedule follow-up in 6 weeks'
        ],
        truckDriverAdaptations: 'Use truck stop time for quick walks. Keep healthy snacks in cooler.'
      })
    }
    
    return protocols
  }
}
