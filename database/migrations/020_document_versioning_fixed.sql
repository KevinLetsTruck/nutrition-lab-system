-- Fixed Document Versioning Migration
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

CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);

CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);

CREATE INDEX IF NOT EXISTS idx_document_versions_version ON document_versions(version_number);

CREATE INDEX IF NOT EXISTS idx_document_versions_validation ON document_versions(validation_status);

CREATE INDEX IF NOT EXISTS idx_version_comparisons_document ON version_comparisons(document_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_document ON document_audit_log(document_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_action ON document_audit_log(action);

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

DROP TRIGGER IF EXISTS set_document_version ON document_versions;

CREATE TRIGGER set_document_version
  BEFORE INSERT ON document_versions
  FOR EACH ROW
  EXECUTE FUNCTION increment_document_version();

CREATE OR REPLACE FUNCTION track_version_changes()
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
  $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_document_changes ON document_versions;

CREATE TRIGGER track_document_changes
  AFTER INSERT ON document_versions
  FOR EACH ROW
  EXECUTE FUNCTION track_version_changes();

CREATE OR REPLACE FUNCTION update_document_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    UPDATE documents
    SET updated_at = NOW()
    WHERE id = NEW.document_id;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_document_on_version ON document_versions;

CREATE TRIGGER update_document_on_version
  AFTER INSERT ON document_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_document_timestamp();

COMMENT ON TABLE documents IS 'Master table for all documents uploaded to the system';

COMMENT ON TABLE document_versions IS 'Tracks all versions of documents with extracted and enhanced data';

COMMENT ON TABLE version_comparisons IS 'Detailed comparison between document versions';

COMMENT ON TABLE document_audit_log IS 'Complete audit trail of all document-related actions';

COMMENT ON COLUMN document_versions.ocr_confidence IS 'Confidence score from OCR processing (0-1)';

COMMENT ON COLUMN document_versions.processing_method IS 'Method used to process document: textract, vision, standard, etc.';

COMMENT ON COLUMN version_comparisons.clinical_significance IS 'Assessment of clinical importance of changes';

-- Note: RLS policies have been removed from this migration
-- You can add them later based on your authentication model