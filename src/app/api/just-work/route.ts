import { NextRequest, NextResponse } from 'next/server'
import ClaudeClient from '@/lib/claude-client'

export async function POST(request: NextRequest) {
  console.log('[JUST-WORK] Starting...')
  
  try {
    const contentType = request.headers.get('content-type') || ''
    let inputText = ''
    let fileName = 'unknown'
    
    if (contentType.includes('application/json')) {
      // JSON input
      const body = await request.json()
      inputText = body.text || body.content || JSON.stringify(body)
    } else if (contentType.includes('multipart/form-data')) {
      // File upload
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (file) {
        fileName = file.name
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Try to get text however we can
        try {
          inputText = buffer.toString('utf8')
        } catch (e) {
          inputText = `File: ${fileName}, Size: ${buffer.length} bytes`
        }
      }
    } else {
      // Raw text
      inputText = await request.text()
    }
    
    // Ensure we have something
    if (!inputText) {
      inputText = 'No content provided'
    }
    
    console.log('[JUST-WORK] Got input, length:', inputText.length)
    
    // Send to Claude
    const claude = ClaudeClient.getInstance()
    const result = await claude.analyzePractitionerReport(
      `Analyze this health-related content and provide insights:\n\n${inputText}`,
      'You are a helpful medical document analyzer. Always provide useful insights.'
    )
    
    return NextResponse.json({
      success: true,
      inputLength: inputText.length,
      analysis: result
    })
    
  } catch (error: any) {
    console.error('[JUST-WORK] Error:', error)
    
    // Return error but still try to be helpful
    return NextResponse.json({
      success: false,
      error: error.message,
      suggestion: 'Try pasting the text content directly instead of uploading a file'
    })
  }
}