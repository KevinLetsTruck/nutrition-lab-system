# Analysis Issues Summary and Solutions

## Current Problems

1. **File Retrieval Issue**
   - Files are stored with paths like: `2025/08/01/filename.pdf`
   - These are in the `general` bucket
   - The analyze route is failing to retrieve them

2. **Report Type Misidentification**
   - Claude is incorrectly identifying NAQ files as Dutch reports
   - This causes the wrong analyzer to be used, leading to parsing errors

3. **Import/Module Issues**
   - The analyze route uses require() which might not work properly in production

## Solutions Implemented

### 1. Fixed Path Handling
- Updated `determineBucketFromPath` to detect date-based paths (e.g., 2025/08/01/)
- Forces use of 'general' bucket for recent uploads
- Added regex check for year patterns: `/^\d{4}$/`

### 2. Need to Fix Report Type Detection
The Claude prompt for detecting report types needs to be more explicit about NAQ files:

```javascript
// Current prompt might be too vague
// Need to add specific NAQ file pattern recognition
```

### 3. Import Fix
Changed from:
```javascript
const { SupabaseStorageService } = require('@/lib/supabase-storage')
```
To:
```javascript
const { SupabaseStorageService } = await import('@/lib/supabase-storage')
```

## Next Steps

1. **Deploy to Production**
   - The path fixes need to be tested in production environment
   - Vercel might handle imports differently

2. **Fix Claude Detection**
   - Add more specific keywords for NAQ detection
   - Include file name in detection logic
   - Add fallback based on filename patterns

3. **Simplify Storage Strategy**
   - Consider standardizing all uploads to use consistent paths
   - Remove complex bucket detection logic
   - Use a single bucket for all lab reports

## Testing Strategy

1. Test with actual PDF files (not text)
2. Verify file retrieval from storage
3. Confirm correct report type detection
4. Validate analysis results