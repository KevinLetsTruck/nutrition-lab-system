import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRLSPolicies() {
  console.log('🔍 Checking AI Conversation Tables and RLS Policies...\n');

  try {
    // Test creating a conversation (should work with service role key)
    console.log('Testing conversation creation...');
    const { data: testConv, error: convError } = await supabase
      .from('ai_conversations')
      .insert({
        client_id: '9be32ffa-adf6-4d27-ab02-bc88f405e9b4', // Mike Wilson's ID
        conversation_type: 'health_assessment',
        status: 'test',
        current_section: 'test'
      })
      .select()
      .single();

    if (convError) {
      console.error('❌ Error creating conversation:', convError);
      console.log('\nThis might be due to RLS policies. Let me check the policies...');
      
      // Check if RLS is enabled
      const { data: tables } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT tablename, rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename IN ('ai_conversations', 'conversation_messages', 'conversation_analysis')
        `
      }).catch(() => ({ data: null }));
      
      if (tables) {
        console.log('\nRLS Status:');
        tables.forEach(table => {
          console.log(`- ${table.tablename}: RLS ${table.rowsecurity ? 'ENABLED ✓' : 'DISABLED ✗'}`);
        });
      }
    } else {
      console.log('✅ Successfully created test conversation:', testConv.id);
      
      // Clean up test data
      await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', testConv.id);
    }

    // Check table structure
    console.log('\n📊 Checking table structures...');
    const tables = ['ai_conversations', 'conversation_messages', 'conversation_analysis'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists and is accessible`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkRLSPolicies();