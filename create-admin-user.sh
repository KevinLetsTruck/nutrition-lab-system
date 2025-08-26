#!/bin/bash

# Create first admin user on Railway deployment
echo "🧑‍💼 Creating first admin user for FNTP Daily Workflow..."
echo ""

read -p "Enter admin email: " ADMIN_EMAIL
read -s -p "Enter admin password: " ADMIN_PASSWORD
echo ""
read -p "Enter admin name: " ADMIN_NAME

echo ""
echo "Creating admin user..."

curl -X POST https://nutrition-lab-system-production-0fa7.up.railway.app/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"name\": \"$ADMIN_NAME\"
  }" | json_pp

echo ""
echo "✅ Admin user created!"
echo ""
echo "🎯 Your daily workflow app is now live:"
echo "   Login: https://nutrition-lab-system-production-0fa7.up.railway.app/login"
echo "   Admin: https://nutrition-lab-system-production-0fa7.up.railway.app/admin"
echo ""
echo "📋 Next steps:"
echo "   1. Login with your admin credentials"
echo "   2. Add team members from admin dashboard" 
echo "   3. Start adding clients for Thursday calls"
echo ""
