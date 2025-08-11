import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { medicalDocStorage } from '@/lib/medical/storage-service'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES_PER_UPLOAD = 10

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png', 
  'image/tiff',
  'image/heic',
  'image/webp'
]

const DOCUMENT_TYPE_MAPPING = {
  'pdf': 'lab_report',
  'jpeg': 'scan',
  'jpg': 'scan', 
  'png': 'scan',
  'tiff': 'scan',
  'heic': 'photo',
  'webp': 'scan'
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  console.log('📤 Starting medical document upload...')
  
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const clientId = formData.get('clientId') as string | null
    const isRadioShow = formData.get('isRadioShow') === 'true'
    const uploadSource = formData.get('source') as string || 'web_upload'
    
    console.log(`📋 Upload request: ${files.length} files, clientId: ${clientId || 'none'}, radioShow: ${isRadioShow}`)
    
    // Validation
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload` },
        { status: 400 }
      )
    }

    // Validate client exists if provided
    let client = null
    if (clientId) {
      client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { id: true, name: true }
      })
      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }
      console.log(`👤 Client validated: ${client.name}`)
    }

    const uploadResults = []
    const uploadErrors = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileNum = i + 1
      
      console.log(`📄 Processing file ${fileNum}/${files.length}: ${file.name}`)
      
      try {
        // File validation
        if (file.size > MAX_FILE_SIZE) {
          const sizeMB = (file.size / 1024 / 1024).toFixed(1)
          uploadErrors.push(`${file.name}: File too large (${sizeMB}MB, max 10MB)`)
          continue
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          uploadErrors.push(`${file.name}: Unsupported file type (${file.type})`)
          continue
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Upload to S3
        const uploadStart = Date.now()
        const { key, url, size, optimized } = await medicalDocStorage.uploadDocument(
          buffer,
          file.name,
          file.type,
          clientId || undefined
        )
        const uploadTime = Date.now() - uploadStart
        
        // Determine document type based on file extension
        const extension = file.name.split('.').pop()?.toLowerCase() || 'unknown'
        const documentType = DOCUMENT_TYPE_MAPPING[extension as keyof typeof DOCUMENT_TYPE_MAPPING] || 'unknown'
        
        // Create database record
        const document = await prisma.medicalDocument.create({
          data: {
            clientId,
            documentType,
            originalFileName: file.name,
            s3Key: key,
            s3Url: url,
            status: 'PENDING',
            metadata: {
              mimeType: file.type,
              originalSize: file.size,
              processedSize: size,
              optimized,
              uploadTime,
              isRadioShow,
              uploadSource,
              uploadedBy: 'kevin-rutherford-fntp'
            },
          },
          include: {
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })
        
        console.log(`✅ File ${fileNum} uploaded successfully: ${document.id}`)
        
        uploadResults.push({
          id: document.id,
          filename: file.name,
          documentType,
          status: 'uploaded',
          s3Key: key,
          size,
          optimized,
          uploadTime,
          client: document.client
        })

      } catch (error) {
        console.error(`❌ Upload error for file ${fileNum} (${file.name}):`, error)
        uploadErrors.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`)
      }
    }
    
    const totalTime = Date.now() - startTime
    console.log(`🏁 Upload complete: ${uploadResults.length} successful, ${uploadErrors.length} failed, ${totalTime}ms total`)
    
    return NextResponse.json({
      success: uploadResults.length > 0,
      documents: uploadResults,
      errors: uploadErrors,
      stats: {
        totalFiles: files.length,
        successful: uploadResults.length,
        failed: uploadErrors.length,
        totalTime
      },
      message: `${uploadResults.length}/${files.length} documents uploaded successfully${uploadErrors.length > 0 ? `, ${uploadErrors.length} failed` : ''}`
    })

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error('💥 Medical document upload system error:', error)
    return NextResponse.json(
      { 
        error: 'Upload system error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        totalTime
      },
      { status: 500 }
    )
  }
}

// Add GET endpoint for testing S3 connection
export async function GET() {
  try {
    const connectionTest = await medicalDocStorage.testConnection()
    return NextResponse.json({
      s3Connected: connectionTest,
      bucket: process.env.S3_MEDICAL_BUCKET_NAME,
      region: process.env.S3_REGION,
      message: connectionTest ? 'S3 connection successful' : 'S3 connection failed'
    })
  } catch (error) {
    return NextResponse.json({
      s3Connected: false,
      error: error instanceof Error ? error.message : 'Connection test failed'
    }, { status: 500 })
  }
}

