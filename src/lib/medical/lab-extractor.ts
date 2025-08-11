import { prisma } from '@/lib/db/prisma'
import { functionalAnalyzer } from './functional-analysis'

export interface ExtractedLabValue {
  testName: string
  standardName?: string
  value?: number
  valueText?: string
  unit?: string
  referenceMin?: number
  referenceMax?: number
  flag?: 'normal' | 'high' | 'low' | 'critical'
  confidence: number
  rawText: string
  position?: number
}

export interface LabExtractionResult {
  extractedValues: ExtractedLabValue[]
  totalFound: number
  highConfidenceCount: number
  processingTime: number
  patterns: {
    tableStructure: boolean
    referenceRanges: boolean
    units: boolean
    flags: boolean
  }
}

export class LabValueExtractor {
  
  // Common lab test patterns with multiple variations
  private readonly LAB_PATTERNS = {
    // Basic Metabolic Panel (BMP/CMP)
    glucose: {
      names: ['glucose', 'gluc', 'blood glucose', 'fasting glucose', 'random glucose'],
      units: ['mg/dl', 'mg/dL', 'mmol/l', 'mmol/L'],
      ranges: { conventional: [70, 99], functional: [83, 99] }
    },
    bun: {
      names: ['bun', 'blood urea nitrogen', 'urea nitrogen'],
      units: ['mg/dl', 'mg/dL', 'mmol/l'],
      ranges: { conventional: [7, 20], functional: [12, 20] }
    },
    creatinine: {
      names: ['creatinine', 'creat', 'serum creatinine'],
      units: ['mg/dl', 'mg/dL', 'µmol/l', 'umol/l'],
      ranges: { conventional: [0.7, 1.3], functional: [0.8, 1.2] }
    },
    sodium: {
      names: ['sodium', 'na', 'na+'],
      units: ['meq/l', 'mEq/L', 'mmol/l'],
      ranges: { conventional: [136, 145], functional: [139, 143] }
    },
    potassium: {
      names: ['potassium', 'k', 'k+'],
      units: ['meq/l', 'mEq/L', 'mmol/l'],
      ranges: { conventional: [3.5, 5.1], functional: [4.0, 4.5] }
    },
    chloride: {
      names: ['chloride', 'cl', 'cl-'],
      units: ['meq/l', 'mEq/L', 'mmol/l'],
      ranges: { conventional: [98, 107], functional: [101, 105] }
    },
    co2: {
      names: ['co2', 'carbon dioxide', 'bicarbonate', 'hco3', 'total co2'],
      units: ['meq/l', 'mEq/L', 'mmol/l'],
      ranges: { conventional: [22, 29], functional: [24, 27] }
    },

    // Lipid Panel
    totalCholesterol: {
      names: ['total cholesterol', 'cholesterol total', 'cholesterol', 'chol'],
      units: ['mg/dl', 'mg/dL', 'mmol/l'],
      ranges: { conventional: [100, 199], functional: [160, 200] }
    },
    hdl: {
      names: ['hdl', 'hdl cholesterol', 'hdl-c', 'high density lipoprotein'],
      units: ['mg/dl', 'mg/dL', 'mmol/l'],
      ranges: { conventional: [40, 60], functional: [59, 100] }
    },
    ldl: {
      names: ['ldl', 'ldl cholesterol', 'ldl-c', 'low density lipoprotein', 'ldl calculated'],
      units: ['mg/dl', 'mg/dL', 'mmol/l'],
      ranges: { conventional: [0, 99], functional: [0, 100] }
    },
    triglycerides: {
      names: ['triglycerides', 'trig', 'trigs', 'triglyceride'],
      units: ['mg/dl', 'mg/dL', 'mmol/l'],
      ranges: { conventional: [0, 149], functional: [0, 100] }
    },

    // CBC
    wbc: {
      names: ['wbc', 'white blood cell', 'white blood cells', 'leukocytes'],
      units: ['k/ul', 'K/uL', '10^3/ul', 'x10³/µL', 'thou/ul'],
      ranges: { conventional: [4.0, 10.8], functional: [5.5, 7.5] }
    },
    rbc: {
      names: ['rbc', 'red blood cell', 'red blood cells', 'erythrocytes'],
      units: ['m/ul', 'M/uL', '10^6/ul', 'x10⁶/µL', 'mil/ul'],
      ranges: { conventional: [4.2, 5.4], functional: [4.2, 4.9] }
    },
    hemoglobin: {
      names: ['hemoglobin', 'hgb', 'hb'],
      units: ['g/dl', 'g/dL', 'g/l'],
      ranges: { conventional: [12.0, 15.5], functional: [13.5, 15.0] }
    },
    hematocrit: {
      names: ['hematocrit', 'hct'],
      units: ['%', 'percent'],
      ranges: { conventional: [36.0, 46.0], functional: [40.0, 44.0] }
    },
    platelets: {
      names: ['platelets', 'plt', 'platelet count'],
      units: ['k/ul', 'K/uL', '10^3/ul', 'thou/ul'],
      ranges: { conventional: [150, 450], functional: [175, 400] }
    },

    // Thyroid
    tsh: {
      names: ['tsh', 'thyroid stimulating hormone', 'thyrotropin'],
      units: ['miu/ml', 'mIU/mL', 'mu/l', 'mU/L', 'uiu/ml'],
      ranges: { conventional: [0.4, 4.0], functional: [1.8, 3.0] }
    },
    freeT4: {
      names: ['free t4', 'ft4', 'free thyroxine', 'thyroxine free'],
      units: ['ng/dl', 'ng/dL', 'pmol/l'],
      ranges: { conventional: [0.8, 1.8], functional: [1.0, 1.5] }
    },
    freeT3: {
      names: ['free t3', 'ft3', 'free triiodothyronine', 'triiodothyronine free'],
      units: ['pg/ml', 'pg/mL', 'pmol/l'],
      ranges: { conventional: [2.3, 4.2], functional: [3.0, 4.0] }
    },

    // Vitamins & Minerals
    vitaminD: {
      names: ['vitamin d', 'vit d', '25-oh vitamin d', '25(oh)d', 'vitamin d 25-hydroxy'],
      units: ['ng/ml', 'ng/mL', 'nmol/l'],
      ranges: { conventional: [30, 100], functional: [50, 80] }
    },
    vitaminB12: {
      names: ['vitamin b12', 'vit b12', 'b12', 'cobalamin'],
      units: ['pg/ml', 'pg/mL', 'pmol/l'],
      ranges: { conventional: [200, 900], functional: [500, 1000] }
    },
    folate: {
      names: ['folate', 'folic acid', 'serum folate'],
      units: ['ng/ml', 'ng/mL', 'nmol/l'],
      ranges: { conventional: [2.7, 17.0], functional: [7.0, 15.0] }
    },
    iron: {
      names: ['iron', 'serum iron', 'fe'],
      units: ['ug/dl', 'µg/dL', 'mcg/dl', 'umol/l'],
      ranges: { conventional: [60, 170], functional: [85, 130] }
    },
    ferritin: {
      names: ['ferritin', 'serum ferritin'],
      units: ['ng/ml', 'ng/mL', 'ug/l', 'µg/L', 'mcg/l'],
      ranges: { conventional: [15, 150], functional: [30, 100] }
    },

    // Inflammatory Markers
    crp: {
      names: ['crp', 'c-reactive protein', 'c reactive protein', 'hs-crp', 'high sensitivity crp'],
      units: ['mg/l', 'mg/L', 'mg/dl'],
      ranges: { conventional: [0, 3.0], functional: [0, 1.0] }
    },
    esr: {
      names: ['esr', 'sed rate', 'sedimentation rate', 'erythrocyte sedimentation rate'],
      units: ['mm/hr', 'mm/h'],
      ranges: { conventional: [0, 30], functional: [0, 10] }
    }
  }

