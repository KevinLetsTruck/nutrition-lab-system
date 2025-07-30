import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-service'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('Test registration request received')
  
  try {
    // Use test data for debugging
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'TestPassword123!'
    }
    
    console.log('Using test data:', testData)

    // Test database connection
    console.log('Testing database connection...')
    try {
      const supabase = createServerSupabaseClient()
      const { error: dbTestError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (dbTestError) {
        console.error('Database connection test failed:', dbTestError)
        return NextResponse.json({
          success: false,
          error: 'Database connection failed',
          details: dbTestError.message
        }, { status: 500 })
      }
      console.log('Database connection test passed')
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Database connection error',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Test registration
    console.log('Attempting test registration...')
    const result = await authService.register(testData)

    console.log('Test registration result:', result)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        testData
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test registration successful',
      user: {
        id: result.user?.id,
        email: result.user?.email,
        role: result.user?.role
      },
      testData
    })

  } catch (error) {
    console.error('Test registration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test registration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 