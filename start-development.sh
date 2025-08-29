#!/bin/bash

echo "🚀 Starting FNTP Development Automation Environment..."
echo "======================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in FNTP project directory"
    echo "   Please run: cd /Users/kr/fntp-nutrition-system"
    exit 1
fi

# Start all development services
echo "📱 Starting Next.js Development Server..."
npm run dev &
DEV_PID=$!

echo "🗄️ Starting Prisma Database Studio..."
npm run db:studio &
DB_PID=$!

echo "⌨️ Starting TypeScript Watch Mode..."
npm run watch:types &
TS_PID=$!

# Wait a moment for services to start
sleep 3

echo ""
echo "✅ FNTP Development Environment Started!"
echo "======================================"
echo "📱 App:        http://localhost:3000"
echo "🗄️ Database:   http://localhost:5555"
echo "⌨️ TypeScript: Background type checking active"
echo ""
echo "🎯 Available Commands:"
echo "   npm run auto:fix    - Fix all code issues automatically"
echo "   npm run auto:format - Format all code automatically"
echo "   npm run test:watch  - Start background testing"
echo ""
echo "💡 Your code will auto-format and type-check as you work!"
echo "🚫 Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development environment..."
    kill $DEV_PID $DB_PID $TS_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Wait for user interruption
wait
