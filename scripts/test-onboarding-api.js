require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

async function testOnboardingAPI() {
  console.log('=== TESTING ONBOARDING API ===\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Environment Variables:')
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}`)
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'SET' : 'MISSING'}`)

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('\n❌ Missing Supabase environment variables.')
    return
  }

  // Create server-side client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    console.log('\n🔍 Testing client_onboarding table access...')
    
    // Test if table exists
    const { data: tableTest, error: tableError } = await supabase
      .from('client_onboarding')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Table access error:', tableError)
      return
    }
    
    console.log('✅ Table access successful')

    // Test inserting a session
    const sessionToken = require('crypto').randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    console.log('\n🔍 Testing session creation...')
    
    const { data, error } = await supabase
      .from('client_onboarding')
      .insert({
        client_id: 'test-client',
        session_token: sessionToken,
        current_step: 'demographics',
        progress_percentage: 0,
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Session creation error:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return
    }

    console.log('✅ Session created successfully:', data)

    // Clean up test data
    await supabase
      .from('client_onboarding')
      .delete()
      .eq('session_token', sessionToken)

    console.log('✅ Test data cleaned up')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }

  console.log('\n=== END TEST ===')
}

testOnboardingAPI() 