const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addTestClients() {
  console.log('Adding test clients to database...')

  try {
    // Check if test clients already exist
    const { data: existingClients, error: checkError } = await supabase
      .from('clients')
      .select('id, email')
      .in('email', [
        'john.smith@example.com',
        'sarah.johnson@example.com',
        'mike.wilson@example.com'
      ])

    if (checkError) {
      console.error('Error checking existing clients:', checkError)
      return
    }

    if (existingClients && existingClients.length > 0) {
      console.log('Test clients already exist:', existingClients.map(c => c.email))
      return
    }

    // Add test clients with proper UUIDs
    const testClients = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        status: 'active'
      },
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '(555) 234-5678',
        status: 'active'
      },
      {
        first_name: 'Mike',
        last_name: 'Wilson',
        email: 'mike.wilson@example.com',
        phone: '(555) 345-6789',
        status: 'active'
      }
    ]

    const { data: newClients, error: insertError } = await supabase
      .from('clients')
      .insert(testClients)
      .select('id, first_name, last_name, email')

    if (insertError) {
      console.error('Error adding test clients:', insertError)
      return
    }

    console.log('✅ Test clients added successfully:')
    newClients.forEach(client => {
      console.log(`  - ${client.first_name} ${client.last_name} (${client.email}) - ID: ${client.id}`)
    })

    // Add some test protocols for the clients
    if (newClients.length > 0) {
      console.log('Adding test protocols...')
      
      const testProtocols = newClients.map(client => ({
        client_id: client.id,
        phase: 'Phase 1: Initial Assessment',
        content: `Protocol for ${client.first_name} ${client.last_name}:\n\nThis is a sample protocol content for demonstration purposes.`,
        status: 'active',
        start_date: new Date().toISOString()
      }))

      const { data: newProtocols, error: protocolError } = await supabase
        .from('protocols')
        .insert(testProtocols)
        .select('id, client_id, phase')

      if (protocolError) {
        console.error('Error adding test protocols:', protocolError)
      } else {
        console.log('✅ Test protocols added successfully')
      }

      // Add some test notes
      console.log('Adding test notes...')
      
      const testNotes = newClients.map(client => ({
        client_id: client.id,
        type: 'interview',
        content: `Initial consultation with ${client.first_name} ${client.last_name}. Client reports good progress with current protocol.`,
        author: 'Kevin Rutherford, FNTP'
      }))

      const { data: newNotes, error: notesError } = await supabase
        .from('client_notes')
        .insert(testNotes)
        .select('id, client_id, type')

      if (notesError) {
        console.error('Error adding test notes:', notesError)
      } else {
        console.log('✅ Test notes added successfully')
      }
    }

    console.log('Database setup complete!')

  } catch (error) {
    console.error('Error setting up test data:', error)
  }
}

addTestClients() 