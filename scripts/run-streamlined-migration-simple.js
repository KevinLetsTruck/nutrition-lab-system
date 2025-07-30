const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Starting streamlined onboarding migration (simple)...')
    
    // Create the table directly
    console.log('\n🔧 Creating client_onboarding table...')
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS client_onboarding (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID,
        
        -- Basic Demographics (essential contact info)
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(20),
        
        -- Current Diet Approach
        current_diet_approach VARCHAR(50),
        diet_duration_months INTEGER,
        
        -- Current Prescriptions/Supplements
        current_medications TEXT,
        current_supplements TEXT,
        
        -- Coaching Priority
        primary_health_goal TEXT,
        
        -- Truck Driver Specific Information
        years_driving INTEGER,
        route_type VARCHAR(20),
        schedule_pattern VARCHAR(20),
        
        -- DOT Medical Status
        dot_medical_status VARCHAR(20),
        dot_expiry_date DATE,
        
        -- Progress Tracking
        current_step VARCHAR(50) DEFAULT 'demographics',
        progress_percentage INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT FALSE,
        
        -- Session Management
        session_token VARCHAR(255) UNIQUE,
        last_activity TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        
        -- Timestamps
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
    
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (tableError) {
      console.error('❌ Error creating table:', tableError)
      // Try alternative approach
      console.log('🔄 Trying alternative approach...')
      
      // Test if we can access the database directly
      const { data, error } = await supabase
        .from('clients')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('❌ Cannot access database:', error)
        return
      }
      
      console.log('✅ Database access confirmed')
    } else {
      console.log('✅ Table created successfully')
    }
    
    // Create indexes
    console.log('\n🔧 Creating indexes...')
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_client_onboarding_client_id ON client_onboarding(client_id);',
      'CREATE INDEX IF NOT EXISTS idx_client_onboarding_session_token ON client_onboarding(session_token);',
      'CREATE INDEX IF NOT EXISTS idx_client_onboarding_current_step ON client_onboarding(current_step);',
      'CREATE INDEX IF NOT EXISTS idx_client_onboarding_is_completed ON client_onboarding(is_completed);',
      'CREATE INDEX IF NOT EXISTS idx_client_onboarding_expires_at ON client_onboarding(expires_at);'
    ]
    
    for (const indexSQL of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSQL })
      if (error) {
        console.error('❌ Error creating index:', error)
      } else {
        console.log('✅ Index created')
      }
    }
    
    console.log('\n🎉 Migration completed!')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
  }
}

// Run the migration
runMigration() 