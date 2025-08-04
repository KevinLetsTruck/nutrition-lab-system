export interface DocumentClassification {
  type: string
  confidence: number
  subType?: string
  metadata: {
    laboratory?: string
    testDate?: string
    patientInfo?: any
    documentSections?: string[]
  }
}

export class IntelligentDocumentClassifier {
  private readonly documentPatterns = {
    nutriq: {
      patterns: [
        /nutriq\s*health\s*assessment/i,
        /digestive\s*health\s*score/i,
        /energy\s*metabolism\s*score/i,
        /immune\s*system\s*score/i,
        /mental\s*emotional\s*score/i,
        /nutritional\s*therapy\s*practitioner/i
      ],
      requiredMatches: 2
    },
    kbmo: {
      patterns: [
        /kbmo\s*diagnostics/i,
        /food\s*sensitivity/i,
        /igg\s*antibody/i,
        /elimination\s*diet/i,
        /food\s*sensitivity\s*test/i,
        /kbma\s*report/i
      ],
      requiredMatches: 2
    },
    dutch: {
      patterns: [
        /dutch\s*(complete|plus|test)/i,
        /precision\s*analytical/i,
        /hormone\s*test/i,
        /cortisol\s*pattern/i,
        /dried\s*urine/i,
        /adrenal\s*assessment/i
      ],
      requiredMatches: 2
    },
    fitTest: {
      patterns: [
        /fit\s*test/i,
        /fecal\s*immunochemical/i,
        /colorectal\s*cancer\s*screening/i,
        /hemoglobin\s*detection/i,
        /stool\s*test/i,
        /gastrointestinal\s*bleeding/i
      ],
      requiredMatches: 2
    },
    spi: {
      patterns: [
        /success\s*probability\s*index/i,
        /spi\s*assessment/i,
        /business\s*readiness/i,
        /trucking\s*success/i,
        /driver\s*assessment/i,
        /0-100\s*scale/i
      ],
      requiredMatches: 2
    },
    cgm: {
      patterns: [
        /continuous\s*glucose\s*monitor/i,
        /cgm\s*report/i,
        /glucose\s*readings/i,
        /time\s*in\s*range/i,
        /glucose\s*variability/i,
        /average\s*glucose/i
      ],
      requiredMatches: 2
    },
    labReport: {
      patterns: [
        /laboratory\s*report/i,
        /lab\s*results/i,
        /reference\s*range/i,
        /clinical\s*laboratory/i,
        /test\s*results/i,
        /specimen\s*collected/i
      ],
      requiredMatches: 2
    },
    metabolicPanel: {
      patterns: [
        /comprehensive\s*metabolic\s*panel/i,
        /basic\s*metabolic\s*panel/i,
        /cmp|bmp/i,
        /glucose.*sodium.*potassium/i,
        /liver\s*function/i,
        /kidney\s*function/i
      ],
      requiredMatches: 1
    },
    thyroid: {
      patterns: [
        /thyroid\s*(panel|test|function)/i,
        /tsh.*t3.*t4/i,
        /thyroid\s*stimulating\s*hormone/i,
        /free\s*t[34]/i,
        /reverse\s*t3/i,
        /thyroid\s*antibod/i
      ],
      requiredMatches: 1
    },
    lipidPanel: {
      patterns: [
        /lipid\s*panel/i,
        /cholesterol\s*panel/i,
        /total\s*cholesterol.*hdl.*ldl/i,
        /triglycerides/i,
        /cardiovascular\s*risk/i,
        /lipid\s*profile/i
      ],
      requiredMatches: 1
    },
    inflammatoryMarkers: {
      patterns: [
        /inflammatory\s*markers/i,
        /c-reactive\s*protein/i,
        /crp|hscrp/i,
        /interleukin/i,
        /tumor\s*necrosis\s*factor/i,
        /inflammation\s*panel/i
      ],
      requiredMatches: 1
    },
    progressTracking: {
      patterns: [
        /progress\s*tracking/i,
        /daily\s*health\s*metrics/i,
        /supplement\s*compliance/i,
        /symptom\s*tracking/i,
        /health\s*diary/i,
        /wellness\s*log/i
      ],
      requiredMatches: 2
    },
    intakeForm: {
      patterns: [
        /client\s*intake/i,
        /health\s*history/i,
        /medical\s*questionnaire/i,
        /patient\s*information/i,
        /health\s*assessment\s*form/i,
        /new\s*client\s*form/i
      ],
      requiredMatches: 2
    },
    followUp: {
      patterns: [
        /follow[\s-]?up\s*assessment/i,
        /re[\s-]?assessment/i,
        /progress\s*evaluation/i,
        /comparative\s*analysis/i,
        /follow[\s-]?up\s*report/i,
        /reassessment\s*form/i
      ],
      requiredMatches: 1
    }
  }

