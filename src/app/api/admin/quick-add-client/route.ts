import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { EmailService } from '@/lib/email-service'

import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    // Check authentication - admin only
    const session = await getServerSession(request)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const authService = new AuthService()
    const emailService = new EmailService()

    // Parse form data
    const formData = await request.formData()
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const age = formData.get('age') as string
    const email = formData.get('email') as string
    const healthConcerns = formData.get('healthConcerns') as string
    const goals = formData.get('goals') as string
    const files = formData.getAll('files') as File[]

    // Validate required fields
    if (!firstName || !lastName || !age || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Generate a secure password for the client
    const tempPassword = Math.random().toString(36).slice(-8) + 
                        Math.random().toString(36).toUpperCase().slice(-4) + 
                        Math.floor(Math.random() * 10) + 
                        '!'

    // Hash the password
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    // Create user account with client profile in a transaction
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
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
            userId: user.id,
            firstName,
            lastName,
            onboardingData: {
              age: parseInt(age),
              healthConcerns,
              goals,
              addedBy: 'admin_quick_add'
            }
          }
        })

        // Also create a client record for lab reports
        const client = await tx.client.create({
          data: {
            email,
            firstName,
            lastName
          }
        })

        return { user, clientProfile, client }
      })

      const userId = result.user.id

      // TODO: Implement file upload with new storage solution
      // For now, file uploads are disabled
      if (files.length > 0) {
        console.log(`Skipping upload of ${files.length} files - storage not implemented yet`)
      }

      // Send welcome email with login credentials
      try {
        const welcomeEmailSent = await emailService.sendWelcomeEmail(
          email,
          firstName,
          tempPassword
        )

        if (!welcomeEmailSent) {
          console.warn('Failed to send welcome email, but client was created successfully')
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError)
        // Don't fail the entire operation if email fails
      }

      // Start email sequence
      try {
        await emailService.startEmailSequence(userId, 'welcome')
      } catch (sequenceError) {
        console.error('Error starting email sequence:', sequenceError)
      }

      return NextResponse.json({
        success: true,
        message: 'Client created successfully',
        userId,
        tempPassword // Only return in development
      })
    } catch (error) {
      console.error('Error creating user:', error)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in quick-add client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 