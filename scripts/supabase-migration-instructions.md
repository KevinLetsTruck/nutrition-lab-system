# Supabase Migration Instructions

## 🚨 **Migration Status: Partially Complete**

The automated migration script executed some statements but the main tables were not created. This is likely because the `exec_sql` RPC function is not available in your Supabase project.

## 🔧 **Manual Migration Required**

### **Step 1: Access Supabase Dashboard**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### **Step 2: Execute Migration SQL**

Copy and paste the following SQL into the SQL Editor and execute it:

```sql
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
```

### **Step 3: Verify Migration**

After executing the SQL, test the connection:

```bash
# Test the debug endpoint
curl http://localhost:3001/api/auth/debug
```

Expected response should show all tables as accessible.

### **Step 4: Add Missing Environment Variables**

Add these to your `.env.local` file:

```bash
# Database URL (get from Supabase dashboard)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random
NEXTAUTH_URL=http://localhost:3001
```

### **Step 5: Test Authentication System**

```bash
# Test registration
curl -X POST http://localhost:3001/api/auth/test-registration
```

## 🎯 **Expected Results**

After completing the migration:
- All database tables should be created
- Debug endpoint should return "healthy" status
- Registration should work without errors
- Authentication system should be fully functional

## 📞 **Need Help?**

If you encounter any issues:
1. Check the Supabase dashboard for any error messages
2. Verify your project has the necessary permissions
3. Test the debug endpoint to see specific issues 