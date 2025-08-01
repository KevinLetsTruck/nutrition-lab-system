import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ClaudeClient from '@/lib/claude-client';
import { HEALTH_ASSESSMENT_PROMPTS } from '@/lib/ai-prompts/health-assessment';

// Initialize Supabase with service role key for server-side operations
// If service role key is not available, fall back to anon key (with limited permissions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { action, clientId, conversationId, message, section } = await request.json();
    
    switch (action) {
      case 'start': {
        console.log('Starting conversation for client:', clientId);
        
        // Create new conversation record
        const { data: conversation, error } = await supabase
          .from('ai_conversations')
          .insert({
            client_id: clientId,
            conversation_type: 'health_assessment',
            status: 'in_progress',
            current_section: 'introduction'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating conversation:', error);
          throw error;
        }

        console.log('Created conversation:', conversation.id);
        
        // Create initial AI welcome message
        const welcomeMessage = `Hi there! I'm here to help understand your health better, especially considering the unique challenges you face as a truck driver. 

This conversation is completely confidential, and I'll be asking questions to get a comprehensive picture of how you're feeling.

Let's start with the basics - how have you been feeling overall lately? Any particular concerns or symptoms that brought you here today?`;

        await supabase
          .from('conversation_messages')
          .insert({
            conversation_id: conversation.id,
            role: 'ai',
            content: welcomeMessage,
            section: 'introduction',
            message_type: 'chat'
          });

        return NextResponse.json({ 
          conversationId: conversation.id,
          welcomeMessage 
        });
      }
        
      case 'message': {
        // Store client message
        await supabase
          .from('conversation_messages')
          .insert({
            conversation_id: conversationId,
            role: 'client',
            content: message,
            section: section || 'introduction'
          });

        // Get conversation context
        const { data: messages } = await supabase
          .from('conversation_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true });

        // Get current section
        const { data: conversation } = await supabase
          .from('ai_conversations')
          .select('current_section')
          .eq('id', conversationId)
          .single();

        const currentSection = conversation?.current_section || 'introduction';
        const sectionPrompt = HEALTH_ASSESSMENT_PROMPTS.sectionPrompts[currentSection as keyof typeof HEALTH_ASSESSMENT_PROMPTS.sectionPrompts] || '';
        
        // Build conversation context
        const conversationContext = messages
          ?.filter(m => m.role !== 'system')
          .map(m => `${m.role}: ${m.content}`)
          .join('\n') || '';

        const prompt = `
          Current section: ${currentSection}
          ${sectionPrompt}
          
          Conversation so far:
          ${conversationContext}
          
          Client just said: ${message}
          
          Respond naturally, asking follow-up questions to gather comprehensive information.
          Be empathetic and understanding, especially for truck drivers' unique challenges.
        `;

        // Get AI response
        const claudeClient = ClaudeClient.getInstance();
        const aiResponseContent = await claudeClient.analyzePractitionerReport(
          prompt,
          HEALTH_ASSESSMENT_PROMPTS.system
        );

        // Store AI response
        await supabase
          .from('conversation_messages')
          .insert({
            conversation_id: conversationId,
            role: 'ai',
            content: aiResponseContent,
            section: currentSection,
            message_type: 'chat'
          });

        return NextResponse.json({
          content: aiResponseContent,
          section: currentSection,
          messageType: 'chat'
        });
      }
        
      case 'validate': {
        // Validation logic here
        return NextResponse.json({ 
          section,
          symptoms: [],
          patterns: [],
          truckDriverFactors: [],
          confidence: 0.8
        });
      }
        
      case 'complete': {
        // Mark conversation as complete
        await supabase
          .from('ai_conversations')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', conversationId);

        return NextResponse.json({
          summary: 'Assessment completed',
          topConcerns: [],
          rootCauseAnalysis: {},
          prioritizedRecommendations: [],
          truckDriverSpecificFactors: []
        });
      }
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI Conversation API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}