#!/bin/bash

# Railway Deployment Monitor
# This script monitors the deployment status

echo "Railway Deployment Monitor"
echo "========================="
echo ""
echo "Project: $(railway status 2>&1 | grep 'Project:' | cut -d' ' -f2-)"
echo ""
echo "🚀 Deployment triggered by push to GitHub"
echo ""
echo "You can monitor the deployment in several ways:"
echo ""
echo "1. Railway Dashboard:"
echo "   - Go to: https://railway.app/dashboard"
echo "   - Look for project: truthful-enchantment"
echo "   - Check the deployment logs"
echo ""
echo "2. Railway CLI Logs (if available):"
echo "   Run: railway logs"
echo ""
echo "3. Check deployment status:"
echo "   Run: railway status"
echo ""
echo "4. Once deployed, test the health endpoint:"
echo "   URL: https://nutrition-lab-system-production.up.railway.app/api/health"
echo ""
echo "Press Ctrl+C to exit this monitor"
echo ""

# Try to show logs if available
echo "Attempting to fetch latest logs..."
echo "=================================="
railway logs --tail 20 2>&1 || echo "Note: Logs may not be available immediately after deployment"
