import { NextRequest, NextResponse } from 'next/server'
import { generateFunctionalMedicineAnalysis, convertReportDataToClientData } from '@/lib/ai-analysis-service'
import { ClientData } from '@/lib/functional-medicine-analysis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    let clientData: ClientData
    
    // Check if we received ReportData or ClientData format
    if (body.reportData) {
      // Convert ReportData to ClientData format
      console.log('[FUNCTIONAL-MEDICINE-API] Converting ReportData to ClientData format')
      clientData = convertReportDataToClientData(body.reportData)
    } else if (body.clientData) {
      // Use ClientData directly
      clientData = body.clientData
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either reportData or clientData is required'
      }, { status: 400 })
    }
    
    console.log('[FUNCTIONAL-MEDICINE-API] Generating functional medicine analysis for:', 
      clientData.isDriver ? 'truck driver' : 'non-driver')
    
    const analysis = await generateFunctionalMedicineAnalysis(clientData)
    
    return NextResponse.json({
      success: true,
      analysis
    })
    
  } catch (error) {
    console.error('[FUNCTIONAL-MEDICINE-API] Error generating analysis:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate functional medicine analysis'
    }, { status: 500 })
  }
}