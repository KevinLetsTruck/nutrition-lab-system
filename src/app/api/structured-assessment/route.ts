import { NextRequest, NextResponse } from 'next/server';
// import { createServerSupabaseClient } from '@/lib/supabase';
import { symptomAISelector } from '@/lib/assessment/symptom-ai-selector';
import { symptomQuestionFlow } from '@/lib/assessment/symptom-question-flow';
import { PatternMatcher } from '@/lib/assessment/pattern-matcher';
import { handleAPIError, APIRequestError } from '@/lib/error-handler';
import { AssessmentSection } from '@/lib/assessment/complete-symptom-bank';

// Only create pattern matcher if needed to avoid API key issues
let patternMatcher: PatternMatcher | null = null;

export async function POST(request: NextRequest) {
  let body: any;
  const supabase = createServerSupabaseClient();
  
  try {
    body = await request.json();
    const { action } = body;
    
    console.log('Structured assessment API - Action:', action, 'Body:', body);
    
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
          throw new APIRequestError(
            'Client not found', 
            404, 
            { 
              clientId, 
              error: clientError?.message,
              code: clientError?.code 
            }
          );
        }
        
        // Create new structured assessment
        const { data: assessment, error } = await supabase
          .from('ai_conversations')
          .insert({
            client_id: clientId,
            conversation_type: 'structured_assessment',
            assessment_type: 'structured',
            status: 'in_progress',
            current_section: 'digestive',
            started_at: new Date().toISOString(),
            questions_answered: 0,
            estimated_questions_remaining: 37 // Total estimated
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating assessment:', error);
          throw new APIRequestError(
            'Failed to create assessment',
            500,
            { 
              supabaseError: error.message,
              code: error.code,
              hint: error.hint,
              clientId,
              fields: {
                client_id: clientId,
                conversation_type: 'structured_assessment',
                assessment_type: 'structured',
                status: 'in_progress',
                current_section: 'energy',
                started_at: new Date().toISOString(),
                questions_answered: 0,
                estimated_questions_remaining: 37
              }
            }
          );
        }

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
            structured_response: {
              value,
              questionId,
              timestamp: new Date().toISOString()
            }
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
          // For now, just log patterns instead of inserting
          // We need to populate assessment_patterns table first
          console.log('Detected patterns:', patterns);
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
      
      case 'getQuestion': {
        const { section, responses = [], patterns = [] } = body;
        
        try {
          let question;
          
          // If no responses yet, get initial question
          if (responses.length === 0) {
            question = await symptomAISelector.getInitialQuestion(section);
          } else {
            // Check if we should continue in this section
            const sectionResponses = responses.filter((r: any) => {
              // Find responses for current section (this is simplified, may need adjustment)
              return true; // For now, use all responses
            });
            
            if (!symptomQuestionFlow.shouldContinueSection(
              section as AssessmentSection,
              responses,
              sectionResponses
            )) {
              return NextResponse.json({ question: null, sectionComplete: true });
            }
            
            // Get next question based on responses and patterns
            question = await symptomAISelector.selectNextQuestion(
              responses,
              patterns,
              section
            );
          }
          
          return NextResponse.json({ question });
        } catch (error) {
          console.error('Error getting question:', error);
          
          // Return null to indicate section complete
          return NextResponse.json({ question: null });
        }
      }
      
      case 'detectPatterns': {
        const { responses } = body;
        
        // Initialize pattern matcher if not already done
        if (!patternMatcher) {
          patternMatcher = new PatternMatcher();
        }
        
        const patterns = patternMatcher.detectPatterns(responses);
        return NextResponse.json({ patterns });
      }
      
      case 'getNextSection': {
        const { currentSection, completedSections = [], allResponses = [] } = body;
        
        const nextSection = symptomQuestionFlow.getNextSection(
          currentSection as AssessmentSection,
          completedSections as AssessmentSection[],
          allResponses
        );
        
        const isComplete = symptomQuestionFlow.isAssessmentComplete(
          completedSections as AssessmentSection[],
          allResponses
        );
        
        return NextResponse.json({ 
          nextSection, 
          isComplete,
          estimatedRemaining: symptomQuestionFlow.estimateRemainingQuestions(
            currentSection as AssessmentSection,
            completedSections as AssessmentSection[],
            allResponses.filter((r: any) => true) // Simplified for now
          )
        });
      }
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    const errorResponse = handleAPIError(error, { 
      action: body?.action, 
      body, 
      path: '/api/structured-assessment' 
    });
    
    return NextResponse.json(errorResponse, { 
      status: error instanceof APIRequestError ? error.statusCode : 500 
    });
  }
}