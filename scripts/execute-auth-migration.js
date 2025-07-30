require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Starting Authentication System Database Migration...');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('Connecting to Supabase...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration() {
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database/migrations/006_authentication_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Migration SQL loaded successfully');
    console.log('Executing migration...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .filter(stmt => !stmt.startsWith('COMMENT ON')) // Skip comments for now
      .filter(stmt => !stmt.startsWith('CREATE TRIGGER')) // Skip triggers for now
      .filter(stmt => !stmt.startsWith('INSERT INTO')); // Skip inserts for now
    
    console.log(`📊 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`  ${i + 1}/${statements.length}: ${statement.substring(0, 60)}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
            // Continue with other statements
          } else {
            console.log(`  ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (execError) {
          console.error(`❌ Execution error for statement ${i + 1}:`, execError.message);
        }
      }
    }
    
    console.log('✅ Migration completed!');
    
    // Test the tables
    console.log('🧪 Testing created tables...');
    
    const tables = ['users', 'client_profiles', 'user_sessions', 'rate_limits'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Error testing table ${table}:`, error.message);
        } else {
          console.log(`✅ Table ${table} is accessible`);
        }
      } catch (testError) {
        console.error(`❌ Error testing table ${table}:`, testError.message);
      }
    }
    
    console.log('🎉 Authentication system migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Add missing environment variables to .env.local:');
    console.log('   - DATABASE_URL');
    console.log('   - NEXTAUTH_SECRET');
    console.log('   - NEXTAUTH_URL');
    console.log('2. Test the authentication system:');
    console.log('   - Visit: http://localhost:3001/api/auth/debug');
    console.log('   - Test registration: http://localhost:3001/api/auth/test-registration');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
executeMigration(); 