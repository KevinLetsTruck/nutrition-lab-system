import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // The client ID you've been using
    const clientId = '6f91bfe4-a4ca-4f9f-8022-5c643676aee5';
    
    // Check if this specific client exists
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    // Also check conversations table
    const { data: conversations } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('client_id', clientId);
    
    // Get total client count
    const { count } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    // Get a few sample clients
    const { data: sampleClients } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email')
      .limit(5);
    
    return NextResponse.json({
      targetClientId: clientId,
      clientExists: !!client && !error,
      client: client || null,
      error: error?.message || null,
      existingConversations: conversations?.length || 0,
      totalClientsInDb: count || 0,
      sampleClients: sampleClients || [],
      advice: !client ? 'This client ID does not exist in the database. Use one of the sample clients below.' : 'Client exists! There might be a different issue.'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}