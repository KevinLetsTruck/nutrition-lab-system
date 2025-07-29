import { NextRequest, NextResponse } from 'next/server'
import { saveFile, validateFile, generateUniqueFilename } from '@/lib/file-utils'
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
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer for validation
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Create a mock file object for validation
    const mockFile = {
      buffer,
      originalname: file.name,
      size: file.size,
      mimetype: file.type
    } as any

    // Validate file
    const validation = validateFile(mockFile)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name)
    
    // Determine subdirectory based on file type
    const subdirectory = file.type === 'application/pdf' ? 'pdfs' : 'images'
    
    // Save file
    const filePath = await saveFile(buffer, uniqueFilename, subdirectory)
    
    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      path: filePath
    }, {
      headers: {
        ...createRateLimitHeaders(rateLimiter, rateLimitClientId)
      }
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Upload endpoint ready' })
}
