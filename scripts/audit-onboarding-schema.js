require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function auditOnboardingSchema() {
  try {
    console.log('🔍 COMPREHENSIVE ONBOARDING SCHEMA AUDIT')
    console.log('='.repeat(60))
    
    // Get the actual database schema
    console.log('\n📋 ACTUAL DATABASE SCHEMA (client_onboarding table):')
    console.log('-'.repeat(40))
    
    // Try to get schema information by attempting to insert a test record
    // and see what columns are available
    const testData = {
      session_token: 'audit-test-' + Date.now(),
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      current_diet_approach: 'low_carb_paleo',
      diet_duration_months: 6,
      current_medications: 'None',
      current_supplements: 'Vitamin D',
      primary_health_goal: 'Improve energy',
      years_driving: 5,
      route_type: 'otr',
      schedule_pattern: 'standard',
      dot_medical_status: 'current',
      dot_expiry_date: '2025-12-31',
      current_step: 'demographics',
      progress_percentage: 0,
      is_completed: false,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
    
    const { data, error } = await supabase
      .from('client_onboarding')
      .insert(testData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error inserting test data:', error.message)
      
      // If it's a column error, let's try to identify which columns exist
      if (error.message.includes('column')) {
        console.log('\n🔍 Attempting to identify existing columns...')
        
        // Try inserting with minimal data to see what works
        const minimalData = {
          session_token: 'minimal-test-' + Date.now(),
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com'
        }
        
        const { error: minimalError } = await supabase
          .from('client_onboarding')
          .insert(minimalData)
        
        if (minimalError) {
          console.error('❌ Even minimal insert failed:', minimalError.message)
        } else {
          console.log('✅ Minimal insert succeeded - these columns exist:')
          console.log(Object.keys(minimalData))
        }
      }
      return
    }
    
    console.log('✅ Test insert succeeded!')
    console.log('Available columns in the record:')
    console.log(Object.keys(data))
    
    // Clean up test data
    await supabase
      .from('client_onboarding')
      .delete()
      .eq('session_token', testData.session_token)
    
    console.log('\n📋 EXPECTED FORM FIELDS (from code):')
    console.log('-'.repeat(40))
    
    const expectedFields = {
      // Demographics
      first_name: 'string',
      last_name: 'string', 
      email: 'string',
      date_of_birth: 'string', // This was removed
      
      // Diet
      current_diet_approach: 'string',
      diet_duration_months: 'number',
      dietType: 'string', // This might be the issue
      
      // Medications
      current_medications: 'string',
      current_supplements: 'string',
      
      // Goals
      primary_health_goal: 'string',
      healthGoals: 'string', // This might be an issue
      
      // Truck driver info
      years_driving: 'number',
      route_type: 'string',
      schedule_pattern: 'string',
      
      // DOT status
      dot_medical_status: 'string',
      dot_expiry_date: 'string'
    }
    
    console.log('Expected fields from form components:')
    Object.entries(expectedFields).forEach(([field, type]) => {
      console.log(`  ${field}: ${type}`)
    })
    
    console.log('\n🔍 POTENTIAL ISSUES:')
    console.log('-'.repeat(40))
    
    // Check for common naming mismatches
    const potentialIssues = [
      'dietType vs current_diet_approach',
      'healthGoals vs primary_health_goal',
      'dateOfBirth vs date_of_birth',
      'medications vs current_medications',
      'supplements vs current_supplements'
    ]
    
    potentialIssues.forEach(issue => {
      console.log(`⚠️  ${issue}`)
    })
    
    console.log('\n💡 RECOMMENDATIONS:')
    console.log('-'.repeat(40))
    console.log('1. Check all form field names vs database column names')
    console.log('2. Look for camelCase vs snake_case mismatches')
    console.log('3. Verify all expected fields exist in database')
    console.log('4. Create field mapping function if needed')
    
  } catch (error) {
    console.error('❌ Audit failed:', error)
  }
}

auditOnboardingSchema() 