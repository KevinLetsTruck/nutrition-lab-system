import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json()

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields except phone are required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user and client profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          id: uuidv4(),
          email,
          passwordHash,
          role: 'CLIENT',
          emailVerified: false,
          onboardingCompleted: false
        }
      })

      // Create client profile
      const clientProfile = await tx.clientProfile.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          firstName,
          lastName,
          phone: phone || null
        }
      })

      // Create client record
      const client = await tx.client.create({
        data: {
          id: uuidv4(),
          email,
          firstName,
          lastName,
          phone: phone || null,
          dateOfBirth: null,
          healthGoals: {},
          medicalHistory: {},
          medications: {},
          supplements: {}
        }
      })

      return { user, clientProfile, client }
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.clientProfile.firstName,
        lastName: result.clientProfile.lastName
      }
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2024' || error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
