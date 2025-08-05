-- Create lab_reports table for storing processed lab report data
CREATE TABLE IF NOT EXISTS lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  analyzed_at TIMESTAMPTZ,
  
  -- Indexes for performance
  INDEX idx_lab_reports_user_id (user_id),
  INDEX idx_lab_reports_client_id (client_id),
  INDEX idx_lab_reports_report_type (report_type),
  INDEX idx_lab_reports_created_at (created_at)
);

-- Create storage bucket for lab report PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lab-reports',
  'lab-reports',
  false,
  33554432, -- 32MB
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for lab_reports table
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;

-- Users can only see their own lab reports
CREATE POLICY "Users can view own lab reports" ON lab_reports
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own lab reports
CREATE POLICY "Users can create own lab reports" ON lab_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own lab reports
CREATE POLICY "Users can update own lab reports" ON lab_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own lab reports
CREATE POLICY "Users can delete own lab reports" ON lab_reports
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for storage bucket
CREATE POLICY "Users can upload own lab report files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lab-reports' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can view own lab report files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lab-reports' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can delete own lab report files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'lab-reports' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lab_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_lab_reports_timestamp
  BEFORE UPDATE ON lab_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_reports_updated_at();