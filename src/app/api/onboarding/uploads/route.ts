import { NextRequest, NextResponse } from 'next/server'
import { saveFile, validateFile } from '@/lib/file-utils'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getRateLimiter, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimiter = getRateLimiter('upload')
    const rateLimitClientId = getClientIdentifier(request)
    
    if (!rateLimiter.isAllowed(rateLimitClientId)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(rateLimiter.getResetTime(rateLimitClientId) / 1000)
        },
        { 
          status: 429,
          headers: {
            ...createRateLimitHeaders(rateLimiter, rateLimitClientId),
            'Retry-After': Math.ceil(rateLimiter.getResetTime(rateLimitClientId) / 1000).toString()
          }
        }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('file') as File[]
    const sessionToken = formData.get('sessionToken') as string
    const category = formData.get('category') as string
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    // Get client from session
    let clientId: string
    try {
      const supabase = createServerSupabaseClient()
      const { data: session } = await supabase
        .from('onboarding_sessions')
        .select('client_id')
        .eq('session_token', sessionToken)
        .single()
      
      if (!session) {
        return NextResponse.json(
          { error: 'Invalid session token' },
          { status: 401 }
        )
      }
      
      clientId = session.client_id
    } catch (error) {
      console.error('Error retrieving session:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve session' },
        { status: 500 }
      )
    }

    const results = []
    const errors = []

    // Process each file
    for (const file of files) {
      try {
        // Validate file
        const validation = validateFile(file)
        
        if (!validation.valid) {
          errors.push({
            filename: file.name,
            error: validation.error
          })
          continue
        }

        // Upload file to Supabase Storage
        const storageFile = await saveFile(file, file.name, category, {
          clientId,
          uploadedBy: 'onboarding',
          sessionToken
        })
        
        // Store file record in client_files table
        const supabase = createServerSupabaseClient()
        const { data: clientFile, error: insertError } = await supabase
          .from('client_files')
          .insert({
            client_id: clientId,
            category: category || 'other',
            filename: storageFile.path,
            original_name: file.name,
            file_path: storageFile.path,
            file_size: storageFile.size,
            file_type: storageFile.type,
            metadata: storageFile.metadata
          })
          .select()
          .single()
        
        if (insertError) {
          throw new Error(`Failed to save file record: ${insertError.message}`)
        }
        
        results.push({
          success: true,
          filename: file.name,
          originalName: file.name,
          size: file.size,
          storagePath: storageFile.path,
          storageUrl: storageFile.url,
          bucket: storageFile.bucket,
          clientFileId: clientFile.id,
          category: category || 'other'
        })
        
      } catch (error) {
        console.error('Error processing file:', file.name, error)
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Return results
    if (results.length === 0) {
      return NextResponse.json(
        { 
          error: 'All files failed to upload',
          details: errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      uploaded: results.length,
      failed: errors.length,
      files: results,
      errors: errors.length > 0 ? errors : undefined
    }, {
      headers: {
        ...createRateLimitHeaders(rateLimiter, rateLimitClientId)
      }
    })
    
  } catch (error) {
    console.error('Onboarding upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('sessionToken')
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    // Get client files for this session
    const supabase = createServerSupabaseClient()
    const { data: session } = await supabase
      .from('onboarding_sessions')
      .select('client_id')
      .eq('session_token', sessionToken)
      .single()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      )
    }

    const { data: files } = await supabase
      .from('client_files')
      .select('*')
      .eq('client_id', session.client_id)
      .order('uploaded_at', { ascending: false })

    return NextResponse.json({
      success: true,
      files: files || []
    })
    
  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 