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

async function syncClientData() {
  console.log('🔍 Syncing client data between tables...\n')

  try {
    // Step 1: Check both tables
    console.log('📊 Checking client_profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('client_profiles')
      .select('*, users!client_profiles_user_id_fkey(email)')

    if (profilesError) {
      console.error('❌ Error fetching client_profiles:', profilesError.message)
      return
    }

    console.log(`✅ Found ${profiles.length} client profiles`)

    console.log('\n📊 Checking clients table...')
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')

    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError.message)
      return
    }

    console.log(`✅ Found ${clients.length} clients`)

    // Step 2: Find kevin2@letstruck.com specifically
    const kevin2Profile = profiles.find(p => p.users?.email === 'kevin2@letstruck.com')
    if (kevin2Profile) {
      console.log('\n🎯 Found kevin2@letstruck.com in client_profiles:')
      console.log(`   ID: ${kevin2Profile.id}`)
      console.log(`   Name: ${kevin2Profile.first_name} ${kevin2Profile.last_name}`)
      console.log(`   Email: ${kevin2Profile.users.email}`)

      // Check if this client exists in the clients table
      const existingClient = clients.find(c => c.email === kevin2Profile.users.email)
      
      if (!existingClient) {
        console.log('\n⚠️  This client is NOT in the clients table!')
        console.log('📝 Creating entry in clients table...')

        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            id: kevin2Profile.id, // Use the same ID for consistency
            email: kevin2Profile.users.email,
            first_name: kevin2Profile.first_name,
            last_name: kevin2Profile.last_name,
            phone: kevin2Profile.phone || '1234567890',
            occupation: 'Truck Driver',
            primary_health_concern: 'General Health',
            created_at: kevin2Profile.created_at,
            updated_at: kevin2Profile.updated_at
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ Error creating client:', createError.message)
        } else {
          console.log('✅ Successfully created client in clients table!')
          console.log(`   You can now use ID: ${newClient.id} for coaching reports`)
        }
      } else {
        console.log('\n✅ Client already exists in clients table with ID:', existingClient.id)
      }
    } else {
      console.log('\n⚠️  Could not find kevin2@letstruck.com in client_profiles')
    }

    // Step 3: Show summary of mismatches
    console.log('\n📊 Summary of table mismatches:')
    const profileEmails = profiles.map(p => p.users?.email).filter(Boolean)
    const clientEmails = clients.map(c => c.email)

    const onlyInProfiles = profileEmails.filter(email => !clientEmails.includes(email))
    const onlyInClients = clientEmails.filter(email => !profileEmails.includes(email))

    if (onlyInProfiles.length > 0) {
      console.log(`\n⚠️  ${onlyInProfiles.length} clients only in client_profiles:`)
      onlyInProfiles.forEach(email => console.log(`   - ${email}`))
    }

    if (onlyInClients.length > 0) {
      console.log(`\n⚠️  ${onlyInClients.length} clients only in clients table:`)
      onlyInClients.forEach(email => console.log(`   - ${email}`))
    }

    if (onlyInProfiles.length === 0 && onlyInClients.length === 0) {
      console.log('\n✅ All clients are synced between both tables!')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }

  console.log('\n✨ Sync check completed!')
}

syncClientData()