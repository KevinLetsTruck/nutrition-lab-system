# PDF Lab Report Processor - Production Deployment Checklist

## Pre-Deployment Steps

### 1. **Environment Variables**
Ensure these are set in your Vercel dashboard:
- [x] `ANTHROPIC_API_KEY` - Your Claude API key
- [x] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 2. **Database Migration**
Run the lab_reports table migration in your production Supabase:

```sql
-- Clean migration for lab_reports table
DROP TABLE IF EXISTS lab_reports CASCADE;

CREATE TABLE lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('nutriq', 'kbmo', 'dutch', 'fit_test', 'stool_test', 'blood_test', 'general')),
  processing_method TEXT NOT NULL CHECK (processing_method IN ('native', 'preprocessed', 'vision', 'ocr')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  patient_info JSONB DEFAULT '{}',
  test_results JSONB DEFAULT '[]',
  clinical_notes TEXT,
  metadata JSONB DEFAULT '{}',
  ai_analysis JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ
);

CREATE INDEX idx_lab_reports_user_id ON lab_reports(user_id);
CREATE INDEX idx_lab_reports_client_id ON lab_reports(client_id);
CREATE INDEX idx_lab_reports_report_type ON lab_reports(report_type);
CREATE INDEX idx_lab_reports_created_at ON lab_reports(created_at);

CREATE OR REPLACE FUNCTION update_lab_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lab_reports_timestamp
  BEFORE UPDATE ON lab_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_reports_updated_at();
```

### 3. **Verify Dependencies**
The package.json already includes all necessary dependencies:
- `pdf-lib` - PDF manipulation
- `pdfjs-dist` - PDF text extraction
- `sharp` - Image processing
- `@anthropic-ai/sdk` - Claude API

## Deployment Steps

### Option 1: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
npm run deploy
```

### Option 2: Manual Deployment
```bash
# 1. Commit and push your changes
git add .
git commit -m "feat: add PDF lab report processing system"
git push origin main

# 2. Vercel will automatically deploy from GitHub
```

## Post-Deployment Testing

### 1. **Test the PDF Processor**
Visit: `https://your-domain.vercel.app/test-pdf-processor`

### 2. **Test with Various PDFs**
- [ ] Native text PDF (e.g., digital lab report)
- [ ] Scanned PDF (e.g., scanned paper report)
- [ ] Mixed content PDF (text + images)
- [ ] Large PDF (>10 pages)

### 3. **Verify Features**
- [ ] File upload works
- [ ] Processing completes without errors
- [ ] Results are saved to database
- [ ] Authentication is required
- [ ] Error handling works properly

### 4. **Check Logs**
In Vercel dashboard, check Functions logs for any errors:
- `/api/lab-reports/upload`
- Authentication endpoints

## Production URLs

Once deployed, your PDF processor will be available at:
- Test Interface: `https://your-domain.vercel.app/test-pdf-processor`
- API Endpoint: `https://your-domain.vercel.app/api/lab-reports/upload`

## Monitoring

### Success Metrics
- Processing time: <10 seconds for most PDFs
- Success rate: >95%
- No memory/timeout errors

### Common Issues & Solutions

1. **Timeout Errors**
   - Vercel has a 10-second timeout for hobby plan
   - Upgrade to Pro for 60-second timeout
   - Or implement async processing with webhooks

2. **Memory Errors**
   - Large PDFs might exceed memory limits
   - Consider chunking or preprocessing

3. **Authentication Errors**
   - Ensure cookies work in production
   - Check CORS settings

## Security Checklist

- [x] Authentication required for all endpoints
- [x] File type validation (PDF only)
- [x] File size limits (32MB)
- [x] User can only access their own reports
- [x] No sensitive data in logs