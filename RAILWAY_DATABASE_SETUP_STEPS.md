# Railway Database Setup - Step by Step

## Current Issue
Your deployment is failing because it's trying to connect to a Supabase database using Prisma, but the connection string isn't working ("Tenant or user not found").

## Solution: Use Railway's PostgreSQL

### Step 1: Create PostgreSQL Service in Railway

1. Go to your Railway project dashboard
2. Click the "+ New" button
3. Select "Database" 
4. Choose "PostgreSQL"
5. Railway will create a PostgreSQL instance

### Step 2: Get Database Credentials

1. Click on your new PostgreSQL service
2. Go to the "Variables" tab
3. You'll see a `DATABASE_URL` - copy this value
4. It will look like: `postgresql://postgres:SOME_PASSWORD@containers-us-west-XXX.railway.app:5432/railway`

### Step 3: Set Environment Variables in Your App Service

1. Click on your main app service (not the PostgreSQL service)
2. Go to the "Variables" tab
3. Add these variables:

```bash
# Take the DATABASE_URL from PostgreSQL service and add connection parameters
DATABASE_URL=postgresql://postgres:PASTE_PASSWORD_HERE@containers-us-west-XXX.railway.app:5432/railway?sslmode=require&connection_limit=10&pool_timeout=30

# Same URL but only with sslmode for migrations
DIRECT_URL=postgresql://postgres:PASTE_PASSWORD_HERE@containers-us-west-XXX.railway.app:5432/railway?sslmode=require

# Keep your existing Anthropic key
ANTHROPIC_API_KEY=sk-ant-api03-[your-existing-key]

# Keep your existing Supabase credentials (for auth)
NEXT_PUBLIC_SUPABASE_URL=https://qbnmcbtcxzpdbnbegxvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFibm1jYnRjeHpwZGJuYmVneHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MzE0NDAsImV4cCI6MjA0NzEwNzQ0MH0.HFr_xz3ZJJp-W5gVKdmEQ7Zo5aIK4fM4k8CMFrMWkNE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFibm1jYnRjeHpwZGJuYmVneHZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTUzMTQ0MCwiZXhwIjoyMDQ3MTA3NDQwfQ.LTuaKJCpwqFBW9oNu0n3z3N-K4SPZJDQ-d2PHJY9vdY
```

### Step 4: Deploy and Initialize Database

1. After setting variables, Railway will automatically redeploy
2. Wait for the deployment to complete (check logs)
3. Once deployed, you need to run migrations

### Step 5: Run Database Migrations

Option A - Using Railway's Command Interface:
1. In your app service, go to the "Settings" tab
2. Find "Deploy" section
3. Add a deploy command: `npx prisma migrate deploy`

Option B - Manual Migration:
1. After deployment succeeds, you can connect to the database and run the SQL scripts from the `database/migrations` folder

### What This Fixes

1. **Prisma Connection**: Your app will now connect to Railway's PostgreSQL instead of trying to reach Supabase
2. **Network Issues**: No more external network problems since both services are in Railway
3. **Performance**: Better performance with services in the same network

### Verification

After deployment:
1. Check the deployment logs for any errors
2. Visit: `https://your-app.railway.app/api/health-check`
3. Visit: `https://your-app.railway.app/api/db-health`

### Important Notes

- The system uses **Railway PostgreSQL** for data storage (via Prisma)
- The system still uses **Supabase** for authentication
- Both services work together - Supabase for auth, Railway for data
