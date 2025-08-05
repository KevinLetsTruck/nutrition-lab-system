#!/bin/bash

# Lab Analysis System Deployment Check Script

echo "🔍 Checking Lab Analysis System Deployment Status..."
echo "================================================"

BASE_URL="https://nutrition-lab-system-lets-truck.vercel.app"

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -n "Checking $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$response" = "200" ]; then
        echo "✅ OK ($response)"
    elif [ "$response" = "401" ]; then
        echo "🔒 Protected ($response - authentication required)"
    elif [ "$response" = "404" ]; then
        echo "❌ Not Found ($response)"
    else
        echo "⚠️  Issue ($response)"
    fi
}

# Check main endpoints
echo ""
echo "1️⃣  Checking Main Application..."
check_endpoint "/" "Homepage"
check_endpoint "/lab-analysis" "Lab Analysis Dashboard"

echo ""
echo "2️⃣  Checking API Endpoints..."
check_endpoint "/api/health" "Health Check"
check_endpoint "/api/lab-analysis/patterns" "Patterns API"
check_endpoint "/api/lab-analysis/protocols" "Protocols API"
check_endpoint "/api/lab-analysis/upload" "Upload API"

echo ""
echo "3️⃣  Checking Build Info..."
echo -n "Fetching deployment info... "
build_info=$(curl -s "$BASE_URL/api/health" 2>/dev/null | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
if [ -n "$build_info" ]; then
    echo "✅ Version: $build_info"
else
    echo "⚠️  Could not fetch version"
fi

echo ""
echo "================================================"
echo "📋 Next Steps:"
echo "1. If endpoints return 404, deployment may still be in progress"
echo "2. Run database migrations from scripts/deploy-lab-analysis.sql"
echo "3. Create 'lab-documents' storage bucket in Supabase"
echo "4. Test file upload functionality"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com"
echo "🔗 Application URL: $BASE_URL/lab-analysis"