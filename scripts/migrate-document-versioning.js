require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 Running document versioning migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '020_document_versioning.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim() + ';');
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('--') || statement.match(/^\s*$/)) {
        continue;
      }
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Extract first few words for logging
      const preview = statement.substring(0, 50).replace(/\n/g, ' ');
      console.log(`  ${preview}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        query: statement
      });
      
      if (error) {
        // Check if it's a "already exists" error which we can ignore
        if (error.message.includes('already exists')) {
          console.log('  ⚠️  Already exists (skipping)');
        } else {
          console.error('  ❌ Error:', error.message);
          throw error;
        }
      } else {
        console.log('  ✅ Success');
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    
    // Verify tables were created
    console.log('\nVerifying tables...');
    const tables = ['documents', 'document_versions', 'version_comparisons', 'document_audit_log'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
      } else {
        console.log(`✅ ${table}: Ready (${count || 0} records)`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Alternative: Direct execution if exec_sql is not available
async function runMigrationDirect() {
  console.log('🚀 Running document versioning migration (direct mode)...\n');
  
  try {
    // Create tables one by one
    console.log('Creating documents table...');
    const { error: docsError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
    
    if (docsError && docsError.code === '42P01') {
      console.log('  Documents table does not exist. Please run the migration manually in Supabase SQL editor.');
      console.log('  Migration file: database/migrations/020_document_versioning.sql');
      return;
    }
    
    console.log('✅ Document versioning tables appear to be set up!');
    
    // Test creating a document
    console.log('\nTesting document creation...');
    const { data: testDoc, error: testError } = await supabase
      .from('documents')
      .insert({
        client_id: '0a8b5c4f-b1e3-4db3-9a2f-c8e9a1b2c3d4',
        document_name: 'test-migration.pdf',
        document_type: 'test',
        metadata: { test: true }
      })
      .select()
      .single();
    
    if (testError) {
      console.log('❌ Test document creation failed:', testError.message);
    } else {
      console.log('✅ Test document created:', testDoc.id);
      
      // Clean up test
      await supabase
        .from('documents')
        .delete()
        .eq('id', testDoc.id);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if exec_sql RPC function exists
async function checkExecSQL() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      query: 'SELECT 1'
    });
    
    if (error && error.message.includes('Could not find the function')) {
      console.log('⚠️  exec_sql function not found. Using direct mode...\n');
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  const hasExecSQL = await checkExecSQL();
  
  if (hasExecSQL) {
    await runMigration();
  } else {
    await runMigrationDirect();
  }
}

main().catch(console.error);