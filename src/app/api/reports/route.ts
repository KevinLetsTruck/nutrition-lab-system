import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get all lab reports with client information
    const { data: reports, error } = await supabase
      .from('lab_reports')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      )
    }
    
    // Transform the data to match expected format
    const transformedReports = reports.map(report => ({
      ...report,
      client: report.clients
    }))
    
    return NextResponse.json({
      success: true,
      reports: transformedReports
    })
    
  } catch (error) {
    console.error('Error in reports API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 