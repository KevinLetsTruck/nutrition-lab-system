#!/bin/bash

# Railway MCP Server Setup Script
# This prepares the Railway MCP server installation

echo "📦 Setting up Railway MCP Server..."

# Create a package.json for Railway MCP
cat > package.json << 'EOF'
{
  "name": "railway-mcp-setup",
  "version": "1.0.0",
  "description": "Railway MCP Server Setup",
  "dependencies": {
    "@railway/mcp": "latest"
  }
}
EOF

echo "Installing Railway MCP server..."
npm install

echo ""
echo "🔑 Railway API Token Required!"
echo "================================"
echo ""
echo "To complete setup, you need your Railway API token:"
echo "1. Go to https://railway.app/account/tokens"
echo "2. Create a new token"
echo "3. Add it to your .env file as: RAILWAY_API_TOKEN=your_token_here"
echo ""
