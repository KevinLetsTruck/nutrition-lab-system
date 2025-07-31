#!/usr/bin/env node

/**
 * Reset user password in the database
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetPassword() {
  console.log('🔧 Password Reset Tool\n')
  
  const newPassword = process.argv[2] || 'newpassword123'
  
  if (newPassword.length < 8) {
    console.log('❌ Password must be at least 8 characters long')
    console.log('   Usage: node scripts/reset-password.js your_new_password')
    return
  }
  
  try {
    console.log('🔐 Resetting password for kevin@letstruck.com...')
    console.log('   New password length:', newPassword.length, 'characters')
    
    // Hash the new password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(newPassword, saltRounds)
    
    // Update the password in the database
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', 'kevin@letstruck.com')
    
    if (updateError) {
      console.error('❌ Failed to update password:', updateError.message)
      return
    }
    
    console.log('✅ Password updated successfully!')
    console.log('\n📋 New login credentials:')
    console.log('   Email: kevin@letstruck.com')
    console.log('   Password:', newPassword)
    console.log('\n🎉 You can now log in with these credentials!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the password reset
resetPassword().catch(console.error) 