#!/bin/bash

echo "🚂 Force Railway Deployment"
echo "=========================="

# Method 1: Try Railway CLI (if it works)
echo "Attempting Railway CLI deployment..."
railway up --detach 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Railway CLI deployment started!"
    echo "Monitor at: railway.app"
else
    echo "❌ Railway CLI failed"
    echo ""
    echo "🌐 Manual Railway Dashboard Method:"
    echo "1. Go to railway.app → nutrition-lab-system"
    echo "2. Deployments tab → Click 'Redeploy' on last deployment"  
    echo "3. Or Settings → Deploy → 'Deploy Now'"
    echo ""
    echo "🔗 GitHub Connection Fix:"
    echo "1. Settings → Source → Disconnect repo"
    echo "2. Reconnect → Select recovery-stable branch"
    echo "3. Enable auto-deploy"
fi

echo ""
echo "🎯 Your daily workflow should be live at:"
echo "https://nutrition-lab-system-production-0fa7.up.railway.app"
