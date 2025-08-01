import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY
    };
    
    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase configuration',
        envCheck 
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test table access
    const tables = ['ai_conversations', 'conversation_messages', 'conversation_analysis'];
    const tableAccess: Record<string, any> = {};
    
    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      tableAccess[table] = {
        accessible: !error,
        error: error?.message,
        count
      };
    }
    
    // Test creating a conversation
    const testResult = {
      canCreate: false,
      error: null as string | null
    };
    
    const { data: testConv, error: createError } = await supabase
      .from('ai_conversations')
      .insert({
        client_id: '9be32ffa-adf6-4d27-ab02-bc88f405e9b4', // Mike Wilson
        conversation_type: 'test',
        status: 'test',
        current_section: 'test'
      })
      .select()
      .single();
    
    if (createError) {
      testResult.error = createError.message;
    } else {
      testResult.canCreate = true;
      // Clean up
      await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', testConv.id);
    }
    
    return NextResponse.json({
      status: 'ok',
      envCheck,
      usingKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon',
      tableAccess,
      testResult
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}