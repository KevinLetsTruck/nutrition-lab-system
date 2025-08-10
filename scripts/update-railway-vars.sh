#!/bin/bash

# Railway environment variables setup script
echo "🚀 Setting up Railway environment variables..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Login to Railway
echo "📝 Please make sure you're logged in to Railway CLI"
echo "   If not, run: railway login"

# Set the environment variables
echo "⚙️  Setting DATABASE_URL with connection pooling and DIRECT_URL..."
railway variables \
  --set "DATABASE_URL=postgresql://postgres:XglbRYGHA8h8pw80@db.ajwudhwruxxdshqjeqij.supabase.co:5432/postgres?pgbouncer=true&sslmode=require&connect_timeout=30&statement_timeout=30000&pool_timeout=30" \
  --set "DIRECT_URL=postgresql://postgres:XglbRYGHA8h8pw80@db.ajwudhwruxxdshqjeqij.supabase.co:5432/postgres"

echo "✅ Environment variables updated!"
echo ""
echo "🔄 To redeploy with new variables, run:"
echo "   railway up"
echo ""
echo "Or push a small change to trigger automatic deployment:"
echo "   git commit --allow-empty -m 'chore: trigger deployment with Supabase DB'"
echo "   git push origin main"
