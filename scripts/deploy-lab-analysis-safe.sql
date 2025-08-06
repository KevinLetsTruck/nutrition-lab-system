-- Lab Analysis System Production Deployment Script (Safe Version)
-- This version checks if dependent tables exist first

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(255),
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Now run the rest of the lab analysis migration
-- Drop tables if they exist (for clean deployment)
DROP TABLE IF EXISTS lab_comparisons CASCADE;
DROP TABLE IF EXISTS cgm_data CASCADE;
DROP TABLE IF EXISTS lab_protocols CASCADE;
DROP TABLE IF EXISTS lab_patterns CASCADE;
DROP TABLE IF EXISTS lab_values CASCADE;
DROP TABLE IF EXISTS lab_results CASCADE;
DROP TABLE IF EXISTS pattern_library CASCADE;
DROP TABLE IF EXISTS lab_test_catalog CASCADE;

-- Create all tables
CREATE TABLE IF NOT EXISTS lab_test_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_code VARCHAR(50) UNIQUE NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  unit VARCHAR(50),
  standard_range_low DECIMAL(10,4),
  standard_range_high DECIMAL(10,4),
  optimal_range_low DECIMAL(10,4),
  optimal_range_high DECIMAL(10,4),
  truck_driver_range_low DECIMAL(10,4),
  truck_driver_range_high DECIMAL(10,4),
  critical_low DECIMAL(10,4),
  critical_high DECIMAL(10,4),
  description TEXT,
  clinical_significance TEXT,
  truck_driver_considerations TEXT,
  related_patterns TEXT[],
  interpretation_notes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  collection_date DATE NOT NULL,
  report_date DATE,
  lab_name VARCHAR(255),
  provider_name VARCHAR(255),
  raw_data JSONB,
  structured_data JSONB,
  file_path TEXT,
  processing_status VARCHAR(50) DEFAULT 'pending',
  processing_error TEXT,
  ai_analysis JSONB,
  detected_patterns TEXT[],
  overall_health_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  test_catalog_id UUID REFERENCES lab_test_catalog(id),
  test_name VARCHAR(255) NOT NULL,
  value DECIMAL(10,4),
  value_text VARCHAR(255),
  unit VARCHAR(50),
  reference_range VARCHAR(100),
  flag VARCHAR(20),
  is_optimal BOOLEAN DEFAULT FALSE,
  is_truck_driver_optimal BOOLEAN DEFAULT FALSE,
  interpretation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  pattern_name VARCHAR(255) NOT NULL,
  pattern_category VARCHAR(100),
  confidence_score DECIMAL(3,2),
  supporting_markers JSONB,
  clinical_significance TEXT,
  truck_driver_impact TEXT,
  priority_level VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  protocol_type VARCHAR(50) NOT NULL,
  priority_level VARCHAR(20),
  recommendations JSONB,
  supplements JSONB,
  lifestyle_changes JSONB,
  follow_up_tests JSONB,
  monitoring_plan JSONB,
  expected_outcomes JSONB,
  truck_driver_specific JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cgm_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  glucose_value INTEGER NOT NULL,
  trend VARCHAR(20),
  event_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  test_catalog_id UUID REFERENCES lab_test_catalog(id),
  previous_value DECIMAL(10,4),
  previous_date DATE,
  current_value DECIMAL(10,4),
  comparison_date DATE,
  change_amount DECIMAL(10,4),
  change_percentage DECIMAL(5,2),
  trend VARCHAR(20),
  rate_of_change DECIMAL(10,4),
  clinical_significance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pattern_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name VARCHAR(100) UNIQUE NOT NULL,
  pattern_category VARCHAR(50) NOT NULL,
  description TEXT,
  key_markers TEXT[],
  clinical_significance TEXT,
  truck_driver_relevance TEXT,
  intervention_strategies JSONB,
  supporting_research JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_lab_results_client ON lab_results(client_id);
CREATE INDEX idx_lab_results_date ON lab_results(collection_date);
CREATE INDEX idx_lab_results_type ON lab_results(report_type);
CREATE INDEX idx_lab_values_result ON lab_values(lab_result_id);
CREATE INDEX idx_lab_values_catalog ON lab_values(test_catalog_id);
CREATE INDEX idx_lab_patterns_result ON lab_patterns(lab_result_id);
CREATE INDEX idx_lab_protocols_client ON lab_protocols(client_id);
CREATE INDEX idx_cgm_data_result ON cgm_data(lab_result_id);
CREATE INDEX idx_cgm_data_timestamp ON cgm_data(timestamp);
CREATE INDEX idx_lab_comparisons_client ON lab_comparisons(client_id);
CREATE INDEX idx_pattern_library_category ON pattern_library(pattern_category);

-- Create update triggers
CREATE TRIGGER update_lab_test_catalog_updated_at
  BEFORE UPDATE ON lab_test_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lab_results_updated_at
  BEFORE UPDATE ON lab_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lab_protocols_updated_at
  BEFORE UPDATE ON lab_protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pattern_library_updated_at
  BEFORE UPDATE ON pattern_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create views for easier querying
CREATE OR REPLACE VIEW lab_results_summary AS
SELECT 
  lr.id,
  lr.client_id,
  lr.report_type,
  lr.collection_date,
  lr.lab_name,
  lr.overall_health_score,
  lr.processing_status,
  c.first_name || ' ' || c.last_name as client_name,
  c.email as client_email,
  COUNT(DISTINCT lv.id) as total_tests,
  COUNT(DISTINCT lp.id) as detected_patterns
FROM lab_results lr
JOIN clients c ON lr.client_id = c.id
LEFT JOIN lab_values lv ON lr.id = lv.lab_result_id
LEFT JOIN lab_patterns lp ON lr.id = lp.lab_result_id
GROUP BY lr.id, c.id;

-- Success message
SELECT 'Lab Analysis System deployed successfully!' as message;