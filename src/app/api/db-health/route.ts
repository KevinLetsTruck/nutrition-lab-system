import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/prisma'
import { connectionTester, DatabaseConnectionTester } from '@/lib/db/connection-test'
import { getDatabaseHealthStatus, forceHealthCheck } from '@/middleware/database-health'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    // Run different health checks based on action
    switch (action) {
      case 'full-test':
        // Run comprehensive connection tests
        const testResults = await connectionTester.runAllTests()
        return NextResponse.json(testResults)
        
      case 'leak-check':
        // Check for connection leaks
        const leakResults = await DatabaseConnectionTester.checkConnectionLeaks()
        return NextResponse.json(leakResults)
        
      case 'force-check':
        // Force a health check
        const forcedHealth = await forceHealthCheck()
        return NextResponse.json(forcedHealth)
        
      case 'status':
        // Get current health status from middleware
        const status = getDatabaseHealthStatus()
        return NextResponse.json(status)
        
      default:
        // Standard health check
        const health = await checkDatabaseHealth()
        
        // Set appropriate status code
        const statusCode = health.status === 'healthy' ? 200 : 503
        
        return NextResponse.json(health, { status: statusCode })
    }
  } catch (error: any) {
    console.error('Database health check error:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: {
          message: error.message || 'Unknown error',
          code: error.code,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

// POST endpoint to trigger connection recovery
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'reconnect') {
      console.log('🔄 Attempting database reconnection...')
      
      // Force reconnection
      const { prisma } = await import('@/lib/prisma')
      await prisma.$disconnect()
      await new Promise(resolve => setTimeout(resolve, 1000))
      await prisma.$connect()
      
      // Check health after reconnection
      const health = await checkDatabaseHealth()
      
      return NextResponse.json({
        message: 'Reconnection attempted',
        health
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Reconnection failed',
        message: error.message
      },
      { status: 500 }
    )
  }
}