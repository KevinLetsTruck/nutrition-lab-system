const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runComprehensiveAnalysisMigration() {
  console.log('🚀 Starting Comprehensive Analysis Migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/012_comprehensive_analysis.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    
    // Execute the migration
    console.log('⚡ Executing migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
    
    console.log('✅ Comprehensive Analysis Migration completed successfully!');
    
    // Verify the tables were created
    console.log('🔍 Verifying tables...');
    
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
        console.error(`❌ Error checking table ${table}:`, error);
      } else {
        console.log(`✅ Table ${table} exists and is accessible`);
      }
    }
    
    // Check if sample data was inserted
    const { data: sampleAnalyses, error: sampleError } = await supabase
      .from('comprehensive_analyses')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Error checking sample data:', sampleError);
    } else {
      console.log(`✅ Found ${sampleAnalyses?.length || 0} sample comprehensive analyses`);
    }
    
    console.log('🎉 Migration verification complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runComprehensiveAnalysisMigration(); 