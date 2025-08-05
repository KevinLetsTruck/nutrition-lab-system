# Lab Reports Table Migration Guide

## Manual Migration Steps

Since `exec_sql` has been removed from your system for security, you need to run this migration manually in your Supabase SQL editor.

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor (usually in the left sidebar)

### Step 2: Run the Migration
Copy and paste this SQL script into the SQL editor and click "Run":

```sql
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
```

### Step 3: Verify the Migration
After running the migration, you can verify it worked by running:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'lab_reports';

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lab_reports'
ORDER BY ordinal_position;
```

### Step 4: (Optional) Set Up Storage Bucket
If you're using Supabase Storage, also run this in the SQL editor:

```sql
-- Create storage bucket for lab report PDFs (if using Supabase Storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lab-reports',
  'lab-reports',
  false,
  33554432, -- 32MB
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;
```

## Testing the System

After running the migration:

1. Navigate to `/test-pdf-processor` in your app
2. Try uploading a PDF lab report
3. Check if it processes successfully

## Troubleshooting

If you get errors:

1. **"relation 'users' does not exist"** - Make sure you've run all previous migrations
2. **"relation 'clients' does not exist"** - The clients table must be created first
3. **Permission errors** - Make sure you're using the service role key

## Alternative: Using Supabase CLI

If you have Supabase CLI installed locally:

```bash
# Save the SQL to a file
cat > supabase/migrations/018_lab_reports.sql << 'EOF'
-- Paste the SQL content here
EOF

# Push the migration
supabase db push
```