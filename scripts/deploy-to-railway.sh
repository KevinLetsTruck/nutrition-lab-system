#!/bin/bash

# FNTP Daily Workflow - Railway Deployment Script
# Based on original ENV_CONFIG.md Railway setup

echo "🚂 FNTP Daily Workflow - Railway Deployment"
echo "============================================"
echo "Using original Railway configuration from ENV_CONFIG.md"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Step 1: Login to Railway"
echo "If you don't have an account, visit: https://railway.app"
echo ""
railway login

echo ""
echo "🚂 Step 2: Create or Link Railway Project"
echo ""
read -p "Do you have an existing Railway project? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Link existing project:"
    echo "1. Find your project ID at railway.app"
    echo "2. Run: railway link [project-id]"
    read -p "Enter your project ID: " PROJECT_ID
    railway link "$PROJECT_ID"
else
    echo "Creating new Railway project..."
    railway init
fi

echo ""
echo "🗄️  Step 3: Add PostgreSQL Database"
echo ""
railway add postgresql
echo "✅ PostgreSQL added! DATABASE_URL will be automatically provided."

echo ""
echo "🔧 Step 4: Set Environment Variables"
echo ""

# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 64)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "Setting environment variables..."
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET" 
railway variables set NODE_ENV="production"
railway variables set NEXT_PUBLIC_APP_NAME="FNTP Daily Workflow"

echo ""
echo "📋 Getting your Railway app URL..."
RAILWAY_URL=$(railway status --json 2>/dev/null | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

if [ -z "$RAILWAY_URL" ]; then
    echo "⏳ Railway URL not ready yet. We'll set it after deployment."
    RAILWAY_URL="https://your-app.up.railway.app"
else
    echo "✅ Railway URL: $RAILWAY_URL"
fi

railway variables set NEXTAUTH_URL="$RAILWAY_URL"
railway variables set NEXT_PUBLIC_APP_URL="$RAILWAY_URL"

echo ""
echo "🔄 Step 5: Deploy Database Schema"
echo ""
npx prisma generate
npx prisma db push

echo ""
echo "🚀 Step 6: Deploy Application"
echo ""

# Commit any pending changes
git add .
git commit -m "feat: Deploy to Railway with original configuration" || true

# Deploy to Railway
railway up

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "====================="
echo ""
echo "Your app is live at: $RAILWAY_URL"
echo ""
echo "📋 Next steps:"
echo "   1. Create first admin user"
echo "   2. Access admin dashboard: $RAILWAY_URL/admin"
echo "   3. Add team members"
echo "   4. Start adding clients for Thursday calls"
echo ""
echo "🔧 Create admin user:"
echo "   curl -X POST $RAILWAY_URL/api/auth/create-admin \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"email\":\"your-admin@email.com\",\"password\":\"your-password\",\"name\":\"Your Name\"}'"
echo ""
echo "🎯 Using Railway (as originally planned) gives you:"
echo "   ✅ PostgreSQL database included"
echo "   ✅ Auto-scaling and monitoring"
echo "   ✅ Easy deployments from Git"
echo "   ✅ Custom domain support"
echo ""
