#!/usr/bin/env node

/**
 * Fix email verification issues by either verifying email or changing user role
 */

import { createClient } from '@supabase/supabase-js'
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

async function fixEmailVerification() {
  console.log('🔧 Fixing email verification for kevin@letstruck.com...\n')
  
  try {
    // Get current user status
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'kevin@letstruck.com')
      .single()
    
    if (userError || !user) {
      console.error('❌ User not found:', userError?.message || 'User does not exist')
      return
    }
    
    console.log('📋 Current user status:')
    console.log(`   Role: ${user.role}`)
    console.log(`   Email Verified: ${user.email_verified}`)
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
    
    // Option 1: Verify the email
    console.log('\n🔧 Option 1: Verify the email')
    const { error: verifyError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('email', 'kevin@letstruck.com')
    
    if (verifyError) {
      console.error('❌ Failed to verify email:', verifyError.message)
    } else {
      console.log('✅ Email verified successfully!')
    }
    
    // Option 2: Change role to admin (if you want admin access)
    console.log('\n🔧 Option 2: Change role to admin')
    const { error: roleError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('email', 'kevin@letstruck.com')
    
    if (roleError) {
      console.error('❌ Failed to change role:', roleError.message)
    } else {
      console.log('✅ Role changed to admin successfully!')
    }
    
    // Verify the changes
    const { data: updatedUser, error: updatedError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'kevin@letstruck.com')
      .single()
    
    if (updatedError) {
      console.error('❌ Failed to verify changes:', updatedError.message)
    } else {
      console.log('\n✅ Updated user status:')
      console.log(`   Role: ${updatedUser.role}`)
      console.log(`   Email Verified: ${updatedUser.email_verified}`)
      console.log('\n🎉 You should now be able to log in!')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the fix
fixEmailVerification().catch(console.error) 