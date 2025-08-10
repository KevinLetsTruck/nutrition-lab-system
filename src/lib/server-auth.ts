import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface UserSession {
  id: string
  email: string
  role: string
}

export async function getServerSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any
    
    // Verify session exists in database
    const session = await prisma.userSession.findFirst({
      where: {
        userId: decoded.userId,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    })

    if (!session) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    }
  } catch (error) {
    console.error('Server session error:', error)
    return null
  }
}

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth')
  }

  if (allowedRoles && !allowedRoles.includes(session.role.toLowerCase())) {
    redirect(session.role === 'admin' ? '/clients' : '/client/dashboard')
  }

  return session
}

export async function requireAdmin() {
  return requireAuth(['admin'])
}

export async function requireClient() {
  return requireAuth(['client'])
}
