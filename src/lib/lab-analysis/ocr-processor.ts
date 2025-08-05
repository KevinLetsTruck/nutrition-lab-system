import { createWorker, Worker } from 'tesseract.js'
const pdfParse = require('pdf-parse')
import { 
  OCRResult, 
  ExtractedLabData, 
  ExtractedTestResult,
  PatientInfo,
  LabInfo
} from '@/types/lab-analysis'

export class LabOCRProcessor {
  private tesseractWorker: Worker | null = null
  private initialized = false

  async initialize() {
    if (this.initialized) return

    try {
      // Initialize Tesseract worker
      this.tesseractWorker = await createWorker({
        logger: m => console.log('[OCR]', m),
      })

      await this.tesseractWorker.load()
      await this.tesseractWorker.loadLanguage('eng')
      await this.tesseractWorker.initialize('eng')
      
      // Configure for better accuracy with lab reports
      await this.tesseractWorker.setParameters({
        tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.-/<>():, ',
      })

      this.initialized = true
      console.log('[OCR] Tesseract initialized successfully')
    } catch (error) {
      console.error('[OCR] Failed to initialize Tesseract:', error)
      throw new Error('OCR initialization failed')
    }
  }

  async processLabDocument(buffer: Buffer, fileType: 'pdf' | 'image'): Promise<OCRResult> {
    try {
      await this.initialize()

      let text = ''
      let confidence = 0

      if (fileType === 'pdf') {
        // Try text extraction first
        try {
          const pdfData = await pdfParse(buffer)
          text = pdfData.text
          confidence = text.length > 100 ? 0.9 : 0.5
          console.log('[OCR] Extracted text from PDF:', text.length, 'characters')
        } catch (pdfError) {
          console.error('[OCR] PDF text extraction failed:', pdfError)
          // Fall back to OCR if needed
          return this.processImageOCR(buffer)
        }
      } else {
        // Process image with OCR
        return this.processImageOCR(buffer)
      }

      // Parse the extracted text
      const structuredData = this.parseLabText(text)

      return {
        success: true,
        text,
        structured_data: structuredData,
        confidence
      }
    } catch (error) {
      console.error('[OCR] Processing error:', error)
      return {
        success: false,
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Unknown OCR error']
      }
    }
  }

  private async processImageOCR(buffer: Buffer): Promise<OCRResult> {
    if (!this.tesseractWorker) {
      throw new Error('Tesseract not initialized')
    }

    try {
      const result = await this.tesseractWorker.recognize(buffer)
      const text = result.data.text
      const confidence = result.data.confidence / 100

      console.log('[OCR] Image OCR completed:', {
        textLength: text.length,
        confidence: confidence.toFixed(2)
      })

      const structuredData = this.parseLabText(text)

      return {
        success: true,
        text,
        structured_data: structuredData,
        confidence
      }
    } catch (error) {
      console.error('[OCR] Image processing error:', error)
      return {
        success: false,
        confidence: 0,
        errors: ['Failed to process image with OCR']
      }
    }
  }

  private parseLabText(text: string): ExtractedLabData {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    const patientInfo = this.extractPatientInfo(lines)
    const labInfo = this.extractLabInfo(lines)
    const testResults = this.extractTestResults(lines)

    return {
      patient_info: patientInfo,
      lab_info: labInfo,
      test_results: testResults,
      metadata: {
        total_lines: lines.length,
        extraction_timestamp: new Date().toISOString()
      }
    }
  }

  private extractPatientInfo(lines: string[]): PatientInfo {
    const info: PatientInfo = {}

    // Common patterns for patient information
    const patterns = {
      name: [
        /Patient:\s*(.+)/i,
        /Name:\s*(.+)/i,
        /Patient Name:\s*(.+)/i,
      ],
      dob: [
        /DOB:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
        /Date of Birth:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
        /Birth Date:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
      ],
      id: [
        /Patient ID:\s*(\S+)/i,
        /MRN:\s*(\S+)/i,
        /Account #:\s*(\S+)/i,
      ],
      gender: [
        /Gender:\s*(M|F|Male|Female)/i,
        /Sex:\s*(M|F|Male|Female)/i,
      ]
    }

    for (const line of lines) {
      // Extract name
      for (const pattern of patterns.name) {
        const match = line.match(pattern)
        if (match && !info.name) {
          info.name = match[1].trim()
          break
        }
      }

      // Extract DOB
      for (const pattern of patterns.dob) {
        const match = line.match(pattern)
        if (match && !info.date_of_birth) {
          info.date_of_birth = match[1]
          break
        }
      }

      // Extract ID
      for (const pattern of patterns.id) {
        const match = line.match(pattern)
        if (match && !info.patient_id) {
          info.patient_id = match[1]
          break
        }
      }

      // Extract gender
      for (const pattern of patterns.gender) {
        const match = line.match(pattern)
        if (match && !info.gender) {
          info.gender = match[1].toUpperCase().substring(0, 1)
          break
        }
      }
    }

    return info
  }

