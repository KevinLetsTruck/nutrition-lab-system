-- Lab Analysis System Production Deployment Script
-- Run this entire script in Supabase SQL Editor

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
  lab_name VARCHAR(100),
  collection_date DATE,
  report_date DATE,
  file_url TEXT,
  file_type VARCHAR(20),
  processing_status VARCHAR(50) DEFAULT 'pending',
  processing_error TEXT,
  raw_text TEXT,
  structured_data JSONB,
  ai_analysis JSONB,
  detected_patterns JSONB[],
  confidence_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  test_catalog_id UUID REFERENCES lab_test_catalog(id),
  test_name VARCHAR(255),
  value DECIMAL(10,4),
  value_text VARCHAR(50),
  unit VARCHAR(50),
  reference_range VARCHAR(100),
  flag VARCHAR(10),
  is_optimal BOOLEAN,
  is_truck_driver_optimal BOOLEAN,
  interpretation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  pattern_name VARCHAR(100),
  pattern_category VARCHAR(50),
  confidence_score DECIMAL(3,2),
  supporting_markers JSONB[],
  clinical_significance TEXT,
  truck_driver_impact TEXT,
  priority_level VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  protocol_type VARCHAR(50),
  priority VARCHAR(20),
  title VARCHAR(255),
  description TEXT,
  specific_recommendations JSONB[],
  supplement_protocol JSONB,
  dietary_modifications JSONB,
  lifestyle_interventions JSONB,
  retest_schedule JSONB,
  truck_driver_adaptations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cgm_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  device_type VARCHAR(50),
  reading_datetime TIMESTAMPTZ,
  glucose_value INTEGER,
  trend_arrow VARCHAR(20),
  meal_tag VARCHAR(50),
  notes TEXT,
  screenshot_url TEXT,
  extracted_from_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  test_catalog_id UUID REFERENCES lab_test_catalog(id),
  previous_value DECIMAL(10,4),
  previous_date DATE,
  current_value DECIMAL(10,4),
  current_date DATE,
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
  pattern_category VARCHAR(50),
  description TEXT,
  required_markers TEXT[],
  optional_markers TEXT[],
  detection_rules JSONB,
  clinical_interpretation TEXT,
  functional_medicine_approach TEXT,
  truck_driver_considerations TEXT,
  intervention_priority VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_lab_results_client_id ON lab_results(client_id);
CREATE INDEX idx_lab_results_status ON lab_results(processing_status);
CREATE INDEX idx_lab_results_collection_date ON lab_results(collection_date);
CREATE INDEX idx_lab_values_result_id ON lab_values(lab_result_id);
CREATE INDEX idx_lab_values_test_id ON lab_values(test_catalog_id);
CREATE INDEX idx_lab_patterns_result_id ON lab_patterns(lab_result_id);
CREATE INDEX idx_lab_patterns_name ON lab_patterns(pattern_name);
CREATE INDEX idx_lab_protocols_client_id ON lab_protocols(client_id);
CREATE INDEX idx_cgm_data_client_id ON cgm_data(client_id);
CREATE INDEX idx_cgm_data_datetime ON cgm_data(reading_datetime);
CREATE INDEX idx_lab_comparisons_client_test ON lab_comparisons(client_id, test_catalog_id);

-- Create triggers
CREATE TRIGGER update_lab_test_catalog_updated_at
  BEFORE UPDATE ON lab_test_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lab_results_updated_at
  BEFORE UPDATE ON lab_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pattern_library_updated_at
  BEFORE UPDATE ON pattern_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert initial lab test catalog data
