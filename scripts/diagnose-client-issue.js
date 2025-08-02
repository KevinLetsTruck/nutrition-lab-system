#!/usr/bin/env node

/**
 * Diagnose Client Data Display Issue
 * Systematically checks all components of the client data flow
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create both client types
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

async function diagnose() {
  console.log('🔍 DIAGNOSING CLIENT DATA ISSUE\n');
  console.log('=' .repeat(60));

  // 1. Check Environment
  console.log('\n1️⃣ ENVIRONMENT CHECK:');
  console.log('   Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('   Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('   Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

  // 2. Test Database Connection
  console.log('\n2️⃣ DATABASE CONNECTION TEST:');
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('count(*)', { count: 'exact' });
    
    if (error) {
      console.log('   ❌ Database connection failed:', error.message);
    } else {
      console.log('   ✅ Database connected successfully');
    }
  } catch (err) {
    console.log('   ❌ Connection error:', err.message);
  }

  // 3. Check Client Data
  console.log('\n3️⃣ CLIENT DATA CHECK:');
  try {
    // Count total clients
    const { count: totalCount } = await supabaseAdmin
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    console.log('   Total clients in database:', totalCount || 0);

    // Get sample clients
    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('id, first_name, last_name, email, created_at, archived_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.log('   ❌ Error fetching clients:', error.message);
    } else {
      console.log('   ✅ Successfully fetched', clients?.length || 0, 'clients');
      
      if (clients && clients.length > 0) {
        console.log('\n   Recent clients:');
        clients.forEach((client, i) => {
          console.log(`   ${i + 1}. ${client.first_name} ${client.last_name} (${client.email})`);
          console.log(`      Created: ${new Date(client.created_at).toLocaleDateString()}`);
          console.log(`      Archived: ${client.archived_at ? 'Yes' : 'No'}`);
        });
      }
    }

    // Check for archived clients
    const { count: archivedCount } = await supabaseAdmin
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .not('archived_at', 'is', null);
    
    console.log('\n   Archived clients:', archivedCount || 0);
    console.log('   Active clients:', (totalCount || 0) - (archivedCount || 0));

  } catch (err) {
    console.log('   ❌ Error checking client data:', err.message);
  }

  // 4. Check RLS Policies
  console.log('\n4️⃣ ROW LEVEL SECURITY CHECK:');
  try {
    // Test with anon key (simulating client-side)
    const { data: clientData, error: clientError } = await supabaseClient
      .from('clients')
      .select('id')
      .limit(1);

    if (clientError) {
      console.log('   ⚠️  Client-side access error:', clientError.message);
      console.log('   This might indicate RLS is blocking access');
    } else {
      console.log('   ✅ Client-side access works');
    }

    // Compare with admin access
    const { data: adminData } = await supabaseAdmin
      .from('clients')
      .select('id')
      .limit(1);

    if (adminData && !clientData) {
      console.log('   ❗ RLS is likely blocking client-side access');
    }

  } catch (err) {
    console.log('   ❌ RLS check error:', err.message);
  }

  // 5. Check API Endpoints
  console.log('\n5️⃣ API ENDPOINT CHECK:');
  try {
    console.log('   Testing http://localhost:3000/api/clients...');
    const response = await fetch('http://localhost:3000/api/clients');
    console.log('   Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API returned', data.clients?.length || 0, 'clients');
    } else {
      const text = await response.text();
      console.log('   ❌ API error:', text);
    }
  } catch (err) {
    console.log('   ❌ API test failed:', err.message);
  }

  // 6. Check Authentication
  console.log('\n6️⃣ AUTHENTICATION CHECK:');
  try {
    console.log('   Testing http://localhost:3000/api/auth/me...');
    const response = await fetch('http://localhost:3000/api/auth/me');
    console.log('   Response status:', response.status);
    
    if (response.status === 401) {
      console.log('   ⚠️  User not authenticated');
      console.log('   This might prevent client data from loading');
    } else if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Authenticated as:', data.user?.email);
    } else {
      console.log('   ❌ Auth check failed');
    }
  } catch (err) {
    console.log('   ❌ Auth test failed:', err.message);
  }

  // 7. Summary and Recommendations
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 DIAGNOSIS SUMMARY:\n');

  console.log('Possible issues to fix:');
  console.log('1. If authentication failed: Log in at http://localhost:3000/auth');
  console.log('2. If RLS is blocking: Check Supabase policies or temporarily disable RLS');
  console.log('3. If API errors: Check server logs for detailed error messages');
  console.log('4. If no data exists: Run seed script to add test data');
  
  console.log('\n🔧 Quick fixes to try:');
  console.log('1. Clear browser cookies and localStorage');
  console.log('2. Restart the development server');
  console.log('3. Check browser console for errors');
  console.log('4. Verify you\'re on the correct page: http://localhost:3000/clients');
}

// Run diagnosis
diagnose().catch(console.error);