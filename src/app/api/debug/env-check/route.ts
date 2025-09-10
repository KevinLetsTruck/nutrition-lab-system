/**
 * Debug Endpoint: Check Production Environment Variables
 * Helps diagnose missing JWT_SECRET or other env issues
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simple environment check for debugging production issues
    const envStatus = {
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      hasRequiredEnvVars: !!(process.env.JWT_SECRET && process.env.DATABASE_URL)
    };

    return NextResponse.json({
      success: true,
      environment: envStatus,
      timestamp: new Date().toISOString(),
      message: envStatus.hasRequiredEnvVars ? 
        'All required environment variables present' : 
        'Missing required environment variables'
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Environment check failed',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
      },
      { status: 500 }
    );
  }
}
