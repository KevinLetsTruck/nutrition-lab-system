#!/usr/bin/env node

/**
 * Check user verification status and help resolve email verification issues
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserStatus() {
  console.log('🔍 Checking user status for kevin@letstruck.com...\n')
  
  try {
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'kevin@letstruck.com')
      .single()
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError.message)
      
      // Try to check if the table exists
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'users')
      
      if (tablesError) {
        console.error('❌ Error checking table existence:', tablesError.message)
      } else if (tables.length === 0) {
        console.log('⚠️  Users table does not exist - this might be the issue!')
        console.log('   The authentication system expects a users table with email_verified field')
      }
      
      return
    }
    
    if (!users) {
      console.log('❌ User not found in users table')
      console.log('   This suggests the user was created in clients table but not in users table')
      return
    }
    
    console.log('✅ User found in users table:')
    console.log(`   ID: ${users.id}`)
    console.log(`   Email: ${users.email}`)
    console.log(`   Role: ${users.role}`)
    console.log(`   Email Verified: ${users.email_verified}`)
    console.log(`   Created: ${users.created_at}`)
    console.log(`   Last Login: ${users.last_login || 'Never'}`)
    
    // Check if email verification is the issue
    if (users.role === 'client' && !users.email_verified) {
      console.log('\n🔧 Email verification issue detected!')
      console.log('   Your account is marked as a client and requires email verification')
      
      // Check if we're in development mode
      const nodeEnv = process.env.NODE_ENV || 'development'
      console.log(`\n🌍 Environment: ${nodeEnv}`)
      
      if (nodeEnv === 'development') {
        console.log('✅ In development mode - email verification should be bypassed')
        console.log('   The login should work without verification in development')
      } else {
        console.log('⚠️  In production mode - email verification is required')
      }
      
      // Offer to fix the issue
      console.log('\n🔧 Solutions:')
      console.log('1. Set NODE_ENV=development in your .env.local file')
      console.log('2. Manually verify the email in the database')
      console.log('3. Change user role to admin (if appropriate)')
      
      // Ask if user wants to fix it
      console.log('\n❓ Would you like to manually verify the email? (y/n)')
      
      // For now, let's just show the fix command
      console.log('\n💡 To fix this, run:')
      console.log('   node scripts/fix-email-verification.js')
      
    } else if (users.email_verified) {
      console.log('\n✅ Email is verified - login should work')
      console.log('   If you\'re still having issues, check the browser console for errors')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the check
checkUserStatus().catch(console.error) 