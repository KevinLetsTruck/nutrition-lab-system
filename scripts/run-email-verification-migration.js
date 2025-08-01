import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Running email verifications table migration...\n')

  try {
    // Create the email_verifications table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create email_verifications table
        CREATE TABLE IF NOT EXISTS email_verifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(255) NOT NULL UNIQUE,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            used BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
        CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

        -- Add comment
        COMMENT ON TABLE email_verifications IS 'Stores email verification tokens for user registration';
      `
    })

    if (error) {
      // If exec_sql is not available, try direct table creation
      console.log('⚠️  exec_sql not available, trying direct table operations...')
      
      // Check if table already exists
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'email_verifications')
        .single()

      if (tables) {
        console.log('✅ Table email_verifications already exists')
      } else {
        console.log('❌ Unable to create table via RPC. You may need to run this SQL manually:')
        console.log(`
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
        `)
        return
      }
    } else {
      console.log('✅ Email verifications table created successfully!')
    }

    // Verify table structure
    const { data: testInsert, error: testError } = await supabase
      .from('email_verifications')
      .select('*')
      .limit(1)

    if (!testError) {
      console.log('✅ Table structure verified - ready for use!')
      console.log('\n📧 Email verification system is now set up:')
      console.log('   - Clients can register at: yoursite.com/auth?client=true')
      console.log('   - They will receive verification emails')
      console.log('   - Must verify email before accessing the system')
    } else {
      console.error('❌ Table verification failed:', testError.message)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('\nYou may need to run the migration manually in Supabase dashboard')
  }
}

// Run the migration
runMigration()