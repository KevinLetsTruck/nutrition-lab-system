const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixOnboardingMigration() {
  try {
    console.log('Fixing onboarding migration using standard Supabase operations...')
    
    // Note: For table creation and schema changes, we need to use the Supabase dashboard
    // or direct SQL execution through the dashboard. The client library doesn't support
    // DDL operations like CREATE TABLE or ALTER TABLE.
    
    console.log('⚠️  Schema changes require manual execution in Supabase dashboard')
    console.log('Please run the following SQL in your Supabase SQL editor:')
    console.log('')
    console.log('1. Add columns to clients table:')
    console.log(`
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
    `)
    
    console.log('2. Create client_intake table:')
    console.log(`
CREATE TABLE IF NOT EXISTS client_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  section VARCHAR(50) NOT NULL,
  responses JSONB NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
    `)
    
    console.log('3. Create client_files table:')
    console.log(`
CREATE TABLE IF NOT EXISTS client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
    `)
    
    console.log('4. Create onboarding_progress table:')
    console.log(`
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  step VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
    `)
    
    console.log('5. Create onboarding_sessions table:')
    console.log(`
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  current_step VARCHAR(50) NOT NULL,
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
    `)
    
    console.log('6. Create indexes:')
    console.log(`
CREATE INDEX IF NOT EXISTS idx_client_intake_client_id ON client_intake(client_id);
CREATE INDEX IF NOT EXISTS idx_client_intake_section ON client_intake(section);
CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON client_files(client_id);
CREATE INDEX IF NOT EXISTS idx_client_files_category ON client_files(category);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_client_id ON onboarding_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_step ON onboarding_progress(step);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_client_id ON onboarding_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_token ON onboarding_sessions(session_token);
    `)
    
    console.log('')
    console.log('After running these SQL statements in your Supabase dashboard,')
    console.log('the onboarding system will be ready to use.')
    console.log('')
    console.log('You can then test the tables using: npm run db:query tables')
    
  } catch (error) {
    console.error('Migration fix failed:', error)
  }
}

fixOnboardingMigration() 