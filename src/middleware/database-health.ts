import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth, enhancedPrisma } from '@/lib/prisma'

// Track consecutive failures
let consecutiveFailures = 0
let lastHealthCheck: Date | null = null
let isHealthy = true

// Configuration
const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds
const MAX_CONSECUTIVE_FAILURES = 3
const BYPASS_PATHS = [
  '/api/health',
  '/api/db-health',
  '/_next',
  '/favicon.ico',
  '/public'
]

/**
 * Database health middleware
 */
export async function databaseHealthMiddleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Skip health checks for certain paths
  if (BYPASS_PATHS.some(bypass => path.startsWith(bypass))) {
    return NextResponse.next()
  }
  
  // Check if we need to run a health check
  const now = new Date()
  const shouldCheckHealth = 
    !lastHealthCheck || 
    (now.getTime() - lastHealthCheck.getTime()) > HEALTH_CHECK_INTERVAL ||
    !isHealthy
  
  if (shouldCheckHealth) {
    try {
      const health = await checkDatabaseHealth()
      
      if (health.status === 'healthy') {
        // Reset failure count on success
        if (consecutiveFailures > 0) {
          console.log('✅ Database health restored after', consecutiveFailures, 'failures')
        }
        consecutiveFailures = 0
        isHealthy = true
      } else {
        consecutiveFailures++
        isHealthy = false
        console.error('❌ Database health check failed:', health.error)
        
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          console.error('🚨 Database is unhealthy after', consecutiveFailures, 'consecutive failures')
          
          // You could send alerts here
          // await sendAlert('Database is down!')
        }
      }
      
      lastHealthCheck = now
    } catch (error) {
      consecutiveFailures++
      isHealthy = false
      console.error('❌ Health check error:', error)
    }
  }
  
  // If database is unhealthy, return error for API routes
  if (!isHealthy && path.startsWith('/api/')) {
    return NextResponse.json(
      {
        error: 'Database connection error',
        message: 'The service is temporarily unavailable. Please try again later.',
        retryAfter: 30
      },
      { 
        status: 503,
        headers: {
          'Retry-After': '30'
        }
      }
    )
  }
  
  // Add health status to response headers
  const response = NextResponse.next()
  response.headers.set('X-Database-Health', isHealthy ? 'healthy' : 'unhealthy')
  response.headers.set('X-Database-Failures', consecutiveFailures.toString())
  
  return response
}

/**
 * Get current database health status
 */
export function getDatabaseHealthStatus() {
  return {
    isHealthy,
    consecutiveFailures,
    lastHealthCheck,
    connectionStatus: enhancedPrisma.getConnectionStatus()
  }
}

/**
 * Force a health check
 */
export async function forceHealthCheck() {
  lastHealthCheck = null
  const health = await checkDatabaseHealth()
  return health
}
