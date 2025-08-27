import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Simple test - just try to connect and run a basic query
    console.log('Testing database connection...');
    
    // Test 1: Simple connection test
    await prisma.$connect();
    console.log('✅ Prisma connected');
    
    // Test 2: Simple query
    const userCount = await prisma.user.count();
    console.log('✅ Query successful, user count:', userCount);
    
    return NextResponse.json({ 
      status: 'ok',
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('Error disconnecting:', e);
    }
  }
}
