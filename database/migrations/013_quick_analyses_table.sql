-- Quick Analyses Table
-- This table stores results from standalone document analysis

CREATE TABLE IF NOT EXISTS quick_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  analysis_results JSONB,
  extraction_method VARCHAR(50),
  processing_time INTEGER,
  confidence DECIMAL(3,2),
  client_id UUID REFERENCES clients(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quick_analyses_file_name ON quick_analyses(file_name);
CREATE INDEX IF NOT EXISTS idx_quick_analyses_report_type ON quick_analyses(report_type);
CREATE INDEX IF NOT EXISTS idx_quick_analyses_client_id ON quick_analyses(client_id);
CREATE INDEX IF NOT EXISTS idx_quick_analyses_created_at ON quick_analyses(created_at);

-- Add RLS policies
ALTER TABLE quick_analyses ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own analyses
CREATE POLICY "Users can view their own quick analyses" ON quick_analyses
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Policy for users to insert their own analyses
CREATE POLICY "Users can insert their own quick analyses" ON quick_analyses
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Policy for users to update their own analyses
CREATE POLICY "Users can update their own quick analyses" ON quick_analyses
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Policy for users to delete their own analyses
CREATE POLICY "Users can delete their own quick analyses" ON quick_analyses
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_quick_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quick_analyses_updated_at
  BEFORE UPDATE ON quick_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_quick_analyses_updated_at();

-- Add comments
COMMENT ON TABLE quick_analyses IS 'Stores results from standalone document analysis';
COMMENT ON COLUMN quick_analyses.file_name IS 'Original filename of the uploaded document';
COMMENT ON COLUMN quick_analyses.file_path IS 'Storage path of the uploaded document';
COMMENT ON COLUMN quick_analyses.report_type IS 'Type of report detected (nutriq, fit_test, etc.)';
COMMENT ON COLUMN quick_analyses.analysis_results IS 'JSON containing the full analysis results';
COMMENT ON COLUMN quick_analyses.extraction_method IS 'Method used for text extraction (textract, standard, etc.)';
COMMENT ON COLUMN quick_analyses.processing_time IS 'Time taken to process the document in milliseconds';
COMMENT ON COLUMN quick_analyses.confidence IS 'Confidence score of the analysis (0-1)';
COMMENT ON COLUMN quick_analyses.client_id IS 'Optional link to a specific client'; 