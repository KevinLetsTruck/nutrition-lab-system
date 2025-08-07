import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // This endpoint is disabled in production due to pdf-parse dependency
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return NextResponse.json({ 
      error: 'This endpoint is not available in production. Please use /api/lab-reports/upload instead.',
      suggestion: 'The lab-reports/upload endpoint provides PDF processing with Claude native support.'
    }, { status: 503 })
  }
  
  // Original implementation only runs in development

  console.log('[PDF-CLAUDE-BINARY] Starting...')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    console.log('[PDF-CLAUDE-BINARY] File:', file.name, file.size, 'bytes')
    
    // Get file as base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    
    // NOTE: This endpoint uses Claude's Vision API which is not yet supported by the AI service
    // So we need to use direct Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Vision API requires ANTHROPIC_API_KEY environment variable',
        suggestion: 'The AI service does not yet support Claude Vision API. Please configure ANTHROPIC_API_KEY.'
      }, { status: 503 })
    }
    
    let anthropic: any
    try {
      const Anthropic = require('@anthropic-ai/sdk').default
      anthropic = new Anthropic({ apiKey })
    } catch (error) {
      return NextResponse.json({ 
        error: 'Failed to initialize Anthropic client',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
    
    console.log('[PDF-CLAUDE-BINARY] Sending to Claude with base64 length:', base64.length)
    
    // Try to send as image - Claude can OCR PDFs when sent as images
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0,
        system: `You are Kevin Rutherford, FNTP, analyzing health documents for truck drivers. 
Extract ALL information from the document including:
- All test results, values, ranges, and dates
- Patient information and demographics
- All scores, measurements, and assessments
- Any clinical observations or notes

Then provide comprehensive functional medicine analysis with:
- Specific supplement recommendations with dosages
- Dietary modifications based on actual test results
- Lifestyle interventions
- Root cause analysis
- Phase-based protocol if appropriate`,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please extract ALL information from this health document and provide a comprehensive functional medicine analysis with specific recommendations.'
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64
              }
            } as any
          ]
        }]
      })
      
      const responseText = message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n')
      
      return NextResponse.json({
        success: true,
        analysis: responseText,
        method: 'claude-pdf-direct'
      })
      
    } catch (error: any) {
      console.log('[PDF-CLAUDE-BINARY] Direct PDF failed, trying as multiple images...')
      
      // If direct PDF fails, we need to convert PDF to images
      // For now, try with pdf-parse as fallback
      try {
        const pdfParse = (await import('pdf-parse' as any)).default
        const pdfData = await pdfParse(buffer, {
          max: 0, // Parse all pages
          // Custom render function to get more content
          pagerender: async (pageData: any) => {
            const render = await pageData.getTextContent()
            return render.items.map((item: any) => item.str).join(' ')
          }
        })
        
        const extractedText = pdfData.text || ''
        console.log('[PDF-CLAUDE-BINARY] Extracted text length:', extractedText.length)
        
        // Send extracted text to Claude
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          temperature: 0,
          system: `You are Kevin Rutherford, FNTP, analyzing health documents.`,
          messages: [{
            role: 'user',
            content: `Analyze this health document (${file.name}):

${extractedText}

Provide comprehensive functional medicine analysis with specific recommendations.`
          }]
        })
        
        const responseText = message.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('\n')
        
        return NextResponse.json({
          success: true,
          analysis: responseText,
          method: 'text-extraction',
          extractedLength: extractedText.length
        })
        
      } catch (fallbackError) {
        console.error('[PDF-CLAUDE-BINARY] All methods failed:', fallbackError)
        throw new Error('Unable to process this PDF. It may require manual conversion to images.')
      }
    }
    
  } catch (error: any) {
    console.error('[PDF-CLAUDE-BINARY] Error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze PDF',
      details: error.message,
      suggestion: 'This PDF format is not supported. Try converting to images or extracting text manually.'
    }, { status: 500 })
  }
}