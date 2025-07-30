require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Read the migration file
const migrationPath = path.join(__dirname, '../database/migrations/006_authentication_system.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('=== Authentication System Migration ===');
console.log('Migration file loaded successfully');
console.log('SQL Preview (first 200 chars):', migrationSQL.substring(0, 200) + '...');
console.log('\nTo run this migration:');
console.log('1. Connect to your Supabase database');
console.log('2. Run the SQL from: database/migrations/006_authentication_system.sql');
console.log('3. Or use the Supabase dashboard SQL editor');
console.log('\nRequired environment variables:');
console.log('- NEXT_PUBLIC_SUPABASE_URL');
console.log('- SUPABASE_SERVICE_ROLE_KEY');
console.log('- DATABASE_URL (if using direct connection)');
console.log('- NEXTAUTH_SECRET');
console.log('- NEXTAUTH_URL');

// Check if we can connect to Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\nEnvironment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\n❌ Missing Supabase environment variables');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

console.log('\n✅ Supabase environment variables found');
console.log('Attempting to connect to Supabase...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('This is expected if the tables don\'t exist yet');
      console.log('You need to run the migration first');
      console.log('\n📋 Next steps:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of database/migrations/006_authentication_system.sql');
      console.log('4. Execute the SQL');
    } else {
      console.log('✅ Database connection successful');
      console.log('Users table exists and is accessible');
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

testConnection(); 