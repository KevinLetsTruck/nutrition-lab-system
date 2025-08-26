# 🚂 FNTP Daily Workflow - Railway Deployment (Original Plan)

**Based on your existing Railway configuration from ENV_CONFIG.md**

## 🎯 Quick Railway Deployment

Since Railway was your original database plan, let's use it! This will be much simpler than starting over.

### Step 1: Install Railway CLI (if needed)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Or using curl
curl -fsSL https://railway.app/install.sh | sh
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Create Railway Project (or link existing)

```bash
# Create new project
railway init

# Or if you already have a Railway project:
railway link [your-project-id]
```

### Step 4: Add Services to Railway Project

#### Add PostgreSQL Database

```bash
# Add PostgreSQL service
railway add postgresql

# Railway will automatically provide DATABASE_URL
```

#### Add Redis (for queues - optional for daily workflow)

```bash
# Add Redis service (if you need queues later)
railway add redis
```

### Step 5: Set Environment Variables

In Railway dashboard or via CLI:

```bash
# Set environment variables
railway variables set JWT_SECRET=$(openssl rand -base64 64)
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
railway variables set NODE_ENV=production
railway variables set NEXTAUTH_URL=https://your-app.up.railway.app
```

### Step 6: Deploy Database Schema

```bash
# Push database schema to Railway PostgreSQL
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

### Step 7: Deploy Application

```bash
# Deploy to Railway
railway up

# Or link to GitHub for auto-deploys
railway add github
```

## 📋 Complete Environment Variables for Railway

Based on your original `ENV_CONFIG.md`, here are the variables Railway needs:

```bash
# Database (automatically provided by Railway PostgreSQL service)
DATABASE_URL=postgresql://postgres:password@railway-host:5432/railway

# Authentication
JWT_SECRET=your-generated-jwt-secret
NEXTAUTH_URL=https://your-app.up.railway.app
NEXTAUTH_SECRET=your-nextauth-secret

# App Config
NEXT_PUBLIC_APP_NAME="FNTP Daily Workflow"
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
NODE_ENV=production

# Optional: Storage (if you want document uploads later)
# DOCUMENT_STORAGE_PROVIDER=LOCAL  # Simple file storage for now
```

## 🎉 Create First Admin User

Once deployed, create your admin user:

### Option 1: Use the API endpoint

```bash
curl -X POST https://your-app.up.railway.app/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-admin@email.com",
    "password": "your-secure-password",
    "name": "Your Name"
  }'
```

### Option 2: Direct database query

```bash
# Connect to Railway PostgreSQL
railway connect postgresql

# Run this SQL
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'admin_' || substr(md5(random()::text), 0, 10),
  'your-admin@email.com',
  'Your Name',
  '$2a$10$your_hashed_password_here',
  'ADMIN',
  NOW(),
  NOW()
);
```

## ✅ Railway Advantages

Using Railway (as originally planned) gives you:

- **Database included**: PostgreSQL + Redis if needed
- **Auto-scaling**: Handles traffic spikes automatically
- **Easy deployments**: Git-based deployments
- **Built-in monitoring**: View logs and metrics
- **Custom domains**: Easy HTTPS setup
- **One platform**: Everything in one place

## 🚀 Your App Will Be Live At:

```
https://your-project-name.up.railway.app
```

## 📞 Ready for Thursday Calls!

Once deployed:

1. **Login**: `https://your-app.up.railway.app/login`
2. **Admin Dashboard**: `https://your-app.up.railway.app/admin`
3. **Add team members** from admin dashboard
4. **Start adding clients** for this week's Thursday call
5. **Upload documents** and create notes

This follows your original Railway architecture - much cleaner than mixing platforms!
