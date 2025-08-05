import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  console.log('[PDF-DIRECT] Starting direct PDF to Claude...')
  
  try {
    // Get the PDF file
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    console.log('[PDF-DIRECT] File received:', file.name, file.size, 'bytes')
    
    // Convert to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    
    console.log('[PDF-DIRECT] Converted to base64, length:', base64.length)
    
    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }
    
    const anthropic = new Anthropic({ apiKey })
    
    // First, try to extract text using pdf-parse (simple, no external dependencies)
    let extractedText = ''
    let extractionMethod = 'none'
    
    try {
      const pdfParse = (await import('pdf-parse')).default
      const pdfData = await pdfParse(buffer)
      extractedText = pdfData.text || ''
      extractionMethod = 'pdf-parse'
      console.log('[PDF-DIRECT] Extracted text:', extractedText.length, 'characters')
    } catch (parseError) {
      console.log('[PDF-DIRECT] PDF parse failed, will send as image')
    }
    
    // If we got good text, use it. Otherwise, convert to image
    let message
    
    if (extractedText && extractedText.trim().length > 100) {
      // Send as text (most reliable)
      console.log('[PDF-DIRECT] Sending as text to Claude...')
      
      message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0,
        system: `You are Kevin Rutherford, FNTP, analyzing health documents for truck drivers. 
Provide comprehensive functional medicine analysis including:
- Document type identification
- Key health markers and values
- Root cause analysis
- Personalized recommendations
- Supplement protocols
- Lifestyle modifications`,
        messages: [{
          role: 'user',
          content: `Please analyze this health document and provide a comprehensive functional medicine assessment.

Document: ${file.name}

Content:
${extractedText}`
        }]
      })
    } else {
      // Try sending as image (Claude can OCR images)
      console.log('[PDF-DIRECT] Sending as image to Claude...')
      
      // Note: This is a simplified approach. In production, you'd convert PDF pages to images
      // For now, we'll send a message explaining the limitation
      message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0,
        system: `You are Kevin Rutherford, FNTP, analyzing health documents.`,
        messages: [{
          role: 'user',
          content: `I have a PDF file "${file.name}" that couldn't be processed as text. 

The file is ${file.size} bytes and appears to be an image-based PDF or has extraction issues.

Please provide guidance on:
1. What type of document this likely is based on the filename
2. What information would typically be found in such a document
3. How to proceed with the analysis
4. Alternative ways to submit this document`
        }]
      })
    }
    
    console.log('[PDF-DIRECT] Claude responded successfully')
    
    // Extract the response text
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
    
    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      analysis: responseText,
      usage: message.usage
    })
    
  } catch (error: any) {
    console.error('[PDF-DIRECT] Error:', error)
    
    // If document type isn't supported, try as images
    if (error.message?.includes('document') || error.message?.includes('unsupported')) {
      return NextResponse.json({
        error: 'Direct PDF upload not supported in this Claude model',
        details: error.message,
        suggestion: 'Converting to image format might work'
      }, { status: 400 })
    }
    
    return NextResponse.json({
      error: 'Failed to analyze PDF',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}