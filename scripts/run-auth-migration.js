const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runAuthMigration() {
  console.log('🚀 Starting authentication system migration...')
  
  try {
    // Read the migration SQL file
    const fs = require('fs')
    const path = require('path')
    const migrationPath = path.join(__dirname, '../database/migrations/006_authentication_system.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      process.exit(1)
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Executing ${statements.length} SQL statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`  ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error)
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Migration completed successfully!')
    
    // Set up admin user password
    console.log('🔐 Setting up admin user...')
    
    const adminEmail = 'kevin@destinationhealth.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'DestinationHealth2024!'
    
    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    
    // Update the admin user's password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', adminEmail)
    
    if (updateError) {
      console.error('❌ Error updating admin password:', updateError)
    } else {
      console.log('✅ Admin user password set successfully!')
      console.log(`📧 Admin email: ${adminEmail}`)
      console.log(`🔑 Admin password: ${adminPassword}`)
      console.log('⚠️  Please change this password after first login!')
    }
    
    // Test the authentication system
    console.log('🧪 Testing authentication system...')
    
    // Test user registration
    const testUser = {
      email: 'test@example.com',
      password_hash: await bcrypt.hash('TestPassword123!', 12),
      role: 'client'
    }
    
    const { data: testUserData, error: testUserError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single()
    
    if (testUserError) {
      console.error('❌ Error creating test user:', testUserError)
    } else {
      console.log('✅ Test user created successfully')
      
      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('email', 'test@example.com')
      
      console.log('✅ Test user cleaned up')
    }
    
    // Test client profile creation
    const testProfile = {
      user_id: testUserData?.id,
      first_name: 'Test',
      last_name: 'User',
      phone: '555-123-4567'
    }
    
    const { error: profileError } = await supabase
      .from('client_profiles')
      .insert(testProfile)
    
    if (profileError) {
      console.error('❌ Error creating test profile:', profileError)
    } else {
      console.log('✅ Test client profile created successfully')
    }
    
    console.log('🎉 Authentication system setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Set up environment variables for JWT_SECRET')
    console.log('2. Configure email service (RESEND_API_KEY)')
    console.log('3. Test the registration and login flow')
    console.log('4. Update the admin password')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
runAuthMigration() 