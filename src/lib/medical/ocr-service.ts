import Tesseract from 'tesseract.js'
import { createWorker } from 'tesseract.js'
import pdf2pic from 'pdf2pic'
import * as pdfParse from 'pdf-parse'
// import mammoth from 'mammoth' // Reserved for future Word document support
import { prisma } from '@/lib/db/prisma'
import { medicalDocStorage } from './storage-service'

interface OCRResult {
  text: string
  confidence: number
  processingTime: number
  method: 'tesseract' | 'pdf-text' | 'hybrid'
  pageCount?: number
  wordCount: number
}

interface DocumentProcessingResult {
  ocrResult: OCRResult
  documentType: string
  labSource?: string
  extractedData?: any
}

export class MedicalOCRService {
  private tesseractWorker: Tesseract.Worker | null = null

  async initializeTesseract(): Promise<void> {
    if (this.tesseractWorker) return

    console.log('🔧 Initializing Tesseract OCR worker...')
    this.tesseractWorker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`📖 OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      }
    })
    
    // Optimize for medical documents
    await this.tesseractWorker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,()[]/-+= :;%<>',
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      preserve_interword_spaces: '1'
    })
    
    console.log('✅ Tesseract worker initialized')
  }

  async processDocument(documentId: string): Promise<DocumentProcessingResult> {
    const startTime = Date.now()
    console.log(`🔍 Starting OCR processing for document: ${documentId}`)

    try {
      // Update status to processing
      await prisma.medicalDocument.update({
        where: { id: documentId },
        data: { status: 'PROCESSING' }
      })

      // Get document details
      const document = await prisma.medicalDocument.findUnique({
        where: { id: documentId }
      })

      if (!document) {
        throw new Error('Document not found')
      }

      console.log(`📄 Processing: ${document.originalFileName} (${document.documentType})`)

      // Get signed URL for processing
      const fileUrl = await medicalDocStorage.getSignedDownloadUrl(document.s3Key!)
      
      // Determine processing method based on file type
      const mimeType = document.metadata?.mimeType as string
      let ocrResult: OCRResult

      if (mimeType === 'application/pdf') {
        ocrResult = await this.processPDF(fileUrl, document.originalFileName)
      } else if (mimeType?.startsWith('image/')) {
        ocrResult = await this.processImage(fileUrl)
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`)
      }

      // Classify document based on extracted text
      const { documentType, labSource, extractedData } = await this.classifyDocument(
        ocrResult.text,
        document.originalFileName
      )

      // Update database with results
      await prisma.medicalDocument.update({
        where: { id: documentId },
        data: {
          ocrText: ocrResult.text,
          ocrConfidence: ocrResult.confidence,
          documentType: documentType,
          status: 'COMPLETED',
          processedAt: new Date(),
          metadata: {
            ...document.metadata,
            ocrMethod: ocrResult.method,
            processingTime: ocrResult.processingTime,
            wordCount: ocrResult.wordCount,
            pageCount: ocrResult.pageCount,
            labSource,
            classificationConfidence: extractedData?.confidence || 0
          }
        }
      })

      const totalTime = Date.now() - startTime
      console.log(`✅ OCR processing complete: ${documentId} (${totalTime}ms)`)

      return {
        ocrResult,
        documentType,
        labSource,
        extractedData
      }

    } catch (error) {
      console.error('❌ OCR processing error:', error)
      
      await prisma.medicalDocument.update({
        where: { id: documentId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'OCR processing failed'
        }
      })
      
      throw error
    }
  }

  private async processPDF(fileUrl: string, filename: string): Promise<OCRResult> {
    console.log('📑 Processing PDF document...')
    const startTime = Date.now()

    try {
      // First try to extract text directly from PDF
      const response = await fetch(fileUrl)
      const buffer = await response.arrayBuffer()
      
      const pdfData = await pdfParse(Buffer.from(buffer))
      
      if (pdfData.text && pdfData.text.trim().length > 100) {
        // PDF has extractable text
        console.log(`📝 Extracted text directly from PDF: ${pdfData.text.length} characters`)
        
        return {
          text: pdfData.text,
          confidence: 0.95, // High confidence for direct text extraction
          processingTime: Date.now() - startTime,
          method: 'pdf-text',
          pageCount: pdfData.numpages,
          wordCount: pdfData.text.split(/\s+/).length
        }
      } else {
        // PDF is scanned, need OCR
        console.log('🖼️ PDF appears to be scanned, converting to images for OCR...')
        return await this.processPDFWithOCR(buffer, filename)
      }
    } catch (error) {
      console.warn('⚠️ Direct PDF text extraction failed, falling back to OCR:', error)
      const response = await fetch(fileUrl)
      const buffer = await response.arrayBuffer()
      return await this.processPDFWithOCR(Buffer.from(buffer), filename)
    }
  }

  private async processPDFWithOCR(pdfBuffer: Buffer, filename: string): Promise<OCRResult> {
    const startTime = Date.now()
    
    try {
      // Convert PDF to images
      const convert = pdf2pic.fromBuffer(pdfBuffer, {
        density: 200, // DPI
        saveFilename: "page",
        savePath: "/tmp",
        format: "png",
        width: 2000,
        height: 2000
      })

      // Convert first few pages (limit for performance)
      const maxPages = 5
      const pageImages = []
      
      for (let i = 1; i <= maxPages; i++) {
        try {
          const page = await convert(i, { responseType: "buffer" })
          pageImages.push(page.buffer)
        } catch (pageError) {
          // No more pages
          break
        }
      }

      console.log(`🖼️ Converted ${pageImages.length} PDF pages to images`)

      // Process each page with OCR
      await this.initializeTesseract()
      const pageTexts: string[] = []
      const confidences: number[] = []

      for (let i = 0; i < pageImages.length; i++) {
        console.log(`📖 Processing page ${i + 1}/${pageImages.length}...`)
        
        const result = await this.tesseractWorker!.recognize(pageImages[i])
        pageTexts.push(result.data.text)
        confidences.push(result.data.confidence)
      }

      const combinedText = pageTexts.join('\n\n--- PAGE BREAK ---\n\n')
      const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length

      return {
        text: combinedText,
        confidence: avgConfidence / 100, // Tesseract returns 0-100, normalize to 0-1
        processingTime: Date.now() - startTime,
        method: 'tesseract',
        pageCount: pageImages.length,
        wordCount: combinedText.split(/\s+/).length
      }

    } catch (error) {
      console.error('❌ PDF OCR processing failed:', error)
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async processImage(imageUrl: string): Promise<OCRResult> {
    console.log('🖼️ Processing image document...')
    const startTime = Date.now()

    try {
      await this.initializeTesseract()
      
      const result = await this.tesseractWorker!.recognize(imageUrl)
      
      return {
        text: result.data.text,
        confidence: result.data.confidence / 100, // Normalize to 0-1
        processingTime: Date.now() - startTime,
        method: 'tesseract',
        pageCount: 1,
        wordCount: result.data.text.split(/\s+/).length
      }
    } catch (error) {
      console.error('❌ Image OCR processing failed:', error)
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async classifyDocument(text: string, filename: string): Promise<{
    documentType: string
    labSource?: string
    extractedData?: any
  }> {
    console.log('🏷️ Classifying document type...')
    
    const lowerText = text.toLowerCase()
    const lowerFilename = filename.toLowerCase()

    // Lab company identification patterns
    const labPatterns = {
      'labcorp': [
        'labcorp', 'laboratory corporation', 'lab corp',
        'lcdf', 'labcorp diagnostics'
      ],
      'quest': [
        'quest diagnostics', 'quest labs', 'questlabs',
        'quest diagnostic', 'quest lab'
      ],
      'nutri-q': [
        'nutri-q', 'nutriq', 'nutritional assessment questionnaire',
        'naq', 'nutri q'
      ],
      'kbmo': [
        'kbmo diagnostics', 'kbmo', 'food inflammation test',
        'fit test', 'kbmo fit'
      ],
      'dutch': [
        'dutch test', 'dried urine', 'precision analytical',
        'dutch complete', 'dutch plus'
      ],
      'genova': [
        'genova diagnostics', 'genova', 'gdx',
        'comprehensive digestive stool analysis'
      ],
      'gi-map': [
        'gi-map', 'gi map', 'gastrointestinal microbial',
        'diagnostic solutions'
      ],
      'organic_acids': [
        'organic acids test', 'oat test', 'great plains',
        'organic acid test', 'metabolic analysis'
      ]
    }

    // Document type patterns
    const typePatterns = {
      'comprehensive_metabolic_panel': [
        'comprehensive metabolic panel', 'cmp', 'basic metabolic',
        'glucose', 'creatinine', 'bun', 'sodium', 'potassium'
      ],
      'lipid_panel': [
        'lipid panel', 'cholesterol', 'triglycerides', 'hdl', 'ldl',
        'lipid profile'
      ],
      'thyroid_panel': [
        'thyroid', 'tsh', 'free t4', 'free t3', 't3 reverse',
        'thyroid stimulating hormone'
      ],
      'cbc_differential': [
        'complete blood count', 'cbc', 'differential', 'white blood cell',
        'hemoglobin', 'hematocrit', 'platelet'
      ],
      'hormone_panel': [
        'hormone', 'testosterone', 'estrogen', 'progesterone',
        'cortisol', 'dhea', 'sex hormone'
      ],
      'food_sensitivity': [
        'food sensitivity', 'food allergy', 'ige', 'igg',
        'food panel', 'allergen'
      ],
      'stool_analysis': [
        'stool analysis', 'stool test', 'parasitology',
        'digestive', 'microbiome', 'gut health'
      ],
      'nutrient_analysis': [
        'vitamin', 'mineral', 'b12', 'folate', 'iron',
        'nutrient', 'deficiency'
      ]
    }

    // Identify lab source
    let labSource: string | undefined
    let maxLabMatches = 0

    for (const [lab, patterns] of Object.entries(labPatterns)) {
      const matches = patterns.filter(pattern => 
        lowerText.includes(pattern) || lowerFilename.includes(pattern)
      ).length
      
      if (matches > maxLabMatches) {
        maxLabMatches = matches
        labSource = lab
      }
    }

    // Identify document type
    let documentType = 'unknown'
    let maxTypeMatches = 0

    for (const [type, patterns] of Object.entries(typePatterns)) {
      const matches = patterns.filter(pattern => lowerText.includes(pattern)).length
      
      if (matches > maxTypeMatches) {
        maxTypeMatches = matches
        documentType = type
      }
    }

    // Special case: If it's a NutriQ document, classify as such
    if (labSource === 'nutri-q') {
      documentType = 'nutriq_assessment'
    }

    const confidence = Math.max(maxLabMatches, maxTypeMatches) / 10 // Normalize

    console.log(`🏷️ Classification result: ${documentType} from ${labSource || 'unknown'} (confidence: ${confidence.toFixed(2)})`)

    return {
      documentType,
      labSource,
      extractedData: {
        confidence,
        labMatches: maxLabMatches,
        typeMatches: maxTypeMatches,
        textLength: text.length
      }
    }
  }

  async cleanup(): Promise<void> {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate()
      this.tesseractWorker = null
      console.log('🧹 Tesseract worker terminated')
    }
  }
}

// Export singleton instance
export const medicalOCRService = new MedicalOCRService()

// Cleanup on process exit
process.on('exit', () => {
  medicalOCRService.cleanup()
})
