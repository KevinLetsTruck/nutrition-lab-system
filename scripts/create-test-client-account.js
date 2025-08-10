const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestClient() {
  console.log('🚀 Creating test client account...')

  try {
    // Create password hash
    const password = 'Client123!'
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'testclient@nutritionlab.com',
        password_hash: passwordHash,
        role: 'client',
        email_verified: true,
        onboarding_completed: true
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Error creating user:', userError)
      return
    }

    console.log('✅ Created user:', user.email)

    // Create client profile
    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .insert({
        user_id: user.id,
        first_name: 'Test',
        last_name: 'Client',
        phone: '555-0123'
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error creating profile:', profileError)
      return
    }

    console.log('✅ Created client profile')
    console.log('\n📧 Test Client Login Credentials:')
    console.log('   Email: testclient@nutritionlab.com')
    console.log('   Password: Client123!')
    console.log('\n🎉 You can now login with these credentials!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createTestClient()
