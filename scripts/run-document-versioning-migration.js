require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fixed migration without user_id dependencies
const migrationStatements = [
  // Create documents table
  `CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500),
    bucket_name VARCHAR(100),
    mime_type VARCHAR(100),
    file_size_bytes INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
  )`,

  // Create document versions table
  `CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    extracted_data JSONB NOT NULL,
    enhanced_data JSONB,
    ocr_confidence FLOAT,
    processing_method VARCHAR(50),
    changes_from_previous JSONB,
    analysis_results JSONB,
    medical_terms_identified JSONB,
    validation_status VARCHAR(50) DEFAULT 'pending',
    validated_by UUID,
    validated_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    UNIQUE(document_id, version_number)
  )`,

  // Create version comparisons table
  `CREATE TABLE IF NOT EXISTS version_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    from_version INTEGER NOT NULL,
    to_version INTEGER NOT NULL,
    field_changes JSONB NOT NULL,
    added_values JSONB,
    removed_values JSONB,
    modified_values JSONB,
    change_summary TEXT,
    clinical_significance VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID
  )`,

  // Create audit log table
  `CREATE TABLE IF NOT EXISTS document_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_id UUID REFERENCES document_versions(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    action_details JSONB,
    performed_by UUID,
    performed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
  )`,

  // Add indexes
  `CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id)`,
  `CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type)`,
  `CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id)`,
  `CREATE INDEX IF NOT EXISTS idx_document_versions_version ON document_versions(version_number)`,
  `CREATE INDEX IF NOT EXISTS idx_document_versions_validation ON document_versions(validation_status)`,
  `CREATE INDEX IF NOT EXISTS idx_version_comparisons_document ON version_comparisons(document_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_log_document ON document_audit_log(document_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_log_action ON document_audit_log(action)`,

  // Function to increment version number
  `CREATE OR REPLACE FUNCTION increment_document_version()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.version_number IS NULL THEN
      SELECT COALESCE(MAX(version_number), 0) + 1
      INTO NEW.version_number
      FROM document_versions
      WHERE document_id = NEW.document_id;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql`,

  // Trigger for version increment
  `DROP TRIGGER IF EXISTS set_document_version ON document_versions`,
  `CREATE TRIGGER set_document_version
  BEFORE INSERT ON document_versions
  FOR EACH ROW
  EXECUTE FUNCTION increment_document_version()`,

  // Function to track changes
  `CREATE OR REPLACE FUNCTION track_version_changes()
  RETURNS TRIGGER AS $$
  DECLARE
    prev_version RECORD;
    changes JSONB;
    significance VARCHAR(20);
  BEGIN
    SELECT * INTO prev_version
    FROM document_versions
    WHERE document_id = NEW.document_id
      AND version_number = NEW.version_number - 1;
    
    IF FOUND THEN
      changes = jsonb_build_object(
        'previous_version', prev_version.version_number,
        'new_version', NEW.version_number,
        'previous_confidence', prev_version.ocr_confidence,
        'new_confidence', NEW.ocr_confidence
      );
      
      NEW.changes_from_previous = changes;
      
      IF ABS(COALESCE(NEW.ocr_confidence, 0) - COALESCE(prev_version.ocr_confidence, 0)) > 0.2 THEN
        significance = 'significant';
      ELSE
        significance = 'minor';
      END IF;
      
      INSERT INTO version_comparisons (
        document_id,
        from_version,
        to_version,
        field_changes,
        clinical_significance,
        created_by
      ) VALUES (
        NEW.document_id,
        prev_version.version_number,
        NEW.version_number,
        changes,
        significance,
        NEW.created_by
      );
    END IF;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql`,

  // Trigger to track changes
  `DROP TRIGGER IF EXISTS track_document_changes ON document_versions`,
  `CREATE TRIGGER track_document_changes
  AFTER INSERT ON document_versions
  FOR EACH ROW
  EXECUTE FUNCTION track_version_changes()`,

  // Function to update document timestamp
  `CREATE OR REPLACE FUNCTION update_document_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    UPDATE documents
    SET updated_at = NOW()
    WHERE id = NEW.document_id;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql`,

  // Trigger to update timestamp
  `DROP TRIGGER IF EXISTS update_document_on_version ON document_versions`,
  `CREATE TRIGGER update_document_on_version
  AFTER INSERT ON document_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_document_timestamp()`,

  // Add comments
  `COMMENT ON TABLE documents IS 'Master table for all documents uploaded to the system'`,
  `COMMENT ON TABLE document_versions IS 'Tracks all versions of documents with extracted and enhanced data'`,
  `COMMENT ON TABLE version_comparisons IS 'Detailed comparison between document versions'`,
  `COMMENT ON TABLE document_audit_log IS 'Complete audit trail of all document-related actions'`,
  `COMMENT ON COLUMN document_versions.ocr_confidence IS 'Confidence score from OCR processing (0-1)'`,
  `COMMENT ON COLUMN document_versions.processing_method IS 'Method used to process document: textract, vision, standard, etc.'`,
  `COMMENT ON COLUMN version_comparisons.clinical_significance IS 'Assessment of clinical importance of changes'`
];

