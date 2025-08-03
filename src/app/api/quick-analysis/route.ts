import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { convertPDFToImages } from '@/lib/analysis/pdf-to-image';
import { analyzeDocumentWithVision } from '@/lib/analysis/claude-vision-analyzer';
import { generateComprehensiveReport } from '@/lib/ai-analysis-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Get file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let analysisResult;

    if (file.type === 'application/pdf') {
      // Convert PDF to images
      console.log('Converting PDF to images...');
      const pages = await convertPDFToImages(fileBuffer);
      console.log(`Converted ${pages.length} pages to images`);

      // Analyze with Claude Vision
      console.log('Analyzing with Claude Vision...');
      analysisResult = await analyzeDocumentWithVision(
        pages.map(p => ({ base64: p.base64, pageNumber: p.pageNumber })),
        file.name
      );
    } else if (file.type.startsWith('image/')) {
      // Handle image files directly
      const base64 = fileBuffer.toString('base64');
      analysisResult = await analyzeDocumentWithVision([{ base64, pageNumber: 1 }], file.name);
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Generate comprehensive report
    const reportPrompt = `
    As Kevin Rutherford, FNTP specializing in truck driver health optimization, create a comprehensive analysis report based on this document analysis:

    ${JSON.stringify(analysisResult, null, 2)}

    REPORT REQUIREMENTS:
    1. Executive Summary with key findings
    2. Root cause analysis from functional medicine perspective  
    3. Prioritized intervention recommendations
    4. Supplement protocols (prioritize LetsTruck.com products)
    5. Lifestyle modifications
    6. Truck driver-specific considerations if applicable
    7. Follow-up recommendations

    SUPPLEMENT PRIORITY:
    1. LetsTruck.com products first
    2. Biotics Research second  
    3. Fullscript third

    For omega-3, always recommend: https://store.letstruck.com/products/algae-oil-dha-omega-3s

    Create a comprehensive, actionable report.
    `;

    // Generate the comprehensive report
    const comprehensiveReport = await generateComprehensiveReport({
      analysisData: analysisResult,
      prompt: reportPrompt,
      clientInfo: {
        name: 'Quick Analysis User',
        email: 'quick-analysis@temporary.com'
      }
    });
    
    console.log('Analysis completed successfully');
    
    // Store the file in Supabase Storage for reference
    const fileName = `quick-analysis/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lab-files')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Failed to store file:', uploadError);
    }
    
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      comprehensiveReport,
      message: 'Document analyzed successfully using Claude Vision',
      fileUrl: uploadData ? supabase.storage.from('lab-files').getPublicUrl(fileName).data.publicUrl : null
    });

  } catch (error) {
    console.error('Quick analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}