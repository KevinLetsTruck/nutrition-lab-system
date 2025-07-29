-- Migration 003: Comprehensive Client Onboarding System
-- This migration adds support for the comprehensive client onboarding system

-- Extend existing clients table with onboarding fields
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS preferred_communication VARCHAR(20) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(100),
ADD COLUMN IF NOT EXISTS insurance_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS primary_health_concern TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- Create client intake responses table (JSONB for flexibility)
CREATE TABLE IF NOT EXISTS client_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  section VARCHAR(50) NOT NULL, -- personal, health_history, medications, lifestyle, goals, etc.
  responses JSONB NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_client_intake_client_id ON client_intake(client_id);
CREATE INDEX IF NOT EXISTS idx_client_intake_section ON client_intake(section);
CREATE INDEX IF NOT EXISTS idx_client_intake_completed_at ON client_intake(completed_at);

-- Create client files table with categories
CREATE TABLE IF NOT EXISTS client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- lab_reports, medical_records, food_photos, cgm_data, supplements, other
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}', -- Additional file information
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON client_files(client_id);
CREATE INDEX IF NOT EXISTS idx_client_files_category ON client_files(category);
CREATE INDEX IF NOT EXISTS idx_client_files_uploaded_at ON client_files(uploaded_at);

-- Create onboarding progress tracking table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  step VARCHAR(50) NOT NULL, -- welcome, personal, health_history, medications, lifestyle, goals, uploads, review
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  data JSONB DEFAULT '{}', -- Step-specific data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_client_id ON onboarding_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_step ON onboarding_progress(step);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_completed ON onboarding_progress(completed);

-- Create onboarding sessions table for tracking progress across sessions
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  current_step VARCHAR(50) NOT NULL,
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for session management
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_client_id ON onboarding_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_token ON onboarding_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_expires_at ON onboarding_sessions(expires_at);

-- Add comments for documentation
COMMENT ON TABLE client_intake IS 'Stores comprehensive client intake form responses organized by sections';
COMMENT ON TABLE client_files IS 'Stores client uploaded files organized by categories with metadata';
COMMENT ON TABLE onboarding_progress IS 'Tracks progress through the multi-step onboarding process';
COMMENT ON TABLE onboarding_sessions IS 'Manages active onboarding sessions for progress resumption';

-- Create a view for comprehensive client profiles
CREATE OR REPLACE VIEW client_profiles AS
SELECT 
  c.id,
  c.email,
  c.first_name,
  c.last_name,
  c.phone,
  c.date_of_birth,
  c.gender,
  c.occupation,
  c.primary_health_concern,
  c.onboarding_completed,
  c.onboarding_started_at,
  c.onboarding_completed_at,
  c.created_at,
  -- Count files by category
  (SELECT COUNT(*) FROM client_files cf WHERE cf.client_id = c.id AND cf.category = 'lab_reports') as lab_reports_count,
  (SELECT COUNT(*) FROM client_files cf WHERE cf.client_id = c.id AND cf.category = 'medical_records') as medical_records_count,
  (SELECT COUNT(*) FROM client_files cf WHERE cf.client_id = c.id AND cf.category = 'food_photos') as food_photos_count,
  (SELECT COUNT(*) FROM client_files cf WHERE cf.client_id = c.id AND cf.category = 'cgm_data') as cgm_data_count,
  (SELECT COUNT(*) FROM client_files cf WHERE cf.client_id = c.id AND cf.category = 'supplements') as supplements_count,
  -- Get latest intake completion
  (SELECT MAX(completed_at) FROM client_intake ci WHERE ci.client_id = c.id) as last_intake_completion,
  -- Get onboarding progress
  (SELECT COUNT(*) FROM onboarding_progress op WHERE op.client_id = c.id AND op.completed = true) as completed_steps,
  (SELECT COUNT(*) FROM onboarding_progress op WHERE op.client_id = c.id) as total_steps
FROM clients c;

