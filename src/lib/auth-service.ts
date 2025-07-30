import { createServerSupabaseClient } from './supabase'
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

export interface ClientProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone?: string
  onboardingData?: any
  consultationStatus: 'pending' | 'scheduled' | 'completed'
  emailSequenceStatus: string[]
  createdAt: Date
  updatedAt: Date
}

export interface AdminProfile {
  id: string
  userId: string
  name: string
  title?: string
  specializations: string[]
  clientCapacity: number
  activeSessions: number
  createdAt: Date
  updatedAt: Date
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  sessionId: string
  iat: number
  exp: number
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '24h'
const SALT_ROUNDS = 12
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

export class AuthService {
  private supabase = createServerSupabaseClient()

  // Password validation
  private validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Rate limiting
  private async checkRateLimit(identifier: string, action: string): Promise<{ allowed: boolean; remainingAttempts: number }> {
    const now = new Date()
    const windowStart = new Date(now.getTime() - 60 * 60 * 1000) // 1 hour window
    
    // Check if user is blocked
    const { data: blocked } = await this.supabase
      .from('rate_limits')
      .select('blocked_until')
      .eq('identifier', identifier)
      .eq('action', action)
      .not('blocked_until', 'is', null)
      .single()
    
    if (blocked && new Date(blocked.blocked_until) > now) {
      return { allowed: false, remainingAttempts: 0 }
    }
    
    // Get current attempts in window
    const { data: attempts } = await this.supabase
      .from('rate_limits')
      .select('attempts')
      .eq('identifier', identifier)
      .eq('action', action)
      .gte('window_start', windowStart.toISOString())
      .single()
    
    const currentAttempts = attempts?.attempts || 0
    
    if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
      // Block user
      await this.supabase
        .from('rate_limits')
        .upsert({
          identifier,
          action,
          attempts: currentAttempts + 1,
          window_start: now.toISOString(),
          window_end: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
          blocked_until: new Date(now.getTime() + LOCKOUT_DURATION).toISOString()
        })
      
      return { allowed: false, remainingAttempts: 0 }
    }
    
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - currentAttempts }
  }

  private async incrementRateLimit(identifier: string, action: string): Promise<void> {
    const now = new Date()
    const windowEnd = new Date(now.getTime() + 60 * 60 * 1000)
    
    await this.supabase
      .from('rate_limits')
      .upsert({
        identifier,
        action,
        attempts: 1,
        window_start: now.toISOString(),
        window_end: windowEnd.toISOString()
      }, {
        onConflict: 'identifier,action',
        ignoreDuplicates: false
      })
  }

  // User registration
  async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validate password
      const passwordValidation = this.validatePassword(data.password)
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') }
      }
      
      // Check rate limiting
      const rateLimit = await this.checkRateLimit(data.email, 'register')
      if (!rateLimit.allowed) {
        return { success: false, error: 'Too many registration attempts. Please try again later.' }
      }
      
      // Check if user already exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .single()
      
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' }
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)
      
      // Create user
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .insert({
          email: data.email.toLowerCase(),
          password_hash: passwordHash,
          role: 'client'
        })
        .select()
        .single()
      
      if (userError) throw userError
      
      // Create client profile
      const { error: profileError } = await this.supabase
        .from('client_profiles')
        .insert({
          user_id: user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone
        })
      
      if (profileError) throw profileError
      
      // Increment rate limit
      await this.incrementRateLimit(data.email, 'register')
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.email_verified,
          onboardingCompleted: user.onboarding_completed,
          createdAt: new Date(user.created_at),
          lastLogin: user.last_login ? new Date(user.last_login) : undefined
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }

  // User login
  async login(data: LoginData): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    try {
      // Check rate limiting
      const rateLimit = await this.checkRateLimit(data.email, 'login')
      if (!rateLimit.allowed) {
        return { success: false, error: 'Too many login attempts. Please try again later.' }
      }
      
      // Get user with profile
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select(`
          *,
          client_profiles (*)
        `)
        .eq('email', data.email.toLowerCase())
        .single()
      
      if (userError || !user) {
        await this.incrementRateLimit(data.email, 'login')
        return { success: false, error: 'Invalid email or password' }
      }
      
      // Verify password
      const passwordValid = await bcrypt.compare(data.password, user.password_hash)
      if (!passwordValid) {
        await this.incrementRateLimit(data.email, 'login')
        return { success: false, error: 'Invalid email or password' }
      }
      
      // Check if email is verified (for clients) - bypass in development mode
      if (user.role === 'client' && !user.email_verified && process.env.NODE_ENV === 'production') {
        return { success: false, error: 'Please verify your email before logging in' }
      }
      
      // Update last login
      await this.supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)
      
      // Generate JWT token
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
      await this.supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          token_hash: await bcrypt.hash(token, 10), // Hash token for storage
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
      
      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.email_verified,
          onboardingCompleted: user.onboarding_completed,
          createdAt: new Date(user.created_at),
          lastLogin: new Date()
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User; error?: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      
      // Check if session exists and is valid
      const { data: sessions } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', decoded.userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
      
      const session = sessions?.[0]
      
      if (!session) {
        return { valid: false, error: 'Session expired' }
      }
      
      // Get user data
      const { data: user } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single()
      
      if (!user) {
        return { valid: false, error: 'User not found' }
      }
      
      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.email_verified,
          onboardingCompleted: user.onboarding_completed,
          createdAt: new Date(user.created_at),
          lastLogin: user.last_login ? new Date(user.last_login) : undefined
        }
      }
    } catch (error) {
      return { valid: false, error: 'Invalid token' }
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<{ success: boolean; profile?: ClientProfile | AdminProfile; error?: string }> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (!user) {
        return { success: false, error: 'User not found' }
      }
      
      if (user.role === 'client') {
        const { data: profile } = await this.supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (!profile) {
          return { success: false, error: 'Client profile not found' }
        }
        
        return {
          success: true,
          profile: {
            id: profile.id,
            userId: profile.user_id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            phone: profile.phone,
            onboardingData: profile.onboarding_data,
            consultationStatus: profile.consultation_status,
            emailSequenceStatus: profile.email_sequence_status || [],
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at)
          }
        }
      } else {
        const { data: profile } = await this.supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (!profile) {
          return { success: false, error: 'Admin profile not found' }
        }
        
        return {
          success: true,
          profile: {
            id: profile.id,
            userId: profile.user_id,
            name: profile.name,
            title: profile.title,
            specializations: profile.specializations || [],
            clientCapacity: profile.client_capacity,
            activeSessions: profile.active_sessions,
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at)
          }
        }
      }
    } catch (error) {
      console.error('Get profile error:', error)
      return { success: false, error: 'Failed to get user profile' }
    }
  }

  // Logout (invalidate session)
  async logout(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      
      // Remove session
      await this.supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', decoded.userId)
        .eq('token_hash', await bcrypt.hash(token, 10))
      
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Logout failed' }
    }
  }

  // Email verification
  async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: 'email_verification' }
      
      if (decoded.type !== 'email_verification') {
        return { success: false, error: 'Invalid verification token' }
      }
      
      await this.supabase
        .from('users')
        .update({ email_verified: true })
        .eq('id', decoded.userId)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Invalid or expired verification token' }
    }
  }

  // Generate email verification token
  generateEmailVerificationToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'email_verification' },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
  }

  // Password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()
      
      if (!user) {
        return { success: false, error: 'User not found' }
      }
      
      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      )
      
      // Store reset token (you might want to add a reset_tokens table)
      // For now, we'll just return success
      
      return { success: true }
    } catch (error) {
      console.error('Password reset request error:', error)
      return { success: false, error: 'Failed to process password reset request' }
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: 'password_reset' }
      
      if (decoded.type !== 'password_reset') {
        return { success: false, error: 'Invalid reset token' }
      }
      
      // Validate new password
      const passwordValidation = this.validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') }
      }
      
      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
      
      // Update password
      await this.supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', decoded.userId)
      
      // Invalidate all sessions
      await this.supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', decoded.userId)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Invalid or expired reset token' }
    }
  }
}

// Export singleton instance
export const authService = new AuthService() 