import { generateClientToken } from '@/lib/client-auth-utils';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email or password format' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    console.log('🔐 Client login attempt for:', email);

    // Find client by email
    const client = await prisma.client.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        password: true, // Include password for verification
        // practitionerId: true, // Enable when field is added
        // subscriptionStatus: true, // Enable when field is added
        assessmentCompleted: true,
        // onboardingCompleted: true, // Enable when field is added
        createdAt: true,
      },
    });

    if (!client) {
      console.log('❌ Client not found:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password for secure authentication
    if (!client.password) {
      console.log('❌ Client has no password set - legacy user needs to reset password');
      return NextResponse.json(
        { error: 'Account needs password reset. Please contact support.' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, client.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for client:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Password verification successful for client:', email);

    // Generate JWT token for client
    const clientToken = generateClientToken({
      id: client.id,
      email: client.email,
    });

    // Update last active (using updatedAt for now)
    await prisma.client.update({
      where: { id: client.id },
      data: { updatedAt: new Date() },
    });

    console.log('✅ Client login successful:', client.firstName, client.lastName);

    // Return client data
    return NextResponse.json({
      success: true,
      token: clientToken,
      client: {
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        phoneNumber: client.phone,
        practitionerId: null, // Will be dynamic when field is added
        subscriptionStatus: 'active', // Default for coaching program members
        onboardingCompleted: true, // Default for existing clients
        assessmentCompleted: client.assessmentCompleted,
        createdAt: client.createdAt,
      },
    });

  } catch (error) {
    console.error('❌ Client login error:', error);
    return NextResponse.json(
      { error: 'Login failed - please try again' },
      { status: 500 }
    );
  }
}
// Railway deployment cache bust Wed Sep 10 15:00:01 PDT 2025
