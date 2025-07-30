-- Migration 004: Streamlined FNTP Client Onboarding System
-- This migration creates a new streamlined onboarding system specifically for FNTP truck driver clients
-- Focuses on essential information not covered in NutriQ assessments

-- Create streamlined client onboarding table
CREATE TABLE IF NOT EXISTS client_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Basic Demographics (essential contact info)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  -- Current Diet Approach
  current_diet_approach VARCHAR(50) NOT NULL, -- 'low_carb_paleo', 'keto_paleo', 'carnivore'
  diet_duration_months INTEGER,
  
  -- Current Prescriptions/Supplements
  current_medications TEXT, -- Simple text list
  current_supplements TEXT, -- Simple text list
  
  -- Coaching Priority
  primary_health_goal TEXT NOT NULL,
  
  -- Truck Driver Specific Information
  years_driving INTEGER,
  route_type VARCHAR(20), -- 'otr', 'regional', 'local'
  schedule_pattern VARCHAR(20), -- 'standard', 'irregular', 'night_shifts'
  
  -- DOT Medical Status
  dot_medical_status VARCHAR(20), -- 'current', 'expired', 'upcoming'
  dot_expiry_date DATE,
  
  -- Progress Tracking
  current_step VARCHAR(50) DEFAULT 'demographics', -- 'demographics', 'diet', 'medications', 'goals', 'truck_info', 'dot_status', 'complete'
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Session Management
  session_token VARCHAR(255) UNIQUE,
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  -- Timestamps
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_client_onboarding_client_id ON client_onboarding(client_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_session_token ON client_onboarding(session_token);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_current_step ON client_onboarding(current_step);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_is_completed ON client_onboarding(is_completed);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_expires_at ON client_onboarding(expires_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_client_onboarding_updated_at
  BEFORE UPDATE ON client_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_client_onboarding_updated_at();

-- Create a function to calculate progress percentage
CREATE OR REPLACE FUNCTION calculate_onboarding_progress(onboarding_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_steps INTEGER := 6; -- demographics, diet, medications, goals, truck_info, dot_status
  completed_steps INTEGER := 0;
  current_step_val VARCHAR(50);
BEGIN
  SELECT current_step INTO current_step_val
  FROM client_onboarding
  WHERE id = onboarding_id;
  
  -- Calculate completed steps based on current_step
  CASE current_step_val
    WHEN 'demographics' THEN completed_steps := 1;
    WHEN 'diet' THEN completed_steps := 2;
    WHEN 'medications' THEN completed_steps := 3;
    WHEN 'goals' THEN completed_steps := 4;
    WHEN 'truck_info' THEN completed_steps := 5;
    WHEN 'dot_status' THEN completed_steps := 6;
    WHEN 'complete' THEN completed_steps := 6;
    ELSE completed_steps := 0;
  END CASE;
  
  RETURN ROUND((completed_steps::DECIMAL / total_steps) * 100);
END;
$$ LANGUAGE plpgsql;

-- Create a function to get onboarding summary
CREATE OR REPLACE FUNCTION get_streamlined_onboarding_summary(client_uuid UUID)
RETURNS TABLE (
  onboarding_id UUID,
  client_name TEXT,
  progress_percentage INTEGER,
  current_step VARCHAR(50),
  is_completed BOOLEAN,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    co.id,
    CONCAT(co.first_name, ' ', co.last_name)::TEXT,
    co.progress_percentage,
    co.current_step,
    co.is_completed,
    co.started_at,
    co.completed_at
  FROM client_onboarding co
  WHERE co.client_id = client_uuid
  ORDER BY co.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE client_onboarding IS 'Streamlined onboarding system for FNTP truck driver clients - essential info only';
COMMENT ON COLUMN client_onboarding.current_diet_approach IS 'Current dietary approach: low_carb_paleo, keto_paleo, carnivore';
COMMENT ON COLUMN client_onboarding.route_type IS 'Truck driving route type: otr, regional, local';
COMMENT ON COLUMN client_onboarding.schedule_pattern IS 'Driving schedule pattern: standard, irregular, night_shifts';
COMMENT ON COLUMN client_onboarding.dot_medical_status IS 'DOT medical certification status: current, expired, upcoming';

-- Create a view for quick onboarding status
CREATE OR REPLACE VIEW streamlined_onboarding_status AS
SELECT 
  co.id,
  co.client_id,
  CONCAT(co.first_name, ' ', co.last_name) as client_name,
  co.email,
  co.current_step,
  co.progress_percentage,
  co.is_completed,
  co.started_at,
  co.completed_at,
  CASE 
    WHEN co.expires_at < NOW() THEN 'expired'
    WHEN co.is_completed THEN 'completed'
    ELSE 'active'
  END as session_status
FROM client_onboarding co; 