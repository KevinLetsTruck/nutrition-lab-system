import { NextRequest, NextResponse } from 'next/server';
import { verifyClientToken } from '@/lib/client-auth-utils';

export async function GET(request: NextRequest) {
  try {
    const clientUser = await verifyClientToken(request);
    if (!clientUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Client token verified for:', clientUser.firstName, clientUser.lastName);

    return NextResponse.json({
      success: true,
      client: clientUser,
    });

  } catch (error) {
    console.error('❌ Client authentication verification failed:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
