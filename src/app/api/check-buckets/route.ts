import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // List all storage buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({ 
        error: 'Failed to list buckets',
        details: bucketsError.message,
        note: 'This might mean no buckets exist or permission issue'
      }, { status: 500 })
    }
    
    // For each bucket, try to list files
    const bucketContents = []
    if (buckets) {
      for (const bucket of buckets) {
        try {
          const { data: files, error: filesError } = await supabase
            .storage
            .from(bucket.name)
            .list('', { limit: 10 })
          
          bucketContents.push({
            bucketName: bucket.name,
            bucketId: bucket.id,
            isPublic: bucket.public,
            fileCount: files ? files.length : 0,
            sampleFiles: files ? files.slice(0, 3).map(f => f.name) : [],
            error: filesError?.message
          })
        } catch (e) {
          bucketContents.push({
            bucketName: bucket.name,
            error: 'Failed to list files'
          })
        }
      }
    }
    
    return NextResponse.json({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      bucketsFound: buckets ? buckets.length : 0,
      buckets: buckets ? buckets.map(b => ({
        name: b.name,
        id: b.id,
        public: b.public
      })) : [],
      bucketContents,
      recommendation: buckets && buckets.length === 0 ? 
        'No storage buckets found. Files may need to be re-uploaded.' :
        'Check which bucket contains your files above.'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check buckets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}