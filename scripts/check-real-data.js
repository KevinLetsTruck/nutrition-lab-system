const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRealData() {
  console.log('Checking real data in database...')

  try {
    // Check clients
    console.log('\n=== CLIENTS ===')
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientsError) {
      console.error('Error fetching clients:', clientsError)
    } else {
      console.log(`Found ${clients.length} clients:`)
      clients.forEach(client => {
        console.log(`  - ${client.first_name} ${client.last_name} (${client.email}) - ID: ${client.id}`)
      })
    }

    // Check protocols
    console.log('\n=== PROTOCOLS ===')
    const { data: protocols, error: protocolsError } = await supabase
      .from('protocols')
      .select('*')
      .order('created_at', { ascending: false })

    if (protocolsError) {
      console.error('Error fetching protocols:', protocolsError)
    } else {
      console.log(`Found ${protocols.length} protocols:`)
      protocols.forEach(protocol => {
        console.log(`  - Protocol ${protocol.id} for client ${protocol.client_id} - Status: ${protocol.status}`)
      })
    }

    // Check client notes
    console.log('\n=== CLIENT NOTES ===')
    const { data: notes, error: notesError } = await supabase
      .from('client_notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (notesError) {
      console.error('Error fetching notes:', notesError)
    } else {
      console.log(`Found ${notes.length} notes:`)
      notes.forEach(note => {
        console.log(`  - Note ${note.id} for client ${note.client_id} - Type: ${note.type}`)
      })
    }

    // Check lab reports
    console.log('\n=== LAB REPORTS ===')
    const { data: reports, error: reportsError } = await supabase
      .from('lab_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (reportsError) {
      console.error('Error fetching lab reports:', reportsError)
    } else {
      console.log(`Found ${reports.length} lab reports:`)
      reports.forEach(report => {
        console.log(`  - Report ${report.id} for client ${report.client_id} - Type: ${report.report_type} - Status: ${report.status}`)
      })
    }

    // Test a specific client query
    console.log('\n=== TESTING CLIENT QUERY ===')
    if (clients && clients.length > 0) {
      const testClient = clients[0]
      console.log(`Testing query for client: ${testClient.first_name} ${testClient.last_name}`)
      
      // Test fetching client with notes
      const { data: clientWithNotes, error: notesQueryError } = await supabase
        .from('clients')
        .select(`
          *,
          client_notes (*)
        `)
        .eq('id', testClient.id)
        .single()

      if (notesQueryError) {
        console.error('Error fetching client with notes:', notesQueryError)
      } else {
        console.log(`Client ${testClient.first_name} has ${clientWithNotes.client_notes?.length || 0} notes`)
      }

      // Test fetching client with protocols
      const { data: clientWithProtocols, error: protocolsQueryError } = await supabase
        .from('clients')
        .select(`
          *,
          protocols (*)
        `)
        .eq('id', testClient.id)
        .single()

      if (protocolsQueryError) {
        console.error('Error fetching client with protocols:', protocolsQueryError)
      } else {
        console.log(`Client ${testClient.first_name} has ${clientWithProtocols.protocols?.length || 0} protocols`)
      }
    }

  } catch (error) {
    console.error('Error checking data:', error)
  }
}

checkRealData() 