import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    console.log('Token to verify:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    return NextResponse.json({
      success: true,
      decoded,
      secretLength: process.env.JWT_SECRET?.length
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      secretLength: process.env.JWT_SECRET?.length
    });
  }
}
