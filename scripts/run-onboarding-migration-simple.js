const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runOnboardingMigration() {
  try {
    console.log('Setting up onboarding system...')
    console.log('')
    console.log('⚠️  Schema changes require manual execution in Supabase dashboard')
    console.log('Please run the following SQL in your Supabase SQL editor:')
    console.log('')
    console.log('📋 Copy and paste this complete SQL script:')
    console.log('')
    console.log('='.repeat(80))
    
    const migrationSQL = `
-- Migration 003: Comprehensive Client Onboarding System
-- Run this in your Supabase SQL editor

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
  section VARCHAR(50) NOT NULL, -- personal, health_history, medications, etc.
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
  category VARCHAR(50) NOT NULL, -- lab_reports, medical_records, food_photos, cgm_data, supplements
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
`

    console.log(migrationSQL)
    console.log('='.repeat(80))
    console.log('')
    console.log('📝 Instructions:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the SQL above')
    console.log('4. Click "Run" to execute')
    console.log('5. Wait for all statements to complete')
    console.log('')
    console.log('✅ After running the SQL, test with: npm run db:query tables')
    console.log('')
    console.log('🎉 Your onboarding system will be ready to use!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

runOnboardingMigration() 