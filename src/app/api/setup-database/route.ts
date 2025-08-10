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
    console.log('Starting database setup...')
    
    // Drop existing tables and types if they exist (for clean setup)
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS client_profiles CASCADE`)
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS admin_profiles CASCADE`)
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS clients CASCADE`)
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS users CASCADE`)
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS user_role CASCADE`)
    
    console.log('Creating enum types...')
    
    // Create the user_role enum
    await prisma.$executeRawUnsafe(`
      CREATE TYPE user_role AS ENUM ('client', 'admin')
    `)
    
    console.log('Creating tables with correct schema...')
    
    // Create users table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE users (
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
    
    // Create client_profiles table with all expected columns
    await prisma.$executeRawUnsafe(`
      CREATE TABLE client_profiles (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        onboarding_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create admin_profiles table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE admin_profiles (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        title TEXT,
        specializations TEXT[],
        client_capacity INTEGER DEFAULT 50,
        active_sessions INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create clients table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE clients (
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
    
    console.log('Creating test users...')
    
    // Create admin user
    const adminPassword = await hash('Admin123!', 10)
    const adminId = 'a0000000-0000-0000-0000-000000000001'
    await prisma.$executeRawUnsafe(`
      INSERT INTO users (id, email, password_hash, role, email_verified, onboarding_completed)
      VALUES ('${adminId}', 'admin@nutritionlab.com', '${adminPassword}', 'admin', true, true)

    `)
    
    // Create admin profile
    await prisma.$executeRawUnsafe(`
      INSERT INTO admin_profiles (user_id, name, title)
      VALUES ('${adminId}', 'Admin User', 'System Administrator')

    `)
    
    // Create client user  
    const clientPassword = await hash('Client123!', 10)
    const clientId = 'c0000000-0000-0000-0000-000000000001'
    await prisma.$executeRawUnsafe(`
      INSERT INTO users (id, email, password_hash, role, email_verified, onboarding_completed)
      VALUES ('${clientId}', 'john.trucker@example.com', '${clientPassword}', 'client', true, true)

    `)
    
    // Create client profile
    await prisma.$executeRawUnsafe(`
      INSERT INTO client_profiles (user_id, first_name, last_name, phone)
      VALUES ('${clientId}', 'John', 'Trucker', '555-123-4567')

    `)
    
    // Also add to clients table
    await prisma.$executeRawUnsafe(`
      INSERT INTO clients (id, email, first_name, last_name, phone)
      VALUES ('${clientId}', 'john.trucker@example.com', 'John', 'Trucker', '555-123-4567')

    `)
    
    console.log('Database setup complete!')
    
    return NextResponse.json({
      success: true,
      message: 'Database tables and users created successfully',
      tables: ['users', 'client_profiles', 'clients'],
      users: ['admin@nutritionlab.com', 'john.trucker@example.com']
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