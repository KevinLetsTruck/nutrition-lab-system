# Prisma + Railway PostgreSQL Setup Guide

## 🚀 Quick Start

### 1. Get Your Railway PostgreSQL Connection String

1. Go to your Railway dashboard
2. Click on your PostgreSQL service
3. Go to the "Variables" tab
4. Copy the `DATABASE_URL` value

Your connection string should look like:
```
postgresql://postgres:PASSWORD@containers-us-west-123.railway.app:5432/railway
```

### 2. Update Your Environment Variables

Add these to your Railway environment variables:

```bash
# Primary connection URL (with connection pooling)
DATABASE_URL=postgresql://postgres:PASSWORD@containers-us-west-123.railway.app:5432/railway?sslmode=require&connection_limit=10&pool_timeout=30

# Direct connection URL (for migrations)
DIRECT_URL=postgresql://postgres:PASSWORD@containers-us-west-123.railway.app:5432/railway?sslmode=require
```

**Important Railway-specific settings:**
- `connection_limit=10` - Railway recommends max 10 connections
- `pool_timeout=30` - 30 second timeout for connection pool
- `sslmode=require` - SSL is required for Railway PostgreSQL

### 3. Generate Prisma Client

```bash
# Pull existing database schema
npm run db:pull

# Generate Prisma Client
npm run db:generate
```

### 4. Verify Connection

Test your database connection:

```typescript
// test-connection.ts
import { prisma, checkDatabaseHealth } from './src/lib/prisma'

async function test() {
  const health = await checkDatabaseHealth()
  console.log('Database health:', health)
  
  const userCount = await prisma.user.count()
  console.log('Total users:', userCount)
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

## 🔄 Migrating from Supabase Client to Prisma

### Before (Supabase):
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single()
```

### After (Prisma):
```typescript
const user = await prisma.user.findUnique({
  where: { email },
  include: { clientProfile: true }
})
```

### Common Operations Reference:

#### Create User
```typescript
// Supabase
const { data, error } = await supabase
  .from('users')
  .insert({ email, password_hash })
  .select()
  .single()

// Prisma
const user = await prisma.user.create({
  data: { 
    email, 
    passwordHash,
    clientProfile: {
      create: { firstName, lastName, phone }
    }
  },
  include: { clientProfile: true }
})
```

#### Update User
```typescript
// Supabase
const { data, error } = await supabase
  .from('users')
  .update({ last_login: new Date() })
  .eq('id', userId)

// Prisma
const user = await prisma.user.update({
  where: { id: userId },
  data: { lastLogin: new Date() }
})
```

#### Delete User
```typescript
// Supabase
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId)

// Prisma
await prisma.user.delete({
  where: { id: userId }
})
```

#### Transactions
```typescript
// Prisma supports transactions (Supabase doesn't)
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email, passwordHash }
  })
  
  const profile = await tx.clientProfile.create({
    data: { userId: user.id, firstName, lastName }
  })
  
  return { user, profile }
})
```

## 🛠️ Development Workflow

### 1. Make Schema Changes
Edit `prisma/schema.prisma`

### 2. Create Migration
```bash
npm run db:migrate:dev -- --name your_migration_name
```

### 3. Push to Production
```bash
npm run db:push
```

### 4. View Database
```bash
npm run db:studio
```

## ⚡ Performance Optimizations for Railway

### 1. Connection Pooling
The Prisma client is configured with:
- Retry logic for connection failures
- Connection pool limits suitable for Railway
- Graceful shutdown handling

### 2. Query Optimization
```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    clientProfile: {
      select: {
        firstName: true,
        lastName: true
      }
    }
  }
})

// Use pagination
const users = await prisma.user.findMany({
  skip: 0,
  take: 20,
  orderBy: { createdAt: 'desc' }
})
```

### 3. Indexes
Add indexes for frequently queried fields:
```prisma
model User {
  // ... fields
  
  @@index([email])
  @@index([createdAt])
}
```

## 🔧 Troubleshooting

### Connection Refused
```
Error: P1001: Can't reach database server
```
**Solution**: Check your DATABASE_URL and ensure Railway PostgreSQL is active

### Too Many Connections
```
Error: P2024: Too many connections
```
**Solution**: Reduce connection_limit in DATABASE_URL or check for connection leaks

### SSL Connection Required
```
Error: SSL connection is required
```
**Solution**: Add `?sslmode=require` to your DATABASE_URL

### Migration Issues
```
Error: P3014: Prisma Migrate could not create the shadow database
```
**Solution**: Use DIRECT_URL for migrations, not the pooled DATABASE_URL

## 📋 Checklist

- [ ] Installed Prisma packages
- [ ] Created `prisma/schema.prisma`
- [ ] Created `src/lib/prisma.ts` with singleton pattern
- [ ] Updated `package.json` with database scripts
- [ ] Set DATABASE_URL in Railway with connection pool settings
- [ ] Set DIRECT_URL in Railway for migrations
- [ ] Generated Prisma Client
- [ ] Tested database connection
- [ ] Updated authentication code to use Prisma
- [ ] Added `postinstall` script for Railway deployments

## 🚢 Deploy to Railway

1. Commit all changes
2. Push to GitHub
3. Railway will automatically:
   - Install dependencies
   - Run `postinstall` (generates Prisma Client)
   - Build your Next.js app
   - Start the server

The Prisma client will use the DATABASE_URL from Railway's environment variables automatically.
