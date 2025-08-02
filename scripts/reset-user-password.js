import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetPassword(email, newPassword) {
  try {
    console.log(`\n🔐 Resetting password for: ${email}\n`)

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('❌ Error updating password:', error)
    } else if (data && data.length > 0) {
      console.log('✅ Password updated successfully!')
      console.log('  User ID:', data[0].id)
      console.log('  Email:', data[0].email)
      console.log('\n🔑 You can now login with the new password')
    } else {
      console.log('❌ User not found with email:', email)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Get email and password from command line
const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.log('Usage: node scripts/reset-user-password.js <email> <new-password>')
  console.log('Example: node scripts/reset-user-password.js user@example.com newpassword123')
  process.exit(1)
}

if (newPassword.length < 6) {
  console.log('❌ Password must be at least 6 characters long')
  process.exit(1)
}

resetPassword(email, newPassword)