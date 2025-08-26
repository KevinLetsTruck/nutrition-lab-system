#!/bin/bash

# Fix all routes that use the Params interface pattern

echo "🔧 Fixing routes with Params interface..."

files=(
  "/Users/kr/fntp-nutrition-system/src/app/api/medical/lab-values/[id]/route.ts"
  "/Users/kr/fntp-nutrition-system/src/app/api/medical/documents/[id]/fntp-complete-analysis/route.ts"
  "/Users/kr/fntp-nutrition-system/src/app/api/medical/documents/[id]/lab-values/route.ts"
  "/Users/kr/fntp-nutrition-system/src/app/api/medical/documents/[id]/protocol/route.ts"
  "/Users/kr/fntp-nutrition-system/src/app/api/medical/documents/[id]/status/route.ts"
  "/Users/kr/fntp-nutrition-system/src/app/api/medical/documents/[id]/fntp-master-protocol/route.ts"
  "/Users/kr/fntp-nutrition-system/src/app/api/medical/documents/[id]/assessment-analysis/route.ts"
  "/Users/kr/fntp-nutrition-system/src/app/api/medical/documents/[id]/reclassify/route.ts"
)

for file in "${files[@]}"; do
  echo "Processing: $(basename $(dirname "$file"))/route.ts"
  
  # Remove the Params interface
  sed -i '' '/^interface Params {$/,/^}$/d' "$file"
  
  # Fix GET functions
  sed -i '' 's/export async function GET(req: NextRequest, { params }: Params)/export async function GET(\n  req: NextRequest,\n  { params }: { params: Promise<{ id: string }> }\n)/g' "$file"
  
  # Fix POST functions  
  sed -i '' 's/export async function POST(req: NextRequest, { params }: Params)/export async function POST(\n  req: NextRequest,\n  { params }: { params: Promise<{ id: string }> }\n)/g' "$file"
  
  # Fix PATCH functions
  sed -i '' 's/export async function PATCH(req: NextRequest, { params }: Params)/export async function PATCH(\n  req: NextRequest,\n  { params }: { params: Promise<{ id: string }> }\n)/g' "$file"
  
  echo "  ✅ Fixed"
done

echo "✅ All Params interface routes fixed!"