  async extractLabValues(documentId: string, ocrText: string): Promise<LabExtractionResult> {
    const startTime = Date.now()
    console.log(`🧪 Starting lab value extraction for document: ${documentId}`)

    try {
      // Clean and prepare text for processing
      const cleanedText = this.preprocessText(ocrText)
      
      // Detect document structure patterns
      const patterns = this.detectStructurePatterns(cleanedText)
      console.log(`📊 Detected patterns:`, patterns)

      // Extract lab values using multiple strategies
      const extractedValues: ExtractedLabValue[] = []
      
      if (patterns.tableStructure) {
        const tableValues = this.extractFromTableStructure(cleanedText)
        extractedValues.push(...tableValues)
      }
      
      const patternValues = this.extractWithPatternMatching(cleanedText)
      extractedValues.push(...patternValues)

      // Remove duplicates and merge similar values
      const mergedValues = this.removeDuplicatesAndMerge(extractedValues)
      
      // Validate and flag values
      const validatedValues = this.validateAndFlagValues(mergedValues)
      
      // Save to database
      await this.saveLabValues(documentId, validatedValues)

      const result: LabExtractionResult = {
        extractedValues: validatedValues,
        totalFound: validatedValues.length,
        highConfidenceCount: validatedValues.filter(v => v.confidence >= 0.8).length,
        processingTime: Date.now() - startTime,
        patterns
      }

      console.log(`✅ Lab extraction complete: ${result.totalFound} values found (${result.highConfidenceCount} high confidence)`)
      
      // Automatically trigger functional medicine analysis
      if (validatedValues.length > 0) {
        console.log('🔬 Triggering functional medicine analysis...')
        try {
          const analysisResult = await functionalAnalyzer.analyzeDocument(documentId)
          console.log(`🎯 Functional analysis complete: Grade ${analysisResult.overallHealth.grade}, ${analysisResult.patterns.length} patterns detected`)
        } catch (analysisError) {
          console.error('⚠️ Functional analysis failed:', analysisError)
          // Don't fail lab extraction if analysis fails
        }
      }

      return result

    } catch (error) {
      console.error('❌ Lab extraction error:', error)
      throw error
    }
  }

