import { NextRequest, NextResponse } from 'next/server'
import ClaudeClient from '@/lib/claude-client'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    let text: string = ''
    let documentType: string = 'auto'
    let clientName: string = 'Unknown Client'
    let fileName: string = ''
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData()
      const file = formData.get('file') as File
      clientName = formData.get('clientName') as string || 'Unknown Client'
      documentType = formData.get('documentType') as string || 'auto'
      
      if (file) {
        fileName = file.name
        
        // In production, we can't extract text from PDFs easily
        // So we'll just acknowledge the file
        text = `[File uploaded: ${fileName}]\n\nNote: In production, PDF text extraction is limited. Please use the PDF Lab Report Processor at /test-pdf-processor for full PDF analysis capabilities.`
      }
    } else {
      // Handle JSON with text
      const body = await request.json()
      text = body.text || ''
      documentType = body.documentType || 'auto'
      clientName = body.clientName || 'Unknown Client'
    }
    
    if (!text) {
      return NextResponse.json({
        error: 'No text content to analyze',
        details: 'Please provide text content or use the PDF processor for file uploads'
      }, { status: 400 })
    }
    
    // Analyze with Claude
    const claude = ClaudeClient.getInstance()
    
    const systemPrompt = `You are a functional medicine practitioner analyzing health information. 
    Provide comprehensive analysis including:
    - Key findings and patterns
    - Health risks and concerns
    - Personalized recommendations
    - Lifestyle modifications
    - Follow-up suggestions
    
    Format your response in clear sections with actionable insights.`
    
    const userPrompt = `Please analyze this health information for ${clientName}:
    
${text}

Provide a comprehensive functional medicine analysis with specific recommendations.`
    
    const response = await claude.analyzePractitionerReport(
      userPrompt,
      systemPrompt
    )
    
    return NextResponse.json({
      success: true,
      analysis: response,
      metadata: {
        clientName,
        documentType,
        fileName,
        textLength: text.length,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('[Analyze-Production] Error:', error)
    
    return NextResponse.json({
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}