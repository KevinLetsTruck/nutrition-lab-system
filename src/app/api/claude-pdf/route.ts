import { NextRequest, NextResponse } from 'next/server'
import ClaudeClient from '@/lib/claude-client'

export async function POST(request: NextRequest) {
  console.log('[CLAUDE-PDF] Starting...')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    console.log('[CLAUDE-PDF] Processing:', file.name, file.size, 'bytes')
    
    // Get file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Try to extract text content
    let content = ''
    let method = 'unknown'
    
    // Method 1: Direct text decode (for text-based PDFs)
    try {
      content = buffer.toString('utf8')
      const printableRatio = content.replace(/[^\x20-\x7E\n\r\t]/g, '').length / content.length
      if (printableRatio < 0.7) {
        content = '' // Not readable text
      } else {
        method = 'text-decode'
      }
    } catch (e) {
      // Not text
    }
    
    // Method 2: PDF parse
    if (!content) {
      try {
        const pdfParse = (await import('pdf-parse')).default
        const data = await pdfParse(buffer)
        if (data.text && data.text.trim()) {
          content = data.text
          method = 'pdf-parse'
        }
      } catch (e) {
        console.log('[CLAUDE-PDF] PDF parse failed')
      }
    }
    
    // Method 3: Send metadata if nothing else works
    if (!content || content.trim().length < 50) {
      content = `PDF Document: ${file.name}
Size: ${file.size} bytes
Type: ${file.type || 'application/pdf'}

Note: This appears to be an image-based PDF or the text extraction failed.
The document likely contains health information that needs visual analysis.`
      method = 'metadata-only'
    }
    
    console.log('[CLAUDE-PDF] Extracted via:', method, 'Length:', content.length)
    
    // Send to Claude
    const claude = ClaudeClient.getInstance()
    
    const prompt = `Analyze this health document and provide comprehensive functional medicine insights:

Filename: ${file.name}

Content:
${content}

Please provide:
1. Document type and key information extracted
2. Health markers and their significance
3. Root cause analysis if applicable
4. Personalized recommendations
5. If the content seems incomplete, explain what might be missing`

    const systemPrompt = `You are Kevin Rutherford, FNTP, analyzing health documents for truck drivers.
Provide thorough functional medicine analysis even with limited information.
If the document appears to be image-based, explain what would typically be found in such documents.`
    
    const analysis = await claude.analyzePractitionerReport(prompt, systemPrompt)
    
    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      extractionMethod: method,
      contentLength: content.length,
      analysis
    })
    
  } catch (error: any) {
    console.error('[CLAUDE-PDF] Error:', error)
    
    return NextResponse.json({
      error: 'Analysis failed',
      details: error.message,
      suggestion: 'Try converting the PDF to images or extracting text manually'
    }, { status: 500 })
  }
}