import { NextRequest, NextResponse } from 'next/server'
import ClaudeClient from '@/lib/claude-client'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientName = formData.get('clientName') as string || 'Unknown Client'
    const documentType = formData.get('documentType') as string || 'auto'
    
    if (!file) {
      return NextResponse.json({
        error: 'No file provided',
        details: 'Please upload a PDF or image file'
      }, { status: 400 })
    }
    
    // Check file size (Claude API limit is 5MB)
    const MAX_FILE_SIZE_MB = 5
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return NextResponse.json({
        error: 'File too large',
        details: `File size (${fileSizeMB.toFixed(2)}MB) exceeds the 5MB limit for Claude API`,
        suggestion: 'Please compress your PDF or reduce image quality'
      }, { status: 400 })
    }
    
    // Convert file to base64 for Claude API
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    
    // Strip any data URL prefix if present
    const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '')
    
    // Determine media type
    let mediaType = file.type
    if (!mediaType) {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        mediaType = 'application/pdf'
      } else if (file.name.toLowerCase().match(/\.(jpg|jpeg)$/)) {
        mediaType = 'image/jpeg'
      } else if (file.name.toLowerCase().endsWith('.png')) {
        mediaType = 'image/png'
      } else if (file.name.toLowerCase().endsWith('.gif')) {
        mediaType = 'image/gif'
      } else if (file.name.toLowerCase().endsWith('.webp')) {
        mediaType = 'image/webp'
      }
    }
    
    // Initialize Claude client
    const claude = ClaudeClient.getInstance()
    
    // Create the message with vision capabilities
    const systemPrompt = `You are an expert functional medicine practitioner analyzing medical lab reports and health documents. 
    
    IMPORTANT: This document likely contains visual elements like:
    - Charts and graphs
    - Tables with lab values
    - Reference ranges
    - Visual indicators (arrows, colors, etc.)
    
    Please provide a comprehensive analysis including:
    1. All numerical values and their significance
    2. Any patterns in the visual data
    3. Abnormal findings (high/low values)
    4. Clinical interpretation
    5. Recommended actions
    
    Be specific about what you see in the images/charts.`
    
    let analysisResult
    
    if (mediaType === 'application/pdf') {
      // For PDFs, use 'document' type
      analysisResult = await claude.analyzeWithDocument(
        `Please analyze this PDF lab report for ${clientName}. 
        Document type: ${documentType}
        
        Extract ALL visual information including:
        - All lab values from tables
        - Chart data and trends
        - Any visual indicators or markers
        - Reference ranges
        
        Provide a detailed clinical analysis.`,
        {
          type: 'document',  // Fixed: Using 'document' for PDFs
          source: {
            type: 'base64',
            media_type: mediaType,
            data: cleanBase64
          }
        },
        systemPrompt
      )
    } else if (mediaType.startsWith('image/')) {
      // For images, use 'image' type
      analysisResult = await claude.analyzeWithVision(
        `Please analyze this medical image/document for ${clientName}. 
        Document type: ${documentType}
        
        Extract ALL visual information and provide detailed clinical analysis.`,
        [{
          type: 'image',  // Keep 'image' for actual images
          source: {
            type: 'base64',
            media_type: mediaType,
            data: cleanBase64
          }
        }],
        systemPrompt
      )
    } else {
      return NextResponse.json({
        error: 'Unsupported file type',
        details: `File type ${mediaType} is not supported. Please upload a PDF or image (JPEG, PNG, GIF, WebP).`
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      metadata: {
        clientName,
        documentType,
        fileName: file.name,
        fileType: mediaType,
        fileSize: file.size,
        fileSizeMB: fileSizeMB.toFixed(2),
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('[Analyze-Vision] Error:', error)
    
    return NextResponse.json({
      error: 'Vision analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Please ensure your file is a valid PDF or image format and under 5MB'
    }, { status: 500 })
  }
}