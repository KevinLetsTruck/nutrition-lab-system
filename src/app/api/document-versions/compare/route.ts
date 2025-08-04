import { NextRequest, NextResponse } from 'next/server'
import { documentVersionService } from '@/lib/services/document-version-service'

export async function POST(request: NextRequest) {
  try {
    const { documentId, fromVersion, toVersion } = await request.json()
    
    if (!documentId || !fromVersion || !toVersion) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, fromVersion, toVersion' },
        { status: 400 }
      )
    }
    
    console.log(`[VERSION-COMPARE] Comparing versions ${fromVersion} to ${toVersion} for document ${documentId}`)
    
    const comparison = await documentVersionService.compareVersions(
      documentId,
      fromVersion,
      toVersion
    )
    
    return NextResponse.json({
      success: true,
      ...comparison
    })
    
  } catch (error) {
    console.error('[VERSION-COMPARE] Error:', error)
    return NextResponse.json(
      { error: 'Version comparison failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}