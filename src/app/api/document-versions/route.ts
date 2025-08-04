import { NextRequest, NextResponse } from 'next/server'
import { documentVersionService } from '@/lib/services/document-version-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, fileName, documentType, extractedData, documentId, enhancedData } = body
    
    if (!clientId || !fileName || !documentType || !extractedData) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, fileName, documentType, extractedData' },
        { status: 400 }
      )
    }
    
    console.log('[DOCUMENT-VERSIONS] Processing document:', fileName)
    
    // If documentId is provided, we're creating a new version
    // Otherwise, create a new document
    const result = await documentVersionService.processDocumentUpload(
      clientId,
      fileName,
      documentType,
      extractedData,
      enhancedData,
      { source: 'api-test' }
    )
    
    return NextResponse.json({
      success: true,
      document: result.document,
      version: result.version
    })
    
  } catch (error) {
    console.error('[DOCUMENT-VERSIONS] Error:', error)
    return NextResponse.json(
      { error: 'Document versioning failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    const history = await documentVersionService.getDocumentHistory(documentId)
    
    return NextResponse.json({
      success: true,
      ...history
    })
    
  } catch (error) {
    console.error('[DOCUMENT-VERSIONS] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get document history', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}