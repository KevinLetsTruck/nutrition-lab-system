const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addClientColumns() {
  console.log('Adding missing columns to clients table...')

  try {
    // Add status column
    console.log('Adding status column...')
    const { error: statusError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE clients ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'active\';'
    })

    if (statusError) {
      console.error('Error adding status column:', statusError)
    } else {
      console.log('✅ Status column added')
    }

    // Add archived_at column
    console.log('Adding archived_at column...')
    const { error: archivedError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE clients ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;'
    })

    if (archivedError) {
      console.error('Error adding archived_at column:', archivedError)
    } else {
      console.log('✅ Archived_at column added')
    }

    // Add updated_at column
    console.log('Adding updated_at column...')
    const { error: updatedError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();'
    })

    if (updatedError) {
      console.error('Error adding updated_at column:', updatedError)
    } else {
      console.log('✅ Updated_at column added')
    }

    // Create indexes
    console.log('Creating indexes...')
    const { error: index1Error } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);'
    })

    if (index1Error) {
      console.error('Error creating status index:', index1Error)
    } else {
      console.log('✅ Status index created')
    }

    const { error: index2Error } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_clients_archived_at ON clients(archived_at);'
    })

    if (index2Error) {
      console.error('Error creating archived_at index:', index2Error)
    } else {
      console.log('✅ Archived_at index created')
    }

    // Verify the columns exist
    console.log('Verifying columns...')
    const { data: columns, error: checkError } = await supabase
      .from('clients')
      .select('id, status, archived_at, updated_at')
      .limit(1)

    if (checkError) {
      console.error('Error verifying columns:', checkError)
    } else {
      console.log('✅ All columns verified successfully!')
    }

    console.log('Database schema update complete!')

  } catch (error) {
    console.error('Error updating database schema:', error)
  }
}

addClientColumns() 