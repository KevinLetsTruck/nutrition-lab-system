const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addClientColumns() {
  console.log('🚀 Adding missing columns to clients table...')

  const columns = [
    'ADD COLUMN IF NOT EXISTS occupation VARCHAR(100)',
    'ADD COLUMN IF NOT EXISTS primary_health_concern TEXT',
    'ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100)',
    'ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20)',
    'ADD COLUMN IF NOT EXISTS preferred_communication VARCHAR(20) DEFAULT \'email\'',
    'ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(100)',
    'ADD COLUMN IF NOT EXISTS insurance_id VARCHAR(50)',
    'ADD COLUMN IF NOT EXISTS gender VARCHAR(20)',
    'ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE',
    'ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP',
    'ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP'
  ]

  try {
    for (const column of columns) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE clients ${column}`
      })

      if (error) {
        console.error('❌ Error adding column:', column, error)
      } else {
        console.log('✅ Added column:', column)
      }
    }

    console.log('🎉 Client columns added successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addClientColumns() 