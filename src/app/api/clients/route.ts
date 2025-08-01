import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { handleAPIError, APIRequestError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    
    // Build query
    let query = supabase
      .from('clients')
      .select('id, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Add search filter if provided
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    const { data: clients, error, count } = await query;
    
    if (error) {
      throw new APIRequestError(
        'Failed to fetch clients',
        500,
        {
          supabaseError: error.message,
          code: error.code
        }
      );
    }
    
    return NextResponse.json({
      clients: clients || [],
      count: count || clients?.length || 0,
      limit,
      offset
    });
    
  } catch (error) {
    const errorResponse = handleAPIError(error, {
      path: '/api/clients'
    });
    
    return NextResponse.json(errorResponse, {
      status: error instanceof APIRequestError ? error.statusCode : 500
    });
  }
}