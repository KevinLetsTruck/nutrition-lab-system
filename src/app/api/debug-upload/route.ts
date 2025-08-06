import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG-UPLOAD] Request headers:', Object.fromEntries(request.headers.entries()))
    
    const formData = await request.formData()
    const entries = Array.from(formData.entries())
    
    console.log('[DEBUG-UPLOAD] FormData entries:', entries.map(([key, value]) => ({
      key,
      value: value instanceof File ? `File: ${value.name}, size: ${value.size}, type: ${value.type}` : value
    })))
    
    // Check each file
    const files = formData.getAll('file') as File[]
    console.log('[DEBUG-UPLOAD] Number of files:', files.length)
    
    for (const file of files) {
      console.log('[DEBUG-UPLOAD] File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      })
      
      // Try to read the file
      try {
        const arrayBuffer = await file.arrayBuffer()
        console.log('[DEBUG-UPLOAD] File arrayBuffer size:', arrayBuffer.byteLength)
      } catch (error) {
        console.error('[DEBUG-UPLOAD] Error reading file:', error)
      }
    }
    
    // Check environment variables
    console.log('[DEBUG-UPLOAD] Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    })
    
    return NextResponse.json({
      success: true,
      filesReceived: files.length,
      formDataKeys: Array.from(formData.keys()),
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[DEBUG-UPLOAD] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}