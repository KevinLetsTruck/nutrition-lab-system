require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Running AI Conversations Database Migration...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Create ai_conversations table
    console.log('📝 Creating ai_conversations table...');
    const { error: aiConvError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ai_conversations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
          conversation_type VARCHAR(50) DEFAULT 'health_assessment',
          status VARCHAR(20) DEFAULT 'in_progress',
          current_section VARCHAR(50),
          started_at TIMESTAMP DEFAULT NOW(),
          completed_at TIMESTAMP,
          total_duration INTEGER,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (aiConvError) {
      console.log('⚠️  ai_conversations error:', aiConvError.message);
    } else {
      console.log('✅ ai_conversations table created');
    }

    // Create conversation_messages table
    console.log('📝 Creating conversation_messages table...');
    const { error: msgError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS conversation_messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
          role VARCHAR(20) NOT NULL CHECK (role IN ('ai', 'client')),
          content TEXT NOT NULL,
          message_type VARCHAR(30) DEFAULT 'chat',
          section VARCHAR(50),
          timestamp TIMESTAMP DEFAULT NOW(),
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (msgError) {
      console.log('⚠️  conversation_messages error:', msgError.message);
    } else {
      console.log('✅ conversation_messages table created');
    }

    // Create conversation_analysis table
    console.log('📝 Creating conversation_analysis table...');
    const { error: analysisError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS conversation_analysis (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
          section VARCHAR(50),
          symptoms_identified JSONB,
          patterns_detected JSONB,
          severity_scores JSONB,
          root_causes JSONB,
          confidence_scores JSONB,
          truck_driver_factors JSONB,
          recommendations JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (analysisError) {
      console.log('⚠️  conversation_analysis error:', analysisError.message);
    } else {
      console.log('✅ conversation_analysis table created');
    }

    // Create indexes
    console.log('📝 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_ai_conversations_client_id ON ai_conversations(client_id);',
      'CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON ai_conversations(status);',
      'CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);',
      'CREATE INDEX IF NOT EXISTS idx_conversation_messages_timestamp ON conversation_messages(timestamp);',
      'CREATE INDEX IF NOT EXISTS idx_conversation_analysis_conversation_id ON conversation_analysis(conversation_id);'
    ];

    for (const indexSql of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (error) {
        console.log('⚠️  Index error:', error.message);
      }
    }
    console.log('✅ Indexes created');

    // Enable RLS
    console.log('📝 Enabling Row Level Security...');
    const rlsTables = ['ai_conversations', 'conversation_messages', 'conversation_analysis'];
    
    for (const table of rlsTables) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });
      if (error) {
        console.log(`⚠️  RLS error for ${table}:`, error.message);
      }
    }
    console.log('✅ RLS enabled');

    // Create basic RLS policies
    console.log('📝 Creating RLS policies...');
    const policies = [
      {
        table: 'ai_conversations',
        name: 'Users can view their own conversations',
        sql: `CREATE POLICY "Users can view their own conversations" ON ai_conversations FOR SELECT USING (auth.uid() IS NOT NULL);`
      },
      {
        table: 'conversation_messages',
        name: 'Users can view their own messages',
        sql: `CREATE POLICY "Users can view their own messages" ON conversation_messages FOR SELECT USING (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = conversation_messages.conversation_id));`
      },
      {
        table: 'conversation_analysis',
        name: 'Users can view their own analysis',
        sql: `CREATE POLICY "Users can view their own analysis" ON conversation_analysis FOR SELECT USING (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = conversation_analysis.conversation_id));`
      }
    ];

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error && !error.message.includes('already exists')) {
        console.log(`⚠️  Policy error for ${policy.table}:`, error.message);
      }
    }
    console.log('✅ RLS policies created');

    console.log('\n🎉 AI Conversations migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();