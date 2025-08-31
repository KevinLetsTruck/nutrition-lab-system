import jwt from 'jsonwebtoken';
import { prisma } from './db';
import { NextRequest } from 'next/server';

export interface ClientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  practitionerId?: string;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  onboardingCompleted: boolean;
  assessmentCompleted: boolean;
  lastActiveAt?: Date;
  createdAt: Date;
}

export async function verifyClientToken(request: NextRequest): Promise<ClientUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Verify it's a client token (not practitioner)
    if (decoded.type !== 'client') {
      return null;
    }

    // Get current client data
    const client = await prisma.client.findUnique({
      where: { id: decoded.clientId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        // Note: These fields may need to be added to Client model
        // practitionerId: true,
        // subscriptionStatus: true,
        assessmentCompleted: true,
        // onboardingCompleted: true,
        // lastActiveAt: true,
        createdAt: true,
      },
    });

    if (!client) {
      return null;
    }

    // Update last active timestamp
    await prisma.client.update({
      where: { id: client.id },
      data: { 
        // lastActiveAt: new Date() // Enable when field is added
        updatedAt: new Date() // Use existing field for now
      },
    });

    return {
      id: client.id,
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      phoneNumber: client.phone || undefined,
      practitionerId: undefined, // Will be enabled when field is added
      subscriptionStatus: 'active', // Default for now - will be dynamic when field is added
      onboardingCompleted: true, // Default for now
      assessmentCompleted: client.assessmentCompleted,
      lastActiveAt: new Date(),
      createdAt: client.createdAt,
    };

  } catch (error) {
    console.error('Client token verification error:', error);
    return null;
  }
}

export function generateClientToken(clientData: { id: string; email: string }): string {
  return jwt.sign(
    { 
      clientId: clientData.id, 
      email: clientData.email,
      type: 'client'
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}
