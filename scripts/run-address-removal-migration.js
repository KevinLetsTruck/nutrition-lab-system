const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function runAddressRemovalMigration() {
  console.log('🚀 Starting address field removal migration...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    console.log('📋 Running migration: Remove address fields from client_onboarding table...')
    
    // Remove address-related columns
    const { error: addressError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE client_onboarding DROP COLUMN IF EXISTS address'
    })
    
    if (addressError) {
      console.error('❌ Error removing address column:', addressError)
    } else {
      console.log('✅ Removed address column')
    }
    
    const { error: cityError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE client_onboarding DROP COLUMN IF EXISTS city'
    })
    
    if (cityError) {
      console.error('❌ Error removing city column:', cityError)
    } else {
      console.log('✅ Removed city column')
    }
    
    const { error: stateError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE client_onboarding DROP COLUMN IF EXISTS state'
    })
    
    if (stateError) {
      console.error('❌ Error removing state column:', stateError)
    } else {
      console.log('✅ Removed state column')
    }
    
    const { error: zipError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE client_onboarding DROP COLUMN IF EXISTS zip_code'
    })
    
    if (zipError) {
      console.error('❌ Error removing zip_code column:', zipError)
    } else {
      console.log('✅ Removed zip_code column')
    }
    
    const { error: emergencyContactError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE client_onboarding DROP COLUMN IF EXISTS emergency_contact'
    })
    
    if (emergencyContactError) {
      console.error('❌ Error removing emergency_contact column:', emergencyContactError)
    } else {
      console.log('✅ Removed emergency_contact column')
    }
    
    const { error: emergencyPhoneError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE client_onboarding DROP COLUMN IF EXISTS emergency_phone'
    })
    
    if (emergencyPhoneError) {
      console.error('❌ Error removing emergency_phone column:', emergencyPhoneError)
    } else {
      console.log('✅ Removed emergency_phone column')
    }
    
    // Update table comment
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: "COMMENT ON TABLE client_onboarding IS 'Streamlined onboarding system for FNTP truck driver clients - essential info only (no address fields)'"
    })
    
    if (commentError) {
      console.error('❌ Error updating table comment:', commentError)
    } else {
      console.log('✅ Updated table comment')
    }
    
    console.log('🎉 Address field removal migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runAddressRemovalMigration() 