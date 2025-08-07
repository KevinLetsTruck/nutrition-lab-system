import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Direct database connection test using pg
    const { Pool } = require('pg')
    
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      return NextResponse.json({
        error: 'DATABASE_URL not set',
        env: {
          hasDbUrl: false,
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          nodeEnv: process.env.NODE_ENV
        }
      })
    }

    // Parse the connection string
    const url = new URL(connectionString)
    
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    })

    // Test the connection
    const client = await pool.connect()
    
    // Run a simple query
    const result = await client.query('SELECT COUNT(*) FROM users')
    const userCount = result.rows[0].count

    // Check if our admin user exists
    const adminResult = await client.query(
      "SELECT email, role FROM users WHERE email = 'admin@test.com'"
    )
    
    client.release()
    await pool.end()

    return NextResponse.json({
      success: true,
      database: {
        host: url.hostname,
        port: url.port,
        database: url.pathname.slice(1).split('?')[0],
        userCount: parseInt(userCount),
        adminExists: adminResult.rows.length > 0,
        adminUser: adminResult.rows[0] || null
      },
      message: 'Direct database connection successful'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      hint: 'Check if Supabase project is active and connection string is correct'
    })
  }
}
