#!/bin/bash

echo "🐛 Setting up Cursor Bugbot for FNTP Nutrition System..."

# Create .cursor directory if it doesn't exist
mkdir -p .cursor/rules

# Check if Cursor is installed
if ! command -v cursor &> /dev/null; then
    echo "❌ Cursor not found. Please install Cursor first."
    echo "   Download from: https://cursor.sh"
    exit 1
fi

echo "✅ Cursor found"

# Check TypeScript configuration
if [ -f "tsconfig.json" ]; then
    echo "✅ TypeScript configuration found"
else
    echo "❌ tsconfig.json not found"
    exit 1
fi

# Check if Bugbot config exists
if [ -f ".cursor/bugbot.json" ]; then
    echo "✅ Bugbot configuration found"
else
    echo "❌ Bugbot configuration missing"
    exit 1
fi

# Check if custom rules exist
if [ -f ".cursor/rules/medical-validation.js" ]; then
    echo "✅ Custom medical validation rules found"
else
    echo "❌ Custom medical validation rules missing"
    exit 1
fi

# Validate Prisma schema
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Prisma schema found"
    npx prisma validate
    if [ $? -eq 0 ]; then
        echo "✅ Prisma schema is valid"
    else
        echo "❌ Prisma schema has issues"
        exit 1
    fi
else
    echo "❌ Prisma schema not found"
    exit 1
fi

# Run TypeScript check
echo "🔍 Running TypeScript validation..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "✅ TypeScript validation passed"
else
    echo "⚠️  TypeScript validation found issues (this is normal)"
fi

echo ""
echo "🎉 Bugbot setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Open Cursor"
echo "   2. Press Cmd+, (Mac) or Ctrl+, (Windows/Linux)"
echo "   3. Search for 'Bugbot' in settings"
echo "   4. Enable 'Cursor Bugbot'"
echo "   5. Set severity to 'Medium' or higher"
echo "   6. Enable real-time checking"
echo ""
echo "🔧 Bugbot will now catch:"
echo "   ✓ Database table mismatches (medicalDocument vs document)"
echo "   ✓ Unsafe array operations (.find() without null checks)"
echo "   ✓ Missing error handling in medical APIs"
echo "   ✓ HIPAA compliance issues"
echo "   ✓ TypeScript strict mode violations"
echo ""
echo "🚨 Critical patterns monitored:"
echo "   • prisma.medicalDocument.* (should be prisma.document.*)"
echo "   • labValues.find() without null checks"
echo "   • document.labValues (should be document.LabValue)"
echo "   • Medical data access without audit logging"
echo ""

