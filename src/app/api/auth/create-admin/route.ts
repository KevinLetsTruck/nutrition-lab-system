import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, secretKey } = await request.json()

    // Require a secret key to create admin accounts
    if (secretKey !== process.env.ADMIN_CREATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 403 }
      )
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user and admin profile in a transaction
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash,
            role: 'ADMIN',
            emailVerified: true,
            onboardingCompleted: true
          }
        })

        // Create admin profile
        const adminProfile = await tx.adminProfile.create({
          data: {
            userId: newUser.id,
            name: name,
            title: 'Administrator',
            specializations: ['General'],
            clientCapacity: 100,
            activeSessions: 0
          }
        })

        return { user: newUser, profile: adminProfile }
      })

      const { user: newUser } = result

      return NextResponse.json({
        success: true,
        message: 'Admin account created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: 'admin'
        }
      })
    } catch (error) {
      console.error('Error creating admin:', error)
      return NextResponse.json(
        { error: 'Failed to create admin profile' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin account' },
      { status: 500 }
    )
  }
}
