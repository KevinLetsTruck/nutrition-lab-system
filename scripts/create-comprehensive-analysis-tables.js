require('dotenv').config({ path: '.env.local' });

console.log('🚀 Creating Comprehensive Analysis Tables via Supabase Dashboard...\n');

console.log('Please run these SQL commands in your Supabase SQL Editor:');
console.log('https://supabase.com/dashboard/project/[your-project-id]/sql/new\n');

const sql = `
-- Comprehensive Analysis System Tables
-- This creates support for AI-powered comprehensive client analysis

-- Main comprehensive analysis table
CREATE TABLE IF NOT EXISTS comprehensive_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  root_causes JSONB NOT NULL,
  systems_priority JSONB NOT NULL,
  progress_comparison JSONB,
  supplement_protocol JSONB NOT NULL,
  treatment_phases JSONB NOT NULL,
  urgent_concerns TEXT[],
  success_metrics JSONB,
  practitioner_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplement recommendations tracking
CREATE TABLE IF NOT EXISTS supplement_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES comprehensive_analyses(id) ON DELETE CASCADE,
  supplement_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  timing VARCHAR(100),
  source VARCHAR(50) CHECK (source IN ('LetsTrack', 'Biotics', 'Fullscript')),
  product_url TEXT,
  monthly_cost DECIMAL(10,2),
  phase INTEGER CHECK (phase IN (1, 2, 3)),
  rationale TEXT,
  truck_compatible BOOLEAN DEFAULT true,
  instructions TEXT,
  practitioner_code VARCHAR(100),
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress tracking over time
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tracking_date DATE NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2),
  metric_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis artifacts for different report types
CREATE TABLE IF NOT EXISTS analysis_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES comprehensive_analyses(id) ON DELETE CASCADE,
  artifact_type VARCHAR(50) NOT NULL CHECK (artifact_type IN ('practitioner_report', 'client_summary', 'protocol_document', 'progress_report')),
  content TEXT NOT NULL,
  file_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_comprehensive_analyses_client_id ON comprehensive_analyses(client_id);
CREATE INDEX IF NOT EXISTS idx_comprehensive_analyses_analysis_date ON comprehensive_analyses(analysis_date);
CREATE INDEX IF NOT EXISTS idx_comprehensive_analyses_created_at ON comprehensive_analyses(created_at);

CREATE INDEX IF NOT EXISTS idx_supplement_recommendations_analysis_id ON supplement_recommendations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_supplement_recommendations_phase ON supplement_recommendations(phase);
CREATE INDEX IF NOT EXISTS idx_supplement_recommendations_source ON supplement_recommendations(source);

CREATE INDEX IF NOT EXISTS idx_progress_tracking_client_id ON progress_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_date ON progress_tracking(tracking_date);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_type ON progress_tracking(metric_type);

CREATE INDEX IF NOT EXISTS idx_analysis_artifacts_analysis_id ON analysis_artifacts(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_artifacts_type ON analysis_artifacts(artifact_type);

-- Add RLS policies for security
ALTER TABLE comprehensive_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_artifacts ENABLE ROW LEVEL SECURITY;

-- Comprehensive analyses policies
CREATE POLICY "Users can view their own comprehensive analyses" ON comprehensive_analyses
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = comprehensive_analyses.client_id
  ));

CREATE POLICY "Users can insert their own comprehensive analyses" ON comprehensive_analyses
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = comprehensive_analyses.client_id
  ));

CREATE POLICY "Users can update their own comprehensive analyses" ON comprehensive_analyses
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = comprehensive_analyses.client_id
  ));

-- Supplement recommendations policies
CREATE POLICY "Users can view their own supplement recommendations" ON supplement_recommendations
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_clients uc
    JOIN comprehensive_analyses ca ON uc.client_id = ca.client_id
    WHERE ca.id = supplement_recommendations.analysis_id
  ));

CREATE POLICY "Users can insert their own supplement recommendations" ON supplement_recommendations
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_clients uc
    JOIN comprehensive_analyses ca ON uc.client_id = ca.client_id
    WHERE ca.id = supplement_recommendations.analysis_id
  ));

-- Progress tracking policies
CREATE POLICY "Users can view their own progress tracking" ON progress_tracking
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = progress_tracking.client_id
  ));

CREATE POLICY "Users can insert their own progress tracking" ON progress_tracking
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = progress_tracking.client_id
  ));

-- Analysis artifacts policies
CREATE POLICY "Users can view their own analysis artifacts" ON analysis_artifacts
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_clients uc
    JOIN comprehensive_analyses ca ON uc.client_id = ca.client_id
    WHERE ca.id = analysis_artifacts.analysis_id
  ));

CREATE POLICY "Users can insert their own analysis artifacts" ON analysis_artifacts
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_clients uc
    JOIN comprehensive_analyses ca ON uc.client_id = ca.client_id
    WHERE ca.id = analysis_artifacts.analysis_id
  ));

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_comprehensive_analyses_updated_at 
  BEFORE UPDATE ON comprehensive_analyses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for client analysis summary
CREATE VIEW client_analysis_summary AS
SELECT 
  c.id as client_id,
  c.first_name,
  c.last_name,
  c.email,
  COUNT(ca.id) as total_analyses,
  MAX(ca.analysis_date) as last_analysis_date,
  COUNT(sr.id) as total_supplement_recommendations,
  COUNT(pt.id) as total_progress_entries,
  ca_latest.root_causes as latest_root_causes,
  ca_latest.systems_priority as latest_systems_priority
FROM clients c
LEFT JOIN comprehensive_analyses ca ON c.id = ca.client_id
LEFT JOIN supplement_recommendations sr ON ca.id = sr.analysis_id
LEFT JOIN progress_tracking pt ON c.id = pt.client_id
LEFT JOIN LATERAL (
  SELECT * FROM comprehensive_analyses 
  WHERE client_id = c.id 
  ORDER BY analysis_date DESC 
  LIMIT 1
) ca_latest ON true
GROUP BY c.id, c.first_name, c.last_name, c.email, ca_latest.root_causes, ca_latest.systems_priority;

-- Create function to get client's latest analysis
CREATE OR REPLACE FUNCTION get_client_latest_analysis(client_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'analysis', json_build_object(
      'id', ca.id,
      'analysis_date', ca.analysis_date,
      'root_causes', ca.root_causes,
      'systems_priority', ca.systems_priority,
      'progress_comparison', ca.progress_comparison,
      'supplement_protocol', ca.supplement_protocol,
      'treatment_phases', ca.treatment_phases,
      'urgent_concerns', ca.urgent_concerns,
      'success_metrics', ca.success_metrics,
      'practitioner_notes', ca.practitioner_notes
    ),
    'supplements', COALESCE(
      (SELECT json_agg(json_build_object(
        'name', sr.supplement_name,
        'dosage', sr.dosage,
        'timing', sr.timing,
        'source', sr.source,
        'phase', sr.phase,
        'rationale', sr.rationale,
        'instructions', sr.instructions,
        'monthly_cost', sr.monthly_cost
      ) ORDER BY sr.phase, sr.supplement_name)
      FROM supplement_recommendations sr WHERE sr.analysis_id = ca.id),
      '[]'::json
    ),
    'artifacts', COALESCE(
      (SELECT json_agg(json_build_object(
        'type', aa.artifact_type,
        'content', aa.content,
        'file_name', aa.file_name
      ))
      FROM analysis_artifacts aa WHERE aa.analysis_id = ca.id),
      '[]'::json
    )
  ) INTO result
  FROM comprehensive_analyses ca
  WHERE ca.client_id = client_uuid
  ORDER BY ca.analysis_date DESC
  LIMIT 1;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to track progress metrics
CREATE OR REPLACE FUNCTION track_client_progress(
  client_uuid UUID,
  metric_type VARCHAR(100),
  metric_value DECIMAL(10,2),
  metric_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  tracking_id UUID;
BEGIN
  INSERT INTO progress_tracking (client_id, tracking_date, metric_type, metric_value, metric_notes)
  VALUES (client_uuid, CURRENT_DATE, metric_type, metric_value, metric_notes)
  RETURNING id INTO tracking_id;
  
  RETURN tracking_id;
END;
$$ LANGUAGE plpgsql;
`;

console.log(sql);
console.log('\n✅ Copy and paste the above SQL into your Supabase SQL Editor and run it.');
console.log('📝 This will create all the necessary tables for the Comprehensive Analysis system.');
console.log('🔗 Go to: https://supabase.com/dashboard/project/[your-project-id]/sql/new'); 