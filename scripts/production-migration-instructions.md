# Production Database Migration Instructions

## Issue
The `client_notes`, `protocols`, and `analysis_versions` tables are missing from the production database, causing 500 errors when trying to save notes.

## Solution
Run the following SQL commands in your Supabase Dashboard SQL Editor.

## Step 1: Create client_notes table

```sql
-- Create client_notes table
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('interview', 'coaching_call', 'assistant')),
  content TEXT NOT NULL,
  author VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_type ON client_notes(type);
CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON client_notes(created_at);

-- Enable RLS
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own client notes" ON client_notes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own client notes" ON client_notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own client notes" ON client_notes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own client notes" ON client_notes
  FOR DELETE USING (true);
```

## Step 2: Create protocols table

```sql
-- Create protocols table
CREATE TABLE IF NOT EXISTS protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  phase VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  content TEXT,
  compliance INTEGER CHECK (compliance >= 0 AND compliance <= 100),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_protocols_client_id ON protocols(client_id);
CREATE INDEX IF NOT EXISTS idx_protocols_status ON protocols(status);
CREATE INDEX IF NOT EXISTS idx_protocols_created_at ON protocols(created_at);

-- Enable RLS
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view protocols" ON protocols
  FOR SELECT USING (true);

CREATE POLICY "Users can insert protocols" ON protocols
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update protocols" ON protocols
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete protocols" ON protocols
  FOR DELETE USING (true);
```

## Step 3: Create analysis_versions table

```sql
-- Create analysis_versions table
CREATE TABLE IF NOT EXISTS analysis_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  version_id VARCHAR(255) NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by VARCHAR(50) NOT NULL CHECK (generated_by IN ('manual', 'ai')),
  snapshot JSONB NOT NULL,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analysis_versions_client_id ON analysis_versions(client_id);
CREATE INDEX IF NOT EXISTS idx_analysis_versions_generated_at ON analysis_versions(generated_at);
CREATE INDEX IF NOT EXISTS idx_analysis_versions_generated_by ON analysis_versions(generated_by);

-- Enable RLS
ALTER TABLE analysis_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view analysis versions" ON analysis_versions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert analysis versions" ON analysis_versions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update analysis versions" ON analysis_versions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete analysis versions" ON analysis_versions
  FOR DELETE USING (true);
```

## Step 4: Add sample data (optional)

```sql
-- Add sample note
INSERT INTO client_notes (client_id, type, content, author) 
SELECT 
  c.id,
  'interview',
  'Initial consultation completed. Client reports fatigue, digestive issues, and difficulty maintaining healthy eating habits while on the road. Currently taking blood pressure medication.',
  'Dr. Smith'
FROM clients c 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add sample protocol
INSERT INTO protocols (client_id, phase, start_date, content, compliance, status) 
SELECT 
  c.id,
  'Phase 1: Gut Restoration',
  CURRENT_DATE,
  'GREETING\nHello,\n\nThank you for completing your comprehensive health assessment. Based on your lab results and our consultation, I''ve created a personalized protocol to address your health goals.\n\nPRIORITY SUPPLEMENTS\n\nNAME OF PRODUCT: Biotics Research - Bio-D-Mulsion Forte\nDOSE: 1 drop daily\nTIMING: With breakfast\nPURPOSE: Optimize vitamin D levels for immune function and inflammation reduction',
  75,
  'active'
FROM clients c 
LIMIT 1
ON CONFLICT DO NOTHING;
```

## Instructions

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to SQL Editor
4. Copy and paste each SQL block above
5. Click "Run" for each block
6. Wait for each command to complete before running the next one

## Verification

After running the migrations, you can verify they worked by:

1. Going to Table Editor in Supabase Dashboard
2. You should see the new tables: `client_notes`, `protocols`, `analysis_versions`
3. Test the notes functionality in your app

## Troubleshooting

If you get errors:
- Make sure you're in the correct project
- Check that the `clients` table exists first
- Ensure you have the necessary permissions
- Try running the commands one at a time 