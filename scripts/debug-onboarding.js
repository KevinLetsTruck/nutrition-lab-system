require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const { randomUUID } = require('crypto')

async function debugOnboarding() {
  console.log('=== DEBUGGING ONBOARDING API ===\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test the exact same code as the API
    const sessionToken = randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    console.log('Creating session with data:', {
      client_id: 'test',
      session_token: sessionToken,
      current_step: 'demographics',
      progress_percentage: 0,
      expires_at: expiresAt.toISOString(),
      last_activity: new Date().toISOString()
    })

    const { data, error } = await supabase
      .from('client_onboarding')
      .insert({
        client_id: 'test',
        session_token: sessionToken,
        current_step: 'demographics',
        progress_percentage: 0,
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString()
      })
      .select()
      .single()

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error: error
      })
      throw new Error(`Failed to create onboarding session: ${error.message || error.details || error.hint || 'Unknown error'}`)
    }

    console.log('✅ Session created successfully:', data)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugOnboarding() 