# Vercel Build Fix Guide

## Issue
Multiple API routes are using `pdf-parse` which doesn't work in Vercel's serverless environment.

## Quick Solution

### Option 1: Use Environment Variable to Disable Routes
In your `.env.production` file on Vercel, add:
```
DISABLE_PDF_ROUTES=true
```

### Option 2: Create Empty Route Files
Replace problematic routes with minimal versions:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This endpoint is not available in production. Use /api/lab-reports/upload instead.' 
  }, { status: 503 })
}
```

### Option 3: Comment Out Problematic Routes
Temporarily rename or remove these files:
- `/api/pdf-advanced-extract/route.ts`
- `/api/pdf-direct-to-claude/route.ts`
- `/api/pdf-to-claude-vision/route.ts`
- `/api/claude-pdf/route.ts`
- `/api/analyze-simple/route.ts`
- `/api/pdf-claude-binary/route.ts`

## The Working Solution

The `/api/lab-reports/upload` endpoint uses the production-ready PDF processor and should work fine.

## Recommended Approach

Since these are test/experimental endpoints, we can safely disable them in production while keeping the main PDF processor working.