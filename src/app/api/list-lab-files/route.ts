import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    const results = {
      bucket: 'lab-files',
      isPublic: false,
      contents: {} as Record<string, any>
    }
    
    // Check root
    const { data: rootFiles, error: rootError } = await supabase
      .storage
      .from('lab-files')
      .list('', { limit: 100 })
    
    if (rootFiles) {
      results.contents['root'] = rootFiles.map(f => ({
        name: f.name,
        id: f.id,
        isFolder: !f.id // Folders don't have IDs
      }))
    }
    
    // Check 2025 folder
    const { data: files2025 } = await supabase
      .storage
      .from('lab-files')
      .list('2025', { limit: 100 })
    
    if (files2025) {
      results.contents['2025'] = files2025.map(f => f.name)
    }
    
    // Check clients folder
    const { data: clientsFolder } = await supabase
      .storage
      .from('lab-files')
      .list('clients', { limit: 100 })
    
    if (clientsFolder) {
      results.contents['clients'] = clientsFolder.map(f => f.name)
    }
    
    // Check specific client folder
    const { data: clientFiles } = await supabase
      .storage
      .from('lab-files')
      .list('clients/336ac9e9-dda3-477f-89d5-241df47b8745', { limit: 100 })
    
    if (clientFiles) {
      results.contents['clients/336ac9e9-dda3-477f-89d5-241df47b8745'] = clientFiles.map(f => ({
        name: f.name,
        size: f.metadata?.size,
        created: f.created_at
      }))
    }
    
    // Try to get a signed URL for one of the files (this should work even if bucket is private)
    let signedUrlExample = null
    if (clientFiles && clientFiles.length > 0) {
      const { data: signedUrl } = await supabase
        .storage
        .from('lab-files')
        .createSignedUrl(`clients/336ac9e9-dda3-477f-89d5-241df47b8745/${clientFiles[0].name}`, 3600)
      
      signedUrlExample = signedUrl
    }
    
    return NextResponse.json({
      ...results,
      problem: 'Bucket is PRIVATE - public URLs wont work',
      solution: 'Either make bucket public OR use signed URLs',
      signedUrlExample,
      recommendation: signedUrlExample ? 
        'Files exist! Use signed URLs or make bucket public' :
        'Check the file paths above to see where files are located'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to list files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}