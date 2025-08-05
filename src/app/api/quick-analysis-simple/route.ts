import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  console.log('[QuickAnalysisSimple] Starting...')
  
  try {
    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'ANTHROPIC_API_KEY not configured' 
      }, { status: 500 })
    }
    
    console.log('[QuickAnalysisSimple] File info:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    
    console.log('[QuickAnalysisSimple] Base64 length:', base64.length)
    
    // Initialize Claude
    const anthropic = new Anthropic({ apiKey })
    
    // Send to Claude
    console.log('[QuickAnalysisSimple] Sending to Claude...')
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this PDF and tell me what type of document it is.'
          },
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64
            }
          } as any
        ]
      }]
    })
    
    console.log('[QuickAnalysisSimple] Claude response received')
    
    return NextResponse.json({
      success: true,
      message: 'Simple test successful',
      claudeResponse: response.content[0].type === 'text' ? response.content[0].text : 'No text response',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    })
    
  } catch (error) {
    console.error('[QuickAnalysisSimple] Error:', error)
    return NextResponse.json({
      error: 'Simple test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}