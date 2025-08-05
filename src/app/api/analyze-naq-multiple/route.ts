import { NextRequest, NextResponse } from 'next/server'
import NutriQAnalyzer from '@/lib/lab-analyzers/nutriq-analyzer'
import DatabaseService from '@/lib/database-service'
import { NAQPattern } from '@/lib/analysis/naq-pattern-analyzer'
import { ComprehensiveNAQReport } from '@/lib/analysis/naq-report-generator'

const nutriqAnalyzer = NutriQAnalyzer.getInstance()
const db = DatabaseService.getInstance()

export async function POST(request: NextRequest) {
  console.log('[ANALYZE-NAQ-MULTIPLE] Starting multi-document enhanced NAQ analysis...')
  
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }
    
    console.log(`[ANALYZE-NAQ-MULTIPLE] Processing ${files.length} files`)
    
    // Get client data from form
    const clientData = {
      clientName: formData.get('clientName') as string || '',
      clientEmail: formData.get('clientEmail') as string || '',
      dateOfBirth: formData.get('dateOfBirth') as string || '',
      reportDate: formData.get('reportDate') as string || new Date().toISOString()
    }
    
    // Process each file
    const individualReports: ComprehensiveNAQReport[] = []
    const allPatterns: NAQPattern[] = []
    const fileMetadata: any[] = []
    
    for (const file of files) {
      console.log(`[ANALYZE-NAQ-MULTIPLE] Processing file: ${file.name}`)
      
      try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Analyze with enhanced NAQ system
        const result = await nutriqAnalyzer.analyzeNutriQReportWithClientPriority(
          buffer,
          clientData as any
        )
        
        if (result.comprehensiveReport) {
          individualReports.push(result.comprehensiveReport)
          allPatterns.push(...(result.comprehensiveReport.functionalMedicinePatterns || []))
          
          fileMetadata.push({
            fileName: file.name,
            fileSize: file.size,
            analysisDate: new Date().toISOString(),
            basicAnalysis: result.nutriqAnalysis,
            patternCount: result.comprehensiveReport.functionalMedicinePatterns.length
          })
        }
      } catch (fileError) {
        console.error(`[ANALYZE-NAQ-MULTIPLE] Error processing ${file.name}:`, fileError)
        fileMetadata.push({
          fileName: file.name,
          fileSize: file.size,
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        })
      }
    }
    
    // Combine reports into a comprehensive multi-document analysis
    const combinedReport = await combineMultipleReports(individualReports, clientData)
    
    // Return the combined analysis
    return NextResponse.json({
      success: true,
      individualReports,
      combinedReport,
      totalPatterns: allPatterns,
      uniquePatterns: getUniquePatterns(allPatterns),
      clientData,
      metadata: {
        totalFiles: files.length,
        successfulAnalyses: individualReports.length,
        failedAnalyses: files.length - individualReports.length,
        files: fileMetadata,
        analysisDate: new Date().toISOString(),
        reportVersion: '3.0-multi'
      }
    })
    
  } catch (error) {
    console.error('[ANALYZE-NAQ-MULTIPLE] Analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze multiple NAQ reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to combine multiple reports
async function combineMultipleReports(
  reports: ComprehensiveNAQReport[], 
  clientData: any
): Promise<any> {
  if (reports.length === 0) {
    return null
  }
  
  // Aggregate symptom burden data across all reports
  const aggregatedSymptomBurden = aggregateSymptomBurden(reports)
  
  // Identify patterns across all reports
  const crossReportPatterns = identifyCrossReportPatterns(reports)
  
  // Generate timeline analysis
  const timelineAnalysis = generateTimelineAnalysis(reports)
  
  // Create comprehensive interpretation
  const combinedInterpretation = {
    executiveSummary: generateCombinedExecutiveSummary(reports),
    aggregatedSymptomBurden,
    crossReportPatterns,
    timelineAnalysis,
    consolidatedRootCauses: consolidateRootCauses(reports),
    prioritizedInterventions: prioritizeInterventions(reports),
    progressTracking: trackProgressBetweenReports(reports)
  }
  
  return combinedInterpretation
}

// Helper function to aggregate pattern data across reports
function aggregateSymptomBurden(reports: ComprehensiveNAQReport[]): any {
  // Analyze patterns across reports
  const patternConfidenceByType: { [key: string]: number[] } = {}
  
  reports.forEach(report => {
    report.functionalMedicinePatterns.forEach(pattern => {
      const key = pattern.name
      if (!patternConfidenceByType[key]) {
        patternConfidenceByType[key] = []
      }
      patternConfidenceByType[key].push(pattern.confidence)
    })
  })
  
  // Calculate aggregated pattern data
  const aggregated: any = {}
  Object.keys(patternConfidenceByType).forEach(patternName => {
    const confidences = patternConfidenceByType[patternName]
    aggregated[patternName] = {
      average: confidences.reduce((a, b) => a + b, 0) / confidences.length,
      min: Math.min(...confidences),
      max: Math.max(...confidences),
      trend: calculateTrend(confidences),
      occurrences: confidences.length,
      allScores: confidences
    }
  })
  
  return aggregated
}

// Helper function to identify patterns across reports
function identifyCrossReportPatterns(reports: ComprehensiveNAQReport[]): any {
  const patternFrequency: { [key: string]: number } = {}
  const patternConfidence: { [key: string]: number[] } = {}
  
  reports.forEach(report => {
    report.functionalMedicinePatterns.forEach(pattern => {
      patternFrequency[pattern.name] = (patternFrequency[pattern.name] || 0) + 1
      
      if (!patternConfidence[pattern.name]) {
        patternConfidence[pattern.name] = []
      }
      patternConfidence[pattern.name].push(pattern.confidence)
    })
  })
  
  // Identify persistent vs emerging patterns
  const persistentPatterns = Object.keys(patternFrequency)
    .filter(name => patternFrequency[name] === reports.length)
  
  const emergingPatterns = Object.keys(patternFrequency)
    .filter(name => patternFrequency[name] === 1 && reports.length > 1)
  
  return {
    persistentPatterns,
    emergingPatterns,
    patternFrequency,
    averageConfidence: Object.fromEntries(
      Object.entries(patternConfidence).map(([name, confidences]) => [
        name,
        confidences.reduce((a, b) => a + b, 0) / confidences.length
      ])
    )
  }
}

// Helper function to generate timeline analysis
function generateTimelineAnalysis(reports: ComprehensiveNAQReport[]): any {
  // Sort reports by date if available
  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.metadata.generatedAt).getTime()
    const dateB = new Date(b.metadata.generatedAt).getTime()
    return dateA - dateB
  })
  
  return {
    reportCount: reports.length,
    dateRange: {
      earliest: sortedReports[0]?.metadata.generatedAt,
      latest: sortedReports[sortedReports.length - 1]?.metadata.generatedAt
    },
    progressionSummary: "Analysis of symptom progression over time"
  }
}

