# 🚂 Manual Railway Deployment - Update Existing Project

## Option A: Web Dashboard Method (Recommended)

### Step 1: Connect GitHub Repository
1. Go to [railway.app](https://railway.app) and login
2. Go to your existing project: `nutrition-lab-system-production-0fa7`
3. Click **Settings** → **Source** 
4. Connect your GitHub repository: `fntp-nutrition-system`
5. Set branch to: `recovery-stable`

### Step 2: Update Environment Variables
In Railway dashboard → **Variables** tab, update these:

```bash
# Keep existing DATABASE_URL (don't change)
DATABASE_URL=postgresql://... (keep existing)

# Update these for daily workflow
JWT_SECRET=generate-new-secure-key
NEXTAUTH_SECRET=generate-new-secure-key
NEXTAUTH_URL=https://nutrition-lab-system-production-0fa7.up.railway.app
NEXT_PUBLIC_APP_NAME=FNTP Daily Workflow
NEXT_PUBLIC_APP_URL=https://nutrition-lab-system-production-0fa7.up.railway.app
NODE_ENV=production

# Optional: Document storage (for future)
DOCUMENT_STORAGE_PROVIDER=LOCAL
```

### Step 3: Deploy
1. Railway will automatically deploy when you push to `recovery-stable` branch
2. Or click **Deploy** in the Railway dashboard

### Step 4: Update Database Schema
Once deployed, run migrations:
1. Go to Railway **Data** tab → **PostgreSQL**
2. Click **Query** button
3. Run this SQL to update schema:

```sql
-- Daily workflow schema is compatible with existing database
-- Just verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

## Option B: CLI Method (If login works)

```bash
# Try these Railway CLI commands
railway login
railway link nutrition-lab-system-production-0fa7
railway up
```

## Option C: Git Push Method

If Railway is connected to GitHub:

```bash
git add .
git commit -m "feat: Deploy daily workflow to replace AI system"
git push origin recovery-stable
```

Railway will auto-deploy from the GitHub push.

## 🎯 After Deployment

Your daily workflow will be live at:
**https://nutrition-lab-system-production-0fa7.up.railway.app**

### Create First Admin User:
```bash
curl -X POST https://nutrition-lab-system-production-0fa7.up.railway.app/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-admin@email.com",
    "password": "your-secure-password", 
    "name": "Your Name"
  }'
```

### Login and Start Using:
1. **Login**: https://nutrition-lab-system-production-0fa7.up.railway.app/login
2. **Admin Dashboard**: https://nutrition-lab-system-production-0fa7.up.railway.app/admin
3. **Add team members** and **start managing Thursday calls**!

## 🔄 What This Replaces

✅ **OUT**: AI system, assessments, complex analysis  
✅ **IN**: Daily workflow, client management, notes, documents  
✅ **Same URL**: No confusion for your team  
✅ **Same Database**: All your existing data preserved
