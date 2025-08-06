import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const clientId = request.nextUrl.searchParams.get('clientId') || '336ac9e9-dda3-477f-89d5-241df47b8745'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  
  try {
    // First, get all lab reports for this client
    const { data: reports, error: fetchError } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', clientId)
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    if (!reports || reports.length === 0) {
      return NextResponse.json({ message: 'No reports found for this client' })
    }
    
    // Fix file URLs for each report
    const updates = []
    for (const report of reports) {
      // Extract the file path from any existing URL or storage_path
      let filePath = ''
      
      if (report.storage_path) {
        filePath = report.storage_path
      } else if (report.file_url && report.file_url.includes('/storage/v1/object/public/lab-files/')) {
        // Extract path after 'lab-files/'
        const match = report.file_url.match(/lab-files\/(.+)$/)
        if (match) {
          filePath = match[1]
        }
      }
      
      if (filePath) {
        const correctUrl = `${supabaseUrl}/storage/v1/object/public/lab-files/${filePath}`
        
        const { error: updateError } = await supabase
          .from('lab_reports')
          .update({ 
            file_url: correctUrl,
            storage_path: filePath
          })
          .eq('id', report.id)
        
        updates.push({
          id: report.id,
          file_name: report.file_name,
          old_url: report.file_url,
          new_url: correctUrl,
          success: !updateError,
          error: updateError?.message
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      supabaseUrl,
      clientId,
      totalReports: reports.length,
      updatedReports: updates.filter(u => u.success).length,
      updates
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fix file URLs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}