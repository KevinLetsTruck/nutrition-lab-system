# Environment File Update Guide

## IMPORTANT: Update Your Environment Files

The terminal logs show the app is still connecting to Supabase database. You need to manually update your environment files.

### 1. Update `.env` file

Replace the entire contents with:

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://neondb_owner:npg_x3p0OaeAkjYN@ep-odd-unit-afkqrpp6-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_x3p0OaeAkjYN@ep-odd-unit-afkqrpp6.us-west-2.aws.neon.tech/neondb?sslmode=require"

# Authentication
JWT_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-in-production"

# AI Services
ANTHROPIC_API_KEY="your-anthropic-api-key"
OPENAI_API_KEY="your-openai-api-key-if-needed"

# File Storage (temporary local)
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="10485760"

# App Settings
NODE_ENV="development"
```

### 2. Update `.env.local` file

Use the same content as above, but with your actual API keys.

### 3. Delete Old Variables

Remove these Supabase-related variables if they exist:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Create Upload Directory

```bash
mkdir -p public/uploads
echo "*" > public/uploads/.gitignore
```

### 5. Restart the Development Server

After updating the environment files:

```bash
# Stop the current server (Ctrl+C)
# Restart with new environment
npm run dev
```

## Verification

After restarting, the terminal should show:
- `🔗 Connecting to database at ep-odd-unit-afkqrpp6-pooler.us-west-2.aws.neon.tech`
- NOT `db.ajwudhwruxxdshqjeqij.supabase.co`

## Production Considerations

Before deploying to production:
1. Generate a secure JWT_SECRET: `openssl rand -base64 32`
2. Set up proper file storage (AWS S3 recommended)
3. Use environment-specific database URLs
4. Enable SSL for all connections
