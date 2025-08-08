#!/usr/bin/env node

/**
 * Railway PostgreSQL Database Setup Script
 * 
 * This script helps migrate from Supabase to Railway's PostgreSQL
 * Run this after creating a PostgreSQL service in Railway
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Railway PostgreSQL Setup Script\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from the project root directory');
  process.exit(1);
}

console.log('📋 Prerequisites:');
console.log('1. Create a PostgreSQL service in your Railway project');
console.log('2. Get the DATABASE_URL from Railway PostgreSQL Variables tab');
console.log('3. Set these environment variables in Railway:\n');

console.log('Required Environment Variables:');
console.log('--------------------------------');
console.log('DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require&connection_limit=10&pool_timeout=30');
console.log('DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require');
console.log('\nKeep your existing variables:');
console.log('ANTHROPIC_API_KEY=sk-ant-api03-xxxxx...');
console.log('NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...');
console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...\n');

console.log('📝 Migration Steps:');
console.log('1. Set the environment variables above in Railway');
console.log('2. The deployment will automatically restart');
console.log('3. Run database migrations after deployment succeeds');
console.log('\n🔄 To run migrations after deployment:');
console.log('npx prisma migrate deploy');

console.log('\n📊 Database Schema Information:');
console.log('The Prisma schema includes these models:');
console.log('- User (authentication)');
console.log('- ClientProfile');
console.log('- AdminProfile');
console.log('- UserSession');
console.log('- EmailVerification');
console.log('- RateLimit');
console.log('- Client (for lab reports)');
console.log('- LabReport');

console.log('\n✅ Benefits of Railway PostgreSQL:');
console.log('- Native integration with Railway');
console.log('- No external network issues');
console.log('- Better performance and reliability');
console.log('- Automatic backups');
console.log('- Easy scaling');

console.log('\n🔧 Troubleshooting:');
console.log('- If deployment fails, check Railway logs');
console.log('- Ensure PostgreSQL service is running');
console.log('- Verify environment variables are set correctly');
console.log('- Check that connection string includes required parameters');

console.log('\n📚 Additional Resources:');
console.log('- Railway PostgreSQL docs: https://docs.railway.app/databases/postgresql');
console.log('- Prisma docs: https://www.prisma.io/docs');
console.log('- Project setup guide: PRISMA_RAILWAY_SETUP.md');

console.log('\n✨ Once environment variables are set, Railway will:');
console.log('1. Automatically redeploy your application');
console.log('2. Connect to the Railway PostgreSQL database');
console.log('3. Initialize Prisma with the correct connection');

console.log('\n');
