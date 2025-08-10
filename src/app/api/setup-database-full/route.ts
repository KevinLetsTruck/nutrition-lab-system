import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { execSync } from 'child_process'

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
    // This approach runs prisma db push in a subprocess
    console.log('Running Prisma db push...')
    
    // First, let's try to detect if we're in Railway
    const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production'
    
    if (!isRailway) {
      return NextResponse.json({
        error: 'This endpoint only works in Railway environment',
        note: 'Run "railway run npx prisma db push" from your local machine instead'
      })
    }
    
    // Create a simple SQL script that creates just the users with proper passwords
    const adminPassword = await hash('Admin123!', 10)
    const clientPassword = await hash('Client123!', 10)
    
    // Return instructions since we can't run shell commands in production
    return NextResponse.json({
      success: false,
      message: 'Database tables need to be created using Prisma',
      instructions: [
        '1. From your local machine, run: railway run npx prisma db push',
        '2. Then run: railway run npx prisma db seed',
        '3. Or manually create users with these hashed passwords:',
        `   Admin: admin@nutritionlab.com / ${adminPassword}`,
        `   Client: john.trucker@example.com / ${clientPassword}`
      ],
      alternativeApproach: 'Use the Railway CLI from your local machine to run Prisma commands'
    })
    
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { 
        error: 'Setup failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}
