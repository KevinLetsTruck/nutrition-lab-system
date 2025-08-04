import { TextractBlock } from '@aws-sdk/client-textract'

export interface EnhancedText {
  originalText: string
  enhancedText: string
  medicalTerms: MedicalTerm[]
  corrections: OCRCorrection[]
  overallConfidence: number
}

export interface MedicalTerm {
  term: string
  expandedForm?: string
  category: 'lab_value' | 'condition' | 'medication' | 'procedure' | 'anatomy' | 'unit'
  confidence: number
  position: { start: number; end: number }
}

export interface OCRCorrection {
  original: string
  corrected: string
  reason: string
  confidence: number
}

export class MedicalTerminologyProcessor {
  private medicalDictionary: Map<string, string[]>
  private abbreviationExpander: Map<string, string>
  private unitPatterns: RegExp[]
  private labValuePatterns: RegExp[]

  constructor() {
    this.initializeDictionaries()
    this.initializePatterns()
  }

  private initializeDictionaries() {
    // Medical abbreviations and their expansions
    this.abbreviationExpander = new Map([
      // Common lab abbreviations
      ['hgb', 'hemoglobin'],
      ['hct', 'hematocrit'],
      ['wbc', 'white blood cell count'],
      ['rbc', 'red blood cell count'],
      ['plt', 'platelet count'],
      ['mcv', 'mean corpuscular volume'],
      ['mch', 'mean corpuscular hemoglobin'],
      ['mchc', 'mean corpuscular hemoglobin concentration'],
      ['rdw', 'red cell distribution width'],
      ['mpv', 'mean platelet volume'],
      
      // Metabolic panel
      ['glu', 'glucose'],
      ['bun', 'blood urea nitrogen'],
      ['cr', 'creatinine'],
      ['na', 'sodium'],
      ['k', 'potassium'],
      ['cl', 'chloride'],
      ['co2', 'carbon dioxide'],
      ['ca', 'calcium'],
      ['phos', 'phosphorus'],
      ['mg', 'magnesium'],
      
      // Liver function
      ['alt', 'alanine aminotransferase'],
      ['ast', 'aspartate aminotransferase'],
      ['alp', 'alkaline phosphatase'],
      ['ggt', 'gamma-glutamyl transferase'],
      ['ldh', 'lactate dehydrogenase'],
      ['tbil', 'total bilirubin'],
      ['dbil', 'direct bilirubin'],
      ['tp', 'total protein'],
      ['alb', 'albumin'],
      ['glob', 'globulin'],
      
      // Lipid panel
      ['tc', 'total cholesterol'],
      ['ldl', 'low-density lipoprotein'],
      ['hdl', 'high-density lipoprotein'],
      ['trig', 'triglycerides'],
      ['vldl', 'very low-density lipoprotein'],
      
      // Thyroid
      ['tsh', 'thyroid stimulating hormone'],
      ['t3', 'triiodothyronine'],
      ['t4', 'thyroxine'],
      ['ft3', 'free t3'],
      ['ft4', 'free t4'],
      ['tpo', 'thyroid peroxidase antibody'],
      ['tgab', 'thyroglobulin antibody'],
      
      // Hormones
      ['dhea', 'dehydroepiandrosterone'],
      ['dheas', 'dhea sulfate'],
      ['fsh', 'follicle stimulating hormone'],
      ['lh', 'luteinizing hormone'],
      ['shbg', 'sex hormone binding globulin'],
      ['igf1', 'insulin-like growth factor 1'],
      
      // Inflammatory markers
      ['crp', 'c-reactive protein'],
      ['hscrp', 'high-sensitivity c-reactive protein'],
      ['esr', 'erythrocyte sedimentation rate'],
      ['il6', 'interleukin-6'],
      ['tnfa', 'tumor necrosis factor alpha'],
      
      // Vitamins and nutrients
      ['vit d', 'vitamin d'],
      ['b12', 'vitamin b12'],
      ['rbc mg', 'red blood cell magnesium'],
      ['ferr', 'ferritin'],
      ['tibc', 'total iron binding capacity'],
      ['tsat', 'transferrin saturation']
    ])

    // Common OCR errors in medical context
    this.medicalDictionary = new Map([
      ['hemoglobin', ['hem0globin', 'hemoglob1n', 'hernoglobin']],
      ['glucose', ['gluc0se', 'glucoze', 'gIucose']],
      ['cholesterol', ['cholester0l', 'ch0lesterol', 'choIesterol']],
      ['creatinine', ['creat1nine', 'creatinlne', 'creatlnine']],
      ['bilirubin', ['bilirub1n', 'biIirubin', 'bllirubin']],
      ['potassium', ['p0tassium', 'potasslum', 'potass1um']],
      ['magnesium', ['magnes1um', 'magneslum', 'rnagnesium']],
      ['testosterone', ['testoster0ne', 'test0sterone', 'testosteron3']],
      ['estradiol', ['estradioI', 'estrad1ol', 'estradi0l']],
      ['cortisol', ['cortis0l', 'cortlsol', 'cort1sol']]
    ])
  }

