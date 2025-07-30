# Authentication System Fix Guide

## 🔍 **Current Issues Identified**

Based on the debug endpoint (`/api/auth/debug`), the following issues were found:

### ❌ **Critical Issues**
1. **Missing DATABASE_URL** - Required for database connection
2. **Database tables don't exist** - "relation \"public.users\" does not exist"
3. **Missing NEXTAUTH_SECRET** - Required for NextAuth.js
4. **Missing NEXTAUTH_URL** - Required for NextAuth.js

### ✅ **Working Components**
- Supabase URL and keys are configured
- Email service (Resend) is configured
- JWT secret is available

## 🛠️ **Step-by-Step Fix Instructions**

### **Step 1: Run Database Migration**

The authentication tables need to be created in your Supabase database.

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the entire contents of `database/migrations/006_authentication_system.sql`
5. Paste and execute the SQL

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

### **Step 2: Add Missing Environment Variables**

Add these to your `.env.local` file:

```bash
# Database URL (get from Supabase dashboard)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random
NEXTAUTH_URL=http://localhost:3001

# For production, set to your actual domain
# NEXTAUTH_URL=https://yourdomain.vercel.app
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
# Generate a random secret
openssl rand -base64 32
```

### **Step 3: Verify Database Setup**

After running the migration, test the connection:

```bash
# Test the debug endpoint
curl http://localhost:3001/api/auth/debug

# Or visit in browser
http://localhost:3001/api/auth/debug
```

Expected response should show:
```json
{
  "status": "healthy",
  "checks": {
    "environment": {
      "databaseUrl": true,
      "supabaseUrl": true,
      "supabaseAnonKey": true,
      "supabaseServiceKey": true,
      "resendApiKey": true,
      "nextAuthSecret": true,
      "nextAuthUrl": true,
      "appUrl": true,
      "jwtSecret": true
    },
    "database": {
      "connection": true,
      "tables": {
        "users": true,
        "client_profiles": true,
        "user_sessions": true,
        "rate_limits": true
      }
    }
  }
}
```

### **Step 4: Test Registration**

Test the registration system:

```bash
# Test with sample data
curl -X POST http://localhost:3001/api/auth/test-registration \
  -H "Content-Type: application/json"
```

### **Step 5: Update Vercel Environment Variables**

For production deployment, add these to your Vercel project:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all the environment variables from `.env.local`

**Required Vercel Environment Variables:**
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://yourdomain.vercel.app
RESEND_API_KEY=re_your_resend_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
JWT_SECRET=your_jwt_secret
```

## 🧪 **Testing the Fix**

### **1. Test Database Connection**
```bash
node scripts/run-auth-migration.js
```

### **2. Test Debug Endpoint**
```bash
curl http://localhost:3001/api/auth/debug
```

### **3. Test Registration**
```bash
curl -X POST http://localhost:3001/api/auth/test-registration
```

### **4. Test Frontend Registration**
1. Visit `http://localhost:3001/auth`
2. Try to register with valid data
3. Check browser console for any errors
4. Check Network tab for API responses

## 🔧 **Troubleshooting**

### **If Database Migration Fails:**
- Check Supabase project permissions
- Ensure you're using the correct project
- Try running SQL statements individually

### **If Environment Variables Don't Work:**
- Restart the development server after adding variables
- Check for typos in variable names
- Ensure no extra spaces or quotes

### **If Registration Still Fails:**
- Check browser console for JavaScript errors
- Check Network tab for API error responses
- Check server logs for detailed error messages

### **Common Error Messages:**

**"relation \"public.users\" does not exist"**
- Solution: Run the database migration

**"Missing Supabase environment variables"**
- Solution: Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

**"NEXTAUTH_SECRET is not configured"**
- Solution: Add NEXTAUTH_SECRET to environment variables

**"Database connection failed"**
- Solution: Check DATABASE_URL and Supabase credentials

## 📋 **Verification Checklist**

- [ ] Database migration executed successfully
- [ ] All environment variables set in `.env.local`
- [ ] Debug endpoint returns "healthy" status
- [ ] Test registration works
- [ ] Frontend registration form works
- [ ] Email verification sends (if configured)
- [ ] Login functionality works
- [ ] Environment variables set in Vercel (for production)

## 🚀 **Next Steps After Fix**

1. **Test the complete authentication flow**
2. **Set up email verification**
3. **Configure admin user**
4. **Test user roles and permissions**
5. **Deploy to production**

## 📞 **Need Help?**

If you're still experiencing issues:

1. Check the debug endpoint: `/api/auth/debug`
2. Review server logs for detailed error messages
3. Test individual components using the test endpoints
4. Verify all environment variables are correctly set

The authentication system should work perfectly once the database tables are created and environment variables are properly configured! 