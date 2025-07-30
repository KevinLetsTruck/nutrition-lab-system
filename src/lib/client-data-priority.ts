export interface ClientData {
  clientName: string
  clientEmail?: string
  clientFirstName?: string
  clientLastName?: string
  assessmentDate?: Date
  dataSource: 'PDF_PRIORITY' | 'FORM_ENTRY' | 'MERGED'
  formOverride?: string // Keep track of what was overridden
}

export interface PDFExtractedData {
  clientName?: string
  assessmentDate?: Date
  systemScores?: any
  rawText: string
}

export interface FormData {
  clientName: string
  clientEmail: string
  clientFirstName: string
  clientLastName: string
  assessmentDate?: Date
}

export class ClientDataPriorityService {
  private static instance: ClientDataPriorityService

  private constructor() {}

  static getInstance(): ClientDataPriorityService {
    if (!ClientDataPriorityService.instance) {
      ClientDataPriorityService.instance = new ClientDataPriorityService()
    }
    return ClientDataPriorityService.instance
  }

  /**
   * Process client data with PDF priority logic
   * PDF client name takes priority over form entry when there's a mismatch
   */
  processClientData(formData: FormData, pdfData: PDFExtractedData): ClientData {
    console.log('=== CLIENT DATA PRIORITY DEBUG ===')
    console.log('Form client name:', formData.clientName)
    console.log('PDF client name:', pdfData.clientName)
    console.log('PDF system scores:', pdfData.systemScores)

    // Extract client name from PDF first
    const pdfClientName = this.extractClientNameFromPDF(pdfData.rawText)
    
    if (pdfClientName && pdfClientName !== formData.clientName) {
      // PDF has different client - use PDF data with priority
      console.log(`Using PDF client: ${pdfClientName} instead of form entry: ${formData.clientName}`)
      
      return {
        clientName: pdfClientName,
        clientEmail: formData.clientEmail,
        clientFirstName: this.extractFirstName(pdfClientName),
        clientLastName: this.extractLastName(pdfClientName),
        assessmentDate: pdfData.assessmentDate || formData.assessmentDate,
        dataSource: 'PDF_PRIORITY',
        formOverride: formData.clientName // Keep for reference
      }
    }
    
    // Use form data if no PDF client or they match
    return {
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientFirstName: formData.clientFirstName,
      clientLastName: formData.clientLastName,
      assessmentDate: pdfData.assessmentDate || formData.assessmentDate,
      dataSource: 'FORM_ENTRY'
    }
  }

  /**
   * Extract client name from PDF text using multiple patterns
   */
  private extractClientNameFromPDF(rawText: string): string | null {
    const namePatterns = [
      /Patient Name[:\s]*([A-Za-z\s]+)/i,
      /Name[:\s]*([A-Za-z\s]+)/i,
      /Client Name[:\s]*([A-Za-z\s]+)/i,
      /Patient[:\s]*([A-Za-z\s]+)/i
    ]

    for (const pattern of namePatterns) {
      const match = rawText.match(pattern)
      if (match && match[1]) {
        const extractedName = match[1].trim()
        // Validate that it looks like a real name (not empty, has letters)
        if (extractedName && /[A-Za-z]/.test(extractedName)) {
          console.log(`Extracted client name from PDF: "${extractedName}"`)
          return extractedName
        }
      }
    }

    console.log('No client name found in PDF text')
    return null
  }

  /**
   * Extract first name from full name
   */
  private extractFirstName(fullName: string): string {
    const parts = fullName?.trim().split(/\s+/) || []
    return parts[0] || ''
  }

  /**
   * Extract last name from full name
   */
  private extractLastName(fullName: string): string {
    const parts = fullName?.trim().split(/\s+/) || []
    return parts.length > 1 ? parts.slice(1).join(' ') : ''
  }

  /**
   * Get analysis data with correct client association
   */
  getAnalysisData(clientData: ClientData, pdfData: PDFExtractedData): any {
    return {
      clientName: clientData.clientName,
      clientEmail: clientData.clientEmail,
      assessmentDate: clientData.assessmentDate,
      systemScores: pdfData.systemScores,
      dataSource: clientData.dataSource,
      formOverride: clientData.formOverride
    }
  }

  /**
   * Create user-friendly message about data source
   */
  getDataSourceMessage(clientData: ClientData): string {
    if (clientData.dataSource === 'PDF_PRIORITY') {
      return `✓ Using client name from PDF: ${clientData.clientName}${clientData.formOverride ? ` (overrode form entry: ${clientData.formOverride})` : ''}`
    } else if (clientData.dataSource === 'FORM_ENTRY') {
      return `✓ Using client name from form: ${clientData.clientName}`
    } else {
      return `✓ Using merged client data: ${clientData.clientName}`
    }
  }

  /**
   * Validate that we have sufficient data for analysis
   */
  validateAnalysisData(clientData: ClientData, pdfData: PDFExtractedData): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    if (!clientData.clientName) {
      issues.push('No client name available')
    }

    if (!pdfData.systemScores) {
      issues.push('No system scores found in PDF')
    }

    if (!pdfData.rawText || pdfData.rawText.length < 100) {
      issues.push('Insufficient text extracted from PDF')
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }
}

export default ClientDataPriorityService 