async function runMigration() {
  console.log('🚀 Running document versioning migration...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < migrationStatements.length; i++) {
    const statement = migrationStatements[i];
    const preview = statement.substring(0, 50).replace(/\n/g, ' ');
    
    console.log(`[${i + 1}/${migrationStatements.length}] ${preview}...`);
    
    try {
      // Use the query() method which works better for DDL statements
      const { error } = await supabase.rpc('exec_sql', {
        query: statement
      }).catch(async (rpcError) => {
        // If RPC doesn't work, try direct approach
        if (statement.includes('CREATE TABLE')) {
          // For table creation, we can check if it exists
          const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
          if (tableName) {
            const { error } = await supabase.from(tableName).select('*').limit(0);
            if (error?.code === '42P01') {
              throw new Error(`Table ${tableName} needs to be created manually`);
            }
            return { error: null };
          }
        }
        throw rpcError;
      });
      
      if (error) {
        throw error;
      }
      
      console.log('  ✅ Success');
      successCount++;
    } catch (error) {
      console.log('  ❌ Error:', error.message);
      errorCount++;
      
      // For critical tables, stop execution
      if (statement.includes('CREATE TABLE') && !statement.includes('IF NOT EXISTS')) {
        console.log('\n❌ Critical error creating table. Stopping migration.');
        break;
      }
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📝 Total: ${migrationStatements.length}`);
  
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

async function createManualMigrationFile() {
  console.log('\n📝 Creating manual migration file...');
  
  const fs = require('fs');
  const manualMigration = migrationStatements.join(';\n\n') + ';';
  
  fs.writeFileSync('database/migrations/020_document_versioning_fixed.sql', 
`-- Fixed Document Versioning Migration
-- This version removes user_id dependencies from RLS policies
-- Run this in Supabase SQL Editor

${manualMigration}

-- Note: RLS policies have been removed from this migration
-- You can add them later based on your authentication model`);
  
  console.log('✅ Created: database/migrations/020_document_versioning_fixed.sql');
  console.log('   You can run this file manually in Supabase SQL Editor');
}

// Main execution
async function main() {
  console.log('Document Versioning Migration Tool');
  console.log('==================================\n');
  
  // Check if we can connect
  const { data, error } = await supabase.from('clients').select('count').limit(0);
  
  if (error) {
    console.log('❌ Cannot connect to database:', error.message);
    return;
  }
  
  console.log('✅ Connected to database\n');
  
  // Try to run migration
  await runMigration();
  
  // Create manual migration file
  await createManualMigrationFile();
  
  console.log('\n✅ Migration process complete!');
  console.log('\nIf any statements failed, you can run the manual migration:');
  console.log('1. Go to Supabase SQL Editor');
  console.log('2. Run: database/migrations/020_document_versioning_fixed.sql');
}

main().catch(console.error);