import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Test upload endpoint called')
    
    const formData = await request.formData()
    const files = formData.getAll('file') as File[]
    
    console.log('Files received:', files.length)
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const results = []
    
    for (const file of files) {
      console.log('Processing file:', file.name, file.size, file.type)
      
      results.push({
        success: true,
        filename: `test_${file.name}`,
        originalName: file.name,
        size: file.size,
        path: `test/${file.name}`
      })
    }

    return NextResponse.json({
      success: true,
      uploaded: results.length,
      files: results
    })
    
  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json(
      { 
        error: 'Test upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Test upload endpoint ready' })
} 