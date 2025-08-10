import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // Get a sample record to see what columns exist
    const { data: sampleReport, error } = await supabase
      .from('lab_reports')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    const columns = sampleReport ? Object.keys(sampleReport) : []
    
    return NextResponse.json({
      tableExists: true,
      columns,
      hasFileUrl: columns.includes('file_url'),
      hasStoragePath: columns.includes('storage_path'),
      hasFilePath: columns.includes('file_path'),
      sampleRecord: sampleReport ? {
        id: sampleReport.id,
        file_url: sampleReport.file_url,
        file_name: sampleReport.file_name,
        report_type: sampleReport.report_type
      } : null
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}