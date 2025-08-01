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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTable() {
  console.log('🔍 Checking email_verifications table...\n')

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('email_verifications')
      .select('*')
      .limit(1)

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Table email_verifications does not exist')
        console.log('\nPlease run this SQL in your Supabase dashboard:')
        console.log(`
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      } else {
        console.error('❌ Error querying table:', error.message)
      }
    } else {
      console.log('✅ Table email_verifications exists and is accessible!')
      
      // Check if there are any records
      const { count } = await supabase
        .from('email_verifications')
        .select('*', { count: 'exact', head: true })
      
      console.log(`📊 Current records in table: ${count || 0}`)
      console.log('\n✨ Email verification system is ready!')
      console.log('   - Clients can register at: yoursite.com/auth?client=true')
      console.log('   - Verification emails will be sent automatically')
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

checkTable()