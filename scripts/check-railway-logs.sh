#!/bin/bash

# Check Railway deployment logs
echo "🚀 Checking Railway deployment logs..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

echo "📝 Fetching latest deployment logs..."
railway logs --json | jq -r '.message' | tail -50

echo -e "\n📊 Checking deployment status..."
railway status