  private extractLabInfo(lines: string[]): LabInfo {
    const info: LabInfo = {}

    // Detect lab company
    const labNames = ['LabCorp', 'Quest', 'Boston Heart', 'Cleveland Heart', 'Genova', 'Great Plains']
    for (const line of lines.slice(0, 10)) { // Check first 10 lines
      for (const labName of labNames) {
        if (line.toLowerCase().includes(labName.toLowerCase())) {
          info.lab_name = labName
          break
        }
      }
      if (info.lab_name) break
    }

    // Extract dates
    const datePatterns = [
      /Collection Date:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
      /Collected:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
      /Report Date:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
      /Reported:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    ]

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match) {
          if (pattern.source.includes('Collection') && !info.collection_date) {
            info.collection_date = match[1]
          } else if (pattern.source.includes('Report') && !info.report_date) {
            info.report_date = match[1]
          }
        }
      }
    }

    return info
  }

  private extractTestResults(lines: string[]): ExtractedTestResult[] {
    const results: ExtractedTestResult[] = []
    
    // Common lab result patterns
    const resultPatterns = [
      // Pattern: Test Name    Value    Unit    Range    Flag
      /^(.+?)\s+(\d+\.?\d*)\s+(\S+)\s+(\d+\.?\d*\s*-\s*\d+\.?\d*)\s*([HLC]?)$/,
      // Pattern: Test Name    Value    Range    Flag
      /^(.+?)\s+(\d+\.?\d*)\s+(\d+\.?\d*\s*-\s*\d+\.?\d*)\s*([HLC]?)$/,
      // Pattern: Test Name: Value Unit (Range)
      /^(.+?):\s*(\d+\.?\d*)\s*(\S+)\s*\((\d+\.?\d*\s*-\s*\d+\.?\d*)\)$/,
      // Pattern: Test Name    Value    Unit
      /^(.+?)\s+(\d+\.?\d*)\s+(\S+)$/,
    ]

    // Known test names for fuzzy matching
    const knownTests = [
      'Glucose', 'Hemoglobin A1c', 'HbA1c', 'Insulin', 'Cholesterol', 'LDL', 'HDL', 
      'Triglycerides', 'TSH', 'Free T4', 'Free T3', 'Testosterone', 'Vitamin D',
      'B12', 'Ferritin', 'Iron', 'CRP', 'hs-CRP', 'Homocysteine', 'ALT', 'AST',
      'Creatinine', 'BUN', 'eGFR', 'Sodium', 'Potassium', 'Calcium', 'Magnesium'
    ]

    for (const line of lines) {
      // Skip header lines
      if (line.includes('Test Name') || line.includes('Result') || line.includes('Reference')) {
        continue
      }

      // Try each pattern
      for (const pattern of resultPatterns) {
        const match = line.match(pattern)
        if (match) {
          const testName = this.normalizeTestName(match[1])
          const value = match[2]
          const unit = match[3] || ''
          const referenceRange = match[4] || ''
          const flag = match[5] || ''

          // Calculate confidence based on matching known test names
          const confidence = this.calculateTestNameConfidence(testName, knownTests)

          results.push({
            test_name: testName,
            value,
            unit,
            reference_range: referenceRange,
            flag,
            confidence
          })
          break
        }
      }
    }

    // Filter out low confidence results
    return results.filter(r => r.confidence > 0.3)
  }

  private normalizeTestName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s-]/g, '')
      .replace(/\b(total|serum|plasma)\b/gi, '')
      .trim()
  }

  private calculateTestNameConfidence(testName: string, knownTests: string[]): number {
    const normalized = testName.toLowerCase()
    
    // Exact match
    if (knownTests.some(t => t.toLowerCase() === normalized)) {
      return 1.0
    }

    // Contains match
    const containsMatch = knownTests.find(t => 
      normalized.includes(t.toLowerCase()) || 
      t.toLowerCase().includes(normalized)
    )
    if (containsMatch) {
      return 0.8
    }

    // Fuzzy match using simple distance
    let maxSimilarity = 0
    for (const known of knownTests) {
      const similarity = this.calculateSimilarity(normalized, known.toLowerCase())
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity
      }
    }

    return maxSimilarity
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.getEditDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private getEditDistance(str1: string, str2: string): number {
    const matrix: number[][] = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  async cleanup() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate()
      this.tesseractWorker = null
      this.initialized = false
    }
  }
}

export default LabOCRProcessor