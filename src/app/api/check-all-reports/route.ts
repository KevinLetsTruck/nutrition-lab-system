import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId') || '336ac9e9-dda3-477f-89d5-241df47b8745'
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // Get ALL lab reports for this client
    const { data: reports, error } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Group by creation date to see duplicates
    const reportsByDate = {}
    reports?.forEach(report => {
      const date = report.created_at.split('T')[0]
      if (!reportsByDate[date]) reportsByDate[date] = []
      reportsByDate[date].push({
        id: report.id,
        type: report.report_type,
        file_name: report.file_name,
        file_url: report.file_url,
        storage_path: report.storage_path,
        created_at: report.created_at
      })
    })
    
    // Check storage for ANY files
    const { data: allFiles } = await supabase
      .storage
      .from('lab-files')
      .list('', { 
        limit: 1000, 
        offset: 0,
        search: clientId
      })
    
    return NextResponse.json({
      clientId,
      totalReports: reports?.length || 0,
      reportsByDate,
      storageFiles: allFiles?.length || 0,
      recentReports: reports?.slice(0, 10).map(r => ({
        id: r.id,
        type: r.report_type,
        file_name: r.file_name,
        file_url: r.file_url,
        storage_path: r.storage_path,
        created_at: r.created_at
      }))
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}