  async classifyDocument(text: string): Promise<DocumentClassification> {
    const textLower = text.toLowerCase()
    const classifications: Array<{ type: string; score: number; subType?: string }> = []

    // Check each document type
    for (const [docType, config] of Object.entries(this.documentPatterns)) {
      const matches = config.patterns.filter(pattern => pattern.test(textLower))
      
      if (matches.length >= config.requiredMatches) {
        const score = matches.length / config.patterns.length
        classifications.push({ type: docType, score })
      }
    }

    // Sort by confidence score
    classifications.sort((a, b) => b.score - a.score)

    // Extract metadata based on classification
    const topClassification = classifications[0] || { type: 'unknown', score: 0 }
    const metadata = await this.extractMetadata(text, topClassification.type)

    // Determine subtype for lab reports
    let subType: string | undefined
    if (topClassification.type === 'labReport' && classifications.length > 1) {
      // Check for specific lab panel types
      const labSubTypes = ['metabolicPanel', 'thyroid', 'lipidPanel', 'inflammatoryMarkers']
      const subTypeMatch = classifications.find(c => labSubTypes.includes(c.type))
      if (subTypeMatch) {
        subType = subTypeMatch.type
      }
    }

    return {
      type: topClassification.type,
      confidence: topClassification.score,
      subType,
      metadata
    }
  }

  private async extractMetadata(text: string, docType: string): Promise<any> {
    const metadata: any = {}

    // Extract common metadata
    const dateMatch = text.match(/(?:date|collected|drawn)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i)
    if (dateMatch) {
      metadata.testDate = dateMatch[1]
    }

    // Extract laboratory name
    const labPatterns = [
      /(?:laboratory|lab)[\s:]*([A-Za-z\s&]+?)(?:\n|$)/i,
      /^([A-Za-z\s&]+?)\s*(?:laboratory|diagnostics|lab)/im
    ]
    
    for (const pattern of labPatterns) {
      const labMatch = text.match(pattern)
      if (labMatch) {
        metadata.laboratory = labMatch[1].trim()
        break
      }
    }

    // Extract patient info (anonymized)
    const patientMatch = text.match(/patient[\s:]*([^\n]+)/i)
    if (patientMatch) {
      metadata.patientInfo = {
        present: true,
        // Don't store actual patient info for privacy
        anonymized: true
      }
    }

    // Document-specific metadata
    switch (docType) {
      case 'nutriq':
        metadata.documentSections = this.extractNutriQSections(text)
        break
      case 'dutch':
        metadata.documentSections = this.extractDutchSections(text)
        break
      case 'kbmo':
        metadata.documentSections = this.extractKBMOSections(text)
        break
      case 'labReport':
        metadata.documentSections = this.extractLabSections(text)
        break
    }

    return metadata
  }

  private extractNutriQSections(text: string): string[] {
    const sections: string[] = []
    const sectionPatterns = [
      'digestive health',
      'energy metabolism',
      'immune system',
      'mental emotional',
      'sleep quality',
      'stress response'
    ]

    for (const section of sectionPatterns) {
      if (text.toLowerCase().includes(section)) {
        sections.push(section)
      }
    }

    return sections
  }

  private extractDutchSections(text: string): string[] {
    const sections: string[] = []
    const sectionPatterns = [
      'cortisol pattern',
      'sex hormones',
      'organic acids',
      'neurotransmitters',
      'melatonin',
      'oxidative stress'
    ]

    for (const section of sectionPatterns) {
      if (text.toLowerCase().includes(section)) {
        sections.push(section)
      }
    }

    return sections
  }

  private extractKBMOSections(text: string): string[] {
    const sections: string[] = []
    const sectionPatterns = [
      'high reactivity',
      'moderate reactivity',
      'low reactivity',
      'no reactivity',
      'food groups',
      'clinical considerations'
    ]

    for (const section of sectionPatterns) {
      if (text.toLowerCase().includes(section)) {
        sections.push(section)
      }
    }

    return sections
  }

  private extractLabSections(text: string): string[] {
    const sections: string[] = []
    const sectionPatterns = [
      'chemistry panel',
      'hematology',
      'urinalysis',
      'hormones',
      'vitamins',
      'minerals',
      'inflammatory markers',
      'cardiovascular markers'
    ]

    for (const section of sectionPatterns) {
      if (text.toLowerCase().includes(section)) {
        sections.push(section)
      }
    }

    return sections
  }

  // Confidence boosting based on additional context
  async enhanceClassification(
    initialClassification: DocumentClassification,
    additionalContext: {
      fileName?: string
      fileSize?: number
      uploadContext?: string
    }
  ): Promise<DocumentClassification> {
    let confidence = initialClassification.confidence

    // Boost confidence based on filename
    if (additionalContext.fileName) {
      const fileNameLower = additionalContext.fileName.toLowerCase()
      
      // Check if filename matches document type
      const typePatterns: Record<string, RegExp[]> = {
        nutriq: [/nutriq/i, /health.*assessment/i],
        kbmo: [/kbmo/i, /food.*sensitivity/i],
        dutch: [/dutch/i, /hormone/i],
        fitTest: [/fit.*test/i],
        spi: [/spi/i, /success.*probability/i],
        cgm: [/cgm/i, /glucose/i],
        labReport: [/lab.*report/i, /laboratory/i]
      }

      const patterns = typePatterns[initialClassification.type]
      if (patterns) {
        const filenameMatches = patterns.some(p => p.test(fileNameLower))
        if (filenameMatches) {
          confidence = Math.min(confidence + 0.2, 1.0)
        }
      }
    }

    return {
      ...initialClassification,
      confidence
    }
  }
}