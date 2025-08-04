import { NextRequest, NextResponse } from 'next/server'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    console.log('[TEST-PDF-ANALYSIS] Starting test...')
    
    // Create a simple test PDF content
    const testPdfContent = `
    NUTRIQ NUTRITIONAL HEALTH QUESTIONNAIRE
    
    Name: Test Patient
    Date: 2025-08-04
    
    GROUP 1 - ESSENTIAL FATTY ACIDS
    Score: 15
    
    GROUP 2 - SUGAR HANDLING
    Score: 20
    
    GROUP 3 - MINERAL NEEDS
    Score: 12
    
    TOTAL SCORE: 47
    
    RECOMMENDATIONS:
    - Omega-3 supplementation
    - Reduce sugar intake
    - Consider mineral support
    `;
    
    // Convert to Buffer (simulating a PDF)
    const buffer = Buffer.from(testPdfContent, 'utf-8')
    
    console.log('[TEST-PDF-ANALYSIS] Created test buffer, size:', buffer.length)
    
    // Try to analyze
    const analyzer = MasterAnalyzer.getInstance()
    console.log('[TEST-PDF-ANALYSIS] Got analyzer instance')
    
    try {
      const result = await analyzer.analyzeReport(buffer)
      console.log('[TEST-PDF-ANALYSIS] Analysis successful:', result)
      
      return NextResponse.json({
        success: true,
        result,
        bufferSize: buffer.length
      })
    } catch (analyzeError: any) {
      console.error('[TEST-PDF-ANALYSIS] Analysis error:', analyzeError)
      
      return NextResponse.json({
        success: false,
        error: 'Analysis failed',
        details: analyzeError.message,
        stack: analyzeError.stack,
        type: analyzeError.constructor.name
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('[TEST-PDF-ANALYSIS] General error:', error)
    
    return NextResponse.json({
      error: 'Test failed',
      details: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 })
  }
}