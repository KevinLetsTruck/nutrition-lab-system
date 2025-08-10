# Supabase Auth to JWT Migration Guide

## Authentication Method Changes

### 1. Getting Current User

**OLD (Supabase):**
```typescript
const { data: { user } } = await supabase.auth.getUser()
```

**NEW (JWT/Prisma):**
```typescript
// In API routes:
import { getServerSession } from '@/lib/auth'

const session = await getServerSession()
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
const user = session // Contains userId, email, role

// Or using cookies directly:
import { cookies } from 'next/headers'
import { authService } from '@/lib/auth-service'

const cookieStore = cookies()
const token = cookieStore.get('auth-token')
if (token) {
  const { valid, user } = await authService.verifyToken(token.value)
}
```

### 2. Login

**OLD (Supabase):**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

**NEW (JWT/Prisma):**
```typescript
// Using auth service
const { success, user, token, error } = await authService.login(email, password)

// Or via API endpoint
const response = await fetch('/api/auth/login-prisma', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### 3. Registration

**OLD (Supabase):**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { role: 'client' }
  }
})
```

**NEW (JWT/Prisma):**
```typescript
// Using auth service
const { success, user, error } = await authService.createUser({
  email,
  password,
  role: 'CLIENT',
  firstName,
  lastName
})

// Or via API endpoint
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, role, firstName, lastName })
})
```

### 4. Logout

**OLD (Supabase):**
```typescript
await supabase.auth.signOut()
```

**NEW (JWT/Prisma):**
```typescript
// Using auth service
await authService.logout(userId)

// Or via API endpoint
await fetch('/api/auth/logout', { method: 'POST' })
```

### 5. Session Check

**OLD (Supabase):**
```typescript
const { data: { session } } = await supabase.auth.getSession()
```

**NEW (JWT/Prisma):**
```typescript
// In server components/API routes
import { getServerSession } from '@/lib/auth'
const session = await getServerSession()

// In client components
import { useAuth } from '@/lib/auth-context'
const { user, loading } = useAuth()
```

### 6. Auth State Change Listener

**OLD (Supabase):**
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth changes
})
```

**NEW (JWT/Prisma):**
```typescript
// Use the AuthContext provider
import { useAuth } from '@/lib/auth-context'
const { user, loading, checkAuth } = useAuth()

useEffect(() => {
  checkAuth() // Manually check auth status
}, [])
```

### 7. Password Reset

**OLD (Supabase):**
```typescript
await supabase.auth.resetPasswordForEmail(email)
```

**NEW (JWT/Prisma):**
```typescript
// Implement your own password reset flow
// This is not implemented in the current auth service
// You'll need to:
// 1. Generate reset token
// 2. Send email with reset link
// 3. Verify token and update password
```

### 8. Email Verification

**OLD (Supabase):**
```typescript
// Supabase handles this automatically
```

**NEW (JWT/Prisma):**
```typescript
await authService.verifyEmail(userId)
// You'll need to implement email sending
```

## Database Query Changes

### 1. Fetching Data

**OLD (Supabase):**
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
```

**NEW (Prisma):**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    clientProfile: true,
    adminProfile: true
  }
})
```

### 2. Creating Records

**OLD (Supabase):**
```typescript
const { data, error } = await supabase
  .from('lab_results')
  .insert({ clientId, fileName })
```

**NEW (Prisma):**
```typescript
const labResult = await prisma.labResult.create({
  data: { clientId, fileName }
})
```

### 3. Updating Records

**OLD (Supabase):**
```typescript
const { data, error } = await supabase
  .from('users')
  .update({ lastLogin: new Date() })
  .eq('id', userId)
```

**NEW (Prisma):**
```typescript
const user = await prisma.user.update({
  where: { id: userId },
  data: { lastLogin: new Date() }
})
```

### 4. Deleting Records

**OLD (Supabase):**
```typescript
const { error } = await supabase
  .from('user_sessions')
  .delete()
  .eq('userId', userId)
```

**NEW (Prisma):**
```typescript
await prisma.userSession.deleteMany({
  where: { userId }
})
```

## File Storage Changes

**OLD (Supabase Storage):**
```typescript
const { data, error } = await supabase.storage
  .from('lab-documents')
  .upload(filename, file)

const { data: { publicUrl } } = supabase.storage
  .from('lab-documents')
  .getPublicUrl(filename)
```

**NEW (Placeholder - Implement S3/Local Storage):**
```typescript
// Currently returns placeholder URLs
// Implement with AWS S3, local storage, or another solution
const publicUrl = `/placeholder/${filename}`
```

## Environment Variables

**OLD:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

**NEW:**
```env
DATABASE_URL=postgresql://...@neon.tech/neondb
DIRECT_URL=postgresql://...@neon.tech/neondb
JWT_SECRET=your-secret-key
```

## Common Patterns

### Protected API Route
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check role if needed
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Your logic here
}
```

### Protected Page Component
```typescript
import { RouteGuard } from '@/components/RouteGuard'

export default function AdminPage() {
  return (
    <RouteGuard allowedRoles={['admin']}>
      {/* Your page content */}
    </RouteGuard>
  )
}
```

### Using Auth in Client Components
```typescript
'use client'

import { useAuth } from '@/lib/auth-context'

export default function MyComponent() {
  const { user, loading, logout } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>
  
  return (
    <div>
      Welcome {user.email}
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```
