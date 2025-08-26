#!/bin/bash

# Railway Environment Variables Setup Script
echo "🚂 Setting up Railway environment variables..."

# Authentication variables
echo "Setting JWT_SECRET..."
railway variables set JWT_SECRET="z6vplXmv6Zubi0Zl695b696pgd8umPL2iNfHwntx9UU8rhEvskcb6nXNPcRl1ZjtKCbAa9IISr0uki85gIYNUQ=="

echo "Setting NEXTAUTH_SECRET..."
railway variables set NEXTAUTH_SECRET="GioCopf7DKF+FcyIjtjhgL+W7k31KClzLuP0RPNbw64="

# App configuration
echo "Setting NEXTAUTH_URL..."
railway variables set NEXTAUTH_URL="https://nutrition-lab-system-production-0fa7.up.railway.app"

echo "Setting NEXT_PUBLIC_APP_NAME..."
railway variables set NEXT_PUBLIC_APP_NAME="FNTP Daily Workflow"

echo "Setting NEXT_PUBLIC_APP_URL..."
railway variables set NEXT_PUBLIC_APP_URL="https://nutrition-lab-system-production-0fa7.up.railway.app"

echo "Setting NODE_ENV..."
railway variables set NODE_ENV="production"

echo "✅ All environment variables set!"
echo ""
echo "🔄 Triggering deployment..."
railway up --detach

echo ""
echo "🎉 Deployment initiated! Your daily workflow will be live at:"
echo "https://nutrition-lab-system-production-0fa7.up.railway.app"
