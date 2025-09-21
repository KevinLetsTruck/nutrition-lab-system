# 🚀 FNTP Daily Workflow - Production Deployment Guide

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- Production database (Neon, Railway, or Vercel Postgres)

## 🎯 Step 1: Database Setup

### Option A: Neon PostgreSQL (Recommended - Free Tier)

1. Go to [Neon.tech](https://neon.tech)
2. Create free account
3. Create new project: "FNTP Daily Workflow"
4. Copy the connection string (it looks like):
   ```
   postgresql://username:password@hostname.neon.tech/fntp_nutrition_system?sslmode=require
   ```
5. Save this connection string - you'll need it for Vercel

### Option B: Railway PostgreSQL

1. Go to [Railway.app](https://railway.app)
2. Create account and new project
3. Add PostgreSQL database
4. Get connection string from Railway dashboard

## 🚀 Step 2: Deploy to Vercel

### 2.1 Push to GitHub
```bash
# Make sure all changes are committed
git add .
git commit -m "feat: Ready for production deployment"
git push origin recovery-stable
```

### 2.2 Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. **IMPORTANT**: Set these environment variables:

```env
DATABASE_URL=your_neon_or_railway_connection_string
JWT_SECRET=generate-a-secure-64-character-random-string
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=another-secure-random-string
```

### 2.3 Generate Secure Secrets
```bash
# Generate JWT secret (run locally)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use this online: https://generate-secret.vercel.app/64
```

## 📊 Step 3: Database Migration

After deployment, run database migrations:

1. Go to your Vercel dashboard
2. Open your project
3. Go to Functions tab
4. Run this command in Vercel CLI or create a deployment script:

```bash
# Install Vercel CLI locally if needed
npm i -g vercel

# Login and deploy
vercel login
vercel --prod

# Run migrations (you'll need to do this once)
npx prisma migrate deploy
npx prisma generate
```

## 👤 Step 4: Create First Admin User

### Method 1: API Endpoint (Recommended)
Once deployed, visit:
```
https://your-app-name.vercel.app/api/auth/create-admin
```

Send POST request with:
```json
{
  "email": "your-admin@email.com",
  "password": "your-secure-password",
  "name": "Your Admin Name"
}
```

### Method 2: Direct Database Script
Create admin user directly in your Neon/Railway database:

```sql
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'admin_' || generate_random_uuid(),
  'your-admin@email.com',
  'Your Admin Name',
  '$2a$10$your_bcrypt_hashed_password_here',
  'ADMIN',
  NOW(),
  NOW()
);
```

## 🛠️ Step 5: Admin Dashboard Access

1. Login to your app: `https://your-app-name.vercel.app/login`
2. Access admin dashboard: `https://your-app-name.vercel.app/admin`
3. Create additional users from the admin dashboard

## ✅ Step 6: Production Testing Checklist

Test these features in production:

- [ ] User login/logout
- [ ] Client creation and editing
- [ ] Document upload and viewing
- [ ] Note creation and viewing
- [ ] Thursday Calls page
- [ ] Admin dashboard
- [ ] User management
- [ ] Responsive design on mobile

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npx prisma db pull
npx prisma generate
```

### Environment Variables
- Check Vercel dashboard → Project Settings → Environment Variables
- Make sure DATABASE_URL is correct
- Verify JWT_SECRET is set

### Build Errors
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify TypeScript compiles: `npm run build`

## 🎉 You're Live!

Your FNTP Daily Workflow app is now live at:
`https://your-app-name.vercel.app`

### Next Steps:
1. Create admin accounts for your team
2. Start adding clients for this week's call
3. Upload client documents
4. Schedule Thursday calls

## 📧 Support

If you encounter issues:
1. Check Vercel function logs
2. Check database connection in Neon/Railway dashboard
3. Verify all environment variables are set correctly
