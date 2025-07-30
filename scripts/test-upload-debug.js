require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const FormData = require('form-data');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUploadAPI() {
  console.log('=== Testing Upload API Debug ===\n');
  
  try {
    // Test 1: Check if clients table exists
    console.log('1. Checking if clients table exists...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientsError) {
      console.log('❌ Clients table error:', clientsError.message);
    } else {
      console.log('✅ Clients table exists, found', clients?.length || 0, 'records');
    }
    
    // Test 2: Check if users table exists
    console.log('\n2. Checking if users table exists...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table exists, found', users?.length || 0, 'records');
    }
    
    // Test 3: Check if client_profiles table exists
    console.log('\n3. Checking if client_profiles table exists...');
    const { data: profiles, error: profilesError } = await supabase
      .from('client_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Client profiles table error:', profilesError.message);
    } else {
      console.log('✅ Client profiles table exists, found', profiles?.length || 0, 'records');
    }
    
    // Test 4: Try to search for a client by email
    console.log('\n4. Testing client search by email...');
    const testEmail = 'john.smith@email.com';
    const { data: searchResults, error: searchError } = await supabase
      .from('clients')
      .select('*')
      .or(`first_name.ilike.%${testEmail}%,last_name.ilike.%${testEmail}%,email.ilike.%${testEmail}%`);
    
    if (searchError) {
      console.log('❌ Client search error:', searchError.message);
    } else {
      console.log('✅ Client search works, found', searchResults?.length || 0, 'matches for', testEmail);
      if (searchResults && searchResults.length > 0) {
        console.log('   First result:', searchResults[0]);
      }
    }
    
    // Test 5: Test name splitting logic
    console.log('\n5. Testing name splitting logic...');
    const clientName = 'John Smith';
    const firstName = clientName.split(' ')[0];
    const lastName = clientName.split(' ').slice(1).join(' ');
    
    console.log('   Client name:', clientName);
    console.log('   First name:', firstName);
    console.log('   Last name:', lastName);
    console.log('   First name empty?', !firstName);
    console.log('   Last name empty?', !lastName);
    
    // Test 6: Test with different name formats
    console.log('\n6. Testing different name formats...');
    const testNames = ['John Smith', 'John', 'John A Smith', 'John A. Smith'];
    
    testNames.forEach(name => {
      const first = name.split(' ')[0];
      const last = name.split(' ').slice(1).join(' ');
      console.log(`   "${name}" -> First: "${first}", Last: "${last}"`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUploadAPI(); 