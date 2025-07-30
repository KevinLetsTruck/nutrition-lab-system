-- Migration 006: Authentication System Implementation
-- This migration adds comprehensive authentication and user management system

-- Create enum types for user roles and consultation status
CREATE TYPE user_role AS ENUM ('client', 'admin');
CREATE TYPE consultation_status AS ENUM ('pending', 'scheduled', 'completed');

-- Users table for authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'client',
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP
);

-- Client profiles table (extends users with client-specific data)
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  onboarding_data JSONB,
  consultation_status consultation_status DEFAULT 'pending',
  email_sequence_status JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Email automation tracking
CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sequence_type VARCHAR(50) NOT NULL,
  emails_sent JSONB DEFAULT '[]'::jsonb,
  current_step INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT now(),
  paused_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Admin profiles table
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(100),
  specializations TEXT[],
  client_capacity INTEGER DEFAULT 50,
  active_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Admin permissions table
CREATE TABLE admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_profiles(id) ON DELETE CASCADE,
  permission VARCHAR(50) NOT NULL,
  granted_at TIMESTAMP DEFAULT now(),
  granted_by UUID REFERENCES users(id)
);

-- Session management table
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  last_activity TIMESTAMP DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL, -- email, IP, etc.
  action VARCHAR(50) NOT NULL, -- login, register, etc.
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT now(),
  window_end TIMESTAMP DEFAULT (now() + interval '1 hour'),
  blocked_until TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX idx_email_sequences_user_id ON email_sequences(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_rate_limits_identifier_action ON rate_limits(identifier, action);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Core user authentication table';
COMMENT ON TABLE client_profiles IS 'Client-specific profile data extending users table';
COMMENT ON TABLE email_sequences IS 'Email automation tracking for client onboarding';
COMMENT ON TABLE admin_profiles IS 'Admin user profiles with capacity and specialization data';
COMMENT ON TABLE admin_permissions IS 'Granular permissions for admin users';
COMMENT ON TABLE user_sessions IS 'JWT session management and tracking';
COMMENT ON TABLE rate_limits IS 'Rate limiting for authentication and API endpoints';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password will be set via application)
INSERT INTO users (email, password_hash, role, email_verified) 
VALUES ('kevin@destinationhealth.com', 'temp_hash_to_be_updated', 'admin', true);

-- Insert corresponding admin profile
INSERT INTO admin_profiles (user_id, name, title, specializations, client_capacity)
SELECT 
  id,
  'Kevin Rutherford',
  'FNTP Certified Nutrition Therapist',
  ARRAY['Truck Driver Health', 'Functional Medicine', 'DOT Medical Compliance'],
  100
FROM users WHERE email = 'kevin@destinationhealth.com';

-- Grant all permissions to default admin
INSERT INTO admin_permissions (admin_id, permission)
SELECT 
  ap.id,
  unnest(ARRAY[
    'view_all_clients',
    'edit_client_data', 
    'send_emails',
    'generate_reports',
    'manage_protocols',
    'system_admin'
  ])
FROM admin_profiles ap
JOIN users u ON ap.user_id = u.id
WHERE u.email = 'kevin@destinationhealth.com'; 