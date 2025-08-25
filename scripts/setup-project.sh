#!/bin/bash

# Project Initialization Script - Functional Medicine Assessment System
# Run this to set up a new development environment or verify existing setup

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Functional Medicine Assessment System - Project Setup${NC}"
echo "============================================================="
echo ""

# Check for required dependencies
echo -e "${YELLOW}📦 Checking Dependencies${NC}"
echo "=========================="

dependencies=(
    "node:Node.js"
    "npm:npm package manager"
    "git:Git version control"
    "psql:PostgreSQL (optional)"
)

all_deps_ok=true

for dep_check in "${dependencies[@]}"; do
    IFS=':' read -r cmd desc <<< "$dep_check"
    if command -v "$cmd" &> /dev/null; then
        version=$($cmd --version | head -n1)
        echo -e "${GREEN}✅ $desc: $version${NC}"
    else
        echo -e "${RED}❌ $desc: Not found${NC}"
        all_deps_ok=false
    fi
done

if [ "$all_deps_ok" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Some dependencies are missing. Please install them and run this script again.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🏗️ Project Setup${NC}"
echo "================"

# Install npm dependencies
echo "Installing npm dependencies..."
npm install --no-audit --no-fund

# Setup MCP servers
echo "Setting up MCP servers..."
cd mcp-servers
./setup.sh
cd ..

# Make scripts executable
echo "Setting up project scripts..."
chmod +x scripts/*.sh

# Check for environment file
echo -e "${YELLOW}🔧 Environment Configuration${NC}"
echo "============================"

if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local found${NC}"
    
    # Check for critical variables
    critical_vars=("DATABASE_URL" "ANTHROPIC_API_KEY")
    for var in "${critical_vars[@]}"; do
        if grep -q "^$var=" .env.local; then
            echo -e "${GREEN}✅ $var configured${NC}"
        else
            echo -e "${YELLOW}⚠️  $var not configured${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    if [ -f ".env.example" ]; then
        echo "Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo -e "${YELLOW}📝 Please edit .env.local and add your actual API keys and database URL${NC}"
    fi
fi

# Database check
echo ""
echo -e "${YELLOW}🗄️ Database Setup${NC}"
echo "=================="

if npm run db:generate --silent > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${YELLOW}⚠️  Could not generate Prisma client - check DATABASE_URL${NC}"
fi

# Create initial checkpoint
echo ""
echo -e "${YELLOW}📸 Creating Initial State${NC}"
echo "=========================="

if [ -d ".git" ]; then
    if git status --porcelain | grep -q .; then
        echo "Committing initial setup..."
        git add -A
        git commit -m "Initial project setup complete

- Dependencies installed
- MCP servers configured
- Scripts made executable
- Environment template created

Ready for development!" || true
    fi
    echo -e "${GREEN}✅ Git repository ready${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository - consider running 'git init'${NC}"
fi

echo ""
echo -e "${BLUE}🎉 Project Setup Complete!${NC}"
echo "=========================="
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Edit .env.local with your actual API keys and database URL"
echo "2. Run 'npm run db:push' to sync database schema"
echo "3. Run 'npm run dev' to start development server"
echo "4. Check 'PROJECT_STATE.md' for project overview and current status"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  npm run dev                    # Start development server"
echo "  npm run db:studio              # Open database admin"
echo "  ./scripts/restore-context.sh   # Check system health"
echo "  ./scripts/create-checkpoint.sh # Create development checkpoint"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
