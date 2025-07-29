import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { storageService } from '@/lib/supabase-storage'

interface CheckResult {
  id: string
  type: string
  status: string
  originalPath: string
  valid: boolean
  error: string | null
  action: string | null
}

export async function GET(request: NextRequest) {
  try {
    // Add basic auth check for security
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.MIGRATION_SECRET || 'your-secret-key'}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    // Get all lab reports with file paths
    const { data: reports, error: reportsError } = await supabase
      .from('lab_reports')
      .select('*')
      .not('file_path', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50)

    if (reportsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch reports',
        details: reportsError
      }, { status: 500 })
    }

    const results = {
      total: reports.length,
      checked: 0,
      valid: 0,
      invalid: 0,
      fixed: 0,
      failed: 0,
      details: [] as CheckResult[]
    }

    for (const report of reports) {
      results.checked++
      
      const checkResult: CheckResult = {
        id: report.id,
        type: report.report_type,
        status: report.status,
        originalPath: report.file_path,
        valid: false,
        error: null,
        action: null
      }

      // Determine bucket
      let bucket = 'lab-files'
      let filePath = report.file_path
      
      // Check if it's an old local path
      if (report.file_path.startsWith('/Users/') || report.file_path.startsWith('C:\\')) {
        checkResult.error = 'Local file path detected'
        checkResult.action = 'needs_migration'
        results.invalid++
        
        // Update status to indicate missing file
        await supabase
          .from('lab_reports')
          .update({ 
            status: 'failed',
            notes: 'File needs migration from local storage'
          })
          .eq('id', report.id)
          
      } else {
        // Extract bucket if in path
        if (report.file_path.includes('/')) {
          const parts = report.file_path.split('/')
          const buckets = ['lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements', 'general']
          if (buckets.includes(parts[0])) {
            bucket = parts[0]
            filePath = parts.slice(1).join('/')
          }
        }
        
        // Check if file exists
        try {
          const fileBuffer = await storageService.downloadFile(bucket, filePath)
          
          if (fileBuffer) {
            checkResult.valid = true
            checkResult.action = 'file_exists'
            results.valid++
          } else {
            checkResult.error = 'File not found in storage'
            checkResult.action = 'missing_file'
            results.invalid++
            
            // Update status
            await supabase
              .from('lab_reports')
              .update({ 
                status: 'failed',
                notes: 'File missing from storage'
              })
              .eq('id', report.id)
          }
        } catch (err) {
          checkResult.error = err instanceof Error ? err.message : 'Unknown error'
          checkResult.action = 'check_failed'
          results.failed++
        }
      }
      
      results.details.push(checkResult)
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
      recommendations: [
        'Files with local paths need to be re-uploaded',
        'Missing files should be marked as failed',
        'Valid files can be analyzed normally'
      ]
    })

  } catch (error) {
    console.error('Production migration check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Add basic auth check for security
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.MIGRATION_SECRET || 'your-secret-key'}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action, reportId } = await request.json()
    
    if (!action || !reportId) {
      return NextResponse.json(
        { error: 'Missing action or reportId' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    switch (action) {
      case 'mark_failed':
        const { error } = await supabase
          .from('lab_reports')
          .update({ 
            status: 'failed',
            notes: 'File missing or inaccessible'
          })
          .eq('id', reportId)
        
        if (error) {
          return NextResponse.json({
            success: false,
            error: 'Failed to update report'
          }, { status: 500 })
        }
        
        return NextResponse.json({
          success: true,
          message: 'Report marked as failed'
        })
        
      case 'reset_pending':
        const { error: resetError } = await supabase
          .from('lab_reports')
          .update({ 
            status: 'pending',
            notes: null
          })
          .eq('id', reportId)
        
        if (resetError) {
          return NextResponse.json({
            success: false,
            error: 'Failed to reset report'
          }, { status: 500 })
        }
        
        return NextResponse.json({
          success: true,
          message: 'Report reset to pending'
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Production migration action error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 