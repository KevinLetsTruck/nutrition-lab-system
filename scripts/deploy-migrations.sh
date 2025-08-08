#!/bin/bash
# Deploy Prisma migrations to Railway PostgreSQL

echo "🚀 Deploying Prisma migrations to Railway PostgreSQL..."
echo "Using Railway environment variables..."

# Run migrations in Railway environment
railway run npx prisma migrate deploy

echo "✅ Migrations complete!"
echo ""
echo "📊 You can now verify the deployment at:"
echo "   - Health Check: https://nutrition-lab-system-production-0fa7.up.railway.app/api/health-check"
echo "   - DB Health: https://nutrition-lab-system-production-0fa7.up.railway.app/api/db-health"
echo ""
echo "🔍 To check deployment logs: railway logs"
