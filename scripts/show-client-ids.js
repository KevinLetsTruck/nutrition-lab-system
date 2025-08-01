#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function showClientIds() {
  console.log('🔍 Finding kevin2@letstruck.com IDs in both tables...\n')

  try {
    // Find in client_profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('client_profiles')
      .select('*, users!client_profiles_user_id_fkey(email)')
      .eq('users.email', 'kevin2@letstruck.com')

    if (!profilesError && profiles.length > 0) {
      console.log('📊 In client_profiles table:')
      profiles.forEach(profile => {
        console.log(`   ID: ${profile.id}`)
        console.log(`   Name: ${profile.first_name} ${profile.last_name}`)
        console.log(`   This is the ID shown in the URL when viewing the client\n`)
      })
    }

    // Find in clients table
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', 'kevin2@letstruck.com')

    if (!clientsError && clients.length > 0) {
      console.log('📊 In clients table:')
      clients.forEach(client => {
        console.log(`   ID: ${client.id}`)
        console.log(`   Name: ${client.first_name} ${client.last_name}`)
        console.log(`   This is the ID needed for coaching reports\n`)
      })
    }

    console.log('💡 SOLUTION:')
    console.log('The fix I implemented will automatically find the correct client')
    console.log('when you generate a coaching report, even if the IDs don\'t match.')
    console.log('\nTry generating the coaching report again - it should work now!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

showClientIds()