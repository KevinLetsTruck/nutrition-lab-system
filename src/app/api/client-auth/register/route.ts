import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateClientToken } from '@/lib/client-auth-utils';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  practitionerCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RegisterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid registration data',
          details: validation.error.issues.map(issue => issue.message)
        },
        { status: 400 }
      );
    }

    const userData = validation.data;

    console.log('📝 Client registration attempt:', userData.email);

    // Check if client already exists
    const normalizedEmail = userData.email.toLowerCase();
    console.log('🔍 Checking for existing client with email:', normalizedEmail);
    
    const existingClient = await prisma.client.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingClient) {
      console.log('❌ Client already exists:', {
        email: existingClient.email,
        name: `${existingClient.firstName} ${existingClient.lastName}`,
        id: existingClient.id,
        status: existingClient.status
      });
      return NextResponse.json(
        { error: 'Account already exists with this email' },
        { status: 409 }
      );
    }

    console.log('✅ No existing client found, proceeding with registration');

    // Hash password (prepare for future use, but don't store it yet)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    console.log('🔐 Password hashed for future use (not stored in current schema)');

    // Find practitioner by code (optional)
    let practitionerId = null;
    if (userData.practitionerCode) {
      // For now, we'll use a simple check for your coaching program code
      if (userData.practitionerCode === 'COACHING2025') {
        console.log('✅ Valid coaching program code used');
        // practitionerId would be set to actual practitioner ID when field is added
      } else {
        console.log('⚠️ Invalid practitioner code:', userData.practitionerCode);
      }
    }

    // Create client account (compatible with current schema)
    let newClient;
    try {
      console.log('🔧 Creating new client account...');
      newClient = await prisma.client.create({
        data: {
          email: normalizedEmail,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phoneNumber,
          password: passwordHash, // Store hashed password for secure authentication
          // practitionerId, // Will be enabled when field is added to schema  
          // subscriptionStatus: userData.practitionerCode === 'COACHING2025' ? 'active' : 'trial', // Will be enabled when field is added
          // onboardingCompleted: false, // Will be enabled when field is added
          assessmentCompleted: false,
          status: 'SIGNED_UP',
          isTruckDriver: true, // Default for portal users
        },
      });
    } catch (createError: any) {
      console.error('❌ Database error during client creation:', createError);
      
      // Check if it's a unique constraint violation (email already exists)
      if (createError.code === 'P2002' && createError.meta?.target?.includes('email')) {
        console.log('🔍 Unique constraint violation on email - client was created between our check and create');
        return NextResponse.json(
          { error: 'Account already exists with this email' },
          { status: 409 }
        );
      }
      
      // Other database errors
      return NextResponse.json(
        { error: 'Registration failed due to database error - please try again' },
        { status: 500 }
      );
    }

    console.log('✅ Client account created:', newClient.firstName, newClient.lastName);

    // Generate JWT token
    const clientToken = generateClientToken({
      id: newClient.id,
      email: newClient.email,
    });

    return NextResponse.json({
      success: true,
      token: clientToken,
      client: {
        id: newClient.id,
        email: newClient.email,
        firstName: newClient.firstName,
        lastName: newClient.lastName,
        phoneNumber: newClient.phone,
        practitionerId: practitionerId,
        subscriptionStatus: userData.practitionerCode === 'COACHING2025' ? 'active' : 'trial',
        onboardingCompleted: false,
        assessmentCompleted: false,
        createdAt: newClient.createdAt,
      },
    });

  } catch (error) {
    console.error('❌ Client registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed - please try again' },
      { status: 500 }
    );
  }
}