  private preprocessText(text: string): string {
    return text
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Normalize common unicode characters
      .replace(/–/g, '-')
      .replace(/—/g, '-')
      .replace(/'/g, "'")
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      // Normalize units
      .replace(/mg\/dl/gi, 'mg/dL')
      .replace(/meq\/l/gi, 'mEq/L')
      .replace(/ug\/dl/gi, 'µg/dL')
      .replace(/mcg\/dl/gi, 'µg/dL')
      .trim()
  }

  private detectStructurePatterns(text: string): { tableStructure: boolean; referenceRanges: boolean; units: boolean; flags: boolean } {
    return {
      tableStructure: /\|\s*\w+\s*\|\s*[\d.]+\s*\|/.test(text) || 
                     /\b\w+\s+[\d.]+\s+\w+\/\w+\s+[\d.-]+\s*-\s*[\d.-]+/.test(text),
      referenceRanges: /[\d.]+\s*-\s*[\d.]+/.test(text) || 
                       /\(\s*[\d.]+\s*-\s*[\d.]+\s*\)/.test(text),
      units: /mg\/dl|meq\/l|ng\/ml|pg\/ml|ug\/dl|k\/ul|g\/dl|%/gi.test(text),
      flags: /\b(high|low|normal|critical|h|l|n|c)\b/gi.test(text)
    }
  }

  private extractFromTableStructure(text: string): ExtractedLabValue[] {
    const values: ExtractedLabValue[] = []
    const lines = text.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Pattern: Test Name | Value | Unit | Reference Range | Flag
      const tableMatch = line.match(/^([^|]+)\|\s*([\d.]+)\s*\|\s*([^|]+)\|\s*([^|]*)\|\s*([^|]*)$/i)
      if (tableMatch) {
        const [, testName, valueStr, unit, refRange, flag] = tableMatch
        
        const extractedValue = this.createLabValue({
          testName: testName.trim(),
          valueStr: valueStr.trim(),
          unit: unit.trim(),
          refRange: refRange.trim(),
          flag: flag.trim(),
          rawText: line,
          confidence: 0.9 // High confidence for structured table data
        })

        if (extractedValue) {
          values.push(extractedValue)
        }
      }

      // Pattern: Test Name    Value Unit    Reference Range
      const spacedMatch = line.match(/^([a-zA-Z\s]+?)\s+([\d.]+)\s+([a-zA-Z\/]+)\s+([\d.-]+\s*-\s*[\d.-]+)/i)
      if (spacedMatch) {
        const [, testName, valueStr, unit, refRange] = spacedMatch
        
        const extractedValue = this.createLabValue({
          testName: testName.trim(),
          valueStr: valueStr.trim(),
          unit: unit.trim(),
          refRange: refRange.trim(),
          rawText: line,
          confidence: 0.8
        })

        if (extractedValue) {
          values.push(extractedValue)
        }
      }
    }

    return values
  }

