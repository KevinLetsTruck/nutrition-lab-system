#!/bin/bash

echo "🚂 Completing Railway setup after authentication..."

echo "1. Checking authentication status..."
railway whoami

echo "2. Linking to existing project..."
# We'll use the project ID from the dashboard if link doesn't work automatically
railway link

echo "3. Setting up all environment variables..."
./railway-set-variables.sh

echo "4. Deploying daily workflow..."
railway up --detach

echo ""
echo "🎉 Complete! Your daily workflow will be live at:"
echo "https://nutrition-lab-system-production-0fa7.up.railway.app"
echo ""
echo "Next: Run ./create-admin-user.sh to create your first admin user"
