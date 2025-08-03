import { NextRequest, NextResponse } from 'next/server';
import { parsePDFServerless } from '@/lib/pdf-parser-serverless';

export async function POST(request: NextRequest) {
  try {
    console.log('[TEST-QUICK-ANALYSIS] Starting test...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log(`[TEST-QUICK-ANALYSIS] File info:`, {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Get file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Check if it's a PDF
    const isPDF = fileBuffer.slice(0, 4).toString('ascii') === '%PDF';
    console.log('[TEST-QUICK-ANALYSIS] Is PDF:', isPDF);
    
    if (!isPDF) {
      return NextResponse.json({
        success: false,
        error: 'File is not a PDF',
        fileHeader: fileBuffer.slice(0, 20).toString('hex')
      });
    }
    
    // Try to parse with serverless parser
    console.log('[TEST-QUICK-ANALYSIS] Attempting serverless PDF parsing...');
    
    try {
      const result = await parsePDFServerless(fileBuffer);
      
      console.log('[TEST-QUICK-ANALYSIS] Parse successful:', {
        pageCount: result.pageCount,
        textLength: result.text.length,
        firstChars: result.text.substring(0, 100)
      });
      
      return NextResponse.json({
        success: true,
        pageCount: result.pageCount,
        textLength: result.text.length,
        textPreview: result.text.substring(0, 500),
        message: 'PDF parsed successfully with serverless parser'
      });
      
    } catch (parseError) {
      console.error('[TEST-QUICK-ANALYSIS] Parse error:', parseError);
      
      return NextResponse.json({
        success: false,
        error: 'PDF parsing failed',
        details: parseError instanceof Error ? parseError.message : 'Unknown error',
        stack: parseError instanceof Error ? parseError.stack : undefined
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('[TEST-QUICK-ANALYSIS] Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}