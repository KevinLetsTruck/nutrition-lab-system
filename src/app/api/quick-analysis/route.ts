import { NextRequest, NextResponse } from 'next/server'
import { SupabaseStorageService } from '@/lib/supabase-storage'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import { TextractProcessor } from '@/lib/document-processors/textract-processor'
import ClaudeClient from '@/lib/claude-client'
import PDFLabParser from '@/lib/lab-analyzers/pdf-parser'
import { supabase } from '@/lib/supabase'

// Helper function to save analysis results to database
async function saveQuickAnalysisToDatabase(analysisResult: any, fileName: string, filePath: string) {
  try {
    const { data, error } = await supabase
      .from('quick_analyses')
      .insert({
        file_name: fileName,
        file_path: filePath,
        report_type: analysisResult.reportType,
        analysis_results: analysisResult.analyzedReport,
        extraction_method: analysisResult.extractionMethod,
        processing_time: analysisResult.processingTime,
        confidence: analysisResult.analyzedReport.confidence || 0.5,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[QUICK-ANALYSIS] Failed to save analysis to database:', error);
      return null;
    }

    console.log('[QUICK-ANALYSIS] Analysis saved to database with ID:', data.id);
    return data;
  } catch (error) {
    console.error('[QUICK-ANALYSIS] Error saving analysis to database:', error);
    return null;
  }
}

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
    
    // Determine the correct bucket - files are uploaded to lab-files for assessment PDFs
    const correctBucket = bucket === 'quick-analysis' ? 'lab-files' : bucket
    
    // Download the file from storage
    console.log(`[QUICK-ANALYSIS] Downloading file from bucket: ${correctBucket}, path: ${filePath}`)
    const fileBuffer = await storageService.downloadFile(correctBucket, filePath)
    
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
        
        // Use MasterAnalyzer for enhanced document classification and analysis
        const masterAnalyzer = MasterAnalyzer.getInstance()
        console.log('[QUICK-ANALYSIS] Starting MasterAnalyzer analysis with Textract text...')
        
        try {
          const masterAnalysisResult = await masterAnalyzer.analyzeReport(fileBuffer, fileName)
          console.log('[QUICK-ANALYSIS] Analysis completed with type:', masterAnalysisResult.reportType)
          
          analysisResult = {
            success: true,
            reportType: masterAnalysisResult.reportType,
            extractedData: extractedContent,
            analyzedReport: masterAnalysisResult,
            extractionMethod: 'textract',
            processingTime: Date.now() - startTime
          }
          
          // Save analysis results to database
          await saveQuickAnalysisToDatabase(analysisResult, fileName, filePath);
        } catch (analyzerError) {
          console.error('[QUICK-ANALYSIS] MasterAnalyzer failed:', analyzerError)
          throw new Error(`Analysis failed: ${analyzerError instanceof Error ? analyzerError.message : 'Unknown error'}`)
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
          // Check if vision analysis was already done
          if (parsedPDF.visionAnalysisText) {
            console.log('[QUICK-ANALYSIS] Using vision analysis text from PDF parser')
            parsedPDF.rawText = parsedPDF.visionAnalysisText
          } else {
            // If still no text, this means the PDF couldn't be processed
            throw new Error('Unable to extract text from PDF. The document may be corrupted or in an unsupported format.')
          }
        }
        
        // Use MasterAnalyzer for enhanced document classification and analysis
        const masterAnalyzer = MasterAnalyzer.getInstance()
        console.log('[QUICK-ANALYSIS] Starting MasterAnalyzer analysis with standard text...')
        
        try {
          const masterAnalysisResult = await masterAnalyzer.analyzeReport(fileBuffer, fileName)
          console.log('[QUICK-ANALYSIS] Analysis completed with type:', masterAnalysisResult.reportType)
          
          const analysisResult = {
            success: true,
            reportType: masterAnalysisResult.reportType,
            extractedData: {
              text: parsedPDF.rawText,
              tables: [],
              confidence: masterAnalysisResult.confidence
            },
            analyzedReport: masterAnalysisResult,
            extractionMethod: 'standard',
            processingTime: Date.now() - startTime
          }
          
          // Save analysis results to database
          await saveQuickAnalysisToDatabase(analysisResult, fileName, filePath);
          
          return NextResponse.json(analysisResult)
        } catch (analyzerError) {
          console.error('[QUICK-ANALYSIS] MasterAnalyzer failed:', analyzerError)
          throw new Error(`Analysis failed: ${analyzerError instanceof Error ? analyzerError.message : 'Unknown error'}`)
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