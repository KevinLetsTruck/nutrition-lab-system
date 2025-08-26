#!/bin/bash

# Fix Next.js 15 route params in all API routes with dynamic segments

echo "🔧 Fixing Next.js 15 route parameters..."

# Counter for statistics
fixed=0
total=0

# Find all route.ts files in directories with brackets (dynamic routes)
find /Users/kr/fntp-nutrition-system/src/app/api -name "route.ts" -path "*\[*\]*" | while read -r file; do
    total=$((total + 1))
    echo "Processing: $file"
    
    # Create a backup
    cp "$file" "$file.backup"
    
    # Fix the params type and add await
    # This handles GET, POST, PATCH, DELETE methods
    sed -i '' \
        -e 's/{ params }: { params: { \([^}]*\) } }/{ params }: { params: Promise<{ \1 }> }/g' \
        -e 's/const { \([^}]*\) } = params;/const { \1 } = await params;/g' \
        "$file"
    
    # Check if file was modified
    if ! diff -q "$file" "$file.backup" > /dev/null; then
        echo "  ✅ Fixed: $(basename $(dirname "$file"))/route.ts"
        fixed=$((fixed + 1))
        rm "$file.backup"
    else
        echo "  ⏭️  Already fixed or no dynamic params"
        rm "$file.backup"
    fi
done

echo ""
echo "📊 Summary:"
echo "   Fixed: $fixed files"
echo "   Total checked: $total files"