-- Create function to get client onboarding summary
CREATE OR REPLACE FUNCTION get_client_onboarding_summary(client_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'client_id', c.id,
    'email', c.email,
    'name', c.first_name || ' ' || c.last_name,
    'onboarding_completed', c.onboarding_completed,
    'onboarding_started_at', c.onboarding_started_at,
    'onboarding_completed_at', c.onboarding_completed_at,
    'progress', (
      SELECT json_build_object(
        'completed_steps', COUNT(*) FILTER (WHERE completed = true),
        'total_steps', COUNT(*),
        'current_step', (
          SELECT step 
          FROM onboarding_progress 
          WHERE client_id = c.id AND completed = false 
          ORDER BY created_at ASC 
          LIMIT 1
        )
      )
      FROM onboarding_progress 
      WHERE client_id = c.id
    ),
    'files', (
      SELECT json_object_agg(category, count)
      FROM (
        SELECT category, COUNT(*) as count
        FROM client_files
        WHERE client_id = c.id
        GROUP BY category
      ) file_counts
    ),
    'intake_sections', (
      SELECT json_agg(section)
      FROM (
        SELECT DISTINCT section
        FROM client_intake
        WHERE client_id = c.id
        ORDER BY section
      ) sections
    )
  ) INTO result
  FROM clients c
  WHERE c.id = client_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-categorize uploaded files
CREATE OR REPLACE FUNCTION categorize_uploaded_file(
  p_filename VARCHAR,
  p_original_name VARCHAR,
  p_file_type VARCHAR
)
RETURNS VARCHAR AS $$
BEGIN
  -- Lab reports (PDFs with lab-related keywords)
  IF p_file_type = 'application/pdf' AND (
    p_original_name ILIKE '%lab%' OR 
    p_original_name ILIKE '%test%' OR 
    p_original_name ILIKE '%blood%' OR 
    p_original_name ILIKE '%urine%' OR
    p_original_name ILIKE '%stool%' OR
    p_original_name ILIKE '%hormone%' OR
    p_original_name ILIKE '%vitamin%' OR
    p_original_name ILIKE '%mineral%'
  ) THEN
    RETURN 'lab_reports';
  END IF;
  
  -- Medical records (PDFs with medical keywords)
  IF p_file_type = 'application/pdf' AND (
    p_original_name ILIKE '%medical%' OR 
    p_original_name ILIKE '%record%' OR 
    p_original_name ILIKE '%doctor%' OR 
    p_original_name ILIKE '%physician%' OR
    p_original_name ILIKE '%consultation%' OR
    p_original_name ILIKE '%prescription%'
  ) THEN
    RETURN 'medical_records';
  END IF;
  
  -- CGM data (CSV files or images with CGM keywords)
  IF (p_file_type = 'text/csv' OR p_file_type LIKE 'image/%') AND (
    p_original_name ILIKE '%cgm%' OR 
    p_original_name ILIKE '%glucose%' OR 
    p_original_name ILIKE '%blood sugar%' OR
    p_original_name ILIKE '%dexcom%' OR
    p_original_name ILIKE '%freestyle%'
  ) THEN
    RETURN 'cgm_data';
  END IF;
  
  -- Food photos (image files with food keywords)
  IF p_file_type LIKE 'image/%' AND (
    p_original_name ILIKE '%food%' OR 
    p_original_name ILIKE '%meal%' OR 
    p_original_name ILIKE '%diet%' OR
    p_original_name ILIKE '%nutrition%' OR
    p_original_name ILIKE '%breakfast%' OR
    p_original_name ILIKE '%lunch%' OR
    p_original_name ILIKE '%dinner%' OR
    p_original_name ILIKE '%snack%'
  ) THEN
    RETURN 'food_photos';
  END IF;
  
  -- Supplements (images with supplement keywords)
  IF p_file_type LIKE 'image/%' AND (
    p_original_name ILIKE '%supplement%' OR 
    p_original_name ILIKE '%vitamin%' OR 
    p_original_name ILIKE '%mineral%' OR
    p_original_name ILIKE '%probiotic%' OR
    p_original_name ILIKE '%herb%' OR
    p_original_name ILIKE '%pill%' OR
    p_original_name ILIKE '%capsule%'
  ) THEN
    RETURN 'supplements';
  END IF;
  
  -- Default to other for unrecognized files
  RETURN 'other';
END;
$$ LANGUAGE plpgsql; 