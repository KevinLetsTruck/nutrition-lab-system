import { NextRequest, NextResponse } from 'next/server';
import { ClientService } from '@/lib/db/client-service';
import { handleAPIError, APIRequestError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    
    let result;
    
    if (search) {
      // Use search functionality
      result = await ClientService.searchClients({
        query: search,
        skip: offset,
        take: limit,
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });
    } else {
      // Get all clients
      result = await ClientService.getClients({
        skip: offset,
        take: limit,
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });
    }
    
    // Transform to match expected format
    const clients = result.clients.map(client => ({
      id: client.id,
      first_name: client.firstName,
      last_name: client.lastName,
      email: client.email,
      created_at: client.createdAt
    }));
    
    return NextResponse.json({
      clients,
      count: result.total,
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