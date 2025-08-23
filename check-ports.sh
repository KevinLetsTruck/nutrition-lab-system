#!/bin/bash

echo "🔍 Checking what's using port 3000..."
echo ""

# Check port 3000
echo "Port 3000:"
lsof -i :3000 | head -5

echo ""
echo "Port 3007 (current app):"
lsof -i :3007 | head -5

echo ""
echo "To fix this, you can:"
echo "1. Kill the process on port 3000:"
echo "   kill -9 [PID from above]"
echo ""
echo "2. Then restart your dev server:"
echo "   npm run dev"
echo ""
echo "Or just keep using port 3007 - it works fine!"
