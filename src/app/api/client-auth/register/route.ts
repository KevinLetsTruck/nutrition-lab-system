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
    const existingClient = await prisma.client.findUnique({
      where: { email: userData.email.toLowerCase() },
    });

    if (existingClient) {
      console.log('❌ Client already exists:', userData.email);
      return NextResponse.json(
        { error: 'Account already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Find practitioner by code (optional)
    let practitionerId = null;
    if (userData.practitionerCode) {
      // For now, we'll use a simple check for your coaching program code
      if (userData.practitionerCode === 'COACHING2025') {
        // TODO: Replace with actual practitioner lookup when practitioner codes are implemented
        console.log('✅ Valid coaching program code used');
        // practitionerId would be set to actual practitioner ID
      } else {
        console.log('⚠️ Invalid practitioner code:', userData.practitionerCode);
      }
    }

    // Create client account
    const newClient = await prisma.client.create({
      data: {
        email: userData.email.toLowerCase(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phoneNumber,
        // passwordHash, // Enable when field is added to schema
        // practitionerId, // Enable when field is added to schema
        // subscriptionStatus: userData.practitionerCode === 'COACHING2025' ? 'active' : 'trial', // Enable when field is added
        // onboardingCompleted: false, // Enable when field is added
        assessmentCompleted: false,
        status: 'SIGNED_UP',
        isTruckDriver: true, // Default for portal users
      },
    });

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
