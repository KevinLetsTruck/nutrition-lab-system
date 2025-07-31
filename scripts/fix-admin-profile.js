#!/usr/bin/env node

/**
 * Fix admin profile issue that's causing 500 error on /api/auth/me
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

async function fixAdminProfile() {
  console.log('🔧 Fixing admin profile issue...\n')
  
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
    console.log(`   ID: ${user.id}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Email: ${user.email}`)
    
    if (user.role === 'admin') {
      console.log('\n🔍 Checking for admin_profiles table...')
      
      // Check if admin_profiles table exists
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'admin_profiles')
      
      if (tablesError) {
        console.error('❌ Error checking table existence:', tablesError.message)
      } else if (tables.length === 0) {
        console.log('⚠️  admin_profiles table does not exist!')
        console.log('   This is causing the 500 error on /api/auth/me')
        
        // Option 1: Change role back to client
        console.log('\n🔧 Option 1: Change role back to client (recommended)')
        const { error: roleError } = await supabase
          .from('users')
          .update({ role: 'client' })
          .eq('email', 'kevin@letstruck.com')
        
        if (roleError) {
          console.error('❌ Failed to change role:', roleError.message)
        } else {
          console.log('✅ Role changed back to client successfully!')
        }
        
      } else {
        console.log('✅ admin_profiles table exists')
        
        // Check if admin profile exists
        const { data: adminProfile, error: profileError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (profileError || !adminProfile) {
          console.log('⚠️  Admin profile not found - creating one...')
          
          // Create admin profile
          const { error: createError } = await supabase
            .from('admin_profiles')
            .insert({
              user_id: user.id,
              name: 'Kevin Rutherford',
              title: 'System Administrator',
              specializations: ['Nutrition', 'Lab Analysis'],
              client_capacity: 100,
              active_sessions: 0
            })
          
          if (createError) {
            console.error('❌ Failed to create admin profile:', createError.message)
            console.log('\n🔧 Falling back to client role...')
            
            // Fallback: change to client role
            const { error: fallbackError } = await supabase
              .from('users')
              .update({ role: 'client' })
              .eq('email', 'kevin@letstruck.com')
            
            if (fallbackError) {
              console.error('❌ Failed to change role:', fallbackError.message)
            } else {
              console.log('✅ Role changed to client as fallback')
            }
          } else {
            console.log('✅ Admin profile created successfully!')
          }
        } else {
          console.log('✅ Admin profile already exists')
        }
      }
    } else {
      console.log('✅ User is already a client - no admin profile needed')
    }
    
    // Verify the fix
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
      console.log('\n🎉 The /api/auth/me endpoint should now work!')
      console.log('   Try logging in again.')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the fix
fixAdminProfile().catch(console.error) 