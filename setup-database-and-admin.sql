-- Complete Database Setup and Admin User Creation
-- Run this entire script in Supabase SQL Editor

-- STEP 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- STEP 2: Create user role enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('client', 'admin');
    END IF;
END$$;

-- STEP 3: Create essential tables
CREATE TABLE IF NOT EXISTS users (
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

CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  specializations TEXT[],
  client_capacity INTEGER DEFAULT 50,
  active_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- STEP 4: Create your admin user
-- Email: admin@test.com
-- Password: Admin123!
INSERT INTO users (
  id, 
  email, 
  password_hash, 
  role, 
  email_verified, 
  onboarding_completed, 
  created_at
)
VALUES (
  'f7925e65-ec95-49ec-95b1-f32a016a6ec8', 
  'admin@test.com', 
  '$2b$12$9g0xc/XJqxBQhgKjq3EUy.uFZqGCAI0eZn8iGvcbkO8Jl0/yYAruK', 
  'admin', 
  true, 
  true, 
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create admin profile
INSERT INTO admin_profiles (
  id, 
  user_id, 
  name, 
  title, 
  specializations, 
  client_capacity, 
  active_sessions, 
  created_at, 
  updated_at
)
VALUES (
  '1710b448-9189-40bf-8fe6-0f5605ad9e01', 
  'f7925e65-ec95-49ec-95b1-f32a016a6ec8', 
  'Test Admin', 
  'Administrator', 
  ARRAY['General'], 
  100, 
  0, 
  NOW(), 
  NOW()
)
ON CONFLICT DO NOTHING;

-- STEP 5: Verify the setup
SELECT 'Database setup complete!' as message;
SELECT 'Admin user created:' as message, email, role FROM users WHERE email = 'admin@test.com';

-- Login credentials:
-- Email: admin@test.com
-- Password: Admin123!
