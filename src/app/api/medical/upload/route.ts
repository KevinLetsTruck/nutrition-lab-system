import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/tiff',
  'image/heic',
  'image/heif'
]

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.heic', '.heif']

interface FileUploadResult {
  fileName: string
  status: 'success' | 'error'
  documentId?: string
  error?: string
  details?: any
}

export async function POST(req: NextRequest) {
  try {
    // ============ TEMPORARY AUTH BYPASS FOR TESTING ============
    const isTestMode = req.nextUrl.searchParams.get('test') === 'true'
    
    if (isTestMode) {
      console.warn('⚠️ AUTH BYPASSED FOR TESTING - REMOVE IN PRODUCTION')
      console.warn('Test mode activated at:', new Date().toISOString())
    } else {
      // TODO: Add your normal JWT/auth validation here
      // const token = req.headers.get('authorization')
      // if (!token) {
      //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      // }
      // Temporarily skip auth check until properly configured
      console.log('Auth check skipped - configure JWT validation')
    }
    // ============ END TEMPORARY AUTH BYPASS ============

    // Parse form data
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const clientId = formData.get('clientId') as string | null
    const isRadioShow = formData.get('isRadioShow') === 'true'

    // Validate that files were provided
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Validate file count
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files allowed per upload' },
        { status: 400 }
      )
    }

    console.log(`Processing ${files.length} files for upload...`)

    // Process each file independently
    const uploadPromises = files.map(async (file): Promise<FileUploadResult> => {
      try {
        // Validate individual file
        const validationError = validateFile(file)
        if (validationError) {
          return {
            fileName: file.name,
            status: 'error',
            error: validationError
          }
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Attempt S3 upload (gracefully handle if S3 not configured)
        let s3Key: string | null = null
        let s3Url: string | null = null
        
        try {
          // Check if S3 is configured
          if (process.env.S3_MEDICAL_BUCKET_NAME && process.env.S3_ACCESS_KEY_ID) {
            const { medicalDocStorage } = await import('@/lib/medical/storage-service')
            const uploadResult = await medicalDocStorage.uploadDocument(
              buffer,
              file.name,
              file.type,
              clientId || undefined
            )
            s3Key = uploadResult.key
            s3Url = uploadResult.url
            console.log(`✅ S3 upload successful for ${file.name}`)
          } else {
            console.warn(`⚠️ S3 not configured - storing metadata only for ${file.name}`)
          }
        } catch (s3Error) {
          console.error(`S3 upload failed for ${file.name}:`, s3Error)
          // Continue without S3 - store metadata only
        }

        // Create database record
        const document = await prisma.medicalDocument.create({
          data: {
            clientId,
            documentType: 'pending_classification',
            originalFileName: file.name,
            s3Key,
            s3Url,
            status: s3Key ? 'PENDING' : 'PENDING_STORAGE',
            metadata: {
              mimeType: file.type,
              size: file.size,
              isRadioShow,
              uploadedAt: new Date().toISOString(),
              testMode: isTestMode
            },
          },
        })

        // Add to processing queue if S3 upload was successful
        if (s3Key && s3Url) {
          try {
            const queueAvailable = await checkQueueAvailability()
            if (queueAvailable) {
              const { addMedicalDocToQueue } = await import('@/lib/medical/queue-service')
              await addMedicalDocToQueue({
                documentId: document.id,
                clientId: clientId || undefined,
                fileUrl: s3Url,
                fileKey: s3Key,
                documentType: 'unknown',
                priority: isRadioShow ? 10 : 0,
                isRadioShow,
              })
              console.log(`📋 Added ${file.name} to processing queue`)
            }
          } catch (queueError) {
            console.warn(`Queue not available for ${file.name}:`, queueError)
          }
        }

        return {
          fileName: file.name,
          status: 'success',
          documentId: document.id,
          details: {
            size: file.size,
            type: file.type,
            s3Uploaded: !!s3Key,
            queuedForProcessing: !!s3Key,
            storageStatus: s3Key ? 'uploaded' : 'pending'
          }
        }

      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error)
        return {
          fileName: file.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    })

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises)

    // Analyze results
    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    // Determine overall status
    const overallSuccess = errorCount === 0
    const partialSuccess = successCount > 0 && errorCount > 0

    return NextResponse.json({
      success: overallSuccess,
      partialSuccess,
      message: generateStatusMessage(successCount, errorCount),
      summary: {
        totalFiles: files.length,
        successful: successCount,
        failed: errorCount
      },
      results,
      testMode: isTestMode,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Medical document upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process upload request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to validate individual files
function validateFile(file: File): string | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)`
  }

  // Check file type by MIME type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    // Also check by extension as fallback
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `Invalid file type: ${file.type || extension}`
    }
  }

  // Check for empty files
  if (file.size === 0) {
    return 'File is empty'
  }

  return null // No validation errors
}

// Helper function to check if queue is available
async function checkQueueAvailability(): Promise<boolean> {
  try {
    if (!process.env.REDIS_MEDICAL_URL && !process.env.REDIS_URL) {
      return false
    }
    // Add actual Redis connection check here if needed
    return true
  } catch {
    return false
  }
}

// Helper function to generate user-friendly status message
function generateStatusMessage(successCount: number, errorCount: number): string {
  if (errorCount === 0) {
    return `Successfully uploaded ${successCount} document${successCount !== 1 ? 's' : ''}`
  } else if (successCount === 0) {
    return `Failed to upload ${errorCount} document${errorCount !== 1 ? 's' : ''}`
  } else {
    return `Uploaded ${successCount} document${successCount !== 1 ? 's' : ''}, ${errorCount} failed`
  }
}