import { NextRequest, NextResponse } from 'next/server'
// import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { clientId, nutriqResults, analysisResults } = await request.json()
    
    if (!clientId || !nutriqResults || !analysisResults) {
      return NextResponse.json({
        success: false,
        error: 'Missing required data: clientId, nutriqResults, analysisResults'
      }, { status: 400 })
    }
    
    console.log('[UPDATE-NUTRIQ] Updating NutriQ data for client:', clientId)
    
    const supabase = createServerSupabaseClient()
    
    // Find the existing NutriQ report for this client
    const { data: existingReports, error: findError } = await supabase
      .from('lab_reports')
      .select('id')
      .eq('client_id', clientId)
      .eq('report_type', 'nutriq')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (findError) {
      throw new Error(`Failed to find NutriQ report: ${findError.message}`)
    }
    
    if (!existingReports || existingReports.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No NutriQ report found for this client'
      }, { status: 404 })
    }
    
    const reportId = existingReports[0].id
    
    // Update the report with the new data
    const { error: updateError } = await supabase
      .from('lab_reports')
      .update({
        nutriq_results: nutriqResults,
        analysis_results: analysisResults,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
    
    if (updateError) {
      throw new Error(`Failed to update NutriQ report: ${updateError.message}`)
    }
    
    console.log('[UPDATE-NUTRIQ] Successfully updated NutriQ report:', reportId)
    
    return NextResponse.json({
      success: true,
      message: 'NutriQ data updated successfully',
      reportId: reportId
    })
    
  } catch (error) {
    console.error('[UPDATE-NUTRIQ] Error updating NutriQ data:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update NutriQ data'
    }, { status: 500 })
  }
} 