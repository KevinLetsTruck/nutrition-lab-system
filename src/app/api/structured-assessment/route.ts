import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'start': {
        const { clientId } = body;
        
        // Verify client exists
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('id, first_name, last_name')
          .eq('id', clientId)
          .single();
          
        if (clientError || !client) {
          throw new Error(`Client not found: ${clientId}`);
        }
        
        // Create new structured assessment
        const { data: assessment, error } = await supabase
          .from('ai_conversations')
          .insert({
            client_id: clientId,
            conversation_type: 'structured_assessment',
            assessment_type: 'structured',
            status: 'in_progress',
            current_section: 'energy',
            started_at: new Date().toISOString(),
            questions_answered: 0,
            estimated_questions_remaining: 37 // Total estimated
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ assessmentId: assessment.id });
      }
        
      case 'respond': {
        const { assessmentId, questionId, value, section } = body;
        
        // Store the response
        const { error: messageError } = await supabase
          .from('conversation_messages')
          .insert({
            conversation_id: assessmentId,
            role: 'client',
            content: String(value),
            question_id: questionId,
            question_type: 'structured',
            structured_response: {
              value,
              questionId,
              timestamp: new Date().toISOString()
            },
            section,
            message_type: 'structured_response'
          });

        if (messageError) throw messageError;
        
        // Update assessment progress
        const { data: assessment } = await supabase
          .from('ai_conversations')
          .select('questions_answered')
          .eq('id', assessmentId)
          .single();
          
        const newCount = (assessment?.questions_answered || 0) + 1;
        
        await supabase
          .from('ai_conversations')
          .update({
            questions_answered: newCount,
            current_section: section,
            updated_at: new Date().toISOString()
          })
          .eq('id', assessmentId);

        return NextResponse.json({ success: true });
      }
        
      case 'complete': {
        const { assessmentId, patterns } = body;
        
        // Store detected patterns
        if (patterns && patterns.length > 0) {
          const patternInserts = patterns.map((pattern: any) => ({
            conversation_id: assessmentId,
            pattern_name: pattern.name,
            confidence: pattern.confidence,
            evidence: pattern.evidence,
            detected_at: new Date().toISOString()
          }));
          
          await supabase
            .from('detected_patterns')
            .insert(patternInserts);
        }
        
        // Mark assessment as complete
        await supabase
          .from('ai_conversations')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', assessmentId);

        return NextResponse.json({ success: true });
      }
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Structured assessment API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process assessment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}