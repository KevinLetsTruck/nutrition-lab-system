import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkStructuredAssessments() {
  console.log('🔍 Checking Structured Assessment Data...\n');

  // Check ai_conversations for structured assessments
  const { data: assessments, error: assessmentsError } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('assessment_type', 'structured')
    .order('created_at', { ascending: false })
    .limit(5);

  if (assessmentsError) {
    console.error('❌ Error fetching assessments:', assessmentsError);
    return;
  }

  console.log(`✅ Found ${assessments?.length || 0} structured assessments\n`);

  if (assessments && assessments.length > 0) {
    for (const assessment of assessments) {
      console.log(`📋 Assessment ID: ${assessment.id}`);
      console.log(`   Client ID: ${assessment.client_id}`);
      console.log(`   Status: ${assessment.status}`);
      console.log(`   Current Section: ${assessment.current_section}`);
      console.log(`   Questions Answered: ${assessment.questions_answered}`);
      console.log(`   Started: ${new Date(assessment.started_at).toLocaleString()}`);
      
      // Check messages for this assessment
      const { data: messages, error: messagesError } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', assessment.id)
        .eq('role', 'client')
        .order('created_at', { ascending: false })
        .limit(5);

      if (messages && messages.length > 0) {
        console.log(`   \n   Recent Responses:`);
        messages.forEach(msg => {
          if (msg.structured_response) {
            console.log(`   - Question: ${msg.question_id}`);
            console.log(`     Value: ${msg.structured_response.value}`);
            console.log(`     Time: ${new Date(msg.created_at).toLocaleTimeString()}`);
          }
        });
      }

      // Check detected patterns
      const { data: patterns } = await supabase
        .from('detected_patterns')
        .select('*')
        .eq('conversation_id', assessment.id);

      if (patterns && patterns.length > 0) {
        console.log(`   \n   Detected Patterns:`);
        patterns.forEach(pattern => {
          console.log(`   - ${pattern.pattern_name} (${Math.round(pattern.confidence * 100)}% confidence)`);
        });
      }

      console.log('\n---\n');
    }
  } else {
    console.log('No structured assessments found yet. Start one to test!');
  }
}

checkStructuredAssessments();