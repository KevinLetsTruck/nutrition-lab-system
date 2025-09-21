# 🚂 Railway Deployment - Alternative Methods

Since CLI authentication is having issues, here are working alternatives:

## Option 1: Railway Web Dashboard (One-by-One Variables)

Go to Railway Dashboard → **nutrition-lab-system-production-0fa7** → **Variables**

Add these **one at a time** (this often works better than batch):

```bash
# Variable 1
JWT_SECRET = z6vplXmv6Zubi0Zl695b696pgd8umPL2iNfHwntx9UU8rhEvskcb6nXNPcRl1ZjtKCbAa9IISr0uki85gIYNUQ==

# Variable 2
NEXTAUTH_SECRET = GioCopf7DKF+FcyIjtjhgL+W7k31KClzLuP0RPNbw64=

# Variable 3
NEXTAUTH_URL = https://nutrition-lab-system-production-0fa7.up.railway.app

# Variable 4
NEXT_PUBLIC_APP_NAME = FNTP Daily Workflow

# Variable 5
NEXT_PUBLIC_APP_URL = https://nutrition-lab-system-production-0fa7.up.railway.app

# Variable 6
NODE_ENV = production
```

## Option 2: Railway API Token Method

1. Go to Railway → Settings → Tokens → Create new token
2. Export the token: `export RAILWAY_TOKEN=your_token_here`
3. Then CLI should work:
   ```bash
   railway link
   railway variables set JWT_SECRET="z6vplXmv6Zubi0Zl695b696pgd8umPL2iNfHwntx9UU8rhEvskcb6nXNPcRl1ZjtKCbAa9IISr0uki85gIYNUQ=="
   # ... continue with other variables
   ```

## Option 3: GitHub Auto-Deploy

1. **Push to GitHub** (already done)
2. **Railway Dashboard** → **Settings** → **Source** → **Connect Repo**
3. **Connect**: fntp-nutrition-system repository
4. **Branch**: recovery-stable
5. **Auto-deploy**: Railway deploys automatically when you push

## Option 4: Manual Deploy via Railway UI

1. **Upload ZIP**: Download repository as ZIP, upload to Railway
2. **Set variables** via web interface
3. **Deploy** manually

## Current Status

✅ **Code Ready**: All daily workflow code committed  
✅ **Database Exists**: Your PostgreSQL is already running on Railway  
✅ **Environment Variables Generated**: Secure keys created  
⏳ **Need**: Variables set and deployment triggered

## Recommended: Try Option 2 (API Token)

This usually bypasses CLI authentication issues while still allowing batch variable setting.
