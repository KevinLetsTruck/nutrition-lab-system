import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // First check if bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets()
    
    if (listError) {
      return NextResponse.json({ 
        error: 'Failed to list buckets',
        details: listError.message
      }, { status: 500 })
    }
    
    const labFilesBucket = buckets?.find(b => b.name === 'lab-files')
    
    if (labFilesBucket) {
      return NextResponse.json({
        message: 'Bucket already exists',
        bucket: labFilesBucket,
        nextStep: 'Files need to be uploaded to this bucket'
      })
    }
    
    // Create the bucket
    const { data: newBucket, error: createError } = await supabase
      .storage
      .createBucket('lab-files', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/*'],
        fileSizeLimit: 52428800 // 50MB
      })
    
    if (createError) {
      return NextResponse.json({ 
        error: 'Failed to create bucket',
        details: createError.message,
        note: 'You may need to create this bucket manually in Supabase dashboard'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Bucket created successfully',
      bucket: newBucket,
      nextStep: 'Now re-upload your files to populate the bucket'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create bucket',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}