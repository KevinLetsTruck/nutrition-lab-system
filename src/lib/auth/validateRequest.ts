import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authService } from '@/lib/auth-service'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
  }
}

export async function validateRequest(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<{ valid: boolean; user?: any; error?: NextResponse }> {
  try {
    // Get token from cookie
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return {
        valid: false,
        error: NextResponse.json(
          { error: 'No authentication token found' },
          { status: 401 }
        )
      }
    }

    // Verify token
    const { valid, user, error } = await authService.verifyToken(token.value)

    if (!valid || !user) {
      return {
        valid: false,
        error: NextResponse.json(
          { error: error || 'Invalid token' },
          { status: 401 }
        )
      }
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user.role.toUpperCase()
      const allowedRolesUpper = allowedRoles.map(r => r.toUpperCase())
      
      if (!allowedRolesUpper.includes(userRole)) {
        return {
          valid: false,
          error: NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }
    }

    return { valid: true, user }
  } catch (error) {
    console.error('Request validation error:', error)
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

// Wrapper for protected API routes
export function withAuth(
  handler: (request: NextRequest, context: any, user: any) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (request: NextRequest, context: any) => {
    const { valid, user, error } = await validateRequest(request, allowedRoles)
    
    if (!valid) {
      return error!
    }

    return handler(request, context, user)
  }
}

// Example usage:
// export const GET = withAuth(async (request, context, user) => {
//   // Your protected route logic here
//   return NextResponse.json({ data: 'protected data' })
// }, ['admin'])
