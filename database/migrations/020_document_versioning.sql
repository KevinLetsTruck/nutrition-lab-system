-- Document versioning system for tracking changes over time
-- This migration adds comprehensive version tracking for all document types

-- Create documents table if not exists
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

-- Create document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  extracted_data JSONB NOT NULL,
  enhanced_data JSONB,
  ocr_confidence FLOAT,
  processing_method VARCHAR(50), -- 'textract', 'vision', 'standard', etc.
  changes_from_previous JSONB,
  analysis_results JSONB,
  medical_terms_identified JSONB,
  validation_status VARCHAR(50) DEFAULT 'pending',
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(document_id, version_number)
);

-- Create version comparisons table for tracking specific changes
CREATE TABLE IF NOT EXISTS version_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  from_version INTEGER NOT NULL,
  to_version INTEGER NOT NULL,
  field_changes JSONB NOT NULL, -- Detailed field-by-field changes
  added_values JSONB,
  removed_values JSONB,
  modified_values JSONB,
  change_summary TEXT,
  clinical_significance VARCHAR(20), -- 'critical', 'significant', 'minor', 'none'
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create audit log for document actions
CREATE TABLE IF NOT EXISTS document_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID REFERENCES document_versions(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'validated', 'compared'
  action_details JSONB,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Add indexes for performance
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_version ON document_versions(version_number);
CREATE INDEX idx_document_versions_validation ON document_versions(validation_status);
CREATE INDEX idx_version_comparisons_document ON version_comparisons(document_id);
CREATE INDEX idx_audit_log_document ON document_audit_log(document_id);
CREATE INDEX idx_audit_log_action ON document_audit_log(action);

-- Function to automatically increment version number
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

-- Trigger to auto-increment version
CREATE TRIGGER set_document_version
BEFORE INSERT ON document_versions
FOR EACH ROW
EXECUTE FUNCTION increment_document_version();

-- Function to track changes between versions
CREATE OR REPLACE FUNCTION track_version_changes()
RETURNS TRIGGER AS $$
DECLARE
  prev_version RECORD;
  changes JSONB;
  added JSONB;
  removed JSONB;
  modified JSONB;
  significance VARCHAR(20);
BEGIN
  -- Get previous version
  SELECT * INTO prev_version
  FROM document_versions
  WHERE document_id = NEW.document_id
    AND version_number = NEW.version_number - 1;
  
  IF FOUND THEN
    -- Calculate changes
    changes = jsonb_build_object(
      'previous_version', prev_version.version_number,
      'new_version', NEW.version_number,
      'previous_confidence', prev_version.ocr_confidence,
      'new_confidence', NEW.ocr_confidence
    );
    
    -- Store changes in the new version
    NEW.changes_from_previous = changes;
    
    -- Determine clinical significance based on confidence change
    IF ABS(COALESCE(NEW.ocr_confidence, 0) - COALESCE(prev_version.ocr_confidence, 0)) > 0.2 THEN
      significance = 'significant';
    ELSE
      significance = 'minor';
    END IF;
    
    -- Insert comparison record
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

-- Trigger to track changes
CREATE TRIGGER track_document_changes
AFTER INSERT ON document_versions
FOR EACH ROW
EXECUTE FUNCTION track_version_changes();

-- Function to update document updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE documents
  SET updated_at = NOW()
  WHERE id = NEW.document_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update document timestamp
CREATE TRIGGER update_document_on_version
AFTER INSERT ON document_versions
FOR EACH ROW
EXECUTE FUNCTION update_document_timestamp();

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_audit_log ENABLE ROW LEVEL SECURITY;

-- Documents: Users can only see documents for their clients
CREATE POLICY "Users can view documents for their clients"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = documents.client_id
        AND clients.user_id = auth.uid()
    )
  );

-- Document versions: Same as documents
CREATE POLICY "Users can view document versions for their clients"
  ON document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN clients c ON c.id = d.client_id
      WHERE d.id = document_versions.document_id
        AND c.user_id = auth.uid()
    )
  );

-- Version comparisons: Same as documents
CREATE POLICY "Users can view version comparisons for their clients"
  ON version_comparisons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN clients c ON c.id = d.client_id
      WHERE d.id = version_comparisons.document_id
        AND c.user_id = auth.uid()
    )
  );

-- Audit log: Read-only for users, their own actions only
CREATE POLICY "Users can view their own audit logs"
  ON document_audit_log FOR SELECT
  USING (performed_by = auth.uid());

-- Insert policies for authenticated users
CREATE POLICY "Users can create documents for their clients"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create document versions"
  ON document_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN clients c ON c.id = d.client_id
      WHERE d.id = document_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create audit logs"
  ON document_audit_log FOR INSERT
  WITH CHECK (performed_by = auth.uid());

-- Comments for documentation
COMMENT ON TABLE documents IS 'Master table for all documents uploaded to the system';
COMMENT ON TABLE document_versions IS 'Tracks all versions of documents with extracted and enhanced data';
COMMENT ON TABLE version_comparisons IS 'Detailed comparison between document versions';
COMMENT ON TABLE document_audit_log IS 'Complete audit trail of all document-related actions';

COMMENT ON COLUMN document_versions.ocr_confidence IS 'Confidence score from OCR processing (0-1)';
COMMENT ON COLUMN document_versions.processing_method IS 'Method used to process document: textract, vision, standard, etc.';
COMMENT ON COLUMN document_versions.medical_terms_identified IS 'JSON array of medical terms found and validated';
COMMENT ON COLUMN version_comparisons.clinical_significance IS 'Assessment of clinical importance of changes';