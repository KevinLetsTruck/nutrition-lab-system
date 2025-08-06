import { NextRequest, NextResponse } from 'next/server'
import { saveFile, validateFile, getFileInfo } from '@/lib/file-utils'
import { getRateLimiter, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limiter'
import { db } from '@/lib/supabase'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import DatabaseService from '@/lib/database-service'
import { SupabaseStorageService } from '@/lib/supabase-storage'
import { getServerSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  console.log('[UPLOAD] === NEW UPLOAD REQUEST ===')
  console.log('[UPLOAD] Request URL:', request.url)
  console.log('[UPLOAD] Request method:', request.method)
  
  try {
    // Rate limiting first
    const rateLimiter = getRateLimiter('upload')
    const rateLimitClientId = getClientIdentifier(request)
    
    if (!rateLimiter.isAllowed(rateLimitClientId)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(rateLimiter.getResetTime(rateLimitClientId) / 1000)
        },
        { 
          status: 429,
          headers: {
            ...createRateLimitHeaders(rateLimiter, rateLimitClientId),
            'Retry-After': Math.ceil(rateLimiter.getResetTime(rateLimitClientId) / 1000).toString()
          }
        }
      )
    }

    const formData = await request.formData()
    console.log('[UPLOAD] FormData received')
    
    const files = formData.getAll('file') as File[]
    const clientEmail = formData.get('clientEmail') as string
    const clientFirstName = formData.get('clientFirstName') as string
    const clientLastName = formData.get('clientLastName') as string
    const category = formData.get('category') as string
    const quickAnalysis = formData.get('quickAnalysis') as string
    const clientId = formData.get('clientId') as string
    
    console.log('[UPLOAD] Parsed form data:', {
      filesCount: files.length,
      clientEmail,
      clientFirstName,
      clientLastName,
      category,
      quickAnalysis,
      clientId
    })
    
    // Check authentication (except for quick analysis or client uploads)
    if (quickAnalysis !== 'true' && !clientId) {
      const session = await getServerSession(request)
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    
    // If clientId is provided, verify it exists
    if (clientId && !quickAnalysis) {
      try {
        const client = await db.getClientById(clientId)
        
        if (!client) {
          return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 })
        }
        
        // Verify the email matches
        if (client.email !== clientEmail) {
          return NextResponse.json({ error: 'Client email mismatch' }, { status: 400 })
        }
      } catch (error) {
        console.error('Error verifying client:', error)
        return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 })
      }
    }
    
    if (!files || files.length === 0) {
      console.log('[UPLOAD] No files provided - returning 400')
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Handle quick analysis mode (no client required)
    if (quickAnalysis === 'true') {
      const results = []
      const errors = []

      // Process each file for quick analysis
      for (const file of files) {
        try {
          // Validate file
          const validation = validateFile(file)
          
          if (!validation.valid) {
            errors.push({
              filename: file.name,
              error: validation.error
            })
            continue
          }

          // Convert File to Buffer for storage upload
          const arrayBuffer = await file.arrayBuffer()
          const fileBuffer = Buffer.from(arrayBuffer)
          
          // Upload file to Supabase Storage with quick analysis path
          // Note: saveFile will generate its own unique filename internally
          const storageFile = await saveFile(fileBuffer, file.name, 'quick-analysis', {
            uploadedBy: 'quick-analysis',
            timestamp: new Date().toISOString()
          }, true)
          
          // Log the exact path that was saved
          console.log('[UPLOAD] File saved to storage:', {
            bucket: storageFile.bucket,
            path: storageFile.path,
            fullPath: `${storageFile.bucket}/${storageFile.path}`
          })
          
          console.log('[UPLOAD] Storage file response:', {
            path: storageFile.path,
            bucket: storageFile.bucket,
            url: storageFile.url
          })
          
          results.push({
            success: true,
            filename: file.name,
            originalName: file.name,
            size: file.size,
            storagePath: storageFile.path,
            storageUrl: storageFile.url,
            bucket: storageFile.bucket,
            filePath: storageFile.path, // For analysis API
            quickAnalysis: true
          })
          
        } catch (error) {
          console.error('Error processing file for quick analysis:', file.name, error)
          errors.push({
            filename: file.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Return results for quick analysis
      if (results.length === 0) {
        return NextResponse.json(
          { 
            error: 'All files failed to upload',
            details: errors
          },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        uploaded: results.length,
        failed: errors.length,
        files: results,
        errors: errors.length > 0 ? errors : undefined,
        quickAnalysis: true
      }, {
        headers: {
          ...createRateLimitHeaders(rateLimiter, rateLimitClientId)
        }
      })
    }

    // Regular upload mode (requires client information)
    if (!clientEmail || !clientFirstName || !clientLastName) {
      console.log('[UPLOAD] Missing client information - returning 400', {
        hasEmail: !!clientEmail,
        hasFirstName: !!clientFirstName,
        hasLastName: !!clientLastName
      })
      return NextResponse.json(
        { error: 'Missing client information (email, firstName, lastName)' },
        { status: 400 }
      )
    }

    // Find or create client (use provided clientId or find/create one)
    let targetClientId: string
    if (clientId) {
      // Use the provided clientId (already validated above)
      targetClientId = clientId
    } else {
      // Find or create client
      try {
        const existingClient = await db.searchClients(clientEmail)
        if (existingClient.length > 0) {
          targetClientId = existingClient[0].id
        } else {
          const newClient = await db.createClient({
            email: clientEmail,
            first_name: clientFirstName,
            last_name: clientLastName
          })
          targetClientId = newClient.id
        }
      } catch (error) {
        console.error('Error finding/creating client:', error)
        return NextResponse.json(
          { error: 'Failed to process client information' },
          { status: 500 }
        )
      }
    }

    const results = []
    const errors = []

    // Process each file
    console.log('[UPLOAD] Processing files:', files.length)
    for (const file of files) {
      try {
        console.log('[UPLOAD] Processing file:', file.name, 'size:', file.size, 'type:', file.type)
        
        // Validate file
        const validation = validateFile(file)
        console.log('[UPLOAD] Validation result:', validation)
        
        if (!validation.valid) {
          console.log('[UPLOAD] File validation failed:', file.name, validation.error)
          errors.push({
            filename: file.name,
            error: validation.error
          })
          continue
        }

        // Convert File to Buffer for storage upload
        console.log('[UPLOAD] Converting file to buffer...')
        const arrayBuffer = await file.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)
        console.log('[UPLOAD] Buffer created, size:', fileBuffer.length)
        
        // Upload file to Supabase Storage
        console.log('[UPLOAD] Calling saveFile with category:', category, 'clientId:', targetClientId)
        const storageFile = await saveFile(fileBuffer, file.name, category, {
          clientId: targetClientId,
          clientEmail,
          uploadedBy: 'api'
        }, true) // Use service role for server-side uploads
        console.log('[UPLOAD] SaveFile returned:', storageFile)
        
        // Create lab report record in database
        const reportType = determineReportType(file.name, file.type, category)
        const labReport = await db.createLabReport({
          client_id: targetClientId,
          report_type: reportType,
          report_date: new Date().toISOString().split('T')[0],
          file_path: storageFile.path,
          file_size: storageFile.size,
          notes: `Uploaded via API - ${file.name}`
        })
        
        results.push({
          success: true,
          filename: file.name,
          originalName: file.name,
          size: file.size,
          storagePath: storageFile.path,
          storageUrl: storageFile.url,
          bucket: storageFile.bucket,
          labReportId: labReport.id,
          clientEmail,
          clientFirstName,
          clientLastName,
          reportType
        })
        
        // Trigger analysis automatically after successful upload
        console.log('[UPLOAD] Triggering automatic analysis for report:', labReport.id)
        
        // Make an internal request to the analyze endpoint
        const baseUrl = request.headers.get('host') || 'localhost:3000'
        const protocol = request.headers.get('x-forwarded-proto') || 'http'
        const analyzeUrl = `${protocol}://${baseUrl}/api/analyze`
        
        fetch(analyzeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            labReportId: labReport.id
          })
        }).then(response => {
          if (response.ok) {
            console.log('[UPLOAD] Analysis triggered successfully for report:', labReport.id)
          } else {
            console.error('[UPLOAD] Failed to trigger analysis for report:', labReport.id, response.status)
          }
        }).catch(error => {
          console.error('[UPLOAD] Error triggering analysis for report:', labReport.id, error)
        })
        
        // Don't wait for analysis to complete - return upload success immediately
        
      } catch (error) {
        console.error('[UPLOAD] Error processing file:', file.name, error)
        console.error('[UPLOAD] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({
          filename: file.name,
          error: errorMessage
        })
      }
    }

    // Return results
    if (results.length === 0) {
      return NextResponse.json(
        { 
          error: 'All files failed to upload',
          details: errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      uploaded: results.length,
      failed: errors.length,
      files: results,
      errors: errors.length > 0 ? errors : undefined
    }, {
      headers: {
        ...createRateLimitHeaders(rateLimiter, rateLimitClientId)
      }
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to determine report type based on file and category
function determineReportType(fileName: string, mimeType: string, category?: string): 'nutriq' | 'kbmo' | 'dutch' | 'cgm' | 'food_photo' {
  const lowerFileName = fileName.toLowerCase()
  
  // If category is specified, map it to report type
  if (category) {
    switch (category) {
      case 'lab_reports':
        if (lowerFileName.includes('nutriq') || lowerFileName.includes('naq')) return 'nutriq'
        if (lowerFileName.includes('kbmo')) return 'kbmo'
        if (lowerFileName.includes('dutch')) return 'dutch'
        return 'nutriq' // Default for lab reports
      case 'cgm_data':
        return 'cgm'
      case 'food_photos':
        return 'food_photo'
      default:
        break
    }
  }
  
  // Auto-detect based on filename
  if (lowerFileName.includes('nutriq') || lowerFileName.includes('naq')) return 'nutriq'
  if (lowerFileName.includes('kbmo')) return 'kbmo'
  if (lowerFileName.includes('dutch')) return 'dutch'
  if (lowerFileName.includes('cgm') || lowerFileName.includes('glucose')) return 'cgm'
  if (lowerFileName.includes('food') || lowerFileName.includes('meal')) return 'food_photo'
  
  // Default based on MIME type
  if (mimeType === 'application/pdf') return 'nutriq'
  if (mimeType.startsWith('image/')) return 'food_photo'
  
  return 'nutriq' // Default fallback
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Upload endpoint ready',
    maxFileSize: process.env.MAX_FILE_SIZE || '10485760',
    allowedTypes: process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,txt',
    storage: 'Supabase Storage'
  })
}
