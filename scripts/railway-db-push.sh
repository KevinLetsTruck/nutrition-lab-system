#!/bin/bash

echo "🚀 Pushing Prisma schema to Railway database..."

# Run prisma db push via Railway run command
railway run npx prisma db push --skip-generate

echo "✅ Database schema pushed successfully!"
echo "🔄 Running seed data..."

# Run seed script
railway run npm run db:seed

echo "✅ Seed data applied!"
