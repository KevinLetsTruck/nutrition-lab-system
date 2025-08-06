import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const fileName = request.nextUrl.searchParams.get('fileName') || 'corkadel_carole_fit176_report_07jul25.pdf'
  
  try {
    // Common bucket names to check
    const possibleBuckets = [
      'lab-files',
      'lab-documents',
      'documents',
      'files',
      'uploads',
      'lab_files',
      'lab_documents'
    ]
    
    const searchResults = []
    
    for (const bucketName of possibleBuckets) {
      try {
        // Try to list files in this bucket
        const { data: files, error } = await supabase
          .storage
          .from(bucketName)
          .list('', { 
            limit: 100,
            search: fileName.split('.')[0] // Search without extension
          })
        
        if (!error && files) {
          // Search in root
          const found = files.filter(f => 
            f.name.toLowerCase().includes(fileName.toLowerCase()) ||
            f.name.includes('fit176') ||
            f.name.includes('corkadel')
          )
          
          if (found.length > 0) {
            searchResults.push({
              bucket: bucketName,
              location: 'root',
              files: found.map(f => ({
                name: f.name,
                size: f.metadata?.size,
                url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${f.name}`
              }))
            })
          }
          
          // Also check in subdirectories
          const { data: clientFiles } = await supabase
            .storage
            .from(bucketName)
            .list('clients/336ac9e9-dda3-477f-89d5-241df47b8745', { limit: 100 })
          
          if (clientFiles && clientFiles.length > 0) {
            searchResults.push({
              bucket: bucketName,
              location: 'clients/336ac9e9-dda3-477f-89d5-241df47b8745',
              files: clientFiles.map(f => ({
                name: f.name,
                size: f.metadata?.size,
                url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/clients/336ac9e9-dda3-477f-89d5-241df47b8745/${f.name}`
              }))
            })
          }
        }
      } catch (e) {
        // Bucket doesn't exist, continue
      }
    }
    
    return NextResponse.json({
      searchingFor: fileName,
      bucketsChecked: possibleBuckets,
      filesFound: searchResults.length > 0,
      results: searchResults,
      recommendation: searchResults.length > 0 ?
        'Files found! Update the URLs to use the correct bucket name.' :
        'No files found. They may need to be re-uploaded.'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to search for files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}