import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // First, let's check if the bucket is public now
    const { data: buckets } = await supabase.storage.listBuckets()
    const labFilesBucket = buckets?.find(b => b.name === 'lab-files')
    const isPublic = labFilesBucket?.public || false
    
    const updates = [
      {
        id: '713f5d32-2385-458c-b3b4-173289fca9f6',
        file_name: 'corkadel_carole_fit176_report_07jul25.pdf',
        file_url: 'https://ajwudhwruxxdshqjeqij.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf'
      },
      {
        id: 'ec99b292-e5cb-4442-9404-0c3622ab5657',
        file_name: 'corkadel_carole_fit176_report_07jul25.pdf',
        file_url: 'https://ajwudhwruxxdshqjeqij.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf'
      },
      {
        id: '49f40728-89bf-4706-bcaf-fcca5c453c98',
        file_name: 'Symptom-Burden-Bar-Graph-17 (1).pdf',
        file_url: 'https://ajwudhwruxxdshqjeqij.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455408916_Symptom-Burden-Bar-Graph-17-1.pdf'
      }
    ]
    
    const results = []
    
    if (isPublic) {
      // Bucket is public, use direct URLs
      for (const update of updates) {
        const { data, error } = await supabase
          .from('lab_reports')
          .update({ file_url: update.file_url })
          .eq('id', update.id)
          .select()
        
        results.push({
          id: update.id,
          success: !error,
          error: error?.message,
          urlType: 'public',
          data
        })
      }
    } else {
      // Bucket is private, generate signed URLs
      for (const update of updates) {
        const fileName = update.file_url.split('/').pop()
        const path = `clients/336ac9e9-dda3-477f-89d5-241df47b8745/${fileName}`
        
        const { data: signedUrlData, error: signedError } = await supabase
          .storage
          .from('lab-files')
          .createSignedUrl(path, 31536000) // 1 year
        
        if (signedUrlData?.signedUrl) {
          const { data, error } = await supabase
            .from('lab_reports')
            .update({ file_url: signedUrlData.signedUrl })
            .eq('id', update.id)
            .select()
          
          results.push({
            id: update.id,
            success: !error,
            error: error?.message,
            urlType: 'signed',
            data
          })
        } else {
          results.push({
            id: update.id,
            success: false,
            error: signedError?.message || 'Failed to create signed URL'
          })
        }
      }
    }
    
    // Also update the NAQ document if it exists
    const { data: naqReport } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', '336ac9e9-dda3-477f-89d5-241df47b8745')
      .eq('file_name', 'NAQ-Questions-Answers-4.pdf')
      .single()
    
    if (naqReport) {
      const naqUrl = isPublic ? 
        'https://ajwudhwruxxdshqjeqij.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455408342_NAQ-Questions-Answers-4.pdf' :
        (await supabase.storage.from('lab-files').createSignedUrl('clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455408342_NAQ-Questions-Answers-4.pdf', 31536000)).data?.signedUrl
      
      if (naqUrl) {
        await supabase
          .from('lab_reports')
          .update({ file_url: naqUrl })
          .eq('id', naqReport.id)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Files fixed! Using ${isPublic ? 'public URLs' : 'signed URLs'} because bucket is ${isPublic ? 'PUBLIC' : 'PRIVATE'}`,
      bucketStatus: {
        name: 'lab-files',
        isPublic,
        recommendation: !isPublic ? 'Consider making bucket public in Supabase Dashboard' : 'Bucket is public - all good!'
      },
      results,
      nextStep: 'Go back to your client page and refresh - PDFs should now display!'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fix URLs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}