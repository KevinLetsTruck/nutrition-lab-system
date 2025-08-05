#!/bin/bash

echo "🔍 Verifying Lab Analysis Deployment..."
echo "======================================"

URL="https://nutrition-lab-system-lets-truck.vercel.app/lab-analysis"

# Check if lab analysis page returns 200
echo -n "Checking lab analysis page... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$status" = "200" ]; then
    echo "✅ SUCCESS! Lab Analysis is deployed!"
    echo ""
    echo "🎉 Deployment Complete!"
    echo "📍 URL: $URL"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Run database migration: scripts/deploy-lab-analysis.sql"
    echo "2. Create storage bucket 'lab-documents' in Supabase"
    echo "3. Test file upload functionality"
    exit 0
else
    echo "❌ Not ready yet (Status: $status)"
    echo ""
    echo "⏳ Deployment may still be in progress..."
    echo "   Current commits pushed:"
    git log --oneline -3
    echo ""
    echo "🔄 Try again in a minute or check Vercel dashboard"
    exit 1
fi