import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const clientId = formData.get('clientId') as string

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    const uploadedResults = []

    for (const file of files) {
      // Generate unique filename
      const timestamp = new Date().getTime()
      const filename = `${clientId}/${timestamp}-${file.name}`

      // TODO: Implement file storage solution
      // For now, just create the lab result record without actual file storage
      console.log(`Would upload file: ${filename} (${file.size} bytes)`)
      
      // Use placeholder URL until storage is implemented
      const publicUrl = `/placeholder/${filename}`

      // Create lab result record
      const labResult = await prisma.labResult.create({
        data: {
          clientId,
          labName: 'Unknown Lab', // Will be extracted during processing
          fileUrl: publicUrl,
          fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
          processingStatus: 'pending',
          collectionDate: new Date(), // Will be updated during processing
          reportDate: new Date(),
          structuredData: {},
          confidenceScores: {}
        }
      })

      uploadedResults.push(labResult)

      // Queue for processing (in production, this would trigger a background job)
      // For now, we'll call the processing endpoint directly
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/lab-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          labResultId: labResult.id
        })
      }).catch(console.error) // Fire and forget
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedResults.length,
      resultId: uploadedResults[0]?.id,
      results: uploadedResults.map(r => ({
        id: r.id,
        status: r.processingStatus
      }))
    })

  } catch (error) {
    console.error('Lab upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload lab results' },
      { status: 500 }
    )
  }
}
