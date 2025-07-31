#!/usr/bin/env node

/**
 * Quick fix for login issue - change user role back to client
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

async function quickFixLogin() {
  console.log('🔧 Quick fix for login issue...\n')
  
  try {
    // Change role back to client (this will fix the /api/auth/me 500 error)
    const { error: roleError } = await supabase
      .from('users')
      .update({ role: 'client' })
      .eq('email', 'kevin@letstruck.com')
    
    if (roleError) {
      console.error('❌ Failed to change role:', roleError.message)
      return
    }
    
    console.log('✅ Role changed to client successfully!')
    
    // Verify the change
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'kevin@letstruck.com')
      .single()
    
    if (userError) {
      console.error('❌ Failed to verify change:', userError.message)
    } else {
      console.log('\n✅ User status updated:')
      console.log(`   Role: ${user.role}`)
      console.log(`   Email Verified: ${user.email_verified}`)
      console.log('\n🎉 Login should now work!')
      console.log('   The /api/auth/me endpoint will no longer return 500 error.')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the quick fix
quickFixLogin().catch(console.error) 