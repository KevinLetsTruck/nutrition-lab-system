# Neon Database Setup

## Overview
This application now uses Neon PostgreSQL database exclusively. All Supabase dependencies have been removed.

## Database Connection
The app uses two connection strings from Neon:
- `DATABASE_URL` - Pooled connection for general queries
- `DIRECT_URL` - Direct connection for migrations

## Authentication
- Uses JWT tokens with bcrypt for password hashing
- Sessions stored in PostgreSQL via Prisma
- No dependency on Supabase Auth

## File Storage
- Supabase Storage has been removed
- File upload endpoints currently use placeholder URLs
- TODO: Implement S3 or another storage solution

## Migration Status
- ✅ Database queries migrated to Prisma
- ✅ Authentication using Prisma + JWT
- ✅ All Supabase packages removed
- ⚠️ File storage needs implementation

## Environment Variables Required
```env
DATABASE_URL=postgresql://...@ep-xxx-pooler.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=your-anthropic-key
```

## Files Changed
1. Removed files:
   - src/lib/supabase.ts
   - src/lib/supabase-storage.ts

2. Updated files:
   - package.json (removed @supabase/supabase-js)
   - src/lib/auth-service.ts (new Prisma-based auth)
   - src/lib/config/env.ts (removed Supabase vars)
   - src/app/clients/page.tsx (uses Prisma API)
   - src/lib/file-utils.ts (placeholder implementation)

3. New files:
   - src/app/api/clients/route.ts (Prisma-based API)

## Next Steps
1. Implement file storage solution (S3 recommended)
2. Update all remaining test/debug files
3. Test all functionality with Neon database