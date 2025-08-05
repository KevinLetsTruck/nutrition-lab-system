import { readFile } from 'fs/promises'
import path from 'path'
import { fromBuffer } from 'pdf2pic'
import ClaudeClient from '../claude-client'
import { parsePDFServerless, detectDocumentType } from '../pdf-parser-serverless'

// Dynamic import to avoid build-time issues with pdf-parse
let pdf: any = null

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production'

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
  // New fields for vision analysis
  hasImageContent?: boolean
  visionAnalysisText?: string
  combinedText?: string
}

export class PDFLabParser {
  private static instance: PDFLabParser
  private claudeClient: ClaudeClient
  
  private constructor() {
    this.claudeClient = ClaudeClient.getInstance()
  }
  
  static getInstance(): PDFLabParser {
    if (!PDFLabParser.instance) {
      PDFLabParser.instance = new PDFLabParser()
    }
    return PDFLabParser.instance
  }
  
  private async convertPDFToImages(pdfBuffer: Buffer, pageNumbers?: number[]): Promise<Array<{ base64: string; pageNumber: number }>> {
    console.log('[PDF-PARSER] Converting PDF to images...')
    
    try {
      // Check if we're in a serverless environment
      if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        console.log('[PDF-PARSER] Serverless environment detected - skipping image conversion')
        console.log('[PDF-PARSER] Image-based PDF analysis is not yet supported in production')
        return []
      }
      // Configure pdf2pic options
      const options = {
        density: 200,           // Higher density for better quality
        format: 'png',
        width: 2000,           // Max width to maintain quality
        height: 2800,          // Max height for standard pages
        preserveAspectRatio: true,
        saveFilename: 'page',  // Base filename for conversion
        savePath: './temp'     // Temporary path (we'll use buffer instead)
      }
      
      const converter = fromBuffer(pdfBuffer, options)
      const pageImages: Array<{ base64: string; pageNumber: number }> = []
      
      // Get page count first
      let pageCount = 1
      try {
        // Dynamic import to avoid build-time issues
        if (!pdf) {
          pdf = (await import('pdf-parse')).default
        }
        const pdfData = await pdf(pdfBuffer)
        pageCount = pdfData.numpages || 1
        console.log('[PDF-PARSER] PDF has', pageCount, 'pages')
      } catch (e) {
        console.log('[PDF-PARSER] Could not determine page count, assuming 1 page')
      }
      
      // Convert specific pages or all pages
      const pagesToConvert = pageNumbers || Array.from({ length: Math.min(pageCount, 10) }, (_, i) => i + 1) // Limit to first 10 pages
      
      for (const pageNum of pagesToConvert) {
        try {
          console.log('[PDF-PARSER] Converting page', pageNum)
          const result = await converter(pageNum)
          
          if (result) {
            // Handle different response formats from pdf2pic
            let base64: string
            if ((result as any).buffer) {
              base64 = Buffer.from((result as any).buffer).toString('base64')
            } else if ((result as any).base64) {
              base64 = (result as any).base64
            } else {
              console.log('[PDF-PARSER] Unexpected result format from pdf2pic:', Object.keys(result))
              continue
            }
            
            pageImages.push({
              base64,
              pageNumber: pageNum
            })
            console.log('[PDF-PARSER] Page', pageNum, 'converted successfully, size:', base64.length, 'chars')
          }
        } catch (pageError) {
          console.error('[PDF-PARSER] Failed to convert page', pageNum, ':', pageError)
        }
      }
      
      console.log('[PDF-PARSER] Successfully converted', pageImages.length, 'pages to images')
      return pageImages
      
    } catch (error) {
      console.error('[PDF-PARSER] PDF to image conversion failed:', error)
      throw new Error(`Failed to convert PDF to images: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  async parseLabReport(pdfBuffer: Buffer): Promise<ParsedLabReport> {
    console.log('[PDF-PARSER] ===== Starting PDF parsing =====')
    console.log('[PDF-PARSER] Buffer size:', pdfBuffer.length, 'bytes')
    console.log('[PDF-PARSER] Buffer size (KB):', (pdfBuffer.length / 1024).toFixed(2), 'KB')
    
    // Log first few bytes to check file type
    const headerBytes = pdfBuffer.slice(0, 10).toString('hex')
    console.log('[PDF-PARSER] File header (hex):', headerBytes)
    console.log('[PDF-PARSER] File header (ascii):', pdfBuffer.slice(0, 10).toString('ascii'))
    
    try {
      let text: string = ''
      let hasImageContent = false
      let visionAnalysisText: string | undefined
      
      // Check if this is a text file (for testing purposes)
      const bufferString = pdfBuffer.toString('utf8')
      if (bufferString.includes('NUTRIQ ASSESSMENT REPORT') || bufferString.includes('Patient Name:')) {
        // This appears to be a text file, use it directly
        console.log('[PDF-PARSER] Detected as text file, not PDF')
        text = bufferString
      } else {
        // Check if it's actually a PDF
        const isPDF = pdfBuffer.slice(0, 4).toString('ascii') === '%PDF'
        console.log('[PDF-PARSER] Is PDF format:', isPDF)
        
        // This is a PDF, parse it normally
        try {
          console.log('[PDF-PARSER] Parsing as PDF document...')
          
          // Use serverless parser in production
          if (isServerless) {
            console.log('[PDF-PARSER] Using serverless PDF parser (pdfjs-dist)...')
            try {
              const parsedPDF = await parsePDFServerless(pdfBuffer)
              text = parsedPDF.text
              console.log(`[PDF-PARSER] Serverless parsing complete. Pages: ${parsedPDF.pageCount}, Text length: ${text.length}`)
              
              // Detect if we need vision analysis based on text density
              const averageTextPerPage = text.length / parsedPDF.pageCount
              if (averageTextPerPage < 100) {
                console.log('[PDF-PARSER] Low text density detected, may contain images')
                hasImageContent = true
              }
              
              // Skip pdf-parse completely by setting text
              if (text.length > 50) {
                console.log('[PDF-PARSER] Serverless parser extracted sufficient text')
                // Continue to the rest of the parsing logic
              }
            } catch (serverlessError) {
              console.error('[PDF-PARSER] Serverless parsing failed, falling back to text extraction:', serverlessError)
              // Fall back to the existing text extraction method
              try {
                // Try to extract readable portions from the PDF buffer
                const bufferText = pdfBuffer.toString('latin1')
                const readableChunks = bufferText.match(/[\x20-\x7E\s]{20,}/g) || []
                const extractedText = readableChunks.join(' ').trim()
                
                if (extractedText.includes('NAQ') || extractedText.includes('Symptom') || extractedText.includes('NutriQ')) {
                  console.log('[PDF-PARSER] Found assessment keywords in buffer, using extracted text')
                  text = extractedText
                }
              } catch (e) {
                console.log('[PDF-PARSER] Text extraction attempt failed:', e instanceof Error ? e.message : 'Unknown error')
              }
            }
          }
          
          // Only run pdf-parse if we haven't extracted enough text AND not in serverless
          let data: any = null
          if ((!text || text.length < 100) && !isServerless) {
            // Dynamic import to avoid build-time issues
            if (!pdf) {
              pdf = (await import('pdf-parse')).default
            }
            data = await pdf(pdfBuffer)
            text = data.text
          }
          
          if (data) {
            console.log('[PDF-PARSER] PDF metadata:', {
              numpages: data.numpages || 0,
              numrender: data.numrender || 0,
              info: data.info || {},
              metadata: data.metadata ? Object.keys(data.metadata) : 'none',
              version: data.version || 'unknown'
            })
          }
          
          console.log('[PDF-PARSER] PDF parsed successfully')
          console.log('[PDF-PARSER] Extracted text length:', text.length, 'characters')
          
          // Check if we need vision analysis
          const needsVisionAnalysis = this.checkIfNeedsVisionAnalysis(text, data || { numpages: 1 })
          
          if (needsVisionAnalysis) {
            console.log('[PDF-PARSER] PDF needs vision analysis - using document API...')
            hasImageContent = true
            
            // Define systemPrompt outside try block so it's accessible in catch block
            const systemPrompt = `You are an expert at extracting information from nutrition lab reports. 
              Extract all text, data from charts, graphs, tables, and test results. 
              Pay special attention to:
              - Patient information (name, ID, date of birth)
              - Test dates and lab names
              - All numerical results with their units and reference ranges
              - Food sensitivity charts (IgG levels)
              - Hormone test results and patterns
              - Any graphs or visual data representations
              - NAQ/NutriQ symptom burden scores and graphs
              
              Format the extracted information as structured text that can be easily parsed.`
            
            try {
              // Use Claude's document API directly with the PDF
              console.log('[PDF-PARSER] Sending PDF to Claude Document API...')
              
              // Convert PDF buffer to base64 for Claude document API
              const pdfBase64 = pdfBuffer.toString('base64')
              
              const documentPrompt = `Please analyze this PDF document and extract all relevant information, especially focusing on NAQ/NutriQ assessment data, symptom burden scores, and any visual charts or graphs.`
              
              visionAnalysisText = await this.claudeClient.analyzeWithDocument(
                documentPrompt,
                {
                  type: 'document',
                  source: {
                    type: 'base64',
                    media_type: 'application/pdf',
                    data: pdfBase64
                  }
                },
                systemPrompt
              )
              
              console.log('[PDF-PARSER] Document API analysis complete, extracted text length:', visionAnalysisText.length)
            } catch (visionError) {
              console.error('[PDF-PARSER] Document API analysis failed:', visionError)
              console.error('[PDF-PARSER] Document API error details:', {
                message: visionError instanceof Error ? visionError.message : 'Unknown error',
                anthropicKey: !!process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing'
              })
              
              // Fallback to image-based analysis if document API fails
              console.log('[PDF-PARSER] Falling back to image-based analysis...')
              try {
                const pageImages = await this.convertPDFToImages(pdfBuffer)
                
                if (pageImages.length > 0) {
                  visionAnalysisText = await this.claudeClient.analyzePDFPagesAsImages(
                    pageImages,
                    systemPrompt,
                    text
                  )
                  console.log('[PDF-PARSER] Image-based analysis complete, extracted text length:', visionAnalysisText.length)
                }
              } catch (imageError) {
                console.error('[PDF-PARSER] Image-based analysis also failed:', imageError)
                
                // For NAQ/NutriQ files, we can often continue with text-only
                if (text && text.length > 100) {
                  console.log('[PDF-PARSER] Continuing with text-only analysis (sufficient text available)')
                  visionAnalysisText = '' // No vision text, but we have regular text
                } else {
                  // If we have very little text and vision failed, this is a problem
                  throw new Error(`Vision analysis required but failed: ${visionError instanceof Error ? visionError.message : 'Unknown error'}`)
                }
              }
            }
          }
        } catch (pdfError) {
          // Try alternative parsing methods
          console.error('[PDF-PARSER] Primary PDF parsing failed')
          console.error('[PDF-PARSER] Error type:', pdfError?.constructor?.name)
          console.error('[PDF-PARSER] Error message:', pdfError instanceof Error ? pdfError.message : pdfError)
          
          // Check if it's a corrupted or password-protected PDF
          if (pdfError instanceof Error) {
            console.error('[PDF-PARSER] Error details:', {
              message: pdfError.message,
              name: pdfError.name,
              stack: pdfError.stack?.split('\n').slice(0, 5).join('\n')
            })
            
            if (pdfError.message.includes('Invalid PDF structure') || pdfError.message.includes('Invalid XRef stream header')) {
              throw new Error('The PDF file appears to be corrupted or has an invalid structure. Please try uploading a different file.')
            }
            if (pdfError.message.includes('password')) {
              throw new Error('The PDF file is password-protected. Please remove the password and try again.')
            }
            if (pdfError.message.includes('encrypted')) {
              throw new Error('The PDF file is encrypted. Please upload an unencrypted version.')
            }
          }
          
          // Try to convert to images anyway
          console.log('[PDF-PARSER] Attempting image-based extraction as fallback...')
          hasImageContent = true
          
          // For production environment, sometimes pdf-parse fails on valid PDFs
          // Set a flag to indicate we should rely on vision analysis
          text = '' // Clear any partial text
          console.log('[PDF-PARSER] Treating as image-only PDF due to parsing error')
          
          try {
            const pageImages = await this.convertPDFToImages(pdfBuffer)
            
            if (pageImages.length > 0) {
              const systemPrompt = `You are an expert at extracting information from scanned nutrition lab reports. 
              This appears to be a scanned or image-based PDF. Extract ALL visible text and data.`
              
              visionAnalysisText = await this.claudeClient.analyzePDFPagesAsImages(
                pageImages,
                systemPrompt
              )
              
              text = visionAnalysisText || ''
              console.log('[PDF-PARSER] Successfully extracted text via vision, length:', text.length)
            } else {
              throw new Error('Unable to convert PDF to images for analysis')
            }
          } catch (fallbackError) {
            console.error('[PDF-PARSER] Image-based extraction also failed:', fallbackError)
            console.error('[PDF-PARSER] Fallback error details:', {
              message: fallbackError instanceof Error ? fallbackError.message : 'Unknown',
              type: fallbackError?.constructor?.name
            })
            
            // Last resort: For NAQ/NutriQ files, we can still try to analyze with minimal text
            if (text && text.includes('NAQ')) {
              console.log('[PDF-PARSER] Found NAQ content, proceeding with minimal text')
              // Continue with what we have
            } else {
              throw new Error('Unable to extract content from the PDF. The file might be corrupted or in an unsupported format.')
            }
          }
        }
      }
      
      // Combine text from both sources if we have both
      const combinedText = this.combineTextSources(text, visionAnalysisText)
      
      console.log('[PDF-PARSER] Text extraction complete')
      console.log('[PDF-PARSER] Combined text length:', combinedText.length, 'characters')
      console.log('[PDF-PARSER] First 300 chars:', combinedText.substring(0, 300).replace(/\n/g, ' '))
      
      // Basic parsing - this will be enhanced with specific lab analyzers
      const parsedReport: ParsedLabReport = {
        testDate: new Date(),
        results: [],
        rawText: combinedText,
        hasImageContent,
        visionAnalysisText,
        combinedText
      }
      
      // Extract basic information using regex patterns
      this.extractPatientInfo(combinedText, parsedReport)
      this.extractLabResults(combinedText, parsedReport)
      
      console.log('[PDF-PARSER] Report parsed successfully:', {
        hasPatientId: !!parsedReport.patientId,
        hasPatientName: !!parsedReport.patientName,
        hasDateOfBirth: !!parsedReport.dateOfBirth,
        resultsCount: parsedReport.results.length,
        textLength: combinedText.length,
        hasImageContent,
        usedVisionAnalysis: !!visionAnalysisText
      })
      
      console.log('[PDF-PARSER] ===== PDF parsing complete =====')
      
      return parsedReport
    } catch (error) {
      console.error('[PDF-PARSER] ===== Fatal parsing error =====')
      console.error('[PDF-PARSER] Error:', error)
      
      // Log the actual error for debugging
      console.error('[PDF-PARSER] Raw error:', error)
      console.error('[PDF-PARSER] Error type:', error?.constructor?.name)
      console.error('[PDF-PARSER] Error message:', error instanceof Error ? error.message : 'Unknown error')
      
      // Provide more user-friendly error messages - but be more specific about corruption
      if (error instanceof Error) {
        // Only treat as corrupted if it's explicitly a corruption error from pdf-parse
        if (error.message.includes('Invalid PDF structure') || error.message.includes('Invalid XRef stream header')) {
          throw new Error('PDF file appears to be corrupted. Please try uploading a different file.')
        }
        if (error.message.includes('password') || error.message.includes('Password required')) {
          throw new Error('PDF file is password-protected. Please remove the password and try again.')
        }
        if (error.message.includes('encrypted') || error.message.includes('Encrypted')) {
          throw new Error('PDF file is encrypted. Please upload an unencrypted version.')
        }
        if (error.message.includes('empty') || error.message.includes('no readable text')) {
          throw new Error('PDF file appears to be empty or contains no readable text. Please check the file and try again.')
        }
        if (error.message.includes('image-based')) {
          throw new Error('PDF appears to be image-based (scanned). Please upload a text-based PDF or use OCR to convert it first.')
        }
      }
      
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
    if (nameMatch && nameMatch[1]) {
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
          testName: testName?.trim() || '',
          value,
          unit,
          referenceRange: `${minRef} - ${maxRef}`,
          status,
          timestamp: new Date()
        })
      }
    }
  }

  private checkIfNeedsVisionAnalysis(text: string, pdfData: any): boolean {
    // Check various conditions that indicate we need vision analysis
    const conditions = [
      text?.trim().length < 100,                            // Very little text extracted
      text.split('\n').length < 10,                        // Very few lines
      !text.match(/[a-zA-Z]{5,}/g),                       // No meaningful words
      text.toLowerCase().includes('image'),                // References to images
      text.toLowerCase().includes('chart'),                // References to charts
      text.toLowerCase().includes('graph'),                // References to graphs
      (pdfData.numpages > 0 && text.length / pdfData.numpages < 200), // Low text per page ratio
      !text.match(/\d+\.?\d*/g) || text.match(/\d+\.?\d*/g)!.length < 5  // Very few numbers
    ]
    
    const needsVision = conditions.some(condition => condition)
    
    if (needsVision) {
      console.log('[PDF-PARSER] Vision analysis needed - conditions met:', 
        conditions.map((c, i) => c ? i : null).filter(i => i !== null)
      )
    }
    
    return needsVision
  }
  
  private combineTextSources(textExtract: string, visionExtract?: string): string {
    if (!visionExtract) {
      return textExtract
    }
    
    if (!textExtract || textExtract?.trim().length < 50) {
      return visionExtract
    }
    
    // If we have both, combine them intelligently
    // Vision extract usually has better structure, so prioritize it
    return `${visionExtract}\n\n--- Additional Text Extract ---\n${textExtract}`
  }
}

export default PDFLabParser
