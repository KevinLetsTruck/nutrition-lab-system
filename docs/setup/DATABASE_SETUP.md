# Database Setup Guide

## Prerequisites

### 1. Install Docker Desktop for Mac
Download and install Docker Desktop from: https://www.docker.com/products/docker-desktop/

### 2. Alternative: Use a Local PostgreSQL Installation
If you prefer not to use Docker, you can install PostgreSQL directly:
- Download from: https://www.postgresql.org/download/macosx/
- Or use Homebrew: `brew install postgresql@15`

## Using Docker (Recommended)

Once Docker is installed:

1. **Start the database:**
   ```bash
   docker-compose up -d
   ```

2. **Check if it's running:**
   ```bash
   docker-compose ps
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

## Using Local PostgreSQL

1. **Create the database and user:**
   ```sql
   CREATE USER fntp_admin WITH PASSWORD 'fntp_secure_pass_2024';
   CREATE DATABASE fntp_nutrition OWNER fntp_admin;
   GRANT ALL PRIVILEGES ON DATABASE fntp_nutrition TO fntp_admin;
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

## Verify Database Connection

1. **Test with Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   This will open a web interface to view your database tables.

2. **Or use the database push command (for development):**
   ```bash
   npx prisma db push
   ```

## Common Issues

### Port 5432 Already in Use
If you get an error about port 5432 being in use, you might have PostgreSQL already running locally. Either:
- Stop the local PostgreSQL service
- Or change the port in docker-compose.yml and .env file

### Connection Refused
Make sure:
- Docker/PostgreSQL is running
- The DATABASE_URL in .env matches your setup
- No firewall is blocking port 5432
