const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testComprehensiveAnalysis() {
  console.log('🧪 Testing Comprehensive Analysis System...\n');
  
  try {
    // Test 1: Check if tables exist
    console.log('📊 Test 1: Checking if tables exist...');
    const tables = [
      'comprehensive_analyses',
      'supplement_recommendations', 
      'progress_tracking',
      'analysis_artifacts'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table} does not exist:`, error.message);
      } else {
        console.log(`✅ Table ${table} exists and is accessible`);
      }
    }
    
    // Test 2: Check if we have any clients
    console.log('\n👥 Test 2: Checking for clients...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email')
      .limit(5);
    
    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError.message);
    } else {
      console.log(`✅ Found ${clients?.length || 0} clients`);
      if (clients && clients.length > 0) {
        console.log('Sample clients:');
        clients.forEach(client => {
          console.log(`  - ${client.first_name} ${client.last_name} (${client.email})`);
        });
      }
    }
    
    // Test 3: Test the API endpoint (if we have a client)
    if (clients && clients.length > 0) {
      console.log('\n🔗 Test 3: Testing API endpoint...');
      const testClientId = clients[0].id;
      
      try {
        const response = await fetch(`http://localhost:3000/api/clients/${testClientId}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ API endpoint responded successfully');
          console.log('Response structure:', Object.keys(result));
          if (result.analysis) {
            console.log('Analysis includes:', Object.keys(result.analysis));
          }
        } else {
          console.log(`❌ API endpoint failed with status: ${response.status}`);
          const errorText = await response.text();
          console.log('Error details:', errorText);
        }
      } catch (error) {
        console.log('❌ API endpoint test failed:', error.message);
        console.log('This is expected if the dev server is not running');
      }
    }
    
    // Test 4: Check if we have any existing analyses
    console.log('\n📈 Test 4: Checking for existing analyses...');
    const { data: analyses, error: analysesError } = await supabase
      .from('comprehensive_analyses')
      .select('*')
      .limit(5);
    
    if (analysesError) {
      console.error('❌ Error fetching analyses:', analysesError.message);
    } else {
      console.log(`✅ Found ${analyses?.length || 0} existing analyses`);
      if (analyses && analyses.length > 0) {
        console.log('Sample analysis:');
        const analysis = analyses[0];
        console.log(`  - ID: ${analysis.id}`);
        console.log(`  - Client ID: ${analysis.client_id}`);
        console.log(`  - Date: ${analysis.analysis_date}`);
        console.log(`  - Root causes: ${analysis.root_causes?.length || 0}`);
      }
    }
    
    // Test 5: Test data aggregation (simulate what the system would do)
    console.log('\n🔍 Test 5: Testing data aggregation...');
    if (clients && clients.length > 0) {
      const testClientId = clients[0].id;
      
      // Check what data we have for this client
      const { data: clientNotes, error: notesError } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', testClientId)
        .limit(5);
      
      const { data: clientProtocols, error: protocolsError } = await supabase
        .from('protocols')
        .select('*')
        .eq('client_id', testClientId)
        .limit(5);
      
      const { data: labReports, error: labError } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('client_id', testClientId)
        .limit(5);
      
      console.log(`✅ Client data available:`);
      console.log(`  - Notes: ${clientNotes?.length || 0}`);
      console.log(`  - Protocols: ${clientProtocols?.length || 0}`);
      console.log(`  - Lab reports: ${labReports?.length || 0}`);
      
      if (notesError) console.log('  ❌ Notes error:', notesError.message);
      if (protocolsError) console.log('  ❌ Protocols error:', protocolsError.message);
      if (labError) console.log('  ❌ Lab reports error:', labError.message);
    }
    
    console.log('\n🎉 Comprehensive Analysis System Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Run the SQL from create-comprehensive-analysis-tables.js in Supabase');
    console.log('2. Start the dev server: npm run dev');
    console.log('3. Navigate to a client page and test the "Run Comprehensive Analysis" button');
    console.log('4. Check the generated analysis and artifacts');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testComprehensiveAnalysis(); 