import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First, get a valid client
    const { data: clients } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email')
      .limit(1);
      
    if (!clients || clients.length === 0) {
      return NextResponse.json({ error: 'No clients found' }, { status: 404 });
    }
    
    const clientId = clients[0].id;
    console.log('Using client:', clients[0]);
    
    // Try to create a minimal assessment
    const { data: assessment, error } = await supabase
      .from('ai_conversations')
      .insert({
        client_id: clientId,
        conversation_type: 'structured_assessment',
        status: 'in_progress',
        current_section: 'energy'
      })
      .select()
      .single();
      
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to create assessment',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }
    
    // Clean up - delete the test assessment
    if (assessment) {
      await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', assessment.id);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Assessment can be created successfully',
      testAssessment: assessment,
      client: clients[0]
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}