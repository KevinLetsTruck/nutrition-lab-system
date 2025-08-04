import { NextRequest, NextResponse } from 'next/server'
import { documentVersionService } from '@/lib/services/document-version-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const documentId = resolvedParams.id
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    console.log('[DOCUMENT-HISTORY] Getting history for document:', documentId)
    
    const history = await documentVersionService.getDocumentHistory(documentId)
    
    return NextResponse.json({
      success: true,
      ...history
    })
    
  } catch (error) {
    console.error('[DOCUMENT-HISTORY] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get document history', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}