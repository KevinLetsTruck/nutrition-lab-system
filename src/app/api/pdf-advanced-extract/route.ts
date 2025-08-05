import { NextRequest, NextResponse } from 'next/server'
import ClaudeClient from '@/lib/claude-client'

export async function POST(request: NextRequest) {
  console.log('[PDF-ADVANCED] Starting advanced PDF extraction...')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    console.log('[PDF-ADVANCED] Processing:', file.name, file.size, 'bytes')
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Try multiple extraction methods
    let extractedContent = ''
    let extractionMethod = 'none'
    const extractionAttempts: string[] = []
    
    // Method 1: Enhanced pdf-parse with options
    try {
      const pdfParse = (await import('pdf-parse')).default
      
      // Try with different options for better extraction
      const options = {
        max: 0, // Parse all pages
        version: 'v2.0.550',
        // Custom page render function for better text extraction
        pagerender: async (pageData: any) => {
          const render = await pageData.getTextContent()
          const text = render.items
            .map((item: any) => {
              // Handle different text orientations and spacing
              const tx = item.transform
              if (tx && tx[0] < 0) {
                // Text might be rotated
                return ' ' + item.str + ' '
              }
              return item.str
            })
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
          return text
        }
      }
      
      const pdfData = await pdfParse(buffer, options)
      
      // Also try to get form fields if any
      let formText = ''
      if (pdfData.info && pdfData.info.Fields) {
        formText = '\n\nFORM FIELDS:\n' + JSON.stringify(pdfData.info.Fields, null, 2)
      }
      
      extractedContent = (pdfData.text || '') + formText
      
      if (extractedContent.trim().length > 50) {
        extractionMethod = 'pdf-parse-enhanced'
        extractionAttempts.push(`pdf-parse: ${extractedContent.length} chars extracted`)
      }
    } catch (e: any) {
      extractionAttempts.push(`pdf-parse failed: ${e.message}`)
    }
    
    // Method 2: Try raw text extraction
    if (!extractedContent || extractedContent.length < 100) {
      try {
        // Look for text patterns in the buffer
        const textBuffer = buffer.toString('utf8')
        const cleanText = textBuffer
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        if (cleanText.length > extractedContent.length && cleanText.length > 100) {
          extractedContent = cleanText
          extractionMethod = 'raw-text'
          extractionAttempts.push(`raw-text: ${cleanText.length} chars extracted`)
        }
      } catch (e: any) {
        extractionAttempts.push(`raw-text failed: ${e.message}`)
      }
    }
    
    // Method 3: Look for structured data patterns
    if (extractedContent.length < 500) {
      try {
        const patterns = [
          /Score[s]?\s*:?\s*(\d+)/gi,
          /Result[s]?\s*:?\s*([\w\s]+)/gi,
          /Test[s]?\s*:?\s*([\w\s]+)/gi,
          /Patient\s*:?\s*([\w\s]+)/gi,
          /Date\s*:?\s*([\d\/\-]+)/gi,
          /(\d+\.?\d*)\s*(mg|µg|ng|pg|mL|dL|L|IU|nmol|pmol)/gi
        ]
        
        let structuredData = ''
        for (const pattern of patterns) {
          const matches = buffer.toString('latin1').match(pattern)
          if (matches) {
            structuredData += '\n' + matches.join('\n')
          }
        }
        
        if (structuredData) {
          extractedContent += '\n\nSTRUCTURED DATA FOUND:' + structuredData
          extractionAttempts.push('pattern-matching: found structured data')
        }
      } catch (e: any) {
        extractionAttempts.push(`pattern-matching failed: ${e.message}`)
      }
    }
    
    console.log('[PDF-ADVANCED] Extraction attempts:', extractionAttempts)
    console.log('[PDF-ADVANCED] Final content length:', extractedContent.length)
    
    // Prepare comprehensive prompt
    const claude = ClaudeClient.getInstance()
    
    const prompt = `You are analyzing a health document: ${file.name}

EXTRACTION INFORMATION:
- File size: ${file.size} bytes
- Extraction method: ${extractionMethod}
- Content extracted: ${extractedContent.length} characters
- Extraction attempts: ${extractionAttempts.join('; ')}

${extractedContent ? `EXTRACTED CONTENT:\n${extractedContent}` : 'NO CONTENT EXTRACTED - Document appears to be image-based or encrypted'}

IMPORTANT: Even with limited extraction, please provide:
1. What type of document this likely is based on the filename and any extracted content
2. Extract ANY values, scores, or data points you can find
3. If this appears to be a FIT test, NutriQ, KBMO, or other specific test, explain what would typically be found
4. Provide as specific recommendations as possible based on available information
5. If extraction failed, provide guidance on what the patient should do next

Please provide a comprehensive functional medicine analysis.`

    const systemPrompt = `You are Kevin Rutherford, FNTP, expert at analyzing health documents even with limited information.
Always extract every possible data point and provide specific, actionable recommendations.
If you recognize the document type from the filename, use your knowledge of what that test typically contains.`
    
    const analysis = await claude.analyzePractitionerReport(prompt, systemPrompt)
    
    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      extractionMethod,
      contentLength: extractedContent.length,
      extractionAttempts,
      analysis,
      warning: extractedContent.length < 100 ? 
        'Limited content extracted. This appears to be an image-based PDF. For best results, convert to images or request a text-based version.' : 
        undefined
    })
    
  } catch (error: any) {
    console.error('[PDF-ADVANCED] Error:', error)
    
    return NextResponse.json({
      error: 'Analysis failed',
      details: error.message,
      suggestion: 'Try converting this PDF to images or requesting a text-based version from the lab.'
    }, { status: 500 })
  }
}