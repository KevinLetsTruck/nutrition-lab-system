import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUser(email) {
  try {
    console.log(`\n🔍 Checking user: ${email}\n`)

    // Check in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError) {
      console.log('❌ User not found in users table')
      console.error(userError)
    } else {
      console.log('✅ User found:')
      console.log('  ID:', userData.id)
      console.log('  Email:', userData.email)
      console.log('  Role:', userData.role)
      console.log('  Email Verified:', userData.email_verified)
      console.log('  Created:', userData.created_at)
    }

    // Check in client_profiles
    if (userData) {
      const { data: profileData, error: profileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      if (profileData) {
        console.log('\n✅ Client profile found:')
        console.log('  Name:', profileData.first_name, profileData.last_name)
        console.log('  Phone:', profileData.phone)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Get email from command line
const email = process.argv[2]
if (!email) {
  console.log('Usage: node scripts/check-user.js <email>')
  process.exit(1)
}

checkUser(email)