// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Import Supabase client directly
const { createClient } = require('@supabase/supabase-js')

async function debugSessionCreation() {
  console.log('=== DEBUGGING SESSION CREATION ===\n')
  
  try {
    // Test 1: Check environment variables
    console.log('1. Checking environment variables...')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ Missing environment variables:')
      console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
      console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING')
      return
    }
    console.log('✅ Environment variables configured')
    
    // Test 2: Create Supabase client
    console.log('\n2. Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    console.log('✅ Supabase client created successfully')
    
    // Test 3: Check if we can connect to the database
    console.log('\n3. Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Database connection failed:', testError)
      return
    }
    console.log('✅ Database connection successful')
    
    // Test 4: Check if client_onboarding table exists
    console.log('\n4. Testing client_onboarding table access...')
    const { data: tableData, error: tableError } = await supabase
      .from('client_onboarding')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.log('❌ client_onboarding table access failed:', tableError)
      console.log('Error details:', {
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint,
        code: tableError.code
      })
      return
    }
    console.log('✅ client_onboarding table accessible')
    
    // Test 5: Try to create a session WITHOUT clientId (new approach)
    console.log('\n5. Testing session creation WITHOUT clientId...')
    const sessionToken = require('crypto').randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    const sessionData = {
      session_token: sessionToken,
      current_step: 'demographics',
      progress_percentage: 0,
      expires_at: expiresAt.toISOString(),
      last_activity: new Date().toISOString(),
      // Add placeholder values for required fields
      first_name: 'Pending',
      last_name: 'Pending',
      email: 'pending@example.com',
      phone: '000-000-0000',
      current_diet_approach: 'pending',
      primary_health_goal: 'pending'
    }
    
    console.log('Creating session with data:', sessionData)
    
    const { data: sessionDataResult, error: sessionError } = await supabase
      .from('client_onboarding')
      .insert(sessionData)
      .select()
      .single()
    
    if (sessionError) {
      console.log('❌ Session creation failed:', sessionError)
      console.log('Error details:', {
        message: sessionError.message,
        details: sessionError.details,
        hint: sessionError.hint,
        code: sessionError.code
      })
      return
    }
    
    console.log('✅ Session created successfully:', sessionDataResult)
    
    // Test 6: Clean up test data
    console.log('\n6. Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('client_onboarding')
      .delete()
      .eq('session_token', sessionToken)
    
    if (deleteError) {
      console.log('⚠️  Cleanup failed (non-critical):', deleteError.message)
    } else {
      console.log('✅ Test data cleaned up')
    }
    
    console.log('\n=== ALL TESTS PASSED ===')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.error('Error stack:', error.stack)
  }
}

debugSessionCreation() 