INSERT INTO lab_test_catalog (test_code, test_name, category, subcategory, unit, standard_range_low, standard_range_high, optimal_range_low, optimal_range_high, truck_driver_range_low, truck_driver_range_high, critical_low, critical_high, description, clinical_significance, truck_driver_considerations, related_patterns) VALUES
('GLUCOSE', 'Glucose, Fasting', 'metabolic', 'glucose', 'mg/dL', 65, 99, 75, 85, 70, 90, 50, 400, 'Fasting blood glucose level', 'Primary marker for glucose metabolism and diabetes risk', 'Critical for DOT certification; >126 requires medical evaluation', ARRAY['insulin_resistance', 'metabolic_syndrome', 'diabetes']),
('INSULIN', 'Insulin, Fasting', 'metabolic', 'glucose', 'μIU/mL', 2.6, 24.9, 2, 5, 2, 6, NULL, 50, 'Fasting insulin level', 'Early marker for insulin resistance', 'High levels indicate metabolic dysfunction affecting alertness and fatigue', ARRAY['insulin_resistance', 'metabolic_syndrome', 'pcos']),
('HBA1C', 'Hemoglobin A1c', 'metabolic', 'glucose', '%', 4.0, 5.6, 4.5, 5.3, 4.5, 5.5, NULL, 14, '3-month average blood glucose', 'Long-term glucose control marker', 'DOT requires <10%; optimal range prevents fatigue and cognitive issues', ARRAY['diabetes', 'metabolic_syndrome', 'cardiovascular_risk']),
('CHOL_TOTAL', 'Total Cholesterol', 'metabolic', 'lipids', 'mg/dL', 100, 199, 150, 180, 140, 190, NULL, 400, 'Total cholesterol level', 'Cardiovascular risk marker', 'Important for DOT cardiac risk assessment', ARRAY['dyslipidemia', 'cardiovascular_risk', 'metabolic_syndrome']),
('LDL', 'LDL Cholesterol', 'metabolic', 'lipids', 'mg/dL', 0, 99, 0, 80, 0, 90, NULL, 300, 'Low-density lipoprotein', 'Primary atherogenic particle', 'Key marker for cardiovascular health in sedentary occupation', ARRAY['dyslipidemia', 'cardiovascular_risk', 'inflammation']),
('HDL', 'HDL Cholesterol', 'metabolic', 'lipids', 'mg/dL', 40, 999, 60, 100, 50, 100, 20, NULL, 'High-density lipoprotein', 'Protective cholesterol', 'Often low in truckers due to poor diet and lack of exercise', ARRAY['dyslipidemia', 'metabolic_syndrome', 'inflammation']),
('TRIG', 'Triglycerides', 'metabolic', 'lipids', 'mg/dL', 0, 149, 0, 70, 0, 90, NULL, 1000, 'Triglyceride level', 'Marker for metabolic health and insulin resistance', 'Elevated by truck stop food and irregular meals', ARRAY['insulin_resistance', 'metabolic_syndrome', 'fatty_liver']),
('TSH', 'TSH', 'hormones', 'thyroid', 'mIU/L', 0.45, 4.5, 1.0, 2.0, 0.8, 2.5, 0.1, 20, 'Thyroid stimulating hormone', 'Primary thyroid function screen', 'Affects energy, weight, and alertness critical for driving', ARRAY['hypothyroid', 'hyperthyroid', 'autoimmune_thyroid']),
('FT4', 'Free T4', 'hormones', 'thyroid', 'ng/dL', 0.82, 1.77, 1.0, 1.5, 1.0, 1.6, 0.5, 3.0, 'Free thyroxine', 'Active thyroid hormone', 'Low levels cause fatigue and slow reaction time', ARRAY['hypothyroid', 'thyroid_conversion']),
('FT3', 'Free T3', 'hormones', 'thyroid', 'pg/mL', 2.0, 4.4, 3.0, 4.0, 2.8, 4.0, 1.0, 6.0, 'Free triiodothyronine', 'Most active thyroid hormone', 'Critical for metabolism and energy production', ARRAY['hypothyroid', 'thyroid_conversion', 'low_t3_syndrome']),
('CRP_HS', 'hs-CRP', 'inflammation', 'acute', 'mg/L', 0, 3.0, 0, 1.0, 0, 1.5, NULL, 10, 'High-sensitivity C-reactive protein', 'Cardiovascular and systemic inflammation', 'Elevated by poor diet, sedentary lifestyle, and sleep deprivation', ARRAY['inflammation', 'cardiovascular_risk', 'metabolic_syndrome']),
('VIT_D', 'Vitamin D, 25-OH', 'nutritional', 'vitamins', 'ng/mL', 30, 100, 50, 80, 40, 80, 10, 150, '25-hydroxyvitamin D', 'Vitamin D status', 'Often deficient due to limited sun exposure in cab', ARRAY['vitamin_d_deficiency', 'immune_dysfunction', 'mood_disorders']),
('VIT_B12', 'Vitamin B12', 'nutritional', 'vitamins', 'pg/mL', 232, 1245, 500, 900, 400, 950, 100, 2000, 'Cobalamin level', 'B12 status', 'Can be low with poor diet or gut issues', ARRAY['b12_deficiency', 'methylation_dysfunction', 'anemia']),
('FERRITIN', 'Ferritin', 'inflammation', 'iron', 'ng/mL', 30, 400, 50, 150, 40, 170, 10, 1000, 'Iron storage protein', 'Iron status and inflammation marker', 'Can be elevated with inflammation or hemochromatosis', ARRAY['iron_overload', 'inflammation', 'hemochromatosis']),
('TEST_TOTAL', 'Testosterone, Total', 'hormones', 'sex_male', 'ng/dL', 264, 916, 500, 800, 450, 800, 100, 1500, 'Total testosterone', 'Primary male hormone', 'Low levels common in truckers; affects energy, mood, libido', ARRAY['hypogonadism', 'metabolic_syndrome', 'andropause']);

-- Insert pattern library entries
INSERT INTO pattern_library (pattern_name, pattern_category, description, required_markers, optional_markers, detection_rules, clinical_interpretation, functional_medicine_approach, truck_driver_considerations, intervention_priority) VALUES
('insulin_resistance', 'metabolic', 'Insulin resistance pattern', 
 ARRAY['GLUCOSE', 'INSULIN'], 
 ARRAY['HBA1C', 'TRIG', 'HDL', 'ALT'], 
 '{"rules": [{"marker": "INSULIN", "operator": ">", "value": 5}, {"marker": "GLUCOSE", "operator": ">", "value": 90}, {"marker": "TRIG", "operator": ">", "value": 100}]}'::jsonb,
 'Early metabolic dysfunction preceding diabetes',
 'Address through diet, exercise, supplements like berberine and chromium',
 'Common in truckers due to sedentary job and poor food choices. Requires immediate intervention to prevent diabetes and maintain DOT certification.',
 'high'),
('thyroid_dysfunction', 'hormonal', 'Thyroid dysfunction pattern',
 ARRAY['TSH', 'FT4', 'FT3'],
 ARRAY['RT3', 'TPO_AB'],
 '{"rules": [{"marker": "TSH", "operator": ">", "value": 2.5}, {"marker": "FT3", "operator": "<", "value": 3.0}, {"marker": "FT4", "operator": "<", "value": 1.2}]}'::jsonb,
 'Suboptimal thyroid function affecting metabolism',
 'Support thyroid with selenium, iodine, and address underlying inflammation',
 'Causes fatigue and weight gain. May need thyroid support to maintain energy for safe driving.',
 'high');

-- Grant permissions (adjust based on your auth setup)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create storage bucket policy (run in Supabase Dashboard under Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('lab-documents', 'lab-documents', true);

-- Success message
SELECT 'Lab Analysis System deployed successfully!' as message;