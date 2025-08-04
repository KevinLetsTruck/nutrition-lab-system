require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('📦 Creating Document Versioning Tables\n');
console.log('This script will create the necessary tables for document versioning.');
console.log('Since we cannot run DDL directly through Supabase JS client,');
console.log('you need to run the SQL manually.\n');

// Read the migration file
const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '020_document_versioning_fixed.sql');

if (fs.existsSync(migrationPath)) {
  console.log('✅ Found migration file:', migrationPath);
  console.log('\nPlease follow these steps:\n');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Create a new query');
  console.log('4. Copy and paste the contents of:');
  console.log('   database/migrations/020_document_versioning_fixed.sql');
  console.log('5. Click "Run"\n');
  
  console.log('The migration will create these tables:');
  console.log('- documents');
  console.log('- document_versions');
  console.log('- version_comparisons');
  console.log('- document_audit_log\n');
  
  console.log('Along with necessary indexes, functions, and triggers.\n');
  
  // Show a preview of the migration
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  const preview = migrationContent.substring(0, 500);
  console.log('Preview of migration:\n');
  console.log('```sql');
  console.log(preview + '...');
  console.log('```\n');
  
} else {
  console.log('❌ Migration file not found!');
  console.log('Creating it now...');
  
  // Create the migration file with the fixed SQL
  const migrationSQL = `-- Fixed Document Versioning Migration
-- This version removes user_id dependencies from RLS policies
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS documents (
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
);

CREATE TABLE IF NOT EXISTS document_versions (
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
);

CREATE TABLE IF NOT EXISTS version_comparisons (
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
);

CREATE TABLE IF NOT EXISTS document_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID REFERENCES document_versions(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  action_details JSONB,
  performed_by UUID,
  performed_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_version_comparisons_document ON version_comparisons(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_document ON document_audit_log(document_id);

-- Function to auto-increment version number
CREATE OR REPLACE FUNCTION increment_document_version()
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
$$ LANGUAGE plpgsql;

-- Trigger for version increment
DROP TRIGGER IF EXISTS set_document_version ON document_versions;
CREATE TRIGGER set_document_version
BEFORE INSERT ON document_versions
FOR EACH ROW
EXECUTE FUNCTION increment_document_version();`;
  
  fs.writeFileSync(migrationPath, migrationSQL);
  console.log('✅ Created migration file:', migrationPath);
}

console.log('After running the migration, you can verify with:');
console.log('node scripts/test-document-versioning-direct.js');