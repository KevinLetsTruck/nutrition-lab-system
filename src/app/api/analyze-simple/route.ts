import { NextRequest, NextResponse } from 'next/server'
import ClaudeClient from '@/lib/claude-client'

export async function POST(request: NextRequest) {
  console.log('[ANALYZE-SIMPLE] Starting simple analysis...')
  
  try {
    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string || 'auto'
    const clientName = formData.get('clientName') as string || 'Patient'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    console.log('[ANALYZE-SIMPLE] File received:', file.name, file.size, 'bytes')
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Try to extract text - WHATEVER WE CAN GET
    let extractedText = ''
    
    // Method 1: If it's already text, just use it
    try {
      extractedText = buffer.toString('utf8')
      // Check if it's actually readable text
      const printableRatio = extractedText.replace(/[^\x20-\x7E\n\r\t]/g, '').length / extractedText.length
      if (printableRatio < 0.8) {
        extractedText = '' // Not valid text
      }
    } catch (e) {
      // Not text
    }
    
    // Method 2: Try PDF extraction if no text yet
    if (!extractedText && file.name.toLowerCase().endsWith('.pdf')) {
      try {
        console.log('[ANALYZE-SIMPLE] Attempting PDF extraction...')
        const pdfParse = (await import('pdf-parse')).default
        
        // Simple options to avoid file system issues
        const options = {
          max: 0, // No page limit
          version: 'default'
        }
        
        const data = await pdfParse(buffer, options)
        extractedText = data.text || ''
        console.log('[ANALYZE-SIMPLE] PDF extraction got:', extractedText.length, 'characters')
      } catch (pdfError: any) {
        console.log('[ANALYZE-SIMPLE] PDF extraction failed:', pdfError.message)
        // Don't fail - continue with what we have
      }
    }
    
    // If STILL no text, just describe what we received
    if (!extractedText || extractedText.trim().length < 10) {
      extractedText = `Document Upload Information:
Filename: ${file.name}
Size: ${file.size} bytes
Type: ${file.type || 'Unknown'}

Note: Unable to extract text content from this document. It may be:
- An image-based PDF requiring OCR
- An encrypted or password-protected file
- A corrupted file
- An image file (JPG, PNG, etc.)

Please provide the document content in text format or try a different file.`
    }
    
    console.log('[ANALYZE-SIMPLE] Final text length:', extractedText.length)
    
    // Now analyze with Claude - ALWAYS analyze something
    const claudeClient = ClaudeClient.getInstance()
    
    const prompt = `Analyze this health document for ${clientName}.

Document Type: ${documentType}
Filename: ${file.name}

Content:
${extractedText}

Please provide:
1. What type of document this appears to be
2. Key health information found (if any)
3. Recommendations based on the content
4. If no health data was found, explain what you see and suggest next steps

Always provide a helpful response even if the document content is limited.`

    const systemPrompt = `You are a functional medicine expert analyzing health documents. 
Always provide helpful analysis even with limited information.
If the document appears to be empty or unreadable, provide guidance on what the user should do.`
    
    console.log('[ANALYZE-SIMPLE] Sending to Claude...')
    const analysis = await claudeClient.analyzePractitionerReport(prompt, systemPrompt)
    
    console.log('[ANALYZE-SIMPLE] Claude responded successfully')
    
    // Return success no matter what
    return NextResponse.json({
      success: true,
      result: {
        fileName: file.name,
        fileSize: file.size,
        extractedTextLength: extractedText.length,
        documentType,
        analysis,
        message: 'Analysis completed. See results below.'
      }
    })
    
  } catch (error: any) {
    console.error('[ANALYZE-SIMPLE] Error:', error)
    
    // Even on error, try to return something useful
    return NextResponse.json({
      success: false,
      error: 'Analysis encountered an issue',
      details: error.message,
      suggestion: 'Try uploading a different file or paste the text directly'
    }, { status: 500 })
  }
}