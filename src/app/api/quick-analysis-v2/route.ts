import { NextRequest, NextResponse } from 'next/server'
import { PDFProcessor } from '@/lib/pdf-processor-production'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'quick-analysis-v2',
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  console.log('[QuickAnalysisV2] Endpoint called')
  console.log('[QuickAnalysisV2] Environment check:', {
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    nodeEnv: process.env.NODE_ENV
  })
  
  try {
    // Handle FormData for file upload
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({
        error: 'No file provided',
        details: 'Please upload a PDF file'
      }, { status: 400 })
    }
    
    console.log('[QuickAnalysisV2] Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ 
        error: 'Invalid file type',
        details: 'Only PDF files are supported'
      }, { status: 400 })
    }
    
    // Check file size (5MB limit for Claude API)
    const maxSizeMB = 5
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      return NextResponse.json({ 
        error: 'File too large',
        details: `File size (${fileSizeMB.toFixed(2)}MB) exceeds ${maxSizeMB}MB limit`,
        suggestion: 'Please compress your PDF or split it into smaller files'
      }, { status: 400 })
    }
    
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[QuickAnalysisV2] ANTHROPIC_API_KEY is not set')
      return NextResponse.json({
        error: 'Configuration error',
        details: 'API key not configured. Please contact support.',
        suggestion: 'ANTHROPIC_API_KEY environment variable is missing'
      }, { status: 500 })
    }
    
    // Initialize PDF processor
    const processor = new PDFProcessor({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 3,
      maxPDFSizeMB: 5
    })
    
    // Process the PDF
    const startTime = Date.now()
    let labReport
    try {
      labReport = await processor.processLabReport(file)
    } catch (processorError) {
      console.error('[QuickAnalysisV2] PDF processor error:', processorError)
      return NextResponse.json({
        error: 'PDF processing failed',
        details: processorError instanceof Error ? processorError.message : 'Failed to process PDF',
        suggestion: 'Please ensure the PDF is a valid lab report'
      }, { status: 500 })
    }
    const processingTime = Date.now() - startTime
    
    console.log('[QuickAnalysisV2] Processing complete:', {
      reportType: labReport.metadata.reportType,
      method: labReport.metadata.processingMethod,
      confidence: labReport.metadata.confidence,
      resultsCount: labReport.testResults.length,
      processingTimeMs: processingTime
    })
    
    // Create comprehensive analysis response
    const analysisResponse = {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      reportType: labReport.metadata.reportType,
      processingTime: `${(processingTime / 1000).toFixed(2)}s`,
      confidence: labReport.metadata.confidence,
      
      // Summary information
      summary: generateSummary(labReport),
      
      // Key findings and recommendations
      keyFindings: extractKeyFindings(labReport),
      recommendations: generateRecommendations(labReport),
      
      // Full analysis breakdown
      analysis: {
        patientInfo: labReport.patientInfo,
        testResults: labReport.testResults,
        clinicalNotes: labReport.clinicalNotes,
        abnormalFindings: labReport.testResults.filter(r => 
          r.status && ['high', 'low', 'critical'].includes(r.status)
        )
      },
      
      // Metadata
      metadata: labReport.metadata,
      
      // Raw extract for debugging
      rawData: labReport.rawExtract
    }
    
    return NextResponse.json(analysisResponse)
    
  } catch (error) {
    console.error('[QuickAnalysisV2] Error:', error)
    console.error('[QuickAnalysisV2] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Provide more specific error messages
    let errorMessage = 'Analysis failed'
    let details = error instanceof Error ? error.message : 'Unknown error'
    let suggestion = 'Please ensure your file is a valid PDF lab report'
    
    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        errorMessage = 'Configuration error'
        details = 'API key not properly configured'
        suggestion = 'Server configuration issue - please contact support'
      } else if (error.message.includes('Failed to parse')) {
        errorMessage = 'PDF parsing error'
        details = 'Unable to extract data from PDF'
        suggestion = 'Ensure the PDF is a valid lab report with text content'
      }
    }
    
    return NextResponse.json({
      error: errorMessage,
      details,
      suggestion,
      debug: process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    }, { status: 500 })
  }
}

// Helper functions for generating analysis insights
function generateSummary(labReport: any): string {
  const { reportType, testResults, patientInfo } = labReport
  const abnormalCount = testResults.filter((r: any) => 
    r.status && ['high', 'low', 'critical'].includes(r.status)
  ).length
  
  let summary = `Analyzed ${reportType.toUpperCase()} report`
  if (patientInfo.name) {
    summary += ` for ${patientInfo.name}`
  }
  summary += `. Found ${testResults.length} test results with ${abnormalCount} abnormal findings.`
  
  if (reportType === 'fit_test' && testResults.length > 0) {
    const fitResult = testResults.find((r: any) => r.name.toLowerCase().includes('fit'))
    if (fitResult) {
      summary += ` FIT test result: ${fitResult.value}.`
    }
  }
  
  return summary
}

function extractKeyFindings(labReport: any): string[] {
  const findings: string[] = []
  const { testResults, clinicalNotes } = labReport
  
  // Add critical findings first
  const criticalResults = testResults.filter((r: any) => r.status === 'critical')
  criticalResults.forEach((result: any) => {
    findings.push(`⚠️ CRITICAL: ${result.name} is ${result.value} ${result.unit || ''} (${result.referenceRange || 'out of range'})`)
  })
  
  // Add high/low findings
  const abnormalResults = testResults.filter((r: any) => 
    r.status && ['high', 'low'].includes(r.status)
  )
  abnormalResults.forEach((result: any) => {
    const indicator = result.status === 'high' ? '↑' : '↓'
    findings.push(`${indicator} ${result.name}: ${result.value} ${result.unit || ''} (${result.status})`)
  })
  
  // Add key clinical notes if present
  if (clinicalNotes && clinicalNotes.length > 50) {
    findings.push(`Clinical interpretation available`)
  }
  
  // Report-specific findings
  if (labReport.metadata.reportType === 'fit_test') {
    const fitResult = testResults.find((r: any) => r.name.toLowerCase().includes('fit'))
    if (fitResult) {
      findings.unshift(`FIT Test Result: ${fitResult.value}`)
    }
  }
  
  return findings.length > 0 ? findings : ['All test results within normal ranges']
}

function generateRecommendations(labReport: any): string[] {
  const recommendations: string[] = []
  const { testResults, metadata } = labReport
  
  // Check for abnormal results
  const hasAbnormal = testResults.some((r: any) => 
    r.status && ['high', 'low', 'critical'].includes(r.status)
  )
  
  if (hasAbnormal) {
    recommendations.push('Review abnormal findings with healthcare provider')
  }
  
  // Critical results need immediate attention
  const hasCritical = testResults.some((r: any) => r.status === 'critical')
  if (hasCritical) {
    recommendations.unshift('🚨 URGENT: Contact healthcare provider immediately regarding critical values')
  }
  
  // Report-specific recommendations
  switch (metadata.reportType) {
    case 'fit_test':
      const fitResult = testResults.find((r: any) => r.name.toLowerCase().includes('fit'))
      if (fitResult && fitResult.value.toLowerCase() === 'positive') {
        recommendations.push('Follow up with gastroenterologist for further evaluation')
        recommendations.push('Consider colonoscopy as recommended by physician')
      }
      break
      
    case 'kbmo':
      recommendations.push('Consider elimination diet based on food sensitivities')
      recommendations.push('Retest after 3-6 months of dietary modifications')
      break
      
    case 'dutch':
      recommendations.push('Review hormone patterns with functional medicine practitioner')
      recommendations.push('Consider lifestyle modifications for hormone balance')
      break
  }
  
  // General recommendations
  recommendations.push('Keep this report for your medical records')
  recommendations.push('Schedule follow-up testing as recommended')
  
  return recommendations
}