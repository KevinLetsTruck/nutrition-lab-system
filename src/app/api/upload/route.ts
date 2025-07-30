import { NextRequest, NextResponse } from 'next/server'
import { saveFile, validateFile, generateUniqueFilename, getFileInfo } from '@/lib/file-utils'
import { getRateLimiter, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limiter'
import { db } from '@/lib/supabase'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import DatabaseService from '@/lib/database-service'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
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
    const files = formData.getAll('file') as File[]
    const clientEmail = formData.get('clientEmail') as string
    const clientFirstName = formData.get('clientFirstName') as string
    const clientLastName = formData.get('clientLastName') as string
    const category = formData.get('category') as string
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Validate client information
    if (!clientEmail || !clientFirstName || !clientLastName) {
      return NextResponse.json(
        { error: 'Missing client information (email, firstName, lastName)' },
        { status: 400 }
      )
    }

    // Find or create client
    let clientId: string
    try {
      const existingClient = await db.searchClients(clientEmail)
      if (existingClient.length > 0) {
        clientId = existingClient[0].id
      } else {
        const newClient = await db.createClient({
          email: clientEmail,
          first_name: clientFirstName,
          last_name: clientLastName
        })
        clientId = newClient.id
      }
    } catch (error) {
      console.error('Error finding/creating client:', error)
      return NextResponse.json(
        { error: 'Failed to process client information' },
        { status: 500 }
      )
    }

    const results = []
    const errors = []

    // Process each file
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

        // Upload file to Supabase Storage
        const storageFile = await saveFile(file, file.name, category, {
          clientId,
          clientEmail,
          uploadedBy: 'api'
        })
        
        // Create lab report record in database
        const reportType = determineReportType(file.name, file.type, category)
        const labReport = await db.createLabReport({
          client_id: clientId,
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
        console.error('Error processing file:', file.name, error)
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
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
