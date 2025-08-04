require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrationSQL() {
  console.log('🚀 Running Document Versioning Migration\n');
  
  // Read the migration SQL
  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '020_document_versioning_fixed.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  // Split into individual statements
  const statements = migrationSQL
    .split(';')
    .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
    .map(stmt => stmt.trim() + ';');
  
  console.log(`Found ${statements.length} SQL statements to execute\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 80).replace(/\n/g, ' ').replace(/\s+/g, ' ');
    
    console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);
    
    try {
      // Since we can't run DDL directly through Supabase JS, we'll simulate the process
      // In a real scenario, this would need to be run through Supabase SQL Editor
      
      // For demonstration, we'll show what would be executed
      if (statement.includes('CREATE TABLE')) {
        console.log('  ⚠️  Would create table (needs SQL Editor)');
      } else if (statement.includes('CREATE INDEX')) {
        console.log('  ⚠️  Would create index (needs SQL Editor)');
      } else if (statement.includes('CREATE FUNCTION')) {
        console.log('  ⚠️  Would create function (needs SQL Editor)');
      } else if (statement.includes('CREATE TRIGGER')) {
        console.log('  ⚠️  Would create trigger (needs SQL Editor)');
      } else {
        console.log('  ⚠️  Would execute statement (needs SQL Editor)');
      }
      
      errorCount++;
      errors.push(`Statement ${i + 1}: Requires Supabase SQL Editor`);
      
    } catch (error) {
      console.error('  ❌ Error:', error.message);
      errorCount++;
      errors.push(`Statement ${i + 1}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  The following need to be run in Supabase SQL Editor:');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy the entire contents of:');
    console.log('   database/migrations/020_document_versioning_fixed.sql');
    console.log('5. Paste and click "Run"');
  }
  
  // Create a convenience script for copying
  const copyScript = `
#!/bin/bash
# Copy migration to clipboard (macOS)
cat database/migrations/020_document_versioning_fixed.sql | pbcopy
echo "✅ Migration copied to clipboard!"
echo "Now paste it in Supabase SQL Editor"
`;
  
  fs.writeFileSync('copy-migration.sh', copyScript);
  fs.chmodSync('copy-migration.sh', '755');
  
  console.log('\n💡 Tip: Run ./copy-migration.sh to copy the migration to clipboard');
}

// Since we know DDL can't be run through the client, let's provide the SQL directly
console.log('📋 COPY THIS SQL AND RUN IN SUPABASE SQL EDITOR:\n');
console.log('```sql');
const migrationSQL = fs.readFileSync(
  path.join(__dirname, '..', 'database', 'migrations', '020_document_versioning_fixed.sql'), 
  'utf8'
);
console.log(migrationSQL);
console.log('```');

runMigrationSQL();