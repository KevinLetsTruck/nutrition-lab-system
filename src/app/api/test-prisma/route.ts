import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // First check if Prisma is available
    const hasPrisma = !!require('@prisma/client')
    
    // Try to import our prisma instance
    let prismaImported = false
    let prismaError = ''
    
    try {
      const { prisma } = await import('@/lib/prisma')
      prismaImported = !!prisma
    } catch (error: any) {
      prismaError = error.message
    }
    
    return NextResponse.json({
      status: 'checking',
      hasPrismaClient: hasPrisma,
      prismaImported,
      prismaError,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
