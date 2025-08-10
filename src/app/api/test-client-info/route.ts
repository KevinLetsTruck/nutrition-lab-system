import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the email you're looking for
    const email = 'kevin@letstruck.com';
    
    // Find the client with this email
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email')
      .eq('email', email)
      .single();
    
    if (error || !client) {
      // If not found, list all clients to help debug
      const { data: allClients } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email')
        .order('created_at', { ascending: false })
        .limit(10);
      
      return NextResponse.json({
        message: `Client with email ${email} not found`,
        availableClients: allClients || []
      });
    }
    
    return NextResponse.json({
      message: 'Client found!',
      client,
      structuredAssessmentUrl: `/assessments/structured/${client.id}`
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}