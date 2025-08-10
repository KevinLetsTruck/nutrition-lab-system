import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

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
    
    // Tables don't exist or need updating
    console.log('Setting up database tables...')
    
    try {
      // Drop existing tables and types if they exist (for clean setup)
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS client_profiles CASCADE`)
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS clients CASCADE`)
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS users CASCADE`)
      await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS user_role CASCADE`)
      
      console.log('Creating enum types...')
      
      // Create the user_role enum
      await prisma.$executeRawUnsafe(`
        CREATE TYPE user_role AS ENUM ('client', 'admin')
      `)
      
      console.log('Creating tables with correct schema...')
      
      // This will create the tables based on the schema
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role user_role NOT NULL DEFAULT 'client',
          email_verified BOOLEAN DEFAULT false,
          onboarding_completed BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        )
      `)
      
      // Create other essential tables
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS client_profiles (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          phone TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          date_of_birth TIMESTAMP,
          phone TEXT,
          address TEXT,
          emergency_contact TEXT,
          medical_history TEXT,
          allergies TEXT,
          current_medications TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // Create admin user
      const adminPassword = await hash('Admin123!', 10)
      await prisma.$executeRawUnsafe(`
        INSERT INTO users (email, password_hash, role, email_verified)
        VALUES ('admin@nutritionlab.com', '${adminPassword}', 'admin', true)
        ON CONFLICT (email) DO NOTHING
      `)
      
      // Create client user
      const clientPassword = await hash('Client123!', 10)
      await prisma.$executeRawUnsafe(`
        INSERT INTO users (email, password_hash, role, email_verified)
        VALUES ('john.trucker@example.com', '${clientPassword}', 'client', true)
        ON CONFLICT (email) DO NOTHING
      `)
      
      return NextResponse.json({
        success: true,
        message: 'Basic tables and users created',
        tables: 'created',
        note: 'Run "railway run npx prisma db push" locally for complete schema'
      })
      
    } catch (createError: any) {
      console.error('Table creation error:', createError)
      return NextResponse.json({
        success: false,
        message: 'Manual table creation failed', 
        error: createError.message,
        note: 'You need to run "railway run npx prisma db push" from your local machine'
      })
    }
    
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
