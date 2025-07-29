import { NextRequest, NextResponse } from 'next/server'
import { storageService } from '@/lib/supabase-storage'

interface TestResults {
  environment: {
    hasUrl: boolean
    hasAnonKey: boolean
    hasServiceKey: boolean
  }
  buckets: Record<string, {
    exists: boolean
    fileCount?: number
    error?: string
  }>
  uploadTest: {
    success: boolean
    error?: string
    path?: string
  } | null
  downloadTest: {
    success: boolean
    size: number
    contentMatches: boolean
  } | null
  errors: Array<{
    stage: string
    error: string
  }>
}

export async function GET(request: NextRequest) {
  console.log('[TEST-STORAGE] Starting storage test...')
  
  const results: TestResults = {
    environment: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)
    },
    buckets: {},
    uploadTest: null,
    downloadTest: null,
    errors: []
  }

  try {
    // Test 1: Check buckets
    const buckets = ['lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements', 'general']
    
    for (const bucket of buckets) {
      try {
        // Try a simple list operation
        const files = await storageService.listFiles(bucket)
        results.buckets[bucket] = {
          exists: true,
          fileCount: files.length
        }
      } catch (error) {
        results.buckets[bucket] = {
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 2: Upload test
    try {
      console.log('[TEST-STORAGE] Testing upload...')
      const testContent = Buffer.from('Test content from API: ' + new Date().toISOString())
      const testFileName = `api-test-${Date.now()}.txt`
      
      const uploadResult = await storageService.uploadFile(
        testContent,
        testFileName,
        'general'
      )
      
      results.uploadTest = {
        success: uploadResult.success,
        error: uploadResult.error,
        path: uploadResult.file?.path
      }

      // Test 3: Download test (if upload succeeded)
      if (uploadResult.success && uploadResult.file) {
        console.log('[TEST-STORAGE] Testing download...')
        const downloadBuffer = await storageService.downloadFile(
          uploadResult.file.bucket,
          uploadResult.file.path
        )
        
        results.downloadTest = {
          success: !!downloadBuffer,
          size: downloadBuffer ? downloadBuffer.length : 0,
          contentMatches: downloadBuffer ? 
            downloadBuffer.toString().includes('Test content from API') : false
        }

        // Cleanup
        await storageService.deleteFile(
          uploadResult.file.bucket,
          uploadResult.file.path
        )
      }
    } catch (error) {
      results.errors.push({
        stage: 'upload/download test',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[TEST-STORAGE] Fatal error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('[TEST-STORAGE] Testing file upload via POST...')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }

    console.log('[TEST-STORAGE] File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to storage
    const uploadResult = await storageService.uploadFile(
      buffer,
      file.name,
      'general',
      {
        mimeType: file.type,
        size: file.size
      }
    )

    if (!uploadResult.success) {
      return NextResponse.json({
        success: false,
        error: uploadResult.error
      }, { status: 500 })
    }

    // Try to download it back
    const downloadBuffer = await storageService.downloadFile(
      uploadResult.file!.bucket,
      uploadResult.file!.path
    )

    return NextResponse.json({
      success: true,
      upload: {
        path: uploadResult.file!.path,
        bucket: uploadResult.file!.bucket,
        url: uploadResult.file!.url
      },
      download: {
        success: !!downloadBuffer,
        size: downloadBuffer ? downloadBuffer.length : 0
      }
    })

  } catch (error) {
    console.error('[TEST-STORAGE] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 