import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId') || '336ac9e9-dda3-477f-89d5-241df47b8745'
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // Get all lab reports for this client
    const { data: reports, error: reportsError } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', clientId)
    
    if (reportsError) throw reportsError
    
    // List all files in the client's directory
    const { data: files, error: filesError } = await supabase
      .storage
      .from('lab-files')
      .list(`clients/${clientId}`)
    
    if (filesError) throw filesError
    
    const updates = []
    
    // Match files to reports and update
    for (const report of reports || []) {
      // Skip if report already has a file URL
      if (report.file_url) {
        console.log(`Report ${report.id} already has file URL, skipping`)
        continue
      }
      
      // Try to find a matching file
      console.log(`Looking for match for report ${report.id} (${report.report_type}) with file: ${report.file_name}`)
      
      const matchingFile = files?.find(file => {
        const fileName = file.name.toLowerCase()
        const reportType = report.report_type?.toLowerCase() || ''
        const reportFileName = report.file_name?.toLowerCase() || ''
        
        // Remove timestamp prefix (e.g., 1754455407444_) from storage filename
        const cleanFileName = fileName.replace(/^\d+_/, '')
        
        // Normalize filenames for comparison (handle parentheses vs hyphens)
        const normalizedCleanName = cleanFileName.replace(/[()]/g, '-').replace(/-+/g, '-')
        const normalizedReportName = reportFileName.replace(/[()]/g, '-').replace(/-+/g, '-')
        
        console.log(`  Checking file: ${file.name}`)
        console.log(`    Clean name: ${cleanFileName}`)
        console.log(`    Normalized: ${normalizedCleanName} vs ${normalizedReportName}`)
        
        // Match by original filename or report type
        const isMatch = normalizedCleanName === normalizedReportName || 
               cleanFileName === reportFileName ||
               fileName.includes(reportType) || 
               fileName.includes('nutriq') || 
               fileName.includes('symptom') ||
               fileName.includes('kbmo') ||
               fileName.includes('fit') ||
               fileName.includes('general')
               
        if (isMatch) console.log(`    ✓ MATCH!`)
        return isMatch
      })
      
      if (matchingFile) {
        const storagePath = `clients/${clientId}/${matchingFile.name}`
        const { data: urlData } = supabase
          .storage
          .from('lab-files')
          .getPublicUrl(storagePath)
        
        // Update the report with the file information
        const { error: updateError } = await supabase
          .from('lab_reports')
          .update({
            file_url: urlData.publicUrl,
            storage_path: storagePath,
            file_name: matchingFile.name,
            file_path: storagePath // For backwards compatibility
          })
          .eq('id', report.id)
        
        if (!updateError) {
          updates.push({
            reportId: report.id,
            reportType: report.report_type,
            fileName: matchingFile.name,
            publicUrl: urlData.publicUrl
          })
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Linked ${updates.length} files to reports`,
      clientId,
      totalReports: reports?.length || 0,
      totalFiles: files?.length || 0,
      updates,
      refreshMessage: updates.length > 0 ? 
        'Refresh your page to see the View PDF buttons!' : 
        'No files found to link'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to link storage files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}