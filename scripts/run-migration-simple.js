require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Running Simple Database Migration...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('📝 Creating users table...');
    
    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'client',
          email_verified BOOLEAN DEFAULT false,
          onboarding_completed BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          last_login TIMESTAMP
        );
      `
    });
    
    if (usersError) {
      console.log('⚠️  Users table creation error (might already exist):', usersError.message);
    } else {
      console.log('✅ Users table created');
    }

    console.log('📝 Creating client_profiles table...');
    
    // Create client_profiles table
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS client_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          onboarding_data JSONB,
          consultation_status VARCHAR(20) DEFAULT 'pending',
          email_sequence_status JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        );
      `
    });
    
    if (profilesError) {
      console.log('⚠️  Client profiles table creation error (might already exist):', profilesError.message);
    } else {
      console.log('✅ Client profiles table created');
    }

    console.log('📝 Creating user_sessions table...');
    
    // Create user_sessions table
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          token_hash VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT now(),
          last_activity TIMESTAMP DEFAULT now(),
          ip_address INET,
          user_agent TEXT
        );
      `
    });
    
    if (sessionsError) {
      console.log('⚠️  User sessions table creation error (might already exist):', sessionsError.message);
    } else {
      console.log('✅ User sessions table created');
    }

    console.log('📝 Creating rate_limits table...');
    
    // Create rate_limits table
    const { error: rateLimitsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS rate_limits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          identifier VARCHAR(255) NOT NULL,
          action VARCHAR(50) NOT NULL,
          attempts INTEGER DEFAULT 1,
          window_start TIMESTAMP DEFAULT now(),
          window_end TIMESTAMP DEFAULT (now() + interval '1 hour'),
          blocked_until TIMESTAMP
        );
      `
    });
    
    if (rateLimitsError) {
      console.log('⚠️  Rate limits table creation error (might already exist):', rateLimitsError.message);
    } else {
      console.log('✅ Rate limits table created');
    }

    // Test the tables
    console.log('🧪 Testing tables...');
    
    const tables = ['users', 'client_profiles', 'user_sessions', 'rate_limits'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Error testing table ${table}:`, error.message);
        } else {
          console.log(`✅ Table ${table} is accessible`);
        }
      } catch (testError) {
        console.error(`❌ Error testing table ${table}:`, testError.message);
      }
    }
    
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    console.log('\n📋 Manual migration required:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy the SQL from scripts/supabase-migration-instructions.md');
    console.log('3. Execute the SQL manually');
  }
}

runMigration(); 