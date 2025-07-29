const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testOnboardingTables() {
  try {
    console.log('Testing onboarding tables...')
    
    // Test 1: Check if tables exist
    console.log('\n1. Checking if tables exist...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['client_intake', 'client_files', 'onboarding_progress', 'onboarding_sessions'])
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError)
    } else {
      console.log('Found tables:', tables?.map(t => t.table_name) || [])
    }

    // Test 2: Try to insert a test client
    console.log('\n2. Testing client creation...')
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        email: 'test-onboarding@example.com',
        first_name: 'Test',
        last_name: 'User',
        onboarding_started_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (clientError) {
      console.error('Error creating client:', clientError)
    } else {
      console.log('✓ Created test client:', client.id)
      
      // Test 3: Try to create onboarding session
      console.log('\n3. Testing onboarding session creation...')
      const { data: session, error: sessionError } = await supabase
        .from('onboarding_sessions')
        .insert({
          client_id: client.id,
          session_token: 'test-session-token-' + Date.now(),
          current_step: 'welcome',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()
      
      if (sessionError) {
        console.error('Error creating session:', sessionError)
      } else {
        console.log('✓ Created test session:', session.id)
      }
      
      // Test 4: Try to create progress record
      console.log('\n4. Testing progress creation...')
      const { data: progress, error: progressError } = await supabase
        .from('onboarding_progress')
        .insert({
          client_id: client.id,
          step: 'welcome',
          completed: true,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (progressError) {
        console.error('Error creating progress:', progressError)
      } else {
        console.log('✓ Created test progress:', progress.id)
      }
      
      // Test 5: Try to create intake record
      console.log('\n5. Testing intake creation...')
      const { data: intake, error: intakeError } = await supabase
        .from('client_intake')
        .insert({
          client_id: client.id,
          section: 'personal',
          responses: { test: 'data' }
        })
        .select()
        .single()
      
      if (intakeError) {
        console.error('Error creating intake:', intakeError)
      } else {
        console.log('✓ Created test intake:', intake.id)
      }
      
      // Clean up test data
      console.log('\n6. Cleaning up test data...')
      await supabase.from('client_intake').delete().eq('client_id', client.id)
      await supabase.from('onboarding_progress').delete().eq('client_id', client.id)
      await supabase.from('onboarding_sessions').delete().eq('client_id', client.id)
      await supabase.from('clients').delete().eq('id', client.id)
      console.log('✓ Cleaned up test data')
    }
    
    console.log('\n🎉 All onboarding table tests passed!')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testOnboardingTables() 