const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please set:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMikeWilsonData() {
  console.log('🔍 Checking Mike Wilson\'s data...')
  
  try {
    // Find Mike Wilson
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .or('first_name.ilike.%mike%,last_name.ilike.%wilson%')
    
    if (clientError) {
      throw new Error(`Failed to fetch clients: ${clientError.message}`)
    }
    
    console.log(`📋 Found ${clients.length} clients matching Mike Wilson:`)
    clients.forEach(client => {
      console.log(`  - ${client.first_name} ${client.last_name} (ID: ${client.id})`)
    })
    
    if (clients.length === 0) {
      console.log('❌ No clients found matching Mike Wilson')
      return
    }
    
    // Use the first matching client
    const client = clients[0]
    console.log(`\n🎯 Using client: ${client.first_name} ${client.last_name} (ID: ${client.id})`)
    
    // Check lab reports (including NutriQ)
    const { data: labReports, error: labError } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', client.id)
    
    if (labError) {
      throw new Error(`Failed to fetch lab reports: ${labError.message}`)
    }
    
    console.log(`\n📊 Lab Reports (${labReports.length}):`)
    labReports.forEach(report => {
      console.log(`  - ${report.report_type} (${report.report_date})`)
      console.log(`    Status: ${report.status}`)
      console.log(`    Has analysis_results: ${!!report.analysis_results}`)
      console.log(`    Has nutriq_results: ${!!report.nutriq_results}`)
      
      if (report.nutriq_results && report.nutriq_results.length > 0) {
        const nutriq = report.nutriq_results[0]
        console.log(`    NutriQ Total Score: ${nutriq.total_score || 'N/A'}`)
        console.log(`    Energy Score: ${nutriq.energy_score || 'N/A'}`)
        console.log(`    Mood Score: ${nutriq.mood_score || 'N/A'}`)
        console.log(`    Sleep Score: ${nutriq.sleep_score || 'N/A'}`)
      }
    })
    
    // Check notes
    const { data: notes, error: notesError } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
    
    if (notesError) {
      throw new Error(`Failed to fetch notes: ${notesError.message}`)
    }
    
    console.log(`\n📝 Notes (${notes.length}):`)
    notes.forEach(note => {
      console.log(`  - ${note.type} (${note.created_at})`)
      console.log(`    Content: ${note.content.substring(0, 100)}...`)
    })
    
    // Check protocols
    const { data: protocols, error: protocolsError } = await supabase
      .from('protocols')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
    
    if (protocolsError) {
      throw new Error(`Failed to fetch protocols: ${protocolsError.message}`)
    }
    
    console.log(`\n💊 Protocols (${protocols.length}):`)
    protocols.forEach(protocol => {
      console.log(`  - ${protocol.phase} (${protocol.created_at})`)
      console.log(`    Status: ${protocol.status}`)
      console.log(`    Compliance: ${protocol.compliance || 'N/A'}%`)
    })
    
    console.log('\n✅ Data check complete!')
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message)
    process.exit(1)
  }
}

checkMikeWilsonData() 