  private initializePatterns() {
    // Patterns for lab values with units
    this.labValuePatterns = [
      // Standard lab value: number + unit
      /(\d+\.?\d*)\s*(mg\/dL|g\/dL|mmol\/L|mEq\/L|IU\/L|U\/L|ng\/mL|pg\/mL|µg\/dL|mcg\/dL|nmol\/L|pmol\/L|%)/gi,
      // Range values: number - number unit
      /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*(mg\/dL|g\/dL|mmol\/L|mEq\/L|IU\/L|U\/L|ng\/mL|pg\/mL|µg\/dL|mcg\/dL|nmol\/L|pmol\/L|%)/gi,
      // Values with < or >
      /([<>])\s*(\d+\.?\d*)\s*(mg\/dL|g\/dL|mmol\/L|mEq\/L|IU\/L|U\/L|ng\/mL|pg\/mL|µg\/dL|mcg\/dL|nmol\/L|pmol\/L|%)/gi
    ]

    // Common unit patterns that might be OCR'd incorrectly
    this.unitPatterns = [
      /mg\/d[lI]/gi,  // mg/dL often read as mg/dl or mg/dI
      /[uµ]g\/d[lI]/gi,  // µg/dL confusion
      /mm[o0][lI]\/[lI]/gi,  // mmol/L variations
      /[iI][uU]\/[lI]/gi,  // IU/L variations
      /pg\/m[lI]/gi,  // pg/mL variations
    ]
  }

  async enhanceOCRResults(textractOutput: any, documentType?: string): Promise<EnhancedText> {
    console.log('[MEDICAL-PROCESSOR] Enhancing OCR results for document type:', documentType)
    
    // Extract raw text from Textract output
    const rawText = this.extractRawText(textractOutput)
    
    // Step 1: Fix common OCR errors
    let enhancedText = this.fixCommonOCRErrors(rawText)
    
    // Step 2: Expand medical abbreviations
    const expandedTerms = this.expandAbbreviations(enhancedText)
    enhancedText = expandedTerms.text
    
    // Step 3: Identify and validate medical terms
    const medicalTerms = this.identifyMedicalTerms(enhancedText)
    
    // Step 4: Fix unit formatting
    enhancedText = this.standardizeUnits(enhancedText)
    
    // Step 5: Validate lab values
    const validatedValues = this.validateLabValues(enhancedText)
    
    // Calculate overall confidence
    const overallConfidence = this.calculateConfidence(medicalTerms, validatedValues)
    
    return {
      originalText: rawText,
      enhancedText,
      medicalTerms,
      corrections: this.corrections,
      overallConfidence
    }
  }

  private extractRawText(textractOutput: any): string {
    if (typeof textractOutput === 'string') {
      return textractOutput
    }
    
    // Handle Textract block structure
    if (textractOutput.Blocks) {
      return textractOutput.Blocks
        .filter((block: TextractBlock) => block.BlockType === 'LINE')
        .map((block: TextractBlock) => block.Text)
        .join('\n')
    }
    
    return ''
  }

  private corrections: OCRCorrection[] = []

