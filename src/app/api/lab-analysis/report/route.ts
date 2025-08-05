import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { jsPDF } from 'jspdf'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const labResultId = searchParams.get('lab_result_id')
  const format = searchParams.get('format') || 'json' // json or pdf

  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!labResultId) {
      return NextResponse.json(
        { error: 'Lab result ID required' },
        { status: 400 }
      )
    }

    // Get comprehensive lab data
    const { data: labData, error: fetchError } = await supabase
      .from('lab_results')
      .select(`
        *,
        clients(
          id,
          first_name,
          last_name,
          email,
          date_of_birth,
          gender
        ),
        lab_values(*),
        lab_patterns(*),
        lab_protocols(*)
      `)
      .eq('id', labResultId)
      .single()

    if (fetchError || !labData) {
      return NextResponse.json(
        { error: 'Lab result not found' },
        { status: 404 }
      )
    }

    // Get test catalog for reference ranges
    const { data: testCatalog } = await supabase
      .from('lab_test_catalog')
      .select('*')

    // Build comprehensive report
    const report = buildComprehensiveReport(labData, testCatalog || [])

    if (format === 'pdf') {
      // Generate PDF report
      const pdfBuffer = await generatePDFReport(report)
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="lab-report-${labResultId}.pdf"`
        }
      })
    }

    return NextResponse.json({
      success: true,
      report
    })

  } catch (error) {
    console.error('[LAB-REPORT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function buildComprehensiveReport(labData: any, testCatalog: any[]): any {
  const client = labData.clients
  const values = labData.lab_values || []
  const patterns = labData.lab_patterns || []
  const protocols = labData.lab_protocols || []
  const aiAnalysis = labData.ai_analysis

  // Calculate age
  const age = client.date_of_birth ? 
    Math.floor((Date.now() - new Date(client.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
    null

  return {
    header: {
      title: 'Comprehensive Functional Medicine Lab Analysis',
      practitioner: 'Kevin Rutherford, FNTP',
      client_name: `${client.first_name} ${client.last_name}`,
      client_email: client.email,
      age,
      gender: client.gender,
      report_date: new Date().toISOString(),
      collection_date: labData.collection_date,
      lab_name: labData.lab_name
    },
    
    executive_summary: {
      overall_health_score: aiAnalysis?.functional_assessment?.overall_vitality?.score || 0,
      key_findings: aiAnalysis?.key_findings || [],
      primary_concerns: patterns
        .filter((p: any) => p.priority_level === 'immediate' || p.priority_level === 'high')
        .map((p: any) => p.pattern_name),
      dot_status: aiAnalysis?.truck_driver_specific?.dot_compliance?.status || 'unknown'
    },

    functional_assessment: aiAnalysis?.functional_assessment || {},

    lab_values_analysis: values.map((value: any) => {
      const catalogEntry = testCatalog.find(t => t.id === value.test_catalog_id)
      return {
        test_name: value.test_name,
        value: value.value || value.value_text,
        unit: value.unit,
        reference_range: value.reference_range,
        optimal_range: catalogEntry ? 
          `${catalogEntry.optimal_range_low}-${catalogEntry.optimal_range_high}` : 'N/A',
        status: determineValueStatus(value, catalogEntry),
        interpretation: value.interpretation,
        flag: value.flag
      }
    }),

    patterns_detected: patterns.map((pattern: any) => ({
      name: pattern.pattern_name,
      category: pattern.pattern_category,
      confidence: `${Math.round(pattern.confidence_score * 100)}%`,
      significance: pattern.clinical_significance,
      truck_driver_impact: pattern.truck_driver_impact,
      priority: pattern.priority_level
    })),

    root_causes: aiAnalysis?.root_causes || [],

    protocols: {
      supplements: protocols
        .filter((p: any) => p.protocol_type === 'supplement')
        .map((p: any) => ({
          title: p.title,
          priority: p.priority,
          recommendations: p.supplement_protocol?.supplements || []
        })),
      
      dietary: protocols
        .filter((p: any) => p.protocol_type === 'dietary')
        .map((p: any) => ({
          title: p.title,
          priority: p.priority,
          modifications: p.dietary_modifications || []
        })),
      
      lifestyle: protocols
        .filter((p: any) => p.protocol_type === 'lifestyle')
        .map((p: any) => ({
          title: p.title,
          priority: p.priority,
          interventions: p.lifestyle_interventions || []
        })),
      
      retest_schedule: protocols
        .find((p: any) => p.protocol_type === 'retest')
        ?.retest_schedule || {}
    },

    truck_driver_considerations: aiAnalysis?.truck_driver_specific || {},

    clinical_notes: {
      ai_insights: aiAnalysis?.clinical_pearls || [],
      practitioner_notes: 'Schedule follow-up consultation to review findings and begin protocol implementation.'
    },

    disclaimer: 'This report is for educational purposes only and does not constitute medical advice. Please consult with your healthcare provider before making any changes to your health regimen.'
  }
}

function determineValueStatus(value: any, catalogEntry: any): string {
  if (!catalogEntry || value.value === undefined) return 'unknown'
  
  const numValue = parseFloat(value.value)
  
  if (value.is_optimal) return 'optimal'
  
  if (numValue < catalogEntry.standard_range_low) return 'low'
  if (numValue > catalogEntry.standard_range_high) return 'high'
  
  if (numValue < catalogEntry.optimal_range_low || numValue > catalogEntry.optimal_range_high) {
    return 'suboptimal'
  }
  
  return 'normal'
}

async function generatePDFReport(report: any): Promise<Buffer> {
  const doc = new jsPDF()
  let yPosition = 20

  // Header
  doc.setFontSize(20)
  doc.text(report.header.title, 20, yPosition)
  yPosition += 10

  doc.setFontSize(12)
  doc.text(`Practitioner: ${report.header.practitioner}`, 20, yPosition)
  yPosition += 7
  doc.text(`Client: ${report.header.client_name}`, 20, yPosition)
  yPosition += 7
  doc.text(`Date: ${new Date(report.header.report_date).toLocaleDateString()}`, 20, yPosition)
  yPosition += 15

  // Executive Summary
  doc.setFontSize(16)
  doc.text('Executive Summary', 20, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  doc.text(`Overall Health Score: ${report.executive_summary.overall_health_score}/100`, 20, yPosition)
  yPosition += 7
  doc.text(`DOT Status: ${report.executive_summary.dot_status}`, 20, yPosition)
  yPosition += 10

  doc.text('Key Findings:', 20, yPosition)
  yPosition += 7
  report.executive_summary.key_findings.forEach((finding: string) => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }
    doc.text(`• ${finding}`, 25, yPosition)
    yPosition += 7
  })

  // Primary Concerns
  yPosition += 10
  doc.setFontSize(14)
  doc.text('Primary Health Concerns', 20, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  report.executive_summary.primary_concerns.forEach((concern: string) => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }
    doc.text(`• ${concern}`, 25, yPosition)
    yPosition += 7
  })

  // Add more sections as needed...
  // This is a simplified version - in production, you'd want to:
  // 1. Add charts/graphs using chart libraries
  // 2. Format tables properly
  // 3. Add color coding for values
  // 4. Include all report sections

  return Buffer.from(doc.output('arraybuffer'))
}