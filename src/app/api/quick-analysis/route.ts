import { NextRequest, NextResponse } from 'next/server'
import { SupabaseStorageService } from '@/lib/supabase-storage-service'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import { TextractProcessor } from '@/lib/document-processors/textract-processor'
import { ClaudeClient } from '@/lib/claude-client'
import PDFLabParser from '@/lib/lab-analyzers/pdf-parser'

export async function POST(request: NextRequest) {
  console.log('[QUICK-ANALYSIS] ========== Starting quick analysis request ==========')
  const startTime = Date.now()
  
  try {
    const { filePath, fileName, bucket } = await request.json()
    
    console.log('[QUICK-ANALYSIS] Request params:', { 
      filePath,
      fileName,
      bucket
    })
    
    // Initialize storage service with service role for full access
    const storageService = new SupabaseStorageService(true)
    
    // Download the file from storage
    console.log(`[QUICK-ANALYSIS] Downloading file from bucket: ${bucket}, path: ${filePath}`)
    const fileBuffer = await storageService.downloadFile(bucket, filePath)
    
    if (!fileBuffer) {
      console.error('[QUICK-ANALYSIS] File not found in storage')
      return NextResponse.json(
        { error: 'File not found in storage' },
        { status: 404 }
      )
    }
    
    console.log('[QUICK-ANALYSIS] File downloaded successfully, size:', fileBuffer.length)
    
    // Check if AWS Textract is configured
    const hasTextract = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    let analysisResult
    
    if (hasTextract) {
      console.log('[QUICK-ANALYSIS] Using AWS Textract for analysis')
      
      try {
        // Use Textract for better accuracy with scanned PDFs
        const textractProcessor = new TextractProcessor()
        const extractedContent = await textractProcessor.extractFromDocument(fileBuffer)
        
        console.log('[QUICK-ANALYSIS] Textract extraction complete, text length:', extractedContent.text.length)
        
        // Detect report type using Claude
        const claudeClient = ClaudeClient.getInstance()
        const reportType = await claudeClient.detectReportType(extractedContent.text)
        
        console.log('[QUICK-ANALYSIS] Detected report type:', reportType)
        
        // Analyze using master analyzer
        const analyzer = new MasterAnalyzer()
        const analyzedReport = await analyzer.analyzeReport(extractedContent.text, reportType)
        
        analysisResult = {
          success: true,
          reportType,
          extractedData: extractedContent,
          analyzedReport,
          extractionMethod: 'textract',
          processingTime: Date.now() - startTime
        }
      } catch (textractError) {
        console.error('[QUICK-ANALYSIS] Textract processing failed:', textractError)
        // Fall back to standard processing
        hasTextract && console.log('[QUICK-ANALYSIS] Falling back to standard processing')
      }
    }
    
    // If Textract is not available or failed, use standard processing
    if (!analysisResult) {
      console.log('[QUICK-ANALYSIS] Using standard PDF processing')
      
      try {
        // First try to extract text
        const parser = PDFLabParser.getInstance()
        const parsedPDF = await parser.parseLabReport(fileBuffer)
        
        if (!parsedPDF.rawText || parsedPDF.rawText.trim().length === 0) {
          // If no text extracted, try Claude Vision
          console.log('[QUICK-ANALYSIS] No text extracted, trying Claude Vision')
          const claudeClient = ClaudeClient.getInstance()
          
          // Convert PDF to images for vision analysis
          const images = parsedPDF.images || []
          if (images.length === 0) {
            throw new Error('Unable to extract text or images from PDF')
          }
          
          // Use Claude Vision to extract text
          const visionResult = await claudeClient.analyzeLabImages(
            images.map(img => img.base64),
            { filename: fileName }
          )
          
          parsedPDF.rawText = visionResult.extractedText || ''
        }
        
        // Detect report type
        const claudeClient = ClaudeClient.getInstance()
        const reportType = await claudeClient.detectReportType(parsedPDF.rawText)
        
        console.log('[QUICK-ANALYSIS] Detected report type:', reportType)
        
        // Analyze using master analyzer
        const analyzer = new MasterAnalyzer()
        const analyzedReport = await analyzer.analyzeReport(parsedPDF.rawText, reportType)
        
        analysisResult = {
          success: true,
          reportType,
          extractedData: {
            text: parsedPDF.rawText,
            tables: parsedPDF.tables || [],
            confidence: 0.8
          },
          analyzedReport,
          extractionMethod: 'standard',
          processingTime: Date.now() - startTime
        }
      } catch (standardError) {
        console.error('[QUICK-ANALYSIS] Standard processing failed:', standardError)
        throw standardError
      }
    }
    
    console.log('[QUICK-ANALYSIS] Analysis completed successfully')
    console.log('[QUICK-ANALYSIS] Processing time:', analysisResult.processingTime, 'ms')
    
    return NextResponse.json(analysisResult)
    
  } catch (error) {
    console.error('[QUICK-ANALYSIS] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Quick analysis failed',
        details: errorMessage
      },
      { status: 500 }
    )
  } finally {
    console.log('[QUICK-ANALYSIS] ========== Request completed ==========')
  }
}