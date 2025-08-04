import { NextRequest, NextResponse } from 'next/server'
import MedicalTerminologyProcessor from '@/lib/document-processors/medical-terminology-processor'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }
    
    console.log('[TEST-MEDICAL-TERMS] Processing text with length:', text.length)
    
    // Test the medical terminology processor
    const enhanced = await MedicalTerminologyProcessor.enhanceOCRResults(text)
    
    return NextResponse.json({
      success: true,
      originalText: text,
      enhancedText: enhanced.enhancedText,
      medicalTerms: enhanced.medicalTerms,
      corrections: enhanced.corrections,
      overallConfidence: enhanced.overallConfidence,
      improvements: {
        termsIdentified: enhanced.medicalTerms.length,
        correctionsMade: enhanced.corrections.length,
        confidenceScore: enhanced.overallConfidence
      }
    })
    
  } catch (error) {
    console.error('[TEST-MEDICAL-TERMS] Error:', error)
    return NextResponse.json(
      { error: 'Medical terminology processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}