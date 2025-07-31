const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkClientsSchema() {
  console.log('Checking clients table schema...')

  try {
    // Get table information
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'clients' 
        ORDER BY ordinal_position;
      `
    })

    if (tableError) {
      console.error('Error getting table schema:', tableError)
      return
    }

    console.log('Current clients table schema:')
    console.log('Table info:', JSON.stringify(tableInfo, null, 2))

    // Try to get a sample record
    console.log('\nTrying to get a sample record...')
    const { data: sample, error: sampleError } = await supabase
      .from('clients')
      .select('*')
      .limit(1)

    if (sampleError) {
      console.error('Error getting sample record:', sampleError)
    } else {
      console.log('Sample record:', JSON.stringify(sample, null, 2))
    }

  } catch (error) {
    console.error('Error checking schema:', error)
  }
}

checkClientsSchema() 