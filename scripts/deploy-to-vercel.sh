#!/bin/bash

# FNTP Daily Workflow - Vercel Deployment Script

echo "🚀 FNTP Daily Workflow - Vercel Deployment"
echo "=========================================="

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "📝 Pre-deployment checklist:"
echo "   1. Create production database (Neon/Railway)"
echo "   2. Have DATABASE_URL ready"
echo "   3. Generate JWT_SECRET"
echo ""

read -p "Do you have a production DATABASE_URL ready? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔗 Create a database first:"
    echo "   • Neon (free): https://neon.tech"
    echo "   • Railway: https://railway.app"
    echo ""
    exit 1
fi

echo ""
echo "🔑 Generate a secure JWT secret:"
echo "   Run: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
echo ""

read -p "Ready to deploy? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

# Commit any pending changes
echo "📦 Committing changes..."
git add .
git commit -m "feat: Production deployment ready with admin system" || true

echo ""
echo "🚀 Deploying to Vercel..."
echo ""
echo "IMPORTANT: When prompted, set these environment variables:"
echo "   DATABASE_URL=your_production_database_url"
echo "   JWT_SECRET=your_generated_jwt_secret"
echo "   NEXTAUTH_URL=https://your-app-name.vercel.app"
echo "   NEXTAUTH_SECRET=another_secure_random_string"
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Run database migrations"
echo "   2. Create first admin user"
echo "   3. Test the application"
echo ""
echo "🔧 Run migrations:"
echo "   npx prisma migrate deploy"
echo ""
echo "👤 Create admin user:"
echo "   node scripts/create-first-admin.js"
echo ""