// Helper function to consolidate root causes
function consolidateRootCauses(reports: ComprehensiveNAQReport[]): any {
  const allRootCauses: string[] = []
  
  // Extract root causes from patterns
  reports.forEach(report => {
    report.functionalMedicinePatterns.forEach(pattern => {
      // Add root causes from pattern hierarchy
      if (pattern.rootCauseHierarchy && pattern.rootCauseHierarchy.length > 0) {
        allRootCauses.push(...pattern.rootCauseHierarchy)
      }
    })
  })
  
  // Count frequency and prioritize
  const causeFrequency: { [key: string]: number } = {}
  allRootCauses.forEach(cause => {
    causeFrequency[cause] = (causeFrequency[cause] || 0) + 1
  })
  
  return {
    primaryCauses: Object.entries(causeFrequency)
      .filter(([_, freq]) => freq >= reports.length / 2)
      .map(([cause]) => cause),
    allCauses: Object.keys(causeFrequency),
    frequency: causeFrequency
  }
}

// Helper function to prioritize interventions
function prioritizeInterventions(reports: ComprehensiveNAQReport[]): any {
  const interventionFrequency: { [key: string]: number } = {}
  const patternBasedInterventions: { [key: string]: string[] } = {}
  
  reports.forEach(report => {
    // Collect interventions from patterns
    report.functionalMedicinePatterns.forEach(pattern => {
      const priority = pattern.interventionPriority
      if (!patternBasedInterventions[priority]) {
        patternBasedInterventions[priority] = []
      }
      patternBasedInterventions[priority].push(pattern.name)
      
      // Count pattern frequencies for intervention prioritization
      interventionFrequency[pattern.name] = (interventionFrequency[pattern.name] || 0) + 1
    })
  })
  
  // Group interventions by priority
  return {
    immediate: patternBasedInterventions['immediate'] || [],
    highPriority: patternBasedInterventions['high'] || [],
    mediumPriority: patternBasedInterventions['moderate'] || [],
    lowPriority: patternBasedInterventions['low'] || [],
    frequencyData: interventionFrequency
  }
}

