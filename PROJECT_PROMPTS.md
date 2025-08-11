# FNTP Nutrition System - Project Prompts

## Prompt 01: Verify Foundation & Fix Current Issues

### Objective
Verify the current system foundation is working correctly and fix any issues before building further.

### Instructions for Cursor

```
Analyze and fix the current medical document system foundation. Check that all basic components are working properly.

## 1. Verify Database Connection and Schema

Check that the medical tables exist and are properly connected:

1. Create a test script at `scripts/verify-medical-setup.ts`:
   - Test connection to PostgreSQL on Railway
   - Verify all medical tables exist (MedicalDocument, MedicalLabValue, MedicalDocAnalysis, MedicalProcessingQueue)
   - Check relationships are properly configured
   - Test basic CRUD operations on MedicalDocument table
   - Report any missing tables or connection issues

2. Fix any schema issues found:
   - If tables are missing, create migration
   - If relationships are broken, fix them
   - Ensure all foreign keys are properly set

## 2. Fix the Test Upload Page

The test page at `/test-medical` has hydration errors. Fix it:

1. Review `app/test-medical/page.tsx`
2. Remove any Date() calls or dynamic values that cause hydration mismatch
3. Ensure it starts with 'use client' directive
4. Test that file upload UI works without errors
5. Make sure the upload button triggers the API call

## 3. Verify API Endpoint

Check `/api/medical/upload/route.ts`:

1. Ensure the endpoint exists and exports POST function
2. Add proper error handling for missing services
3. Add test mode bypass: check for `?test=true` query parameter
4. Log all operations for debugging
5. Return meaningful error messages

The endpoint should:
- Accept FormData with multiple files
- Work even if S3 is not configured (save metadata only)
- Work even if Redis is not configured (skip queue)
- Save document records to database
- Return clear success/error status

## 4. Create Storage Service Stub

Since S3 isn't configured yet, create a stub at `lib/medical/storage-service.ts`:

```typescript
export class MedicalDocumentStorage {
  async uploadDocument(file: Buffer, filename: string, mimeType: string, clientId?: string) {
    console.log(`[STUB] Would upload ${filename} (${mimeType}) for client ${clientId || 'standalone'}`)
    // Return fake S3 response for testing
    return {
      key: `stub-key-${Date.now()}`,
      url: `https://stub-url/${filename}`,
    }
  }

  async getSignedDownloadUrl(key: string) {
    console.log(`[STUB] Would generate signed URL for ${key}`)
    return `https://stub-signed-url/${key}`
  }

  async deleteDocument(key: string) {
    console.log(`[STUB] Would delete ${key}`)
  }
}

export const medicalDocStorage = new MedicalDocumentStorage()
```

## 5. Create Simple Test Flow

Create `scripts/test-upload-flow.ts` that:
1. Creates a test MedicalDocument record
2. Reads it back
3. Updates its status
4. Deletes it
5. Reports success or any errors

## 6. Generate Status Report

After all fixes, create a status report showing:
- ✅ Database connection: working/not working
- ✅ Medical tables: exist/missing
- ✅ Test page: fixed/still has issues  
- ✅ API endpoint: responding/failing
- ✅ Storage service: stubbed/configured
- ✅ Can create document records: yes/no

Log this report to console and also save to `medical-system-status.md`

## Expected Outcome

After running this prompt, we should have:
1. Working database with correct schema
2. Test page without hydration errors
3. API endpoint that responds (even without S3/Redis)
4. Ability to create document records in database
5. Clear understanding of what's working and what needs configuration

## Testing

Run these commands to verify:
```bash
# Test database
npx tsx scripts/verify-medical-setup.ts

# Test upload flow
npx tsx scripts/test-upload-flow.ts

# Check schema
npx prisma studio

# Test the upload page
npm run dev
# Navigate to http://localhost:3000/test-medical
```

Report back with the status report and any errors encountered.
```

---

## Future Prompts

Additional prompts will be added here as the system develops.
