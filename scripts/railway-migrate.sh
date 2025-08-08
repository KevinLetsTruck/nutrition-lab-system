#!/bin/bash
# Run Prisma migrations on Railway

echo "Running Prisma migrations on Railway..."
echo "This will use the DATABASE_URL from your Railway environment"

# Generate Prisma client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

echo "Migrations complete!"
echo "You can verify at: https://nutrition-lab-system-production-0fa7.up.railway.app/api/db-health"
