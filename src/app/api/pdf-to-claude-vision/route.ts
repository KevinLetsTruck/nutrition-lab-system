import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  console.log('[PDF-VISION] Starting PDF analysis with Claude Vision...')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ 
        error: 'Please provide a PDF file' 
      }, { status: 400 })
    }
    
    console.log('[PDF-VISION] Processing:', file.name, file.size, 'bytes')
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Initialize Anthropic
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }
    
    const anthropic = new Anthropic({ apiKey })
    
    // Method 1: Try direct base64 image approach (simpler)
    // This works if the PDF is actually just an embedded image
    const base64 = buffer.toString('base64')
    
    console.log('[PDF-VISION] Sending to Claude Vision API...')
    
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0,
        system: `You are Kevin Rutherford, FNTP, analyzing health documents for truck drivers. 
Extract ALL information from this document including:
- All test results with values and ranges
- Patient information
- Test dates
- Any scores or measurements
- Clinical observations

Then provide comprehensive functional medicine analysis including:
- Root cause analysis
- System interconnections
- Personalized supplement recommendations
- Lifestyle modifications for truck drivers
- DOT medical considerations`,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please extract ALL information from this health document and provide a comprehensive functional medicine analysis.'
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png', // Try as image
                data: base64
              }
            }
          ]
        }]
      })
      
      console.log('[PDF-VISION] Claude Vision analysis complete')
      
      const responseText = message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n')
      
      return NextResponse.json({
        success: true,
        fileName: file.name,
        fileSize: file.size,
        method: 'claude-vision-direct',
        analysis: responseText,
        usage: message.usage
      })
      
    } catch (visionError: any) {
      console.log('[PDF-VISION] Direct vision failed:', visionError.message)
      
      // Method 2: Try extracting text and sending that
      try {
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(buffer)
        const extractedText = pdfData.text || ''
        
        if (extractedText.length > 100) {
          console.log('[PDF-VISION] Falling back to text extraction...')
          
          const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            temperature: 0,
            system: `You are Kevin Rutherford, FNTP, analyzing health documents for truck drivers.`,
            messages: [{
              role: 'user',
              content: `Analyze this health document:
              
${extractedText}

Provide comprehensive functional medicine analysis.`
            }]
          })
          
          const responseText = message.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('\n')
          
          return NextResponse.json({
            success: true,
            fileName: file.name,
            fileSize: file.size,
            method: 'text-extraction',
            extractedLength: extractedText.length,
            analysis: responseText
          })
        }
      } catch (textError) {
        console.log('[PDF-VISION] Text extraction also failed')
      }
      
      // If all else fails, return the vision error
      throw visionError
    }
    
  } catch (error: any) {
    console.error('[PDF-VISION] Error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze PDF',
      details: error.message || 'Unknown error',
      suggestion: 'This PDF may be encrypted or in an unsupported format. Try converting to images or extracting text manually.'
    }, { status: 500 })
  }
}