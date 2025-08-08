import { NextRequest, NextResponse } from 'next/server'
import { getAIServiceManager } from '@/lib/ai'

export async function GET(request: NextRequest) {
  try {
    const aiManager = getAIServiceManager()
    
    // Get health status of all services
    const healthStatus = aiManager.getHealthStatus()
    
    // Get usage stats
    const totalCost = aiManager.getTotalCost()
    const cacheStats = aiManager.getCacheStats()
    
    // Test basic functionality if requested
    const testParam = request.nextUrl.searchParams.get('test')
    let testResult = null
    
    if (testParam === 'true') {
      try {
        const response = await aiManager.createCompletion({
          messages: [
            { role: 'user', content: 'Say "AI services are working" in 5 words or less.' }
          ],
          temperature: 0,
          maxTokens: 20
        })
        testResult = {
          success: true,
          response: response.content,
          model: response.model
        }
      } catch (error) {
        testResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      services: healthStatus,
      stats: {
        totalCost: `$${totalCost.toFixed(4)}`,
        cache: cacheStats
      },
      test: testResult,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('AI health check error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check AI service health',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
