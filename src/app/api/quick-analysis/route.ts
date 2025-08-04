import { NextRequest, NextResponse } from 'next/server'
import { SupabaseStorageService } from '@/lib/supabase-storage'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import { TextractProcessor } from '@/lib/document-processors/textract-processor'
import ClaudeClient from '@/lib/claude-client'
import PDFLabParser from '@/lib/lab-analyzers/pdf-parser'
import { supabase } from '@/lib/supabase'
import { PDFRepairUtility } from '@/lib/pdf-repair-utility'

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
    console.log('[QUICK-ANALYSIS] AWS Textract check:', {
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasTextract: hasTextract
    })
    let analysisResult
    
    // Always try Textract first for better OCR on image-based PDFs
    if (hasTextract) {
      console.log('[QUICK-ANALYSIS] Using AWS Textract for analysis')
      
      try {
        // First try to repair the PDF for Textract compatibility
        console.log('[QUICK-ANALYSIS] Attempting PDF repair for Textract compatibility...')
        const repairResult = await PDFRepairUtility.repairPDFForTextract(fileBuffer)
        
        let textractBuffer = fileBuffer;
        if (repairResult.success && repairResult.repairedBuffer) {
          console.log(`[QUICK-ANALYSIS] PDF repaired using ${repairResult.method}`);
          textractBuffer = repairResult.repairedBuffer;
        } else {
          console.log('[QUICK-ANALYSIS] PDF repair failed, using original buffer');
        }
        
        // Use Textract for better accuracy with scanned PDFs
        console.log('[QUICK-ANALYSIS] Creating TextractProcessor...')
        const textractProcessor = new TextractProcessor()
        console.log('[QUICK-ANALYSIS] TextractProcessor created, starting extraction...')
        
        const extractedContent = await textractProcessor.extractFromDocument(textractBuffer)
        
        console.log('[QUICK-ANALYSIS] Textract extraction complete, text length:', extractedContent.text.length)
        console.log('[QUICK-ANALYSIS] Textract confidence:', extractedContent.confidence)
        console.log('[QUICK-ANALYSIS] Textract pages:', extractedContent.pageCount)
        
        // Use MasterAnalyzer for enhanced document classification and analysis
        const masterAnalyzer = MasterAnalyzer.getInstance()
        console.log('[QUICK-ANALYSIS] Starting MasterAnalyzer analysis with Textract text...')
        
        try {
          // Create a text buffer from the extracted content for analysis
          const textBuffer = Buffer.from(extractedContent.text, 'utf-8')
          const masterAnalysisResult = await masterAnalyzer.analyzeReport(textBuffer, fileName)
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
        console.error('[QUICK-ANALYSIS] Textract error details:', textractError instanceof Error ? textractError.message : 'Unknown error')
        console.error('[QUICK-ANALYSIS] Textract error stack:', textractError instanceof Error ? textractError.stack : 'No stack trace')
        
        // Try Claude Vision as fallback for image-based PDFs
        console.log('[QUICK-ANALYSIS] Textract failed, trying Claude Vision as fallback...')
        try {
          // Use the PDF parser to convert PDF to images and analyze with Claude Vision
          const parser = PDFLabParser.getInstance()
          const parsedPDF = await parser.parseLabReport(fileBuffer)
          
          if (parsedPDF.visionAnalysisText) {
            console.log('[QUICK-ANALYSIS] Using vision analysis text from PDF parser')
            
            // Use MasterAnalyzer to analyze the vision-extracted text
            const masterAnalyzer = MasterAnalyzer.getInstance()
            const textBuffer = Buffer.from(parsedPDF.visionAnalysisText, 'utf-8')
            const masterAnalysisResult = await masterAnalyzer.analyzeReport(textBuffer, fileName)
            
            analysisResult = {
              success: true,
              reportType: masterAnalysisResult.reportType,
              extractedData: {
                text: parsedPDF.visionAnalysisText,
                tables: [],
                confidence: 0.8
              },
              analyzedReport: masterAnalysisResult,
              extractionMethod: 'claude_vision',
              processingTime: Date.now() - startTime
            }
            
            // Save analysis results to database
            await saveQuickAnalysisToDatabase(analysisResult, fileName, filePath);
            
          } else {
            throw new Error('No vision analysis text available')
          }
          
        } catch (visionError) {
          console.error('[QUICK-ANALYSIS] Claude Vision also failed:', visionError)
          throw new Error(`Both Textract and Claude Vision failed. Textract: ${textractError instanceof Error ? textractError.message : 'Unknown error'}. Vision: ${visionError instanceof Error ? visionError.message : 'Unknown error'}`)
        }
      }
    }
    
    // If Textract is not available or failed, use standard processing
    if (!analysisResult) {
      console.log('[QUICK-ANALYSIS] Textract not available or failed, using standard PDF processing')
      console.log('[QUICK-ANALYSIS] analysisResult is:', analysisResult)
      
      try {
        // For image-based PDFs, try a simple approach with MasterAnalyzer directly
        console.log('[QUICK-ANALYSIS] Attempting direct MasterAnalyzer analysis for image-based PDF')
        
        const masterAnalyzer = MasterAnalyzer.getInstance()
        const masterAnalysisResult = await masterAnalyzer.analyzeReport(fileBuffer, fileName)
        
        console.log('[QUICK-ANALYSIS] Direct MasterAnalyzer analysis successful')
        
        analysisResult = {
          success: true,
          reportType: masterAnalysisResult.reportType,
          extractedData: {
            text: 'Image-based PDF analyzed with MasterAnalyzer',
            tables: [],
            confidence: masterAnalysisResult.confidence
          },
          analyzedReport: masterAnalysisResult,
          extractionMethod: 'direct_master_analyzer',
          processingTime: Date.now() - startTime
        }
        
        // Save analysis results to database
        await saveQuickAnalysisToDatabase(analysisResult, fileName, filePath);
        
        return NextResponse.json(analysisResult)
        

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