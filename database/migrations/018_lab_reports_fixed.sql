-- Create lab_reports table for storing processed lab report data
CREATE TABLE IF NOT EXISTS lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- File information
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT,
  
  -- Report details
  report_type TEXT NOT NULL CHECK (report_type IN ('nutriq', 'kbmo', 'dutch', 'fit_test', 'stool_test', 'blood_test', 'general')),
  processing_method TEXT NOT NULL CHECK (processing_method IN ('native', 'preprocessed', 'vision', 'ocr')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Extracted data
  patient_info JSONB DEFAULT '{}',
  test_results JSONB DEFAULT '[]',
  clinical_notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Analysis results (if any)
  ai_analysis JSONB,
  recommendations JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lab_reports_user_id ON lab_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_client_id ON lab_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_report_type ON lab_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_lab_reports_created_at ON lab_reports(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lab_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_lab_reports_timestamp ON lab_reports;
CREATE TRIGGER update_lab_reports_timestamp
  BEFORE UPDATE ON lab_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_reports_updated_at();