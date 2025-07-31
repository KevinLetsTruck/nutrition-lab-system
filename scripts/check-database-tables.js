const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...')
    
    // Check if clients table exists
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('count')
      .limit(1)
    
    console.log('📊 Clients table check:', { data: clientsData, error: clientsError })
    
    // Check if users table exists
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    console.log('📊 Users table check:', { data: usersData, error: usersError })
    
    // List all tables (this might not work with Supabase, but worth trying)
    console.log('📋 Attempting to list all tables...')
    
    // Try to get table info from information_schema
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_tables')
      .select('*')
    
    console.log('📋 Tables data:', { data: tablesData, error: tablesError })
    
  } catch (error) {
    console.error('🚨 Error checking tables:', error)
  }
}

checkTables() 