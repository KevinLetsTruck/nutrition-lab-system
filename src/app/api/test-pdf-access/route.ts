import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const testUrls = [
    `${supabaseUrl}/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf`,
    `${supabaseUrl}/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455408916_Symptom-Burden-Bar-Graph-17-1.pdf`
  ]
  
  const results = []
  
  for (const url of testUrls) {
    try {
      // Test if file is accessible
      const response = await fetch(url, { method: 'HEAD' })
      
      results.push({
        url,
        accessible: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        corsHeaders: {
          'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
          'x-frame-options': response.headers.get('x-frame-options')
        }
      })
    } catch (error) {
      results.push({
        url,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return NextResponse.json({
    results,
    recommendation: results[0]?.accessible ? 
      'Files are accessible. If PDF viewer shows blank, it might be an iframe/CORS issue.' :
      'Files are not accessible. Check if they exist in Supabase storage.'
  })
}