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
    // List all files in the client's directory
    const { data: files, error } = await supabase
      .storage
      .from('lab-files')
      .list(`clients/${clientId}`, {
        limit: 100,
        offset: 0
      })
    
    if (error) throw error
    
    // Get lab reports to match with files
    const { data: reports } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', clientId)
    
    // Generate public URLs for each file
    const filesWithUrls = files?.map(file => {
      const { data } = supabase
        .storage
        .from('lab-files')
        .getPublicUrl(`clients/${clientId}/${file.name}`)
      
      return {
        name: file.name,
        size: file.metadata?.size,
        created: file.created_at,
        publicUrl: data.publicUrl,
        path: `clients/${clientId}/${file.name}`
      }
    }) || []
    
    return NextResponse.json({
      clientId,
      totalFiles: filesWithUrls.length,
      totalReports: reports?.length || 0,
      files: filesWithUrls,
      reports: reports?.map(r => ({
        id: r.id,
        file_name: r.file_name,
        file_url: r.file_url,
        file_path: r.file_path,
        storage_path: r.storage_path
      })),
      fixCommand: filesWithUrls.length > 0 ? 
        `Run this to link files to reports: /api/link-storage-files?clientId=${clientId}` : 
        'No files found in storage'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check storage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}