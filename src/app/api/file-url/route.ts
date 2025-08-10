import { NextRequest, NextResponse } from 'next/server'
// import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()
    
    if (!filePath) {
      return NextResponse.json({ 
        success: false, 
        error: 'File path is required' 
      }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // Generate a signed URL that expires in 1 hour
    const { data: signedUrl, error } = await supabase.storage
      .from('general')
      .createSignedUrl(filePath, 3600) // 1 hour

    if (error) {
      console.error('[FILE-URL] Error creating signed URL:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      url: signedUrl.signedUrl 
    })

  } catch (error) {
    console.error('[FILE-URL] Unexpected error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 