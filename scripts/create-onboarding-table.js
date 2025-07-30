require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

async function createOnboardingTable() {
  console.log('=== CREATING ONBOARDING TABLE ===\n')

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
    // First, let's test if we can access any table
    console.log('🔍 Testing database access...')
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Cannot access database:', testError)
      return
    }
    
    console.log('✅ Database access confirmed')

    // Try to create the table using a simple insert to see if it exists
    console.log('\n🔍 Testing if client_onboarding table exists...')
    
    const testInsert = {
      client_id: null,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '123-456-7890',
      current_diet_approach: 'low_carb_paleo',
      primary_health_goal: 'Weight loss',
      session_token: 'test-token-' + Date.now(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    const { data, error } = await supabase
      .from('client_onboarding')
      .insert(testInsert)
      .select()
      .single()

    if (error) {
      console.error('❌ Table does not exist or insert failed:', error)
      console.log('\n💡 You need to create the table manually in the Supabase dashboard:')
      console.log('1. Go to your Supabase project dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Run the following SQL:')
      console.log(`
CREATE TABLE IF NOT EXISTS client_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  current_diet_approach VARCHAR(50),
  diet_duration_months INTEGER,
  current_medications TEXT,
  current_supplements TEXT,
  primary_health_goal TEXT,
  years_driving INTEGER,
  route_type VARCHAR(20),
  schedule_pattern VARCHAR(20),
  dot_medical_status VARCHAR(20),
  dot_expiry_date DATE,
  current_step VARCHAR(50) DEFAULT 'demographics',
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  session_token VARCHAR(255) UNIQUE,
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
      `)
      return
    }

    console.log('✅ Table exists and insert successful:', data)

    // Clean up test data
    await supabase
      .from('client_onboarding')
      .delete()
      .eq('session_token', testInsert.session_token)

    console.log('✅ Test data cleaned up')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createOnboardingTable() 