  private extractWithPatternMatching(text: string): ExtractedLabValue[] {
    const values: ExtractedLabValue[] = []
    
    for (const [labKey, labConfig] of Object.entries(this.LAB_PATTERNS)) {
      for (const testName of labConfig.names) {
        // Create flexible regex pattern for each test name
        const patterns = [
          // Pattern: Test Name: Value Unit
          new RegExp(`\\b${this.escapeRegex(testName)}\\s*:?\\s*([\d.]+)\\s*(${labConfig.units.map(this.escapeRegex).join('|')})`, 'gi'),
          // Pattern: Test Name   Value   Unit
          new RegExp(`\\b${this.escapeRegex(testName)}\\s+([\d.]+)\\s+(${labConfig.units.map(this.escapeRegex).join('|')})`, 'gi'),
          // Pattern: Value Unit Test Name
          new RegExp(`([\d.]+)\\s+(${labConfig.units.map(this.escapeRegex).join('|')})\\s+${this.escapeRegex(testName)}`, 'gi')
        ]

        for (const pattern of patterns) {
          let match
          while ((match = pattern.exec(text)) !== null) {
            const valueStr = match[1]
            const unit = match[2]
            
            // Look for reference range near this match
            const contextStart = Math.max(0, match.index - 100)
            const contextEnd = Math.min(text.length, match.index + match[0].length + 100)
            const context = text.substring(contextStart, contextEnd)
            
            const refRangeMatch = context.match(/([\d.]+)\s*-\s*([\d.]+)/)
            const flagMatch = context.match(/\b(high|low|normal|critical|h|l|n|c)\b/i)

            const extractedValue = this.createLabValue({
              testName: testName,
              standardName: labKey,
              valueStr,
              unit,
              refRange: refRangeMatch ? `${refRangeMatch[1]}-${refRangeMatch[2]}` : undefined,
              flag: flagMatch ? flagMatch[1] : undefined,
              rawText: match[0],
              confidence: 0.7,
              ranges: labConfig.ranges
            })

            if (extractedValue) {
              values.push(extractedValue)
            }
          }
        }
      }
    }

    return values
  }

  private createLabValue(params: {
    testName: string
    standardName?: string
    valueStr: string
    unit?: string
    refRange?: string
    flag?: string
    rawText: string
    confidence: number
    ranges?: { conventional: [number, number]; functional: [number, number] }
  }): ExtractedLabValue | null {
    
    const value = parseFloat(params.valueStr)
    if (isNaN(value)) return null

    // Parse reference range
    let referenceMin: number | undefined
    let referenceMax: number | undefined
    
    if (params.refRange) {
      const rangeMatch = params.refRange.match(/([\d.]+)\s*-\s*([\d.]+)/)
      if (rangeMatch) {
        referenceMin = parseFloat(rangeMatch[1])
        referenceMax = parseFloat(rangeMatch[2])
      }
    } else if (params.ranges) {
      referenceMin = params.ranges.conventional[0]
      referenceMax = params.ranges.conventional[1]
    }

    // Determine flag
    let flag: 'normal' | 'high' | 'low' | 'critical' | undefined

    if (params.flag) {
      const flagLower = params.flag.toLowerCase()
      if (['high', 'h'].includes(flagLower)) flag = 'high'
      else if (['low', 'l'].includes(flagLower)) flag = 'low'
      else if (['critical', 'c'].includes(flagLower)) flag = 'critical'
      else if (['normal', 'n'].includes(flagLower)) flag = 'normal'
    } else if (referenceMin !== undefined && referenceMax !== undefined) {
      if (value < referenceMin) flag = 'low'
      else if (value > referenceMax) flag = 'high'
      else flag = 'normal'
    }

    return {
      testName: params.testName,
      standardName: params.standardName,
      value,
      unit: params.unit,
      referenceMin,
      referenceMax,
      flag,
      confidence: params.confidence,
      rawText: params.rawText
    }
  }

  private removeDuplicatesAndMerge(values: ExtractedLabValue[]): ExtractedLabValue[] {
    const seen = new Map<string, ExtractedLabValue>()
    
    for (const value of values) {
      const key = `${value.testName.toLowerCase()}_${value.value}_${value.unit?.toLowerCase() || ''}`
      const existing = seen.get(key)
      
      if (!existing || value.confidence > existing.confidence) {
        seen.set(key, value)
      }
    }
    
    return Array.from(seen.values())
  }

  private validateAndFlagValues(values: ExtractedLabValue[]): ExtractedLabValue[] {
    return values.map(value => {
      // Add validation logic here
      // For now, just ensure confidence doesn't exceed 1.0
      return {
        ...value,
        confidence: Math.min(value.confidence, 1.0)
      }
    })
  }

  private async saveLabValues(documentId: string, values: ExtractedLabValue[]): Promise<void> {
    console.log(`💾 Saving ${values.length} lab values to database...`)

    try {
      // Delete existing lab values for this document
      await prisma.labValue.deleteMany({
        where: { documentId }
      })

      // Insert new lab values
      if (values.length > 0) {
        await prisma.labValue.createMany({
          data: values.map(value => ({
            documentId,
            testName: value.testName,
            standardName: value.standardName,
            value: value.value,
            valueText: value.valueText,
            unit: value.unit,
            referenceMin: value.referenceMin,
            referenceMax: value.referenceMax,
            flag: value.flag,
            confidence: value.confidence
          }))
        })
      }

      console.log(`✅ Lab values saved successfully`)
    } catch (error) {
      console.error('❌ Failed to save lab values:', error)
      throw error
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

// Export singleton instance
export const labValueExtractor = new LabValueExtractor()
