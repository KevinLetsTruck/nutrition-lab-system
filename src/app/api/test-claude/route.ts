import { NextRequest, NextResponse } from 'next/server';
import { claudeService } from '@/lib/api/claude';

export async function GET(request: NextRequest) {
  try {
    // Test without authentication for setup purposes
    const isConnected = await claudeService.testConnection();

    if (isConnected) {
      // Try a sample analysis
      const sampleText = `
        Lab Results:
        Glucose: 105 mg/dL (Range: 65-99)
        HbA1c: 5.9% (Range: <5.7)
        Total Cholesterol: 215 mg/dL (Range: <200)
        HDL: 38 mg/dL (Range: >40)
        Triglycerides: 185 mg/dL (Range: <150)
      `;

      const analysis = await claudeService.analyzeLabDocument(
        sampleText,
        'Basic Metabolic Panel',
        {
          firstName: 'Test',
          lastName: 'Driver',
          isTruckDriver: true,
        }
      );

      return NextResponse.json({
        status: 'success',
        connected: true,
        service: 'Claude AI (Anthropic)',
        model: 'claude-3-5-sonnet-20241022',
        testAnalysis: analysis,
        message: 'Claude AI is working correctly! Remember to keep your API key secure.',
      });
    } else {
      return NextResponse.json({
        status: 'error',
        connected: false,
        message: 'Claude AI service not initialized. Please check your ANTHROPIC_API_KEY in .env file.',
        instructions: [
          '1. Get your API key from https://console.anthropic.com/',
          '2. Add it to your .env file: ANTHROPIC_API_KEY="your-key-here"',
          '3. Restart the development server',
        ],
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to Claude AI',
    }, { status: 500 });
  }
}
