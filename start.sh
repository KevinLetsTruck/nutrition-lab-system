#!/bin/bash
# FNTP Nutrition System - Quick Start Script

echo "🚀 Starting FNTP Nutrition System..."

# Navigate to project directory
cd "$(dirname "$0")"

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    echo "📦 Starting Docker..."
    open /Applications/Docker.app
    echo "⏳ Waiting for Docker to start..."
    while ! docker ps >/dev/null 2>&1; do
        sleep 2
    done
fi

# Check if PostgreSQL is running
if ! docker ps | grep -q fntp_postgres; then
    echo "🐘 Starting PostgreSQL database..."
    docker-compose up -d
    sleep 3
fi

# Check database status
echo "✅ Database status:"
docker ps | grep fntp_postgres

# Start the development server
echo "🌐 Starting Next.js development server..."
echo "📍 URL: http://localhost:3000"
echo ""
npm run dev
