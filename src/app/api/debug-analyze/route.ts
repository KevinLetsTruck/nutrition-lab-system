import { NextRequest, NextResponse } from 'next/server'
import { loadFile } from '@/lib/file-utils'
import { PDFLabParser } from '@/lib/lab-analyzers/pdf-parser'
import ClaudeClient from '@/lib/claude-client'

export async function POST(request: NextRequest) {
  try {
    const { bucket, path } = await request.json()
    
    console.log('[DEBUG-ANALYZE] Starting debug analysis:', { bucket, path })
    
    // Step 1: Try to load the file
    // const { SupabaseStorageService } = require('@/lib/supabase-storage') // TODO: Replace
    const storageService = new SupabaseStorageService(true) // Use service role
    
    console.log('[DEBUG-ANALYZE] Attempting to download file...')
    const fileBuffer = await storageService.downloadFile(bucket, path)
    
    if (!fileBuffer) {
      return NextResponse.json({
        success: false,
        error: 'File not found',
        step: 'file_download'
      }, { status: 404 })
    }
    
    console.log('[DEBUG-ANALYZE] File downloaded successfully, size:', fileBuffer.length)
    
    // Step 2: Try to parse the PDF
    const parser = PDFLabParser.getInstance()
    let parsedData
    
    try {
      console.log('[DEBUG-ANALYZE] Parsing PDF...')
      parsedData = await parser.parseLabReport(fileBuffer)
      console.log('[DEBUG-ANALYZE] PDF parsed successfully:', {
        textLength: parsedData.rawText?.length || 0,
        hasImageContent: parsedData.hasImageContent,
        visionTextLength: parsedData.visionAnalysisText?.length || 0,
        combinedTextLength: parsedData.combinedText?.length || 0
      })
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: parseError instanceof Error ? parseError.message : 'PDF parsing failed',
        step: 'pdf_parsing',
        details: parseError instanceof Error ? parseError.stack : undefined
      }, { status: 500 })
    }
    
    // Step 3: Try to detect report type
    const claude = ClaudeClient.getInstance()
    let reportType
    
    try {
      console.log('[DEBUG-ANALYZE] Detecting report type...')
      const textForDetection = parsedData.combinedText || parsedData.rawText || ''
      
      // Check if we have enough text
      if (textForDetection.length < 50) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient text extracted from PDF',
          step: 'text_extraction',
          textLength: textForDetection.length,
          sampleText: textForDetection.substring(0, 100)
        }, { status: 500 })
      }
      
      reportType = await claude.detectReportType(textForDetection)
      console.log('[DEBUG-ANALYZE] Report type detected:', reportType)
    } catch (detectError) {
      return NextResponse.json({
        success: false,
        error: detectError instanceof Error ? detectError.message : 'Report type detection failed',
        step: 'report_type_detection',
        details: detectError instanceof Error ? detectError.stack : undefined,
        anthropicKeyPresent: !!process.env.ANTHROPIC_API_KEY
      }, { status: 500 })
    }
    
    // Return debug information
    return NextResponse.json({
      success: true,
      debug: {
        fileSize: fileBuffer.length,
        parsedTextLength: parsedData.rawText?.length || 0,
        hasImageContent: parsedData.hasImageContent,
        needsVision: parsedData.hasImageContent,
        visionTextLength: parsedData.visionAnalysisText?.length || 0,
        detectedReportType: reportType,
        sampleText: (parsedData.combinedText || parsedData.rawText || '').substring(0, 200),
        anthropicKeyPresent: !!process.env.ANTHROPIC_API_KEY
      }
    })
    
  } catch (error) {
    console.error('[DEBUG-ANALYZE] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'unexpected',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}