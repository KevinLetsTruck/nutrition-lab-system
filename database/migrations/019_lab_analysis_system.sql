-- Lab Analysis System Schema
-- Comprehensive functional medicine lab tracking and analysis

-- Lab Test Catalog - Master list of all lab tests with ranges
CREATE TABLE IF NOT EXISTS lab_test_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_code VARCHAR(50) UNIQUE NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'metabolic', 'hormones', 'inflammation', 'nutritional', 'functional'
  subcategory VARCHAR(100),
  unit VARCHAR(50),
  standard_range_low DECIMAL(10,4),
  standard_range_high DECIMAL(10,4),
  optimal_range_low DECIMAL(10,4), -- Kresser/IFM optimal ranges
  optimal_range_high DECIMAL(10,4),
  truck_driver_range_low DECIMAL(10,4), -- Truck driver specific ranges
  truck_driver_range_high DECIMAL(10,4),
  critical_low DECIMAL(10,4),
  critical_high DECIMAL(10,4),
  description TEXT,
  clinical_significance TEXT,
  truck_driver_considerations TEXT,
  related_patterns TEXT[], -- Pattern names this marker contributes to
  interpretation_notes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Results - Uploaded lab documents
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  lab_name VARCHAR(100), -- 'LabCorp', 'Quest', 'Boston Heart', etc.
  collection_date DATE,
  report_date DATE,
  file_url TEXT,
  file_type VARCHAR(20), -- 'pdf', 'image'
  processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processing_error TEXT,
  raw_text TEXT, -- OCR extracted text
  structured_data JSONB, -- Parsed structured data
  ai_analysis JSONB, -- Claude's analysis
  detected_patterns JSONB[], -- Array of detected patterns
  confidence_scores JSONB, -- Confidence in extraction/analysis
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Values - Individual test results
CREATE TABLE IF NOT EXISTS lab_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  test_catalog_id UUID REFERENCES lab_test_catalog(id),
  test_name VARCHAR(255), -- Actual name from report (may differ from catalog)
  value DECIMAL(10,4),
  value_text VARCHAR(50), -- For non-numeric results
  unit VARCHAR(50),
  reference_range VARCHAR(100), -- As shown on report
  flag VARCHAR(10), -- 'H', 'L', 'HH', 'LL', etc.
  is_optimal BOOLEAN, -- Based on functional ranges
  is_truck_driver_optimal BOOLEAN,
  interpretation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Patterns - Detected functional medicine patterns
CREATE TABLE IF NOT EXISTS lab_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  pattern_name VARCHAR(100), -- 'insulin_resistance', 'thyroid_dysfunction', etc.
  pattern_category VARCHAR(50), -- 'metabolic', 'hormonal', 'inflammatory'
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  supporting_markers JSONB[], -- Array of markers and values supporting this pattern
  clinical_significance TEXT,
  truck_driver_impact TEXT,
  priority_level VARCHAR(20), -- 'immediate', 'high', 'moderate', 'low'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Protocols - AI-generated intervention recommendations
CREATE TABLE IF NOT EXISTS lab_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  protocol_type VARCHAR(50), -- 'supplement', 'dietary', 'lifestyle', 'retest'
  priority VARCHAR(20), -- 'immediate', 'short_term', 'long_term'
  title VARCHAR(255),
  description TEXT,
  specific_recommendations JSONB[], -- Detailed recommendations
  supplement_protocol JSONB, -- Structured supplement recommendations
  dietary_modifications JSONB,
  lifestyle_interventions JSONB,
  retest_schedule JSONB,
  truck_driver_adaptations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CGM Data - Continuous Glucose Monitor readings
CREATE TABLE IF NOT EXISTS cgm_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  device_type VARCHAR(50), -- 'dexcom_g6', 'freestyle_libre', etc.
  reading_datetime TIMESTAMPTZ,
  glucose_value INTEGER, -- mg/dL
  trend_arrow VARCHAR(20), -- 'rising_rapidly', 'rising', 'stable', etc.
  meal_tag VARCHAR(50),
  notes TEXT,
  screenshot_url TEXT,
  extracted_from_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Comparisons - For tracking changes over time
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
  trend VARCHAR(20), -- 'improving', 'worsening', 'stable'
  rate_of_change DECIMAL(10,4), -- Per month
  clinical_significance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pattern Library - Reference patterns for detection
CREATE TABLE IF NOT EXISTS pattern_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name VARCHAR(100) UNIQUE NOT NULL,
  pattern_category VARCHAR(50),
  description TEXT,
  required_markers TEXT[], -- Markers that must be present
  optional_markers TEXT[], -- Additional supporting markers
  detection_rules JSONB, -- Complex rules for pattern detection
  clinical_interpretation TEXT,
  functional_medicine_approach TEXT,
  truck_driver_considerations TEXT,
  intervention_priority VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
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

-- Update triggers
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