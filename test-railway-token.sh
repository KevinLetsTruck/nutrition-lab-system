#!/bin/bash

echo "🔑 Testing Railway API Token Method"
echo "=================================="

if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ RAILWAY_TOKEN not set"
    echo ""
    echo "To get your Railway API token:"
    echo "1. Go to railway.app → Settings → Tokens"
    echo "2. Create new token"
    echo "3. Export it: export RAILWAY_TOKEN=your_token_here"
    echo "4. Run this script again"
    exit 1
fi

echo "✅ RAILWAY_TOKEN is set"
echo "🔍 Testing Railway connection..."

# Test if we can list projects
railway projects

if [ $? -eq 0 ]; then
    echo "✅ Railway API connection successful!"
    echo ""
    echo "🚂 Ready to set variables and deploy!"
    echo "Run: ./railway-set-variables.sh"
else
    echo "❌ Railway API connection failed"
    echo "Try regenerating your token at railway.app"
fi
