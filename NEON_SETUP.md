# Neon PostgreSQL Setup for Nutrition Lab System

## Quick Setup Steps

### 1. Create Neon Account
1. Go to https://neon.tech
2. Sign up for a free account (GitHub, Google, or email)
3. You'll get a free PostgreSQL database instantly

### 2. Create a New Project
1. Click "Create a project"
2. Project name: `nutrition-lab-system`
3. Database name: `nutrition` (or keep default)
4. Region: Choose closest to you
5. Click "Create project"

### 3. Get Your Connection String
After creation, you'll see a connection string like:
```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/nutrition?sslmode=require
```

### 4. Update Your Environment
Create a `.env.neon` file:
```bash
DATABASE_URL="your-neon-connection-string-here"
DIRECT_URL="your-neon-connection-string-here"
```

### 5. Push Schema to Neon
```bash
# Use the Neon database URL
npx dotenv -e .env.neon -- npx prisma db push

# Seed the database
npx dotenv -e .env.neon -- npx prisma db seed
```

### 6. Update Railway Environment
Once the schema is created in Neon, we can:
1. Export the schema from Neon
2. Import it to Railway
3. Or continue using Neon temporarily

## Benefits
- Free tier includes 3GB storage
- Instant setup
- Public connection string works from anywhere
- Full PostgreSQL compatibility
- No credit card required
