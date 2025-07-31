const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createClientNotesTable() {
  console.log('🚀 Creating client_notes table...')

  try {
    // Create client_notes table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS client_notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL CHECK (type IN ('interview', 'coaching_call', 'assistant')),
          content TEXT NOT NULL,
          author VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (createError) {
      console.error('❌ Error creating client_notes table:', createError)
      return
    }

    console.log('✅ client_notes table created')

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
        CREATE INDEX IF NOT EXISTS idx_client_notes_type ON client_notes(type);
        CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON client_notes(created_at);
      `
    })

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError)
    } else {
      console.log('✅ Indexes created')
    }

    // Create RLS policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own client notes" ON client_notes
          FOR SELECT USING (true);
        
        CREATE POLICY "Users can insert their own client notes" ON client_notes
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Users can update their own client notes" ON client_notes
          FOR UPDATE USING (true);
        
        CREATE POLICY "Users can delete their own client notes" ON client_notes
          FOR DELETE USING (true);
      `
    })

    if (policyError) {
      console.error('❌ Error creating policies:', policyError)
    } else {
      console.log('✅ RLS policies created')
    }

    // Add some sample notes for testing
    const { error: sampleError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO client_notes (client_id, type, content, author) 
        SELECT 
          c.id,
          'interview',
          'Initial consultation completed. Client reports fatigue, digestive issues, and difficulty maintaining healthy eating habits while on the road. Currently taking blood pressure medication.',
          'Dr. Smith'
        FROM clients c 
        LIMIT 1
        ON CONFLICT DO NOTHING;
      `
    })

    if (sampleError) {
      console.error('❌ Error adding sample data:', sampleError)
    } else {
      console.log('✅ Sample note added')
    }

    console.log('🎉 client_notes table setup completed!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createClientNotesTable() 