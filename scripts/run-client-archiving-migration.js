const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runClientArchivingMigration() {
  console.log('Running client archiving migration...')

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/009_client_archiving.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('Executing migration SQL...')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })

    if (error) {
      console.error('Error running migration:', error)
      return
    }

    console.log('✅ Client archiving migration completed successfully!')

    // Verify the columns were added
    console.log('Verifying migration...')
    const { data: columns, error: checkError } = await supabase
      .from('clients')
      .select('id, status, archived_at, updated_at')
      .limit(1)

    if (checkError) {
      console.error('Error verifying migration:', checkError)
    } else {
      console.log('✅ Migration verification successful - columns exist')
    }

  } catch (error) {
    console.error('Error running migration:', error)
  }
}

runClientArchivingMigration() 