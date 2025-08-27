import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    // Check if any admin users already exist
    const existingAdmins = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    if (existingAdmins > 0) {
      return NextResponse.json({
        error: 'Admin users already exist. This endpoint is for initial setup only.',
        adminCount: existingAdmins
      }, { status: 400 });
    }

    // Create the admin user
    const hashedPassword = await hashPassword('admin123'); // Temporary password
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@fntp.com',
        password: hashedPassword,
        name: 'FNTP Admin',
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created:', admin.email);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      adminUser: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      temporaryPassword: 'admin123', // Show this once for initial login
      instructions: 'Login with admin@fntp.com / admin123, then change password immediately'
    });

  } catch (error: any) {
    console.error('❌ Failed to create admin user:', error);
    
    return NextResponse.json({
      error: 'Failed to create admin user',
      details: error.message
    }, { status: 500 });
  }
}
