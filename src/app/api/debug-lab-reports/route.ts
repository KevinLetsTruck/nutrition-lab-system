import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId') || '336ac9e9-dda3-477f-89d5-241df47b8745'
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // Get lab reports for this client
    const { data: labReports, error } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Check storage files for this client
    const { data: storageFiles } = await supabase
      .storage
      .from('lab-files')
      .list(`clients/${clientId}`)
    
    return NextResponse.json({
      clientId,
      totalReports: labReports?.length || 0,
      reports: labReports?.map(r => ({
        id: r.id,
        report_type: r.report_type,
        file_path: r.file_path,
        file_url: r.file_url,
        storage_path: r.storage_path,
        created_at: r.created_at,
        all_fields: Object.keys(r || {})
      })),
      storageFiles: storageFiles?.map(f => ({
        name: f.name,
        size: f.metadata?.size,
        path: `clients/${clientId}/${f.name}`
      }))
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch lab reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}