#!/bin/bash

echo "🚀 RAILWAY BUILD SCRIPT STARTING"
echo "================================"

# Show environment info
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Available memory: $(free -h 2>/dev/null || echo 'Memory info not available')"

# Clean install
echo ""
echo "📦 Installing dependencies..."
npm ci --no-optional --no-audit --no-fund

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo ""
echo "🏗️ Building application..."
npm run build

echo ""
echo "✅ Build completed successfully!"
