import { NextResponse } from 'next/server'
import { prisma, checkDatabaseHealth } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check basic health
    const health = await checkDatabaseHealth()
    
    // Get table counts
    const [userCount, clientCount, labReportCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.client.count().catch(() => 0),
      prisma.labReport.count().catch(() => 0),
    ])
    
    // Test a simple query
    let queryTest = { success: false, error: '' }
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      queryTest.success = true
    } catch (error: any) {
      queryTest.error = error.message
    }
    
    // Get connection info
    const connectionInfo = {
      databaseUrl: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@').substring(0, 60) + '...' : 
        'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV,
    }
    
    return NextResponse.json({
      status: health.status,
      health,
      connectionInfo,
      queryTest,
      tableCounts: {
        users: userCount,
        clients: clientCount,
        labReports: labReportCount,
      },
      prismaVersion: require('@prisma/client').Prisma.prismaVersion,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Prisma health check error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: {
        message: error.message,
        code: error.code,
      },
      connectionInfo: {
        databaseUrl: process.env.DATABASE_URL ? 'Set (but connection failed)' : 'Not set',
        directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    }, { status: 503 })
  }
}
