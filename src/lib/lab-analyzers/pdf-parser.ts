import * as pdf from 'pdf-parse'

export interface LabResult {
  testName: string
  value: string
  unit: string
  referenceRange: string
  status: 'normal' | 'high' | 'low' | 'critical'
  timestamp: Date
}

export interface ParsedLabReport {
  patientId?: string
  patientName?: string
  dateOfBirth?: string
  testDate: Date
  labName?: string
  results: LabResult[]
  rawText: string
}

export class PDFLabParser {
  private static instance: PDFLabParser
  
  private constructor() {}
  
  static getInstance(): PDFLabParser {
    if (!PDFLabParser.instance) {
      PDFLabParser.instance = new PDFLabParser()
    }
    return PDFLabParser.instance
  }
  
  async parseLabReport(pdfBuffer: Buffer): Promise<ParsedLabReport> {
    try {
      const data = await pdf(pdfBuffer)
      const text = data.text
      
      // Basic parsing - this will be enhanced with specific lab analyzers
      const parsedReport: ParsedLabReport = {
        testDate: new Date(),
        results: [],
        rawText: text
      }
      
      // Extract basic information using regex patterns
      this.extractPatientInfo(text, parsedReport)
      this.extractLabResults(text, parsedReport)
      
      return parsedReport
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  private extractPatientInfo(text: string, report: ParsedLabReport): void {
    // Extract patient ID
    const patientIdMatch = text.match(/Patient ID[:\s]*([A-Z0-9-]+)/i)
    if (patientIdMatch) {
      report.patientId = patientIdMatch[1]
    }
    
    // Extract patient name
    const nameMatch = text.match(/Patient Name[:\s]*([A-Za-z\s]+)/i)
    if (nameMatch) {
      report.patientName = nameMatch[1].trim()
    }
    
    // Extract date of birth
    const dobMatch = text.match(/Date of Birth[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
    if (dobMatch) {
      report.dateOfBirth = dobMatch[1]
    }
  }
  
  private extractLabResults(text: string, report: ParsedLabReport): void {
    // This is a basic implementation - will be enhanced with specific patterns
    const lines = text.split('\n')
    
    for (const line of lines) {
      // Look for patterns like "Test Name: Value Unit (Reference Range)"
      const resultMatch = line.match(/^([A-Za-z\s]+)[:\s]+([0-9.]+)\s*([A-Za-z%]+)\s*\(([0-9.-]+)\s*-\s*([0-9.-]+)\)/i)
      
      if (resultMatch) {
        const [, testName, value, unit, minRef, maxRef] = resultMatch
        const numValue = parseFloat(value)
        const minRefNum = parseFloat(minRef)
        const maxRefNum = parseFloat(maxRef)
        
        let status: LabResult['status'] = 'normal'
        if (numValue < minRefNum) status = 'low'
        else if (numValue > maxRefNum) status = 'high'
        
        report.results.push({
          testName: testName.trim(),
          value,
          unit,
          referenceRange: `${minRef} - ${maxRef}`,
          status,
          timestamp: new Date()
        })
      }
    }
  }
}

export default PDFLabParser
