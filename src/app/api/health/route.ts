import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic API functionality without database
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is working'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'API failed', details: error.message },
      { status: 500 }
    );
  }
}
