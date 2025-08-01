#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function fixClientData() {
  console.log('🔍 Checking client data structure...\n')

  try {
    // Check if there are any clients in the clients table
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5)

    if (clientsError) {
      console.error('❌ Error fetching from clients table:', clientsError.message)
    } else {
      console.log('✅ Clients table has', clients.length, 'records')
      if (clients.length > 0) {
        console.log('Sample client:', {
          id: clients[0].id,
          name: `${clients[0].first_name} ${clients[0].last_name}`,
          email: clients[0].email
        })
      }
    }

    // Check client_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('client_profiles')
      .select('*, users!client_profiles_user_id_fkey(email)')
      .limit(5)

    if (profilesError) {
      console.error('❌ Error fetching from client_profiles table:', profilesError.message)
    } else {
      console.log('\n✅ Client_profiles table has', profiles.length, 'records')
      if (profiles.length > 0) {
        console.log('Sample profile:', {
          id: profiles[0].id,
          name: `${profiles[0].first_name} ${profiles[0].last_name}`,
          email: profiles[0].users?.email
        })
      }
    }

    // If no clients exist, create a test client
    if (!clients || clients.length === 0) {
      console.log('\n📝 Creating test client...')
      
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          email: 'test.client@example.com',
          first_name: 'Test',
          last_name: 'Client',
          phone: '(555) 123-4567',
          occupation: 'Truck Driver',
          primary_health_concern: 'Energy and weight management',
          date_of_birth: '1980-01-01'
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating test client:', createError.message)
      } else {
        console.log('✅ Created test client:', newClient)
        console.log('\n🎯 You can now use this client ID for testing:', newClient.id)
      }
    }

    // Show how to properly fetch client data
    console.log('\n📚 How to properly fetch client data:')
    console.log('1. Always check if the client exists first')
    console.log('2. Use proper error handling')
    console.log('3. Consider which table (clients vs client_profiles) you need')
    
    // Example query
    if (clients && clients.length > 0) {
      const clientId = clients[0].id
      console.log(`\n🔍 Testing fetch for client ID: ${clientId}`)
      
      const { data: testClient, error: testError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (testError) {
        console.error('❌ Error fetching specific client:', testError.message)
      } else {
        console.log('✅ Successfully fetched client:', testClient.email)
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }

  console.log('\n✨ Script completed!')
}

fixClientData()