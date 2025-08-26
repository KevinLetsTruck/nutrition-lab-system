#!/bin/bash

# Fix Port Issues and Restart Dev Server Script
# Run this to clean up and restart on port 3000

echo "🧹 FNTP Dev Server Fix Script"
echo "=============================="
echo ""

# Step 1: Find what's on port 3000
echo "📍 Step 1: Checking port 3000..."
PORT_3000_PID=$(lsof -ti:3000)

if [ ! -z "$PORT_3000_PID" ]; then
    echo "Found process $PORT_3000_PID on port 3000"
    echo "Killing process..."
    kill -9 $PORT_3000_PID 2>/dev/null
    echo "✅ Port 3000 cleared!"
else
    echo "✅ Port 3000 is already free"
fi

# Step 2: Find and kill current Next.js dev server
echo ""
echo "📍 Step 2: Stopping current dev server on port 3007..."
PORT_3007_PID=$(lsof -ti:3007)

if [ ! -z "$PORT_3007_PID" ]; then
    echo "Found Next.js on port 3007 (PID: $PORT_3007_PID)"
    echo "Stopping server..."
    kill -9 $PORT_3007_PID 2>/dev/null
    echo "✅ Dev server stopped!"
else
    echo "No server running on port 3007"
fi

# Step 3: Clean Next.js cache
echo ""
echo "📍 Step 3: Cleaning Next.js cache..."
rm -rf .next 2>/dev/null
echo "✅ Cache cleared!"

# Step 4: Restart on port 3000
echo ""
echo "📍 Step 4: Starting fresh dev server on port 3000..."
echo ""
echo "Run this command now:"
echo "👉 npm run dev"
echo ""
echo "Your app will be available at:"
echo "🌐 http://localhost:3000"
echo "🧪 http://localhost:3000/test-simple"
echo ""
echo "✨ Done! Your server should now run on port 3000"
