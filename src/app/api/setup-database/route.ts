import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  // Simple auth check - only allow with a secret key
  const authHeader = request.headers.get('authorization')
  const expectedKey = process.env.EMERGENCY_ACCESS_CODE || 'setup-2025'
  
  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Check if tables exist
    console.log('Checking database tables...')
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    ` as any[]
    
    if (tableCheck.length > 0) {
      console.log('Tables already exist')
      
      // Check if admin exists
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Database already set up',
        tables: 'exist',
        adminCount
      })
    }
    
    // Tables don't exist, create them
    console.log('Creating database tables...')
    execSync('npx prisma db push --skip-generate', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
    
    console.log('Seeding database...')
    execSync('npx prisma db seed', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database setup complete',
      tables: 'created'
    })
    
  } catch (error: any) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { 
        error: 'Database setup failed',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
