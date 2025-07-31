const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testNotesAPI() {
  console.log('🧪 Testing Notes API and Database Connection...')

  try {
    // Test 1: Check if client_notes table exists
    console.log('\n1. Testing client_notes table access...')
    const { data: notes, error: notesError } = await supabase
      .from('client_notes')
      .select('*')
      .limit(1)

    if (notesError) {
      console.error('❌ Error accessing client_notes table:', notesError)
    } else {
      console.log('✅ client_notes table accessible')
      console.log('📊 Current notes count:', notes?.length || 0)
    }

    // Test 2: Check if clients table exists and has data
    console.log('\n2. Testing clients table access...')
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name')
      .limit(3)

    if (clientsError) {
      console.error('❌ Error accessing clients table:', clientsError)
    } else {
      console.log('✅ clients table accessible')
      console.log('📊 Available clients:', clients?.map(c => `${c.first_name} ${c.last_name} (${c.id})`))
    }

    // Test 3: Try to insert a test note
    if (clients && clients.length > 0) {
      console.log('\n3. Testing note insertion...')
      const testClientId = clients[0].id
      
      const { data: newNote, error: insertError } = await supabase
        .from('client_notes')
        .insert({
          client_id: testClientId,
          type: 'coaching_call',
          content: 'Test note from API verification script',
          author: 'Test Script'
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error inserting test note:', insertError)
      } else {
        console.log('✅ Test note inserted successfully')
        console.log('📝 Note ID:', newNote.id)
        
        // Clean up test note
        const { error: deleteError } = await supabase
          .from('client_notes')
          .delete()
          .eq('id', newNote.id)
        
        if (deleteError) {
          console.error('⚠️  Warning: Could not clean up test note:', deleteError)
        } else {
          console.log('🧹 Test note cleaned up')
        }
      }
    }

    // Test 4: Check protocols table
    console.log('\n4. Testing protocols table access...')
    const { data: protocols, error: protocolsError } = await supabase
      .from('protocols')
      .select('*')
      .limit(1)

    if (protocolsError) {
      console.error('❌ Error accessing protocols table:', protocolsError)
    } else {
      console.log('✅ protocols table accessible')
      console.log('📊 Current protocols count:', protocols?.length || 0)
    }

    console.log('\n🎉 Database connection test completed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testNotesAPI() 