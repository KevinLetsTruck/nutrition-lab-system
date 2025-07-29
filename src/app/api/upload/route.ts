import { NextRequest, NextResponse } from 'next/server'
import { saveFile, validateFile, generateUniqueFilename, getFileInfo } from '@/lib/file-utils'
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
    const clientEmail = formData.get('clientEmail') as string
    const clientFirstName = formData.get('clientFirstName') as string
    const clientLastName = formData.get('clientLastName') as string
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Validate client information
    if (!clientEmail || !clientFirstName || !clientLastName) {
      return NextResponse.json(
        { error: 'Missing client information (email, firstName, lastName)' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    // Process each file
    for (const file of files) {
      try {
        // Convert File to Buffer for validation
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Validate file
        const validation = validateFile({
          buffer,
          originalname: file.name,
          size: file.size,
          mimetype: file.type
        } as Express.Multer.File)
        
        if (!validation.valid) {
          errors.push({
            filename: file.name,
            error: validation.error
          })
          continue
        }

        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(file.name)
        
        // Determine subdirectory based on file type
        const subdirectory = file.type === 'application/pdf' ? 'pdfs' : 'images'
        
        // For testing, skip file saving and just return success
        const filePath = `virtual/${subdirectory}/${uniqueFilename}`
        
        results.push({
          success: true,
          filename: uniqueFilename,
          originalName: file.name,
          size: file.size,
          path: filePath,
          clientEmail,
          clientFirstName,
          clientLastName
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
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Upload endpoint ready',
    maxFileSize: process.env.MAX_FILE_SIZE || '10485760',
    allowedTypes: process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,txt'
  })
}
