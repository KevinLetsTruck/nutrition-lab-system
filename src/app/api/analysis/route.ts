import { NextRequest, NextResponse } from 'next/server';
import { claudeService } from '@/lib/api/claude';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { documentId, reanalyze = false } = body;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch document with client info
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { client: true },
    });
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Check if already analyzed and not forcing reanalysis
    if (document.aiAnalysis && !reanalyze) {
      return NextResponse.json({
        analysis: document.aiAnalysis,
        analysisDate: document.analysisDate,
        fromCache: true,
      });
    }
    
    // Ensure we have extracted text
    if (!document.extractedText) {
      return NextResponse.json(
        { error: 'Document text not extracted. Please process the document first.' },
        { status: 400 }
      );
    }
    
    // Analyze with Claude
    const analysis = await claudeService.analyzeLabDocument(
      document.extractedText,
      document.documentType,
      document.client
    );
    
    // Update document with analysis
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        aiAnalysis: analysis,
        analysisDate: new Date(),
        status: 'completed',
      },
    });
    
    return NextResponse.json({
      analysis,
      analysisDate: updatedDocument.analysisDate,
      fromCache: false,
    });
    
  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

// Test Claude connection
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const isConnected = await claudeService.testConnection();
    
    return NextResponse.json({
      connected: isConnected,
      service: 'Claude AI',
      model: 'claude-3-5-sonnet-20241022',
      status: isConnected ? 'operational' : 'error',
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        connected: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      },
      { status: 500 }
    );
  }
}
