const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createPractitionerTables() {
  console.log('🚀 Creating practitioner analysis tables...')

  try {
    // Create protocols table
    const { error: protocolsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS protocols (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
          phase VARCHAR(255) NOT NULL,
          start_date DATE NOT NULL,
          content TEXT,
          compliance INTEGER CHECK (compliance >= 0 AND compliance <= 100),
          status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (protocolsError) {
      console.error('❌ Error creating protocols table:', protocolsError)
    } else {
      console.log('✅ protocols table created')
    }

    // Create analysis_versions table
    const { error: versionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS analysis_versions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
          version_id VARCHAR(255) NOT NULL,
          generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          generated_by VARCHAR(50) NOT NULL CHECK (generated_by IN ('manual', 'ai')),
          snapshot JSONB NOT NULL,
          changes JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (versionsError) {
      console.error('❌ Error creating analysis_versions table:', versionsError)
    } else {
      console.log('✅ analysis_versions table created')
    }

    // Create indexes for protocols
    const { error: protocolsIndexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_protocols_client_id ON protocols(client_id);
        CREATE INDEX IF NOT EXISTS idx_protocols_status ON protocols(status);
        CREATE INDEX IF NOT EXISTS idx_protocols_created_at ON protocols(created_at);
      `
    })

    if (protocolsIndexError) {
      console.error('❌ Error creating protocol indexes:', protocolsIndexError)
    } else {
      console.log('✅ Protocol indexes created')
    }

    // Create indexes for analysis_versions
    const { error: versionsIndexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_analysis_versions_client_id ON analysis_versions(client_id);
        CREATE INDEX IF NOT EXISTS idx_analysis_versions_generated_at ON analysis_versions(generated_at);
        CREATE INDEX IF NOT EXISTS idx_analysis_versions_generated_by ON analysis_versions(generated_by);
      `
    })

    if (versionsIndexError) {
      console.error('❌ Error creating version indexes:', versionsIndexError)
    } else {
      console.log('✅ Analysis version indexes created')
    }

    // Create RLS policies for protocols
    const { error: protocolsPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view protocols" ON protocols
          FOR SELECT USING (true);
        
        CREATE POLICY "Users can insert protocols" ON protocols
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Users can update protocols" ON protocols
          FOR UPDATE USING (true);
        
        CREATE POLICY "Users can delete protocols" ON protocols
          FOR DELETE USING (true);
      `
    })

    if (protocolsPolicyError) {
      console.error('❌ Error creating protocol policies:', protocolsPolicyError)
    } else {
      console.log('✅ Protocol RLS policies created')
    }

    // Create RLS policies for analysis_versions
    const { error: versionsPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE analysis_versions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view analysis versions" ON analysis_versions
          FOR SELECT USING (true);
        
        CREATE POLICY "Users can insert analysis versions" ON analysis_versions
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Users can update analysis versions" ON analysis_versions
          FOR UPDATE USING (true);
        
        CREATE POLICY "Users can delete analysis versions" ON analysis_versions
          FOR DELETE USING (true);
      `
    })

    if (versionsPolicyError) {
      console.error('❌ Error creating version policies:', versionsPolicyError)
    } else {
      console.log('✅ Analysis version RLS policies created')
    }

    // Add sample protocol for testing
    const { error: sampleProtocolError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO protocols (client_id, phase, start_date, content, compliance, status) 
        SELECT 
          c.id,
          'Phase 1: Gut Restoration',
          CURRENT_DATE,
          'GREETING\nHello,\n\nThank you for completing your comprehensive health assessment. Based on your lab results and our consultation, I''ve created a personalized protocol to address your health goals.\n\nPRIORITY SUPPLEMENTS\n\nNAME OF PRODUCT: Biotics Research - Bio-D-Mulsion Forte\nDOSE: 1 drop daily\nTIMING: With breakfast\nPURPOSE: Optimize vitamin D levels for immune function and inflammation reduction',
          75,
          'active'
        FROM clients c 
        LIMIT 1
        ON CONFLICT DO NOTHING;
      `
    })

    if (sampleProtocolError) {
      console.error('❌ Error adding sample protocol:', sampleProtocolError)
    } else {
      console.log('✅ Sample protocol added')
    }

    console.log('🎉 Practitioner analysis tables setup completed!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createPractitionerTables() 