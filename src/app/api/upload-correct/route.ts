import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('[UPLOAD-CORRECT] === NEW REQUEST ===')
  
  try {
    const formData = await request.formData()
    const files = formData.getAll('file') as File[]
    const clientId = formData.get('clientId') as string
    const clientEmail = formData.get('clientEmail') as string
    
    console.log('[UPLOAD-CORRECT] Request data:', {
      fileCount: files.length,
      clientId,
      clientEmail
    })
    
    if (!clientId || !files.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const results = []
    const errors = []
    
    for (const file of files) {
      try {
        // Convert to buffer
        const arrayBuffer = await file.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)
        
        // Generate storage path in client directory
        const timestamp = Date.now()
        const cleanFileName = file.name.replace(/[()]/g, '').replace(/\s+/g, '-')
        const storagePath = `clients/${clientId}/${timestamp}_${cleanFileName}`
        
        console.log('[UPLOAD-CORRECT] Uploading to:', storagePath)
        
        // Upload to storage in correct location
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('lab-files')
          .upload(storagePath, fileBuffer, {
            contentType: file.type,
            upsert: false
          })
        
        if (uploadError) throw uploadError
        
        // Get public URL
        const { data: urlData } = supabase
          .storage
          .from('lab-files')
          .getPublicUrl(storagePath)
        
        // Determine report type from filename
        let reportType = 'general'
        const lowerName = file.name.toLowerCase()
        if (lowerName.includes('nutriq') || lowerName.includes('symptom')) {
          reportType = 'nutriq'
        } else if (lowerName.includes('kbmo') || lowerName.includes('fit')) {
          reportType = 'kbmo'
        }
        
        // Check if we should update existing report or create new
        const { data: existingReports } = await supabase
          .from('lab_reports')
          .select('*')
          .eq('client_id', clientId)
          .eq('report_type', reportType)
          .is('file_url', null)
          .limit(1)
        
        if (existingReports && existingReports.length > 0) {
          // Update existing report
          const { data: updatedReport } = await supabase
            .from('lab_reports')
            .update({
              file_url: urlData.publicUrl,
              file_path: storagePath,
              storage_path: storagePath,
              file_name: file.name,
              file_size: file.size,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingReports[0].id)
            .select()
            .single()
          
          results.push({
            success: true,
            filename: file.name,
            action: 'updated',
            reportId: existingReports[0].id,
            publicUrl: urlData.publicUrl
          })
        } else {
          // Create new report
          const { data: newReport } = await supabase
            .from('lab_reports')
            .insert({
              client_id: clientId,
              report_type: reportType,
              report_date: new Date().toISOString().split('T')[0],
              file_url: urlData.publicUrl,
              file_path: storagePath,
              storage_path: storagePath,
              file_name: file.name,
              file_size: file.size,
              status: 'pending',
              notes: `Uploaded via correct endpoint`
            })
            .select()
            .single()
          
          results.push({
            success: true,
            filename: file.name,
            action: 'created',
            reportId: newReport?.id,
            publicUrl: urlData.publicUrl
          })
        }
        
      } catch (error) {
        console.error('[UPLOAD-CORRECT] File error:', error)
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      success: errors.length === 0,
      results,
      errors,
      message: `Uploaded ${results.length} files to correct location`
    })
    
  } catch (error) {
    console.error('[UPLOAD-CORRECT] Fatal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}