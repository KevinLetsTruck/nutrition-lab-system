import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // 1. Check lab_reports table schema
    let tableColumns: string[] = []
    
    // Try to get a sample record to see what columns exist
    const { data: sampleReport } = await supabase
      .from('lab_reports')
      .select('*')
      .limit(1)
      .single()
    
    if (sampleReport) {
      tableColumns = Object.keys(sampleReport)
    }
    
    // 2. Check if files exist in storage
    const { data: storageFiles } = await supabase
      .storage
      .from('lab-files')
      .list('clients/336ac9e9-dda3-477f-89d5-241df47b8745')
    
    // 3. Check lab reports
    const { data: reports } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', '336ac9e9-dda3-477f-89d5-241df47b8745')
    
    // 4. Test file accessibility
    let fileAccessible = false
    if (storageFiles && storageFiles.length > 0) {
      const testFile = storageFiles[0]
      const testUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/${testFile.name}`
      
      try {
        const response = await fetch(testUrl, { method: 'HEAD' })
        fileAccessible = response.ok
      } catch (e) {
        fileAccessible = false
      }
    }
    
    // 5. Determine what columns we need to use
    const hasFileUrl = tableColumns.includes('file_url')
    const hasFilePath = tableColumns.includes('file_path')
    const hasStoragePath = tableColumns.includes('storage_path')
    
    return NextResponse.json({
      diagnosis: {
        database: {
          tableColumns,
          hasFileUrl,
          hasFilePath,
          hasStoragePath,
          sampleReport: reports?.[0] ? Object.keys(reports[0]) : []
        },
        storage: {
          filesExist: (storageFiles?.length || 0) > 0,
          fileCount: storageFiles?.length || 0,
          files: storageFiles?.map(f => f.name) || [],
          fileAccessible,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        },
        reports: {
          count: reports?.length || 0,
          reports: reports?.map(r => ({
            id: r.id,
            file_url: r.file_url,
            file_path: r.file_path,
            storage_path: r.storage_path,
            file_name: r.file_name
          }))
        }
      },
      recommendations: {
        schemaFix: !hasFilePath ? 'Need to use file_url instead of file_path' : 'Schema OK',
        storageFix: !fileAccessible ? 'Files may not be publicly accessible' : 'Storage OK',
        codeFix: 'Update client page to use file_url field',
        quickFix: `UPDATE lab_reports SET file_url = '${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/lab-files/{storage_path}' WHERE client_id = '336ac9e9-dda3-477f-89d5-241df47b8745' AND file_url IS NULL`
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Diagnosis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}