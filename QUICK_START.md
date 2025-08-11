# Quick Start Guide - Database Setup

## Current Status

✅ **Completed:**
- Prisma client generated successfully
- Database schema is ready

❌ **Pending:**
- PostgreSQL database needs to be running
- Docker is not installed on your system

## Next Steps

### Option 1: Install Docker Desktop (Recommended)

1. **Download Docker Desktop for Mac:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download and install Docker Desktop
   - Start Docker Desktop application

2. **Once Docker is installed, run:**
   ```bash
   # Navigate to your project
   cd ~/fntp-nutrition-system
   
   # Start PostgreSQL database
   docker-compose up -d
   
   # Push the database schema
   npx prisma db push
   
   # Open Prisma Studio to see your database
   npx prisma studio
   ```

### Option 2: Use PostgreSQL.app (Simpler Alternative)

1. **Download PostgreSQL.app:**
   - Visit: https://postgresapp.com/
   - Download and install
   - Start the app

2. **Create your database:**
   ```bash
   # Open psql
   psql -U postgres
   
   # Run these SQL commands:
   CREATE USER fntp_admin WITH PASSWORD 'fntp_secure_pass_2024';
   CREATE DATABASE fntp_nutrition OWNER fntp_admin;
   GRANT ALL PRIVILEGES ON DATABASE fntp_nutrition TO fntp_admin;
   \q
   ```

3. **Push the schema:**
   ```bash
   npx prisma db push
   ```

### Option 3: Use Homebrew

1. **Install PostgreSQL:**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create database and user:**
   ```bash
   psql postgres
   CREATE USER fntp_admin WITH PASSWORD 'fntp_secure_pass_2024';
   CREATE DATABASE fntp_nutrition OWNER fntp_admin;
   GRANT ALL PRIVILEGES ON DATABASE fntp_nutrition TO fntp_admin;
   \q
   ```

3. **Push the schema:**
   ```bash
   npx prisma db push
   ```

## Verify Everything Works

Once your database is running:

```bash
# Push the schema
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

Prisma Studio will open in your browser showing all your database tables!

## Need Help?

- If port 5432 is already in use, you might have PostgreSQL already installed
- Check what's using the port: `lsof -i :5432`
- Stop existing PostgreSQL: `brew services stop postgresql`