  private fixCommonOCRErrors(text: string): string {
    this.corrections = []
    let correctedText = text

    // Fix medical terms
    for (const [correctTerm, errorVariations] of this.medicalDictionary) {
      for (const errorVariation of errorVariations) {
        const regex = new RegExp(`\\b${errorVariation}\\b`, 'gi')
        if (regex.test(correctedText)) {
          correctedText = correctedText.replace(regex, correctTerm)
          this.corrections.push({
            original: errorVariation,
            corrected: correctTerm,
            reason: 'Common OCR error in medical term',
            confidence: 0.85
          })
        }
      }
    }

    // Fix common number/letter confusions in medical context
    const numberLetterFixes = [
      { pattern: /\b0ral\b/gi, replacement: 'oral' },
      { pattern: /\b1ron\b/gi, replacement: 'iron' },
      { pattern: /\bvitamin b1Z\b/gi, replacement: 'vitamin b12' },
      { pattern: /\b5odium\b/gi, replacement: 'sodium' },
      { pattern: /\bur1ne\b/gi, replacement: 'urine' },
      { pattern: /\bbl00d\b/gi, replacement: 'blood' }
    ]

    for (const fix of numberLetterFixes) {
      if (fix.pattern.test(correctedText)) {
        correctedText = correctedText.replace(fix.pattern, fix.replacement)
        this.corrections.push({
          original: fix.pattern.source,
          corrected: fix.replacement,
          reason: 'Number/letter OCR confusion',
          confidence: 0.9
        })
      }
    }

    return correctedText
  }

  private expandAbbreviations(text: string): { text: string; expansions: MedicalTerm[] } {
    const expansions: MedicalTerm[] = []
    let expandedText = text

    for (const [abbrev, expansion] of this.abbreviationExpander) {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi')
      let match
      
      while ((match = regex.exec(text)) !== null) {
        expansions.push({
          term: abbrev,
          expandedForm: expansion,
          category: 'lab_value',
          confidence: 0.95,
          position: { start: match.index, end: match.index + abbrev.length }
        })
      }
    }

    return { text: expandedText, expansions }
  }

  private identifyMedicalTerms(text: string): MedicalTerm[] {
    const medicalTerms: MedicalTerm[] = []
    
    // Identify lab values with units
    for (const pattern of this.labValuePatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        medicalTerms.push({
          term: match[0],
          category: 'lab_value',
          confidence: 0.9,
          position: { start: match.index, end: match.index + match[0].length }
        })
      }
    }

    // Identify medical conditions
    const conditionPatterns = [
      /\b(diabetes|hypertension|hyperlipidemia|anemia|hypothyroidism|hyperthyroidism)\b/gi,
      /\b(cardiovascular disease|metabolic syndrome|insulin resistance|fatty liver)\b/gi,
      /\b(inflammation|oxidative stress|mitochondrial dysfunction|gut dysbiosis)\b/gi
    ]

