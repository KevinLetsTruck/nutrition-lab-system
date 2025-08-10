import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

// Types
export interface User {
  id: string
  email: string
  role: 'client' | 'admin'
  emailVerified: boolean
  onboardingCompleted: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  sessionId: string
  iat: number
  exp: number
}

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '24h'
const SALT_ROUNDS = 12

export class AuthService {
  // Verify JWT token
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User; error?: string }> {
    try {
      console.log('[AuthService] Verifying token with JWT_SECRET:', JWT_SECRET)
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      console.log('[AuthService] Token decoded successfully:', decoded.userId)
      
      // Check if session exists and is valid using Prisma
      const session = await prisma.userSession.findFirst({
        where: {
          userId: decoded.userId,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      if (!session) {
        return { valid: false, error: 'Session expired' }
      }
      
      // Get user data using Prisma
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })
      
      if (!user) {
        return { valid: false, error: 'User not found' }
      }
      
      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role.toLowerCase() as 'admin' | 'client',
          emailVerified: user.emailVerified,
          onboardingCompleted: user.onboardingCompleted,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin || undefined
        }
      }
    } catch (error: any) {
      console.error('[AuthService] Token verification error:', error.message)
      return { valid: false, error: error.message || 'Invalid token' }
    }
  }

  // Create new user (for registration)
  async createUser(data: {
    email: string
    password: string
    role: 'CLIENT' | 'ADMIN'
    firstName?: string
    lastName?: string
  }): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (existingUser) {
        return { success: false, error: 'User already exists' }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)

      // Create user with profile in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash,
            role: data.role,
            emailVerified: false
          }
        })

        // Create appropriate profile
        if (data.role === 'CLIENT') {
          await tx.clientProfile.create({
            data: {
              userId: user.id,
              firstName: data.firstName || '',
              lastName: data.lastName || ''
            }
          })
        } else {
          await tx.adminProfile.create({
            data: {
              userId: user.id,
              name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Admin'
            }
          })
        }

        return user
      })

      return { success: true, user: result }
    } catch (error: any) {
      console.error('Create user error:', error)
      return { success: false, error: error.message || 'Failed to create user' }
    }
  }

  // Login user
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      // Find user with profiles
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          clientProfile: true,
          adminProfile: true
        }
      })

      if (!user) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash)
      if (!passwordValid) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })

      // Create session
      const sessionId = uuidv4()
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          sessionId
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      // Store session
      await prisma.userSession.create({
        data: {
          id: sessionId,
          userId: user.id,
          tokenHash: await bcrypt.hash(token, 10),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      })

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role.toLowerCase() as 'admin' | 'client',
          emailVerified: user.emailVerified,
          onboardingCompleted: user.onboardingCompleted,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin || undefined
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  // Logout user
  async logout(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove all sessions for user
      await prisma.userSession.deleteMany({
        where: { userId }
      })

      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message || 'Logout failed' }
    }
  }

  // Verify email
  async verifyEmail(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true }
      })

      return { success: true }
    } catch (error: any) {
      console.error('Verify email error:', error)
      return { success: false, error: error.message || 'Email verification failed' }
    }
  }

  // Update password
  async updatePassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
      
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
      })

      // Invalidate all sessions
      await prisma.userSession.deleteMany({
        where: { userId }
      })

      return { success: true }
    } catch (error: any) {
      console.error('Update password error:', error)
      return { success: false, error: error.message || 'Password update failed' }
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
