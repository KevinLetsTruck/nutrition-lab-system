import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
  }
  
  try {
    // Fetch the PDF from Supabase
    const response = await fetch(url)
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch PDF',
        status: response.status,
        statusText: response.statusText
      }, { status: response.status })
    }
    
    // Get the PDF data
    const pdfData = await response.arrayBuffer()
    
    // Return the PDF with proper headers
    return new NextResponse(pdfData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${url.split('/').pop()}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to proxy PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}