    for (const pattern of conditionPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        medicalTerms.push({
          term: match[0],
          category: 'condition',
          confidence: 0.85,
          position: { start: match.index, end: match.index + match[0].length }
        })
      }
    }

    return medicalTerms
  }

  private standardizeUnits(text: string): string {
    let standardizedText = text

    // Standardize unit formatting
    const unitStandardizations = [
      { pattern: /mg\/d[lI]/gi, replacement: 'mg/dL' },
      { pattern: /[uµ]g\/d[lI]/gi, replacement: 'µg/dL' },
      { pattern: /mm[o0][lI]\/[lI]/gi, replacement: 'mmol/L' },
      { pattern: /mEq\/[lI]/gi, replacement: 'mEq/L' },
      { pattern: /[iI][uU]\/[lI]/gi, replacement: 'IU/L' },
      { pattern: /[uU]\/[lI]/gi, replacement: 'U/L' },
      { pattern: /ng\/m[lI]/gi, replacement: 'ng/mL' },
      { pattern: /pg\/m[lI]/gi, replacement: 'pg/mL' },
      { pattern: /mcg\/d[lI]/gi, replacement: 'mcg/dL' },
      { pattern: /nm[o0][lI]\/[lI]/gi, replacement: 'nmol/L' },
      { pattern: /pm[o0][lI]\/[lI]/gi, replacement: 'pmol/L' }
    ]

    for (const { pattern, replacement } of unitStandardizations) {
      standardizedText = standardizedText.replace(pattern, replacement)
    }

    return standardizedText
  }

  private validateLabValues(text: string): any[] {
    const validatedValues: any[] = []
    
    // Common lab value ranges for validation
    const labRanges = {
      glucose: { min: 50, max: 500, unit: 'mg/dL' },
      hemoglobin: { min: 5, max: 25, unit: 'g/dL' },
      cholesterol: { min: 50, max: 500, unit: 'mg/dL' },
      creatinine: { min: 0.1, max: 15, unit: 'mg/dL' },
      potassium: { min: 2, max: 8, unit: 'mEq/L' },
      sodium: { min: 110, max: 170, unit: 'mEq/L' },
      calcium: { min: 5, max: 15, unit: 'mg/dL' },
      magnesium: { min: 0.5, max: 5, unit: 'mg/dL' }
    }

    // Validate extracted values against reasonable ranges
    for (const [lab, range] of Object.entries(labRanges)) {
      const pattern = new RegExp(`${lab}[:\\s]+([\\d.]+)\\s*${range.unit}`, 'gi')
      let match
      
      while ((match = pattern.exec(text)) !== null) {
        const value = parseFloat(match[1])
        const isValid = value >= range.min && value <= range.max
        
        validatedValues.push({
          lab,
          value,
          unit: range.unit,
          isValid,
          confidence: isValid ? 0.95 : 0.3
        })
      }
    }

    return validatedValues
  }

  private calculateConfidence(medicalTerms: MedicalTerm[], validatedValues: any[]): number {
    if (medicalTerms.length === 0) return 0.1

    // Calculate average confidence from medical terms
    const termConfidence = medicalTerms.reduce((sum, term) => sum + term.confidence, 0) / medicalTerms.length
    
    // Calculate validation success rate
    const validValues = validatedValues.filter(v => v.isValid).length
    const validationRate = validatedValues.length > 0 ? validValues / validatedValues.length : 0.5
    
    // Weight and combine scores
    const overallConfidence = (termConfidence * 0.6) + (validationRate * 0.4)
    
    return Math.min(Math.max(overallConfidence, 0), 1)
  }

  // Utility method for specific document types
  async enhanceNutriQReport(text: string): Promise<EnhancedText> {
    // Add NutriQ-specific enhancements
    const nutriqTerms = new Map([
      ['NAQ', 'Nutritional Assessment Questionnaire'],
      ['symptom burden', 'total symptom score'],
      ['body systems', 'physiological systems assessment']
    ])

    // Merge with general medical processing
    for (const [abbrev, expansion] of nutriqTerms) {
      this.abbreviationExpander.set(abbrev.toLowerCase(), expansion)
    }

    return this.enhanceOCRResults(text, 'nutriq')
  }

  // Utility method for lab reports
  async enhanceLabReport(text: string, labType: 'kbmo' | 'dutch' | 'standard'): Promise<EnhancedText> {
    // Add lab-specific enhancements based on type
    const labSpecificTerms = {
      kbmo: new Map([
        ['IgG', 'Immunoglobulin G'],
        ['food sensitivity', 'IgG-mediated food sensitivity'],
        ['candida', 'candida albicans']
      ]),
      dutch: new Map([
        ['5a-DHT', '5-alpha-dihydrotestosterone'],
        ['DHEA-S', 'dehydroepiandrosterone sulfate'],
        ['E1', 'estrone'],
        ['E2', 'estradiol'],
        ['E3', 'estriol']
      ]),
      standard: new Map()
    }

    // Merge lab-specific terms
    const specificTerms = labSpecificTerms[labType]
    for (const [abbrev, expansion] of specificTerms) {
      this.abbreviationExpander.set(abbrev.toLowerCase(), expansion)
    }

    return this.enhanceOCRResults(text, labType)
  }
}

// Export singleton instance
export default new MedicalTerminologyProcessor()