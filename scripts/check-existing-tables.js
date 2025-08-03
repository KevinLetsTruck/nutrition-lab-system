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

async function checkExistingTables() {
  console.log('🔍 Checking existing tables in database...\n');
  
  try {
    // List of tables we're interested in
    const tablesToCheck = [
      'clients',
      'client_notes',
      'client_documents',
      'protocols',
      'lab_reports',
      'nutriq_results',
      'structured_assessments',
      'quick_analyses',
      'comprehensive_analyses',
      'supplement_recommendations',
      'progress_tracking',
      'analysis_artifacts',
      'users',
      'user_clients'
    ];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log('- ✅ = Table exists and is accessible');
    console.log('- ❌ = Table does not exist or has issues');
    console.log('\n💡 If you see missing tables, you may need to run the appropriate migrations.');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

// Run the check
checkExistingTables(); 