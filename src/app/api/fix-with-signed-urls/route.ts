import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // File paths in the private bucket
    const files = [
      {
        reportId: '713f5d32-2385-458c-b3b4-173289fca9f6',
        path: 'clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf'
      },
      {
        reportId: 'ec99b292-e5cb-4442-9404-0c3622ab5657', 
        path: 'clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf'
      },
      {
        reportId: '49f40728-89bf-4706-bcaf-fcca5c453c98',
        path: 'clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455408916_Symptom-Burden-Bar-Graph-17-1.pdf'
      }
    ]
    
    const results = []
    
    for (const file of files) {
      // Generate a signed URL that lasts for 1 year
      const { data: signedUrlData, error: signedError } = await supabase
        .storage
        .from('lab-files')
        .createSignedUrl(file.path, 31536000) // 1 year in seconds
      
      if (signedUrlData && signedUrlData.signedUrl) {
        // Update the database with the signed URL
        const { error: updateError } = await supabase
          .from('lab_reports')
          .update({ file_url: signedUrlData.signedUrl })
          .eq('id', file.reportId)
        
        results.push({
          reportId: file.reportId,
          path: file.path,
          success: !updateError,
          error: updateError?.message,
          signedUrl: signedUrlData.signedUrl
        })
      } else {
        results.push({
          reportId: file.reportId,
          path: file.path,
          success: false,
          error: signedError?.message || 'Failed to create signed URL'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Generated signed URLs for private bucket files',
      results,
      note: 'These URLs will work even though the bucket is private',
      recommendation: 'Refresh your client page - PDFs should now display!'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to generate signed URLs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}