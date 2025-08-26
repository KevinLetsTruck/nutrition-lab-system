#!/bin/bash

# Context Restoration Script - Functional Medicine Assessment System
# This script helps restore project context when switching between Claude chats

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Functional Medicine Assessment System - Context Restoration${NC}"
echo "=================================================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Project root validation
PROJECT_ROOT="/Users/kr/fntp-nutrition-system"
if [ ! -d "$PROJECT_ROOT" ]; then
    echo -e "${RED}❌ Project root not found: $PROJECT_ROOT${NC}"
    exit 1
fi

cd "$PROJECT_ROOT"

echo -e "${YELLOW}📋 Step 1: System Health Check${NC}"
echo "================================="

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check PostgreSQL
if command_exists psql; then
    PSQL_VERSION=$(psql --version | head -n1)
    echo -e "${GREEN}✅ $PSQL_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL CLI not found (may be using cloud DB)${NC}"
fi

# Check if development server is running
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Development server running on port 3000${NC}"
    DEV_RUNNING=true
else
    echo -e "${YELLOW}ⓘ Development server not running${NC}"
    DEV_RUNNING=false
fi

echo ""
echo -e "${YELLOW}📊 Step 2: Database Status Check${NC}"
echo "=================================="

# Test database connection (using npm script if available)
if [ -f "package.json" ] && npm run --silent db:studio --dry-run > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database schema accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Database connection not verified${NC}"
fi

# Check for migrations
if [ -d "prisma/migrations" ]; then
    MIGRATION_COUNT=$(find prisma/migrations -name "migration.sql" | wc -l)
    echo -e "${GREEN}✅ Found $MIGRATION_COUNT migrations${NC}"
else
    echo -e "${YELLOW}⚠️  No migrations directory found${NC}"
fi

echo ""
echo -e "${YELLOW}📁 Step 3: Project Structure Validation${NC}"
echo "========================================"

# Check critical files
CRITICAL_FILES=(
    "package.json"
    "next.config.js"
    "prisma/schema.prisma"
    "src/app/layout.tsx"
    "src/app/page.tsx"
    "PROJECT_STATE.md"
    ".env.local"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
    fi
done

echo ""
echo -e "${YELLOW}🔀 Step 4: Git Status & Recent Changes${NC}"
echo "======================================"

# Git status
if command_exists git && [ -d ".git" ]; then
    echo "Current branch:"
    git branch --show-current
    echo ""
    
    echo "Working directory status:"
    git status --porcelain | head -10
    echo ""
    
    echo "Recent commits (last 5):"
    git log --oneline -5
    echo ""
    
    echo "Last checkpoint:"
    git tag -l "checkpoint-*" | sort -r | head -1 || echo "No checkpoints found"
else
    echo -e "${YELLOW}⚠️  Git not available or not initialized${NC}"
fi

echo ""
echo -e "${YELLOW}🎯 Step 5: Current Phase & Progress${NC}"
echo "==================================="

# Read current phase from PROJECT_STATE.md
if [ -f "PROJECT_STATE.md" ]; then
    CURRENT_PHASE=$(grep -A 1 "### \*\*Current Phase\*\*" PROJECT_STATE.md | tail -1 | sed 's/\*\*Active Task\*\*://')
    echo -e "${GREEN}Current Phase: $CURRENT_PHASE${NC}"
    echo ""
    
    echo "Recent progress items:"
    grep -A 10 "### \*\*Immediate Next Steps\*\*" PROJECT_STATE.md | head -10
else
    echo -e "${RED}❌ PROJECT_STATE.md not found${NC}"
fi

echo ""
echo -e "${YELLOW}🛠️ Step 6: Environment & Dependencies${NC}"
echo "====================================="

# Check .env.local
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ Environment configuration found${NC}"
    
    # Check for critical environment variables (without showing values)
    ENV_VARS=("DATABASE_URL" "ANTHROPIC_API_KEY" "NEXTAUTH_SECRET")
    for var in "${ENV_VARS[@]}"; do
        if grep -q "^$var=" .env.local; then
            echo -e "${GREEN}✅ $var configured${NC}"
        else
            echo -e "${YELLOW}⚠️  $var not found in .env.local${NC}"
        fi
    done
else
    echo -e "${RED}❌ .env.local not found${NC}"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencies not installed - run 'npm install'${NC}"
fi

echo ""
echo -e "${YELLOW}🔧 Step 7: System Recommendations${NC}"
echo "================================="

RECOMMENDATIONS=()

if [ "$DEV_RUNNING" = false ]; then
    RECOMMENDATIONS+=("🚀 Start development server: npm run dev")
fi

if [ ! -d "node_modules" ]; then
    RECOMMENDATIONS+=("📦 Install dependencies: npm install")
fi

if ! grep -q "^DATABASE_URL=" .env.local 2>/dev/null; then
    RECOMMENDATIONS+=("🗄️ Configure DATABASE_URL in .env.local")
fi

if ! grep -q "^ANTHROPIC_API_KEY=" .env.local 2>/dev/null; then
    RECOMMENDATIONS+=("🤖 Configure ANTHROPIC_API_KEY in .env.local")
fi

if [ ${#RECOMMENDATIONS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ System appears ready for development!${NC}"
else
    echo "Recommended actions:"
    for rec in "${RECOMMENDATIONS[@]}"; do
        echo -e "${YELLOW}  $rec${NC}"
    done
fi

echo ""
echo -e "${BLUE}📚 Step 8: Quick Reference${NC}"
echo "========================="

echo "Development commands:"
echo "  npm run dev          # Start development server"
echo "  npm run db:studio    # Open database admin"
echo "  npm run db:push      # Update database schema"
echo "  npm run build        # Production build"
echo ""

echo "Project files:"
echo "  PROJECT_STATE.md     # Master project context"
echo "  TECHNICAL_DECISIONS.md # Architecture decisions"
echo "  src/app/             # Next.js application"
echo "  prisma/schema.prisma # Database schema"
echo ""

echo "Useful URLs (when dev server running):"
echo "  http://localhost:3000         # Application"
echo "  http://localhost:3000/api/health # Health check"
echo "  http://localhost:5555         # Prisma Studio (npm run db:studio)"
echo ""

echo -e "${GREEN}🎉 Context restoration complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Review PROJECT_STATE.md for current phase and objectives"
echo "2. Check memory system for recent insights"
echo "3. Verify system health with recommended actions above"
echo "4. Begin development on current priority tasks"
echo ""
echo "=================================================================="
