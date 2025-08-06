import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const pdfUrls = [
    {
      name: 'FIT Report',
      url: 'https://ajwudhwruxxdshqjeqij.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf'
    },
    {
      name: 'Symptom Report',
      url: 'https://ajwudhwruxxdshqjeqij.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455408916_Symptom-Burden-Bar-Graph-17-1.pdf'
    }
  ]
  
  const results = []
  
  for (const pdf of pdfUrls) {
    try {
      const response = await fetch(pdf.url, { method: 'HEAD' })
      
      results.push({
        name: pdf.name,
        url: pdf.url,
        accessible: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        message: response.ok ? '✅ PDF is accessible!' : '❌ PDF not found'
      })
    } catch (error) {
      results.push({
        name: pdf.name,
        url: pdf.url,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: '❌ Failed to check PDF'
      })
    }
  }
  
  const allAccessible = results.every(r => r.accessible)
  
  return NextResponse.json({
    correctSupabaseUrl: 'https://ajwudhwruxxdshqjeqij.supabase.co',
    allPdfsAccessible: allAccessible,
    results,
    recommendation: allAccessible ? 
      '✅ All PDFs are accessible! Run /api/fix-urls-simple to update the database.' :
      '❌ Some PDFs are not accessible. They may need to be re-uploaded.'
  })
}