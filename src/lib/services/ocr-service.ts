import Tesseract from 'tesseract.js'

interface OCRResult {
  text: string
  confidence: number
  structuredData?: any
  error?: string
}

interface ExtractedLabValue {
  testName: string
  value: string | number
  unit?: string
  reference?: string
  flag?: string
}

export class OCRService {
  private static instance: OCRService
  
  static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService()
    }
    return OCRService.instance
  }

  async processFile(file: File | Buffer, fileType: string): Promise<OCRResult> {
    try {
      if (fileType === 'application/pdf' || fileType === 'pdf') {
        return await this.processPDF(file)
      } else if (fileType.startsWith('image/')) {
        return await this.processImage(file)
      } else {
        throw new Error(`Unsupported file type: ${fileType}`)
      }
    } catch (error) {
      console.error('OCR processing error:', error)
      return {
        text: '',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async processPDF(file: File | Buffer): Promise<OCRResult> {
    try {
      // Dynamic import to avoid build-time issues
      const pdf = (await import('pdf-parse')).default
      
      let buffer: Buffer
      
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        buffer = file
      }

      const data = await pdf(buffer)
      
      // Extract text from PDF
      const text = data.text
      
      // Parse structured data from text
      const structuredData = this.parseLabReport(text)
      
      return {
        text,
        confidence: 0.95, // PDF text extraction is usually reliable
        structuredData
      }
    } catch (error) {
      console.error('PDF processing error:', error)
      throw error
    }
  }

  private async processImage(file: File | Buffer): Promise<OCRResult> {
    try {
      let imageData: string | Buffer
      
      if (file instanceof File) {
        // Convert File to base64 for Tesseract
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        imageData = `data:${file.type};base64,${buffer.toString('base64')}`
      } else {
        imageData = file
      }

      // Use Tesseract to extract text
      const result = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: (info) => {
            if (info.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`)
            }
          }
        }
      )

      const text = result.data.text
      const confidence = result.data.confidence / 100

      // Parse structured data from OCR text
      const structuredData = this.parseLabReport(text)

      return {
        text,
        confidence,
        structuredData
      }
    } catch (error) {
      console.error('Image OCR error:', error)
      throw error
    }
  }

  private parseLabReport(text: string): any {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line)
    const extractedValues: ExtractedLabValue[] = []
    
    // Common patterns for lab values
    const patterns = [
      // Pattern: TestName Value Unit (Reference)
      /^(.+?)\s+(\d+\.?\d*)\s+([a-zA-Z/%]+)\s*\(?([\d.-]+(?:\s*-\s*[\d.-]+)?)\)?/,
      // Pattern: TestName: Value Unit
      /^(.+?):\s*(\d+\.?\d*)\s+([a-zA-Z/%]+)/,
      // Pattern: TestName Value (no unit)
      /^(.+?)\s+(\d+\.?\d*)$/
    ]

    // Extract patient info
    const patientInfo: any = {}
    
    // Try to find patient name
    const namePatterns = [
      /Patient:\s*(.+)/i,
      /Name:\s*(.+)/i,
      /Patient Name:\s*(.+)/i
    ]
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern)
      if (match) {
        patientInfo.patientName = match[1].trim()
        break
      }
    }

    // Try to find collection date
    const datePatterns = [
      /Collection Date:\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /Collected:\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /Date:\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i
    ]
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        patientInfo.collectionDate = match[1]
        break
      }
    }

    // Extract lab values
    for (const line of lines) {
      // Skip headers and empty lines
      if (line.length < 3 || line.includes('Reference Range') || line.includes('Test Name')) {
        continue
      }

      // Try each pattern
      for (const pattern of patterns) {
        const match = line.match(pattern)
        if (match) {
          const [, testName, value, unit, reference] = match
          
          // Check for flags (H, L, HH, LL)
          let flag = null
          if (line.includes(' H ') || line.endsWith(' H')) flag = 'H'
          else if (line.includes(' L ') || line.endsWith(' L')) flag = 'L'
          else if (line.includes(' HH ') || line.endsWith(' HH')) flag = 'HH'
          else if (line.includes(' LL ') || line.endsWith(' LL')) flag = 'LL'

          extractedValues.push({
            testName: testName.trim(),
            value: isNaN(Number(value)) ? value : Number(value),
            unit: unit?.trim(),
            reference: reference?.trim(),
            flag: flag || undefined
          })
          break
        }
      }
    }

    // Identify lab company
    let labName = 'Unknown Lab'
    if (text.toLowerCase().includes('labcorp')) labName = 'LabCorp'
    else if (text.toLowerCase().includes('quest')) labName = 'Quest Diagnostics'
    else if (text.toLowerCase().includes('boston heart')) labName = 'Boston Heart'
    else if (text.toLowerCase().includes('genova')) labName = 'Genova Diagnostics'

    return {
      ...patientInfo,
      labName,
      markers: extractedValues,
      totalMarkersFound: extractedValues.length,
      rawText: text.substring(0, 1000) // First 1000 chars for debugging
    }
  }

  // Enhanced parsing for specific lab formats
  parseLabCorpReport(text: string): ExtractedLabValue[] {
    const values: ExtractedLabValue[] = []
    const lines = text.split('\n')
    
    // LabCorp specific patterns
    const labCorpPattern = /^(.+?)\s+(\d+\.?\d*)\s+([a-zA-Z/%]+)?\s*(\d+\.?\d*\s*-\s*\d+\.?\d*)?\s*([HLN])?$/
    
    for (const line of lines) {
      const match = line.match(labCorpPattern)
      if (match) {
        const [, testName, value, unit, reference, flag] = match
        values.push({
          testName: testName.trim(),
          value: Number(value),
          unit: unit?.trim(),
          reference: reference?.trim(),
          flag: flag?.trim()
        })
      }
    }
    
    return values
  }

  parseQuestReport(text: string): ExtractedLabValue[] {
    const values: ExtractedLabValue[] = []
    // Quest specific parsing logic
    // Similar to LabCorp but with Quest-specific patterns
    return values
  }
}
