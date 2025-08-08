## Railway PostgreSQL Setup (End-to-End)

This guide takes you from zero to a working PostgreSQL database on Railway, connected to this app. It’s designed to be copy/paste friendly and error-proof.

### Prerequisites
- GitHub account
- Node.js 18+ installed locally (`node -v`)
- Terminal (macOS, Linux, or Windows with WSL)

### 1) Create a Railway Account and Project
1. Go to `https://railway.app` and sign up with GitHub.
2. Click “New Project”.
   - If your GitHub repo is ready, choose “Deploy from GitHub” and select this repository.
   - Otherwise create an empty project now; you can link the repo later.

### 2) Install Railway CLI
Run ONE of the following:
- macOS (Homebrew): `brew install railway`
- Shell installer (any OS): `curl -fsSL https://railway.app/install.sh | sh`

Verify install: `railway --version`

### 3) Login and Link Your Project Locally
1. Log in: `railway login` and follow the prompt.
2. In your local repo folder run: `railway link` and select the correct project.
   - If you don’t have a project yet, run `railway init` to create and link one.

### 4) Provision PostgreSQL in Railway
1. In the Railway dashboard, inside your project, click “New” → “Database” → “PostgreSQL”.
2. Wait for the service status to show “Running”.
3. Click your PostgreSQL service → “Variables” tab. You should see:
   - `DATABASE_URL`
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### 5) Retrieve and Prepare Connection Strings
Copy the `DATABASE_URL` from the PostgreSQL service. It typically looks like:

```
postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway
```

This app uses two flavors of the URL:
- Pooled (recommended for app runtime): append `?sslmode=require&connection_limit=10&pool_timeout=30`
- Direct/Unpooled (for migrations): append `?sslmode=require`

### 6) Configure App Environment Variables (App Service)
Set these on your APP service (not the DB service) in Railway → Variables:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require&connection_limit=10&pool_timeout=30
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require

# Optional: individual fields (handy for debugging/tools)
RAILWAY_POSTGRES_HOST=containers-us-west-XXX.railway.app
RAILWAY_POSTGRES_PORT=5432
RAILWAY_POSTGRES_USER=postgres
RAILWAY_POSTGRES_PASSWORD=YOUR_PASSWORD
RAILWAY_POSTGRES_DATABASE=railway
```

Tip: You can also set variables from your terminal once linked:
```
railway variables set DATABASE_URL="..."
railway variables set DIRECT_URL="..."
```

### 7) Deploy and Run Migrations
1. Push to `main` (or click “Deploy”) to trigger a new deploy.
2. After the app is running, run Prisma migrations:
   - One‑time deploy command or shell: `npx prisma migrate deploy`

### 8) Verify Everything
- Check health endpoints:
  - `/api/health-check`
  - `/api/db-health`
- Ensure logs do NOT show:
  - “DATABASE_URL is missing connection pool settings”
  - “FATAL: Tenant or user not found”

### 9) Local Development (Optional)
Create `.env.local` for local builds (do not commit this file):
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require&connection_limit=10&pool_timeout=30
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require
```

### Troubleshooting
- “DATABASE_URL is missing connection pool settings” → Ensure pooled URL includes `connection_limit` and `pool_timeout`.
- “FATAL: Tenant or user not found” → The credentials/host are incorrect or point to the wrong service. Re-copy from the PostgreSQL service.
- Variables must be on the APP service. Setting them on the DB service alone will not configure your app.
- If CLI actions ask for interactive choices in CI, run them locally first to link and create resources, then commit and push.
