import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SupabaseStorageService } from '@/lib/supabase-storage'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import { TextractProcessor } from '@/lib/document-processors/textract-processor'
import ClaudeClient from '@/lib/claude-client'
import PDFLabParser from '@/lib/lab-analyzers/pdf-parser'
import { supabase } from '@/lib/supabase'
import { PDFRepairUtility } from '@/lib/pdf-repair-utility'
import MedicalTerminologyProcessor from '@/lib/document-processors/medical-terminology-processor'
import { DocumentVersionService } from '@/lib/services/document-version-service'

// Helper function to save analysis results to database
async function saveQuickAnalysisToDatabase(analysisResult: any, fileName: string, filePath: string) {
  try {
    // Create a new Supabase client with service role for bypassing RLS
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await serviceSupabase
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
          
          // Phase 1 Enhancement: Apply medical terminology processing
          console.log('[QUICK-ANALYSIS] Applying medical terminology enhancements...')
          const enhancedText = await MedicalTerminologyProcessor.enhanceOCRResults(
            extractedContent.text,
            masterAnalysisResult.reportType
          )
          
          // Store both original and enhanced text
          const enhancedExtractedContent = {
            ...extractedContent,
            enhancedText: enhancedText.enhancedText,
            medicalTerms: enhancedText.medicalTerms,
            corrections: enhancedText.corrections,
            ocrConfidence: enhancedText.overallConfidence
          }
          
          analysisResult = {
            success: true,
            reportType: masterAnalysisResult.reportType,
            extractedData: enhancedExtractedContent,
            analyzedReport: masterAnalysisResult,
            extractionMethod: 'textract',
            processingTime: Date.now() - startTime
          }
          
          // Save analysis results to database
          await saveQuickAnalysisToDatabase(analysisResult, fileName, filePath);
          
          // Phase 1 Enhancement: Create document version
          try {
            const versionService = DocumentVersionService.getInstance()
            await versionService.processDocumentUpload(
              'quick-analysis', // Using a generic client ID for quick analysis
              fileName,
              masterAnalysisResult.reportType,
              enhancedExtractedContent,
              { medicalTermsEnhanced: true }
            )
            console.log('[QUICK-ANALYSIS] Document version created')
          } catch (versionError) {
            console.error('[QUICK-ANALYSIS] Failed to create document version:', versionError)
            // Don't fail the analysis if versioning fails
          }
        } catch (analyzerError) {
          console.error('[QUICK-ANALYSIS] MasterAnalyzer failed:', analyzerError)
          throw new Error(`Analysis failed: ${analyzerError instanceof Error ? analyzerError.message : 'Unknown error'}`)
        }
      } catch (textractError) {
        console.error('[QUICK-ANALYSIS] Textract processing failed:', textractError)
        console.error('[QUICK-ANALYSIS] Textract error details:', textractError instanceof Error ? textractError.message : 'Unknown error')
        console.error('[QUICK-ANALYSIS] Textract error stack:', textractError instanceof Error ? textractError.stack : 'No stack trace')
        
        // Try direct Claude analysis as fallback for image-based PDFs
        console.log('[QUICK-ANALYSIS] Textract failed, trying direct Claude analysis as fallback...')
        try {
          // Use Claude directly for image-based PDFs
          const claudeClient = ClaudeClient.getInstance()
          
          // Convert PDF to images for Claude Vision
          console.log('[QUICK-ANALYSIS] Converting PDF to images for Claude Vision...')
          const parser = PDFLabParser.getInstance()
          
          // Use the private method to convert PDF to images
          const pageImages = await (parser as any).convertPDFToImages(fileBuffer, [1]) // Convert first page only
          
          if (pageImages.length === 0) {
            throw new Error('Failed to convert PDF to images')
          }
          
          console.log('[QUICK-ANALYSIS] PDF converted to', pageImages.length, 'images')
          
          // Create a simple prompt for document analysis
          const systemPrompt = `You are an expert medical document analyzer. Analyze this document and provide a comprehensive report including:
          1. Document type identification
          2. Key findings and data extraction
          3. Clinical significance
          4. Recommendations
          
          Return your analysis in a structured format.`
          
          const analysisPrompt = `Please analyze this medical document (${fileName}) and provide a detailed report.`
          
          // Use Claude Vision to analyze the first page image
          const visionResult = await claudeClient.analyzeImageWithVision(
            pageImages[0].base64,
            'image/png',
            analysisPrompt,
            systemPrompt
          )
          
          console.log('[QUICK-ANALYSIS] Direct Claude analysis successful')
          
          // Create a basic analysis result structure
          const basicAnalysis = {
            reportType: 'lab_report' as const,
            extractedText: visionResult,
            confidence: 0.8,
            analysis: {
              summary: visionResult.substring(0, 500),
              findings: visionResult,
              recommendations: 'Based on document analysis'
            }
          }
          
          analysisResult = {
            success: true,
            reportType: basicAnalysis.reportType,
            extractedData: {
              text: basicAnalysis.extractedText,
              tables: [],
              confidence: basicAnalysis.confidence
            },
            analyzedReport: basicAnalysis,
            extractionMethod: 'claude_vision_direct',
            processingTime: Date.now() - startTime
          }
          
          // Save analysis results to database
          await saveQuickAnalysisToDatabase(analysisResult, fileName, filePath);
          
        } catch (claudeError) {
          console.error('[QUICK-ANALYSIS] Direct Claude analysis also failed:', claudeError)
          
          // Final fallback: Create a basic analysis result without parsing
          console.log('[QUICK-ANALYSIS] Creating fallback analysis result...')
          
          // Determine report type from filename
          let reportType = 'lab_report'
          if (fileName.toLowerCase().includes('naq')) {
            reportType = 'nutriq'
          } else if (fileName.toLowerCase().includes('fit')) {
            reportType = 'fit_test'
          } else if (fileName.toLowerCase().includes('symptom')) {
            reportType = 'lab_report'
          }
          
          // Create more meaningful fallback analysis based on document type
          let fallbackAnalysis: any
          
          if (reportType === 'fit_test') {
            fallbackAnalysis = {
              reportType: 'fit_test',
              testType: 'FIT',
              result: 'pending_review',
              extractedText: `FIT Test Document: ${fileName}\nStatus: Document received, requires manual review\nNote: PDF format prevents automated analysis.`,
              confidence: 0.3,
              clinicalSignificance: 'FIT test document received but requires manual review due to PDF format limitations.',
              recommendations: [
                'Manual review of FIT test results required',
                'Consider re-uploading in a different format',
                'Contact lab for digital results if available'
              ],
              followUpRequired: true,
              followUpInstructions: [
                'Review FIT test results manually',
                'Document findings in patient record',
                'Schedule follow-up if results are positive'
              ],
              analysis: {
                summary: `FIT test document (${fileName}) received successfully. Document requires manual review due to PDF format issues.`,
                findings: 'FIT test document is present but automated analysis failed due to PDF format.',
                recommendations: 'Manual review required. Consider requesting digital results from lab.'
              }
            }
          } else if (reportType === 'nutriq') {
            fallbackAnalysis = {
              reportType: 'nutriq',
              totalScore: 0,
              extractedText: `NutriQ Assessment: ${fileName}\nStatus: Document received, requires manual review\nNote: PDF format prevents automated analysis.`,
              confidence: 0.3,
              bodySystems: {
                energy: { score: 0, issues: ['Manual review required'], recommendations: ['Complete manual assessment'] },
                mood: { score: 0, issues: ['Manual review required'], recommendations: ['Complete manual assessment'] },
                sleep: { score: 0, issues: ['Manual review required'], recommendations: ['Complete manual assessment'] },
                stress: { score: 0, issues: ['Manual review required'], recommendations: ['Complete manual assessment'] },
                digestion: { score: 0, issues: ['Manual review required'], recommendations: ['Complete manual assessment'] },
                immunity: { score: 0, issues: ['Manual review required'], recommendations: ['Complete manual assessment'] }
              },
              overallRecommendations: ['Manual review of NutriQ assessment required'],
              priorityActions: ['Complete manual assessment'],
              followUpTests: ['Re-upload in different format if possible'],
              analysis: {
                summary: `NutriQ assessment document (${fileName}) received successfully. Document requires manual review due to PDF format issues.`,
                findings: 'NutriQ assessment is present but automated analysis failed due to PDF format.',
                recommendations: 'Manual review required. Consider re-uploading in a different format.'
              }
            }
          } else {
            fallbackAnalysis = {
              reportType: reportType as any,
              extractedText: `Document: ${fileName}\nStatus: Processed with fallback analysis\nNote: PDF parsing failed, but document was received.`,
              confidence: 0.3,
              analysis: {
                summary: `Document ${fileName} was received but could not be fully analyzed due to PDF format issues.`,
                findings: 'Document requires manual review or re-upload in a different format.',
                recommendations: 'Consider re-uploading the document in a different format or using a different PDF.'
              }
            }
          }
          
          analysisResult = {
            success: true,
            reportType: fallbackAnalysis.reportType,
            extractedData: {
              text: fallbackAnalysis.extractedText,
              tables: [],
              confidence: fallbackAnalysis.confidence
            },
            analyzedReport: fallbackAnalysis,
            extractionMethod: 'fallback',
            processingTime: Date.now() - startTime
          }
          
          // Save analysis results to database
          await saveQuickAnalysisToDatabase(analysisResult, fileName, filePath);
          
          console.log('[QUICK-ANALYSIS] Fallback analysis created and saved')
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