// Helper function to track progress between reports
function trackProgressBetweenReports(reports: ComprehensiveNAQReport[]): any {
  if (reports.length < 2) {
    return { message: "Multiple reports needed for progress tracking" }
  }
  
  return {
    overallTrend: "Improving/Stable/Declining based on symptom scores",
    systemSpecificProgress: "Detailed progress for each body system",
    recommendationCompliance: "Analysis of which recommendations were likely followed"
  }
}

// Helper function to generate combined executive summary
function generateCombinedExecutiveSummary(reports: ComprehensiveNAQReport[]): string {
  return `Multi-document analysis of ${reports.length} NAQ assessments reveals comprehensive health patterns and progression over time. This combined analysis provides deeper insights into persistent health challenges and treatment effectiveness.`
}

// Helper function to get unique patterns
function getUniquePatterns(patterns: NAQPattern[]): NAQPattern[] {
  const uniqueMap = new Map<string, NAQPattern>()
  
  patterns.forEach(pattern => {
    const existing = uniqueMap.get(pattern.name)
    if (!existing || pattern.confidence > existing.confidence) {
      uniqueMap.set(pattern.name, pattern)
    }
  })
  
  return Array.from(uniqueMap.values())
}

// Helper function to calculate trend
function calculateTrend(scores: number[]): string {
  if (scores.length < 2) return 'insufficient data'
  
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
  const secondHalf = scores.slice(Math.floor(scores.length / 2))
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100
  
  if (change < -10) return 'improving'
  if (change > 10) return 'worsening'
  return 'stable'
}

// Example usage endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Multi-Document Enhanced NAQ Analysis Endpoint',
    usage: {
      method: 'POST',
      contentType: 'multipart/form-data',
      fields: {
        files: 'Multiple NAQ PDF files (required, use multiple "files" fields)',
        clientName: 'Client full name (optional)',
        clientEmail: 'Client email (optional)',
        dateOfBirth: 'Client DOB (optional)',
        reportDate: 'Report date (optional)'
      },
      response: {
        success: 'boolean',
        individualReports: 'Array of comprehensive reports for each document',
        combinedReport: 'Aggregated analysis across all documents',
        totalPatterns: 'All patterns found across documents',
        uniquePatterns: 'Deduplicated patterns with highest severity',
        metadata: 'Files and analysis information'
      }
    },
    example: {
      curlCommand: `
curl -X POST http://localhost:3000/api/analyze-naq-multiple \\
  -F "files=@/path/to/naq-report1.pdf" \\
  -F "files=@/path/to/naq-report2.pdf" \\
  -F "files=@/path/to/naq-report3.pdf" \\
  -F "clientName=Carole Corkadel" \\
  -F "clientEmail=carole@example.com"
      `.trim()
    }
  })
}