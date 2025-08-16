#!/bin/bash

echo "🚀 Setting up MCP Servers for FNTP Nutrition System"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/Users/kr/fntp-nutrition-system"
MCP_ROOT="$PROJECT_ROOT/mcp-servers"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${BLUE}=== Installing Custom MCP Servers ===${NC}"
echo ""

# Terminal Server
echo -e "${YELLOW}📦 Installing Terminal Server dependencies...${NC}"
cd "$MCP_ROOT/terminal-server"
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Terminal Server ready${NC}"
else
    echo -e "${RED}❌ Failed to install Terminal Server${NC}"
    exit 1
fi

# Database Server
echo -e "${YELLOW}📦 Installing Database Server dependencies...${NC}"
cd "$MCP_ROOT/database-server"
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database Server ready${NC}"
else
    echo -e "${RED}❌ Failed to install Database Server${NC}"
    exit 1
fi

# Linear Server
echo -e "${YELLOW}📦 Installing Linear Server dependencies...${NC}"
cd "$MCP_ROOT/linear-server"
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Linear Server ready${NC}"
else
    echo -e "${RED}❌ Failed to install Linear Server${NC}"
    exit 1
fi

# Sentry Server
echo -e "${YELLOW}📦 Installing Sentry Server dependencies...${NC}"
cd "$MCP_ROOT/sentry-server"
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Sentry Server ready${NC}"
else
    echo -e "${RED}❌ Failed to install Sentry Server${NC}"
    exit 1
fi

# Railway MCP Server
echo ""
echo -e "${BLUE}=== Installing Railway MCP Server ===${NC}"
echo -e "${YELLOW}📦 Installing Railway MCP Server...${NC}"

# Check if Railway MCP is available
npm list -g @railway/mcp > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Installing Railway MCP globally..."
    npm install -g @railway/mcp > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Railway MCP Server installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not install Railway MCP - it might not be released yet${NC}"
        echo "   You can install it manually later with: npm install -g @railway/mcp"
    fi
else
    echo -e "${GREEN}✅ Railway MCP Server already installed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 MCP Servers setup complete!${NC}"
echo ""
echo -e "${BLUE}=== Next Steps ===${NC}"
echo ""
echo "1. ${YELLOW}Add your Railway API token to .env:${NC}"
echo "   RAILWAY_API_TOKEN=your_token_here"
echo "   (Get it from https://railway.app/account/tokens)"
echo ""
echo "2. ${YELLOW}Restart Claude Desktop${NC} to load the new MCP servers"
echo ""
echo "3. ${YELLOW}Available MCP Servers:${NC}"
echo "   ✅ Filesystem - Read/write files"
echo "   ✅ Memory - Store project context"
echo "   ✅ Browser - Web automation"
echo "   🆕 Terminal - Run commands, npm scripts"
echo "   🆕 Database - Direct PostgreSQL access"
echo "   🆕 Railway - Deploy and manage production"
echo ""
echo -e "${GREEN}Claude will now have full development autonomy!${NC} 🚀"
