require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testOnboardingSchema() {
  try {
    console.log('🔍 Testing client_onboarding table schema...')
    
    // Test creating a session
    console.log('\n1. Testing session creation...')
    const sessionData = {
      session_token: 'test-session-' + Date.now(),
      current_step: 'demographics',
      progress_percentage: 0,
      is_completed: false,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
    
    const { data: session, error: sessionError } = await supabase
      .from('client_onboarding')
      .insert(sessionData)
      .select()
      .single()
    
    if (sessionError) {
      console.error('❌ Session creation failed:', sessionError)
      return
    }
    
    console.log('✅ Session created successfully:', session.id)
    
    // Test saving demographics data (without date_of_birth)
    console.log('\n2. Testing demographics data save...')
    const demographicsData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com'
      // Note: No date_of_birth field
    }
    
    const { error: updateError } = await supabase
      .from('client_onboarding')
      .update(demographicsData)
      .eq('session_token', sessionData.session_token)
    
    if (updateError) {
      console.error('❌ Demographics save failed:', updateError)
      return
    }
    
    console.log('✅ Demographics data saved successfully')
    
    // Test saving diet data
    console.log('\n3. Testing diet data save...')
    const dietData = {
      current_diet_approach: 'low_carb_paleo',
      diet_duration_months: 6
    }
    
    const { error: dietError } = await supabase
      .from('client_onboarding')
      .update(dietData)
      .eq('session_token', sessionData.session_token)
    
    if (dietError) {
      console.error('❌ Diet data save failed:', dietError)
      return
    }
    
    console.log('✅ Diet data saved successfully')
    
    // Test saving medications data
    console.log('\n4. Testing medications data save...')
    const medicationsData = {
      current_medications: 'None',
      current_supplements: 'Vitamin D, Omega-3'
    }
    
    const { error: medError } = await supabase
      .from('client_onboarding')
      .update(medicationsData)
      .eq('session_token', sessionData.session_token)
    
    if (medError) {
      console.error('❌ Medications data save failed:', medError)
      return
    }
    
    console.log('✅ Medications data saved successfully')
    
    // Test saving goals data
    console.log('\n5. Testing goals data save...')
    const goalsData = {
      primary_health_goal: 'Improve energy levels and reduce inflammation'
    }
    
    const { error: goalsError } = await supabase
      .from('client_onboarding')
      .update(goalsData)
      .eq('session_token', sessionData.session_token)
    
    if (goalsError) {
      console.error('❌ Goals data save failed:', goalsError)
      return
    }
    
    console.log('✅ Goals data saved successfully')
    
    // Test saving truck driver data
    console.log('\n6. Testing truck driver data save...')
    const truckData = {
      years_driving: 5,
      route_type: 'otr',
      schedule_pattern: 'standard'
    }
    
    const { error: truckError } = await supabase
      .from('client_onboarding')
      .update(truckData)
      .eq('session_token', sessionData.session_token)
    
    if (truckError) {
      console.error('❌ Truck driver data save failed:', truckError)
      return
    }
    
    console.log('✅ Truck driver data saved successfully')
    
    // Test saving DOT status data
    console.log('\n7. Testing DOT status data save...')
    const dotData = {
      dot_medical_status: 'current',
      dot_expiry_date: '2025-12-31'
    }
    
    const { error: dotError } = await supabase
      .from('client_onboarding')
      .update(dotData)
      .eq('session_token', sessionData.session_token)
    
    if (dotError) {
      console.error('❌ DOT status data save failed:', dotError)
      return
    }
    
    console.log('✅ DOT status data saved successfully')
    
    // Clean up test data
    console.log('\n8. Cleaning up test data...')
    const { error: cleanupError } = await supabase
      .from('client_onboarding')
      .delete()
      .eq('session_token', sessionData.session_token)
    
    if (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError)
      return
    }
    
    console.log('✅ Test data cleaned up successfully')
    
    console.log('\n🎉 All tests passed! The client_onboarding table schema is working correctly.')
    console.log('✅ No date_of_birth column issues detected')
    console.log('✅ All required fields can be saved successfully')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testOnboardingSchema() 