require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeMigration() {
  console.log('🚀 Executing Document Versioning Migration\n');
  
  // Read the migration SQL
  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '020_document_versioning_fixed.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  // Split into individual statements
  const statements = migrationSQL
    .split(';')
    .filter(stmt => {
      const trimmed = stmt.trim();
      return trimmed && !trimmed.startsWith('--') && trimmed.length > 0;
    })
    .map(stmt => stmt.trim());
  
  console.log(`Found ${statements.length} SQL statements to execute\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ').replace(/\s+/g, ' ');
    
    console.log(`[${i + 1}/${statements.length}] ${preview}...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Check if it's a "already exists" error which we can ignore
        if (error.message?.includes('already exists')) {
          console.log('  ⚠️  Already exists (skipping)');
          successCount++;
        } else {
          console.error('  ❌ Error:', error.message || error);
          errorCount++;
        }
      } else {
        console.log('  ✅ Success');
        successCount++;
      }
    } catch (error) {
      console.error('  ❌ Error:', error.message || error);
      errorCount++;
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📝 Total: ${statements.length}`);
  
  // Test the tables
  console.log('\n🧪 Testing tables...');
  await testTables();
}

async function testTables() {
  const tables = ['documents', 'document_versions', 'version_comparisons', 'document_audit_log'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Ready (${count || 0} records)`);
      }
    } catch (error) {
      console.log(`❌ ${table}: Error - ${error.message}`);
    }
  }
}

// Check if exec_sql is available
async function checkExecSQL() {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
    
    if (error && error.message?.includes('Could not find the function')) {
      console.log('❌ exec_sql function not found in your Supabase instance.');
      console.log('   You need to create this function first or run the migration manually.\n');
      console.log('To create exec_sql function, run this in Supabase SQL Editor:');
      console.log('```sql');
      console.log(`CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`);
      console.log('```\n');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking exec_sql:', error);
    return false;
  }
}

// Main execution
async function main() {
  const hasExecSQL = await checkExecSQL();
  
  if (!hasExecSQL) {
    console.log('Alternative: Run the migration manually in Supabase SQL Editor');
    console.log('File: database/migrations/020_document_versioning_fixed.sql');
    return;
  }
  
  await executeMigration();
}

main().